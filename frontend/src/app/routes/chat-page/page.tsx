"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { TabView, TabPanel } from "primereact/tabview";
//import { Button } from "primereact/button";
import CardNav from "../../../components/CardNav";
import styles from "./page.module.css";
import "primereact/resources/themes/md-light-deeppurple/theme.css";

export default function ChatPage() {
  const router = useRouter();

  const [patientId, setPatientId] = useState<number | null>(null);
  const [drugs, setDrugs] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  const [submittedData, setSubmittedData] = useState<any>(null);

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

  const handleSubmit = async () => {
    const formatList = (input: string) =>
      input ? input.split(",").map((s) => s.trim()).filter(Boolean).join(",") : "";

    const queryParams = new URLSearchParams({
      drug: drugs,
      allergies: "",
      conditions: formatList(symptoms),
      ongoingMeds: "",
    });

    try {
      const res = await fetch(
        `http://localhost:5001/api/compatibility?${queryParams.toString()}`
      );
      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      setSubmittedData(data);
    } catch (err) {
      setSubmittedData({
        error: err instanceof Error ? err.message : "An unknown error occurred",
      });
    }
  };

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
              placeholder="Drugs"
              value={drugs}
              onChange={(e) => setDrugs(e.target.value)}
            />
          </div>

          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">3.</span>
            <InputText
              placeholder="Symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.submitButton}>
            <button
              onClick={handleSubmit}
              className={styles.submitButtonInner}
            >
              Submit
            </button>
          </div>

        {submittedData && (
          <div className={styles.tabviewContainer}>
            <TabView>
              <TabPanel header="Input">
                <p>
                  <strong>Drug:</strong> {submittedData.input?.drug || "N/A"}
                </p>
                <p>
                  <strong>Conditions:</strong>{" "}
                  {submittedData.input?.conditions?.length
                    ? submittedData.input.conditions.join(", ")
                    : "None"}
                </p>
                <p>
                  <strong>Allergies:</strong>{" "}
                  {submittedData.input?.allergies?.length
                    ? submittedData.input.allergies.join(", ")
                    : "None"}
                </p>
                <p>
                  <strong>Ongoing Medications:</strong>{" "}
                  {submittedData.input?.ongoingMeds?.length
                    ? submittedData.input.ongoingMeds.join(", ")
                    : "None"}
                </p>
              </TabPanel>

              <TabPanel header="Evidence">
                <ul>
                  {submittedData.result?.evidence_quotes?.map(
                    (quote: string, i: number) => <li key={i}>{quote}</li>
                  )}
                </ul>
              </TabPanel>

              <TabPanel header="Reasons">
                <ul>
                  {submittedData.result?.reasons?.map((reason: string, i: number) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </TabPanel>

              <TabPanel header="Verdict">
                <p>
                  <strong>{submittedData.result?.verdict || "N/A"}</strong>
                </p>
              </TabPanel>
            </TabView>
          </div>
        )}
      </div>
    </div>
  );
}