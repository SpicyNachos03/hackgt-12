"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { TabView, TabPanel } from "primereact/tabview";
import CardNav from "../../../components/CardNav";
import styles from "./page.module.css";
import "primereact/resources/themes/md-light-deeppurple/theme.css";

// ---------- Small utilities ----------
function toList(x: unknown): string[] {
  if (x === null || x === undefined) return [];
  if (Array.isArray(x)) return x.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof x === "string") return x.split(",").map((s) => s.trim()).filter(Boolean);
  return [String(x)].filter(Boolean);
}
function dedupePreserveOrder(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const key = s.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}

export default function ChatPage() {
  const router = useRouter();

  // ---------------- UI state ----------------
  const [patientId, setPatientId] = useState<number | null>(null);
  const [drugs, setDrugs] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");

  // Errors
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ drugs?: string; symptoms?: string }>({});

  // API state
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [compatLoading, setCompatLoading] = useState<boolean>(false);
  const [compatError, setCompatError] = useState<string | null>(null);

  const [recData, setRecData] = useState<any>(null);
  const [recLoading, setRecLoading] = useState<boolean>(false);
  const [recError, setRecError] = useState<string | null>(null);

  // Patient data (fetched when patientId changes)
  const [patientData, setPatientData] = useState<any>(null);

  // Tabs
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const items = [
    { label: "Unique Factor", bgColor: "#0D0716", textColor: "#fff", links: [{ label: "Chat page", href: "./routes/chat-page", ariaLabel: "Chat page" }] },
    { label: "Tutorials", bgColor: "#170D27", textColor: "#fff", links: [{ label: "Sample Cases", href: "google.com", ariaLabel: "Sample Cases" }, { label: "Step-By-Step", href: "google.com", ariaLabel: "Step by Step" }] },
    { label: "Settings", bgColor: "#271E37", textColor: "#fff", links: [{ label: "Docs", href: "google.com", ariaLabel: "Docs" }, { label: "Contact Us", href: "google.com", ariaLabel: "Step by Step" }] },
  ];

  // ----------- Helpers -----------
  const hasNetwork = true; // stub

  const trimmedDrugs = useMemo(() => drugs.trim(), [drugs]);
  const trimmedSymptoms = useMemo(() => symptoms.trim(), [symptoms]);

  function resetErrors() {
    setFormError(null);
    setFieldErrors({});
    setCompatError(null);
    setRecError(null);
  }
  function validateForCompatibility(): boolean {
    const errs: typeof fieldErrors = {};
    if (!trimmedDrugs && !trimmedSymptoms) {
      setFormError("Please enter at least a Drug or Symptoms.");
      return false;
    }
    setFieldErrors(errs);
    return true;
  }
  function validateForRecommendations(): boolean {
    const errs: typeof fieldErrors = {};
    if (!trimmedDrugs) errs.drugs = "Drug is required to fetch alternatives.";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setFormError("Please fix the highlighted fields.");
      return false;
    }
    return true;
  }

  // Abortable fetch with timeout
  async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(t);
    }
  }

  // ---------------- Patient auto-fetch when ID changes (debounced) ----------------
  useEffect(() => {
    let timer: any;
    const run = async () => {
      if (patientId == null) {
        setPatientData(null);
        return;
      }
      const url = `http://localhost:5001/api/user?id=${encodeURIComponent(String(patientId))}`;
      try {
        const res = await fetchWithTimeout(url, { method: "GET", headers: { Accept: "application/json" } }, 10000);
        const raw = await res.text().catch(() => "");
        if (!res.ok) {
          console.warn("[patient] non-OK", res.status, raw.slice(0, 200));
          setPatientData(null);
          return;
        }
        let parsed: any = null;
        try {
          parsed = raw ? JSON.parse(raw) : null;
        } catch (e) {
          console.warn("[patient] JSON parse failed", e);
        }
        setPatientData(parsed); // contains { ok: true, user: {...} }
        console.log("[patient] loaded:", parsed);
      } catch (e: any) {
        console.warn("[patient] fetch error:", e?.message || e);
        setPatientData(null);
      }
    };
    timer = setTimeout(run, 400); // debounce 400ms
    return () => clearTimeout(timer);
  }, [patientId]);

  // ---------- Derived variables from patientData (not shown in the form) ----------
  const patientConditions = useMemo(() => toList(patientData?.user?.Conditions), [patientData]);
  const patientAllergies  = useMemo(() => toList(patientData?.user?.Allergies), [patientData]);
  const patientMeds       = useMemo(() => toList(patientData?.user?.Active_Medications), [patientData]);

  // ---------------- Compatibility check ----------------
  const handleSubmit = async () => {
    resetErrors();
    if (!validateForCompatibility()) return;
    if (!hasNetwork) { setCompatError("No network connection detected."); return; }

    // Merge patient Conditions + typed Symptoms (Allergies & Meds come ONLY from patient)
    const mergedConditions = dedupePreserveOrder([...patientConditions, ...toList(trimmedSymptoms)]);
    const mergedAllergies  = patientAllergies; // from patient only
    const mergedMeds       = patientMeds;      // from patient only
  
    const qs = new URLSearchParams({
      drug: trimmedDrugs,
      allergies: mergedAllergies.join(","),   // not shown in form, but included in query
      conditions: mergedConditions.join(","),
      ongoingMeds: mergedMeds.join(","),
    });

    setCompatLoading(true);
    setSubmittedData(null);
    setCompatError(null);

    try {
      const res = await fetchWithTimeout(
        `http://localhost:5001/api/compatibility?${qs.toString()}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
        20000
      );
      console.log(`http://localhost:5001/api/compatibility?${qs.toString()}`)
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Compatibility request failed (${res.status}). ${text || ""}`.trim());
      }

      const data = await res.json().catch(() => { throw new Error("Failed to parse compatibility JSON."); });
      if (!data || typeof data !== "object") throw new Error("Unexpected compatibility response format.");

      setSubmittedData(data);
      setActiveIndex(0);
    } catch (err: any) {
      setCompatError(err?.message || "An unknown error occurred while fetching compatibility.");
    } finally {
      setCompatLoading(false);
    }
  };

  // ---------------- Research alternatives ----------------
  const handleRecommendation = async () => {
    resetErrors();
    if (!validateForRecommendations()) { setActiveIndex(4); return; }
    if (!hasNetwork) { setRecError("No network connection detected."); setActiveIndex(4); return; }

    const current_option = trimmedDrugs;
    const issue = trimmedSymptoms;

    const qs = new URLSearchParams({
      current_option,
      issue,
      // If you want to also pass patient context to research, uncomment:
      // conditions: dedupePreserveOrder([...patientConditions, ...toList(trimmedSymptoms)]).join(","),
      // allergies: patientAllergies.join(","),
      // ongoingMeds: patientMeds.join(","),
    });

    setRecLoading(true);
    setRecError(null);
    setRecData(null);
    setActiveIndex(4);

    try {
      const res = await fetchWithTimeout(
        `http://localhost:5001/api/research?${qs.toString()}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
        25000
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Recommendations request failed (${res.status}). ${text || ""}`.trim());
      }

      const data = await res.json().catch(() => { throw new Error("Failed to parse recommendations JSON."); });
      if (!data || typeof data !== "object") throw new Error("Unexpected recommendations response format.");
      if (data.ok === false) throw new Error(data.error || "Backend returned an error for recommendations.");

      setRecData(data);
      setActiveIndex(4);
    } catch (e: any) {
      setRecError(e?.message || "Failed to fetch research recommendations.");
      setActiveIndex(4);
    } finally {
      setRecLoading(false);
    }
  };

  // --------------- UI ---------------
  const ErrorBanner = ({ message }: { message: string | null }) =>
    !message ? null : <div className={styles.errorBanner}>{message}</div>;

  const FieldError = ({ message }: { message?: string }) =>
    !message ? null : <div className={styles.fieldError}>{message}</div>;

  const alternativeTabs = Array.isArray(recData?.result?.alternatives)
    ? recData.result.alternatives
    : [];

  // preview what will be sent (optional; does NOT show allergies/meds in the form)
  const mergedConditionsPreview = useMemo(() => {
    return dedupePreserveOrder([...patientConditions, ...toList(trimmedSymptoms)]);
  }, [patientConditions, trimmedSymptoms]);

  return (
    <div>
      <CardNav
        logo="/Clairvoyance.png"
        logoAlt="Company Logo"
        items={items}
        baseColor="#fff"
        menuColor="#000"
        buttonBgColor="#111"
        buttonTextColor="#fff"
        ease="power3.out"
      />

      <div className={styles.formWrapper}>
        <ErrorBanner message={formError} />

        {/* Inputs (ONLY Patient ID, Drug, Symptoms) */}
        <div className={styles.formContainer}>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">1.</span>
            <InputNumber
              placeholder="Patient ID"
              value={patientId}
              useGrouping={false}
              onValueChange={(e) => {
                console.log("[InputNumber] onValueChange:", e.value, typeof e.value);
                setPatientId(typeof e.value === "number" ? e.value : null);
              }}
            />
          </div>

          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">2.</span>
            <InputText
              placeholder="Drug (e.g., metformin)"
              value={drugs}
              onChange={(e) => setDrugs(e.target.value)}
              className={fieldErrors.drugs ? "p-invalid" : ""}
            />
          </div>
          <FieldError message={fieldErrors.drugs} />

          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">3.</span>
            <InputText
              placeholder="Symptoms / issue (comma separated)"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className={fieldErrors.symptoms ? "p-invalid" : ""}
            />
          </div>
          <FieldError message={fieldErrors.symptoms} />
        </div>

        {/* Submit */}
        <div className={styles.submitButton}>
          <button
            onClick={handleSubmit}
            className={styles.submitButtonInner}
            disabled={compatLoading}
            aria-busy={compatLoading}
            aria-disabled={compatLoading}
            title={compatLoading ? "Submitting..." : "Submit for compatibility"}
          >
            {compatLoading ? "Submitting…" : "Submit"}
          </button>
        </div>

        {(submittedData || recData || compatError || recError) && (
          <>
            <div className={styles.tabviewContainer}>
              <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Input">
                  <ErrorBanner message={compatError} />
                  <p><strong>Drug:</strong> {submittedData?.input?.drug || drugs || "N/A"}</p>
                  <p><strong>Patient Conditions:</strong> {mergedConditionsPreview.length ? mergedConditionsPreview.join(", ") : "None"}</p>
                  <p><strong>Patient Active Medications:</strong> {patientMeds.length ? patientMeds.join(", ") : "None"}</p>
                  <p><strong>Patient Allergies:</strong> {patientAllergies.length ? patientAllergies.join(", ") : "None"}</p>

                  {/* intentionally NOT showing allergies / meds in UI */}
                </TabPanel>

                <TabPanel header="Evidence">
                  <ErrorBanner message={compatError} />
                  <ul>
                    {submittedData?.result?.evidence_quotes?.map((q: string, i: number) => (<li key={i}>{q}</li>))}
                  </ul>
                  {!submittedData?.result?.evidence_quotes?.length && <p>No evidence quotes available.</p>}
                </TabPanel>

                <TabPanel header="Reasons">
                  <ErrorBanner message={compatError} />
                  <ul>
                    {submittedData?.result?.reasons?.map((r: string, i: number) => (<li key={i}>{r}</li>))}
                  </ul>
                  {!submittedData?.result?.reasons?.length && <p>No reasons returned.</p>}
                </TabPanel>

                <TabPanel header="Verdict">
                  <ErrorBanner message={compatError} />
                  <p><strong>{submittedData?.result?.verdict || "N/A"}</strong></p>
                </TabPanel>

                <TabPanel header="Alternatives">
                  <ErrorBanner message={recError} />
                  <div className={styles.resultsActionRow}>
                    <button
                      onClick={handleRecommendation}
                      className={styles.submitButtonInner}
                      disabled={recLoading}
                      aria-busy={recLoading}
                      aria-disabled={recLoading}
                      title={recLoading ? "Searching..." : "Get alternatives"}
                    >
                      {recLoading ? "Searching Alternatives…" : "Find Alternatives"}
                    </button>
                  </div>

                  {recLoading && <p>Loading alternatives…</p>}
                  {!recLoading && !recError && !recData && <p>No recommendations yet. Click “Find Alternatives”.</p>}

                  {!recLoading && !recError && Array.isArray(recData?.result?.alternatives) && recData.result.alternatives.length > 0 && (
                    <div className={styles.altTabs}>
                      <TabView>
                        {recData.result.alternatives.map((alt: any, idx: number) => (
                          <TabPanel key={idx} header={alt.name || `Alternative ${idx + 1}`}>
                            <div className={styles.altPane}>
                              <div className={styles.altBody}>{alt.description || "No description available"}</div>
                              {alt.recommended_dosage && <div className={styles.altDosage}>Recommended dosage: {alt.recommended_dosage}</div>}
                              {alt.citation && <div className={styles.altCardCitation}>📖 {alt.citation}</div>}
                            </div>
                          </TabPanel>
                        ))}
                      </TabView>
                    </div>
                  )}

                  {!recLoading && !recError && recData && (!Array.isArray(recData.result?.alternatives) || recData.result.alternatives.length === 0) && (
                    <p>No alternatives returned from the service.</p>
                  )}
                </TabPanel>
              </TabView>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
