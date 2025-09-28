import json
import requests
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnableLambda, RunnablePassthrough
import dotenv

dotenv.load_dotenv()

OPENFDA = "https://api.fda.gov/drug/label.json?search=openfda.generic_name:"
def fetch_warn_prec(drug: str) -> Dict[str, Optional[str]]:
    url = OPENFDA + drug
    print(f"Fetching from {url}")
    try:
        r = requests.get(url, timeout=20)
        j = r.json()
        first = (j.get("results") or [{}])[0]
        return first
    except Exception:
        return {"id": None, "warnings": None, "precautions": None, "effective_time": None}
    

class CompatibilityResult(BaseModel):
    verdict: str = Field(..., pattern="^(SAFE TO PROCEED|PROCEED WITH CAUTION|STRONGLY ADVISE AGAINST)$")
    reasons: List[str]
    evidence_quotes: List[str] = []

# LLM + prompt (STRICT: use only warnings/precautions)
SYSTEM = """You are a STRICT drug compatibility judge.

Given the text from the FDA label and your knowledge of the patient's allergies and conditions, determine if the proposed drug is compatible with the patient.

Rules:
- If text shows a hard restriction for a matched allergy/condition → STRONGLY ADVISE AGAINST
- If text advises caution/monitoring/dose adjustment for a match → PROCEED WITH CAUTION
- If neither section mentions any relevant match → SAFE TO PROCEED
- Regardless of the verdict, always provide 2-4 concise reasons explaining your decision.
Output JSON with keys: verdict, reasons[], evidence_quotes[].
"""

PROMPT = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    (
        "user",
        """ProposedDrug: {drug}
        PatientAllergies: {allergies}
        PatientConditions: {conditions}
        PatientOngoingMeds: {ongoingMeds}

        FDA Label Sections: all information about the drug from the FDA label. {fda_label}
        """,
    ),
])

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0).with_structured_output(CompatibilityResult)

# Chain:
#   1) grab warn/prec via tool
#   2) feed into prompt
#   3) get structured verdict JSON
def check(drug: str, allergies: List[str] | None = None, conditions: List[str] | None = None, ongoingMeds: List[str] | None = None) -> CompatibilityResult:
    allergies = allergies or []
    conditions = conditions or []

    # Step 1: tool
    sections = fetch_warn_prec(drug)
    print(sections)
    # Step 2: if both missing → we can short-circuit to UNKNOWN (still via LLM to keep it uniform)
    inputs = {
        "drug": drug,
        "allergies": ", ".join(allergies) if allergies else "(none)",
        "conditions": ", ".join(conditions) if conditions else "(none)",
        "ongoingMeds": ", ".join(ongoingMeds) if ongoingMeds else "(none)",
        "fda_label": json.dumps(sections),
    }

    # Step 3: run LLM with structured output
    result: CompatibilityResult = (PROMPT | llm).invoke(inputs)
    return result

if __name__ == "__main__":
    out = check(
        drug="aspirin",
        allergies=[],
        conditions=["Scoliosis"],
        ongoingMeds=[],
    )
    print(out.model_dump_json(indent=2))