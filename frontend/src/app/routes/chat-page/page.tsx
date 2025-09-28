"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { TabView, TabPanel } from "primereact/tabview";
//import { Button } from "primereact/button";
import CardNav from "../../../components/CardNav";
import styles from "./page.module.css";
import "primereact/resources/themes/md-light-deeppurple/theme.css";

export default function ChatPage() {
  const router = useRouter();

  // ---------------- UI state ----------------
  const [patientId, setPatientId] = useState<number | null>(null);
  const [drugs, setDrugs] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");

  // Form-level and field-level errors
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ drugs?: string; symptoms?: string }>({});

  // Compatibility API state
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [compatLoading, setCompatLoading] = useState<boolean>(false);
  const [compatError, setCompatError] = useState<string | null>(null);

  // Research/Alternatives API state
  const [recData, setRecData] = useState<any>(null);
  const [recLoading, setRecLoading] = useState<boolean>(false);
  const [recError, setRecError] = useState<string | null>(null);

  // Tabs: 0=Input, 1=Evidence, 2=Reasons, 3=Verdict, 4=Alternatives
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const items = [
    {
      label: "Unique Factor",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [{ label: "Chat page", href: "./routes/chat-page", ariaLabel: "Chat page" }],
    },
    {
      label: "Tutorials",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Sample Cases", href: "google.com", ariaLabel: "Sample Cases" },
        { label: "Step-By-Step", href: "google.com", ariaLabel: "Step by Step" },
      ],
    },
    {
      label: "Settings",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Docs", href: "google.com", ariaLabel: "Docs" },
        { label: "Contact Us", href: "google.com", ariaLabel: "Step by Step" },
      ],
    },
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
    if (!trimmedDrugs) {
      errs.drugs = "Drug is required to fetch alternatives.";
    }
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

  // ---------------- Compatibility check ----------------
  const handleSubmit = async () => {
    resetErrors();
    if (!validateForCompatibility()) {
      return;
    }
    if (!hasNetwork) {
      setCompatError("No network connection detected.");
      return;
    }

    const formatList = (input: string) =>
      input ? input.split(",").map((s) => s.trim()).filter(Boolean).join(",") : "";

    const queryParams = new URLSearchParams({
      drug: trimmedDrugs,
      allergies: "",
      conditions: formatList(trimmedSymptoms),
      ongoingMeds: "",
    });

    setCompatLoading(true);
    setSubmittedData(null);
    setCompatError(null);

    try {
      const res = await fetchWithTimeout(
        `http://localhost:5001/api/compatibility?${queryParams.toString()}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
        20000
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Compatibility request failed (${res.status}). ${text || ""}`.trim());
      }

      const data = await res.json().catch(() => {
        throw new Error("Failed to parse compatibility JSON.");
      });

      if (!data || typeof data !== "object") {
        throw new Error("Unexpected compatibility response format.");
      }

      setSubmittedData(data);
      setActiveIndex(0);
    } catch (err: any) {
      setCompatError(err?.message || "An unknown error occurred while fetching compatibility.");
    } finally {
      setCompatLoading(false);
    }
  };

  // ---------------- Research alternatives ----------------
  // Backend expects: current_option (required), issue (optional), search_hint (optional)
  const handleRecommendation = async () => {
    resetErrors();
    if (!validateForRecommendations()) {
      setActiveIndex(4);
      return;
    }
    if (!hasNetwork) {
      setRecError("No network connection detected.");
      setActiveIndex(4);
      return;
    }

    const current_option = trimmedDrugs; // REQUIRED
    const issue = trimmedSymptoms;       // OPTIONAL
    const hintParts = [
      issue || null,
      patientId !== null ? `patient:${patientId}` : null,
    ].filter(Boolean);
    const search_hint = hintParts.join(" ").trim();

    const queryParams = new URLSearchParams({
      current_option,
      issue,
      search_hint,
    });

    setRecLoading(true);
    setRecError(null);
    setRecData(null);
    setActiveIndex(4);

    try {
      const res = await fetchWithTimeout(
        `http://localhost:5001/api/research?${queryParams.toString()}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
        25000
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Recommendations request failed (${res.status}). ${text || ""}`.trim());
      }

      const data = await res.json().catch(() => {
        throw new Error("Failed to parse recommendations JSON.");
      });

      if (!data || typeof data !== "object") {
        throw new Error("Unexpected recommendations response format.");
      }
      if (data.ok === false) {
        throw new Error(data.error || "Backend returned an error for recommendations.");
      }

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

  // Build Alternative tabs
  const alternativeTabs = Array.isArray(recData?.result?.alternatives)
    ? recData.result.alternatives
    : [];

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

      {/* Entire screen content container */}
      <div className={styles.formWrapper}>
        {/* Global form error */}
        <ErrorBanner message={formError} />

        {/* Inputs */}
        <div className={styles.formContainer}>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">1.</span>
            <InputNumber
              placeholder="Patient ID"
              value={patientId ?? undefined}
              onValueChange={(e) =>
                setPatientId(e.value !== undefined && e.value !== null ? Number(e.value) : null)
              }
            />
          </div>

          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">2.</span>
            <InputText
              placeholder="Drugs (e.g., metformin)"
              value={drugs}
              onChange={(e) => setDrugs(e.target.value)}
              className={fieldErrors.drugs ? "p-invalid" : ""}
            />
          </div>
          <FieldError message={fieldErrors.drugs} />

          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">3.</span>
            <InputText
              placeholder="Symptoms / issue (e.g., kidney disease contraindication)"
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

        {/* Results (kept inside the SAME container for cohesion) */}
        {(submittedData || recData || compatError || recError) && (
          <>
            <div className={styles.tabviewContainer}>
              <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Input">
                  <ErrorBanner message={compatError} />
                  <p>
                    <strong>Drug:</strong> {submittedData?.input?.drug || drugs || "N/A"}
                  </p>
                  <p>
                    <strong>Conditions:</strong>{" "}
                    {submittedData?.input?.conditions?.length
                      ? submittedData.input.conditions.join(", ")
                      : symptoms || "None"}
                  </p>
                  <p>
                    <strong>Allergies:</strong>{" "}
                    {submittedData?.input?.allergies?.length
                      ? submittedData.input.allergies.join(", ")
                      : "None"}
                  </p>
                  <p>
                    <strong>Ongoing Medications:</strong>{" "}
                    {submittedData?.input?.ongoingMeds?.length
                      ? submittedData.input.ongoingMeds.join(", ")
                      : "None"}
                  </p>
                </TabPanel>

                <TabPanel header="Evidence">
                  <ErrorBanner message={compatError} />
                  <ul>
                    {submittedData?.result?.evidence_quotes?.map((quote: string, i: number) => (
                      <li key={i}>{quote}</li>
                    ))}
                  </ul>
                  {!submittedData?.result?.evidence_quotes?.length && (
                    <p>No evidence quotes available.</p>
                  )}
                </TabPanel>

                <TabPanel header="Reasons">
                  <ErrorBanner message={compatError} />
                  <ul>
                    {submittedData?.result?.reasons?.map((reason: string, i: number) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                  {!submittedData?.result?.reasons?.length && <p>No reasons returned.</p>}
                </TabPanel>

                <TabPanel header="Verdict">
                  <ErrorBanner message={compatError} />
                  <p>
                    <strong>{submittedData?.result?.verdict || "N/A"}</strong>
                  </p>
                </TabPanel>

                {/* Alternatives: contains its OWN inner tabview per drug/class */}
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

                  {!recLoading && !recError && !recData && (
                    <p>No recommendations yet. Click “Find Alternatives”.</p>
                  )}

                  {!recLoading && !recError && alternativeTabs.length > 0 && (
                    <div className={styles.altTabs}>
                      <TabView>
                        {alternativeTabs.map((alt: any, idx: number) => (
                          <TabPanel key={idx} header={alt.name || `Alternative ${idx + 1}`}>
                            <div className={styles.altPane}>
                              <div className={styles.altBody}>
                                {alt.description || "No description available"}
                              </div>

                              {/* NEW: dosage line if present */}
                              {alt.recommended_dosage && (
                                <div className={styles.altDosage}>
                                  Recommended dosage: {alt.recommended_dosage}
                                </div>
                              )}

                              {alt.citation && (
                                <div className={styles.altCardCitation}>
                                  📖 {alt.citation}
                                </div>
                              )}
                            </div>
                          </TabPanel>
                        ))}
                      </TabView>
                    </div>
                  )}

                  {!recLoading && !recError && recData && alternativeTabs.length === 0 && (
                    <p>No alternatives returned from the service.</p>
                  )}

                  {!recLoading &&
                    !recError &&
                    recData &&
                    !Array.isArray(recData.result?.alternatives) && (
                      <pre className={styles.altJson}>
                        {JSON.stringify(recData.result ?? recData, null, 2)}
                      </pre>
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
