import os, json, time, requests
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import xml.etree.ElementTree as ET

load_dotenv()

# -----------------------
# PubMed E-utilities
# -----------------------
ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
ESUMMARY = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
EFETCH   = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
NCBI_PARAMS = {
    "db": "pubmed",
    "retmode": "json",
}

def pubmed_search(query: str, retmax: int = 5, sort: str = "relevance") -> List[str]:
    """Return a list of PMIDs for the query."""
    params = {**NCBI_PARAMS, "term": query, "retmax": retmax, "sort": sort}
    r = requests.get(ESEARCH, params=params, timeout=20)
    r.raise_for_status()
    data = r.json()
    return data.get("esearchresult", {}).get("idlist", [])

def pubmed_summaries(pmids: List[str]) -> Dict[str, Any]:
    """Return PubMed summaries (title, journal, pubdate) for PMIDs."""
    if not pmids: return {}
    params = {**NCBI_PARAMS, "id": ",".join(pmids)}
    r = requests.get(ESUMMARY, params=params, timeout=20)
    r.raise_for_status()
    return r.json().get("result", {})

def pubmed_abstracts(pmids: List[str]) -> Dict[str, str]:
    """Return raw abstracts keyed by PMID."""
    if not pmids: return {}
    params = {"db": "pubmed", "id": ",".join(pmids), "retmode": "text", "rettype": "abstract"}
    r = requests.get(EFETCH, params=params, timeout=20)
    r.raise_for_status()
    # efetch returns concatenated text; we split heuristically on PMID lines
    text = r.text
    out: Dict[str, str] = {}
    # Simple splitter: look for lines starting with "PMID: "
    chunks = [c.strip() for c in text.split("\n\n") if c.strip()]
    cur_pmid = None
    buf = []
    for line in text.splitlines():
        if line.startswith("PMID:"):
            if cur_pmid and buf:
                out[cur_pmid] = "\n".join(buf).strip()
                buf = []
            cur_pmid = line.replace("PMID:", "").strip()
        else:
            buf.append(line)
    if cur_pmid and buf:
        out[cur_pmid] = "\n".join(buf).strip()
    # Fallback: if parsing fails, just put the whole thing under the first PMID
    if not out and pmids:
        out[pmids[0]] = text.strip()
    return out

def format_citation(s: Dict[str, Any]) -> str:
    """
    Build a concise citation string: Authors. Title. Journal (Year). PMID: NNN.
    """
    title = s.get("title") or s.get("sorttitle") or ""
    journal = s.get("fulljournalname") or s.get("source") or ""
    pubdate = (s.get("pubdate") or "").split(" ")[0]  # take year if present
    authors = s.get("authors", [])
    if isinstance(authors, list) and authors:
        a0 = authors[0].get("name") or authors[0].get("authtype") or "Author"
        author_str = f"{a0} et al."
    else:
        author_str = ""
    pmid = s.get("uid") or s.get("articleids", [{}])[0].get("value") or ""
    return f"{author_str} {title}. {journal} ({pubdate}). PMID: {pmid}."


def pubmed_first_authors_full(pmids: List[str]) -> Dict[str, str]:
    """
    Return {pmid: "First Last"} using EFetch XML AuthorList.
    Falls back to initials if ForeName missing.
    """
    if not pmids:
        return {}
    params = {"db": "pubmed", "id": ",".join(pmids), "retmode": "xml"}
    r = requests.get(EFETCH, params=params, timeout=20)
    r.raise_for_status()
    authors: Dict[str, str] = {}

    root = ET.fromstring(r.text)
    # XML structure: PubmedArticleSet/PubmedArticle/MedlineCitation/PMID, Article/AuthorList/Author[0]/ForeName, LastName
    for art in root.findall(".//PubmedArticle"):
        pmid_el = art.find(".//MedlineCitation/PMID")
        pmid = pmid_el.text.strip() if pmid_el is not None else None
        if not pmid:
            continue
        first_author = art.find(".//Article/AuthorList/Author")
        if first_author is not None:
            fore = (first_author.findtext("ForeName") or "").strip()
            last = (first_author.findtext("LastName") or "").strip()
            collab = (first_author.findtext("CollectiveName") or "").strip()
            if collab:  # sometimes it's a group author
                authors[pmid] = collab
            elif fore or last:
                authors[pmid] = f"{fore} {last}".strip()
    return authors

def build_article_bundle(pmids: List[str]) -> List[Dict[str, Any]]:
    summaries = pubmed_summaries(pmids)
    abstracts = pubmed_abstracts(pmids)
    bundle = []
    for pid in pmids:
        meta = summaries.get(pid) or {}
        bundle.append({
            "pmid": pid,
            "title": meta.get("title"),
            "journal": meta.get("fulljournalname") or meta.get("source"),
            "pubdate": meta.get("pubdate"),
            "authors": meta.get("authors"),
            "citation": format_citation(meta),
            "abstract": abstracts.get(pid, ""),
            "url": f"https://pubmed.ncbi.nlm.nih.gov/{pid}/",
        })
    return bundle

# -----------------------
# LLM schema & prompt
# -----------------------
class Alternative(BaseModel):
    name: str = Field(..., description="Name of the recommended alternative drug.")
    description: str = Field(..., description="Why this is appropriate or better for the given issue, in 2-4 sentences.")
    citation: str = Field(..., description="Concise citation for the key supporting article.")

class AlternativesOut(BaseModel):
    alternatives: List[Alternative] = Field(..., min_items=1, max_items=4)

SYSTEM = """You are a clinical literature scout. Read the provided PubMed article snippets.
Task: suggest the most relevant alternative drug to the clinician's problem.

Constraints:
- Base your suggestion ONLY on the provided articles.
- Prefer higher-quality, recent, and guideline-aligned evidence when available.
- Output 3-5 alternatives max.
- Format each item as: name, description (2–4 sentences), citation (one key paper).

Be conservative: if evidence is weak or indirect, say so in the description."""

PROMPT = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    ("user",
     """Clinical issue (what failed / what's needed):
{issue}

Current/contraindicated option (if any):
{current_option}

Here are {k} PubMed articles (title | abstract snippet | citation | url):

{articles_block}

Return strict JSON with:
{{
  "alternatives": [
    {{"name": "...","description": "...","citation": "..."}},
    ...
  ]
}}
"""),
])

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0).with_structured_output(AlternativesOut)

# -----------------------
# Public function
# -----------------------
def suggest_alternatives(
    issue: str,
    current_option: str,
    search_hint: Optional[str] = None,
    k: int = 5,
) -> AlternativesOut:
    """
    issue: e.g., "ACE inhibitor contraindicated in pregnancy; need antihypertensive alternative"
    current_option: e.g., "lisinopril"
    search_hint: optional keywords to guide PubMed search (drug class, population)
    """
    # 1) Build a conservative search query
    q = search_hint or issue
    pmids = pubmed_search(q, retmax=k, sort="relevance")
    if not pmids:
        # fallback: remove punctuation and retry
        time.sleep(0.8)
        pmids = pubmed_search(q.split(";")[0], retmax=k, sort="relevance")

    articles = build_article_bundle(pmids)
    # 2) Build a compact block for the prompt
    lines = []
    for a in articles:
        abstract_snip = (a["abstract"] or "").strip().replace("\n", " ")
        if len(abstract_snip) > 800:
            abstract_snip = abstract_snip[:780] + " …"
        lines.append(f"- {a['title']}\n  {abstract_snip}\n  {a['citation']}\n  {a['url']}")
    articles_block = "\n\n".join(lines) if lines else "(no articles found)"
    
    inputs = {
        "issue": issue,
        "current_option": current_option or "(none)",
        "k": len(articles),
        "articles_block": articles_block,
    }

    out: AlternativesOut = (PROMPT | llm).invoke(inputs)
    return out


if __name__ == "__main__":
    result = suggest_alternatives(
        issue="The patient has a known allergy to aspirin, which is explicitly stated in the FDA label as a reason not to use the drug.",
        current_option="aspirin",
        search_hint=" ".join(["Acute viral pharyngitis (disorder)", "Gingival disease (disorder)", "Otitis media (disorder)", "Streptococcal sore throat (disorder)"]),
        k=5,
    )
    print(result.model_dump_json(indent=2))
