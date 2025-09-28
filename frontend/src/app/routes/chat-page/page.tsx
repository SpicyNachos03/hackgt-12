"use client";
import { useRouter } from "next/navigation";
import { CedarCaptionChat } from "../../../cedar/components/chatComponents/CedarCaptionChat";
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';
import React, { useState } from 'react'; 
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import "primereact/resources/themes/bootstrap4-dark-purple/theme.css"
import { TabView, TabPanel } from "primereact/tabview";
import "primereact/resources/themes/tailwind-light/theme.css";
import { Button } from "primereact/button";
import { ProgressBar } from 'primereact/progressbar';
import CardNav from "../../../components/CardNav";
import { format } from "path";

export default function ChatPage() {
  const router = useRouter();
  const value = 75;

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

  /*
  const handleSubmit = async () => {
  const formatList = (input: string) => input ? input.split(',').map(s => s.trim()).filter(Boolean).join(',') : '';

  const queryParams = new URLSearchParams({
    drug: drugs,
    allergies: '', 
    conditions: formatList(symptoms), 
    ongoingMeds: '', 
  });

  try {
    const res = await fetch(`http://localhost:5001/api/compatibility?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Network response was not ok');

    const data = await res.json();
    console.log('Compatibility API response:', data);
    setSubmittedData(data);
  } catch (err) {
    console.error('Error fetching compatibility:', err);
    setSubmittedData({ error: err instanceof Error ? err.message : 'An unknown error occurred' });
  }

  */ 

  const handleSubmit = () => { const formData = { patientId, drugs, symptoms, }; console.log("Form Data Submitted: ", formData); setSubmittedData(formData); // save it in state };
};
 
  return (
    <div>
      <CardNav
      logo="/logo.png"
      logoAlt="Company Logo"
      items={items}
      baseColor="#fff"
      menuColor="#000"
      buttonBgColor="#111"
      buttonTextColor="#fff"
      ease="power3.out"
      />
        <div style={{ marginTop: "15%" }}>
        <div className="card flex flex-column md:flex-row gap-3">
            <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">1.</span>
                <InputNumber placeholder="Paitent ID" value={patientId} onValueChange={(e) => setPatientId(e.value ?? 0)}/>
            </div>

            <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">2.</span>
                <InputText placeholder="Drugs" value={drugs} onChange={(e) => setDrugs(e.target.value)}/>
            </div>

            <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">3.</span>
                <InputText placeholder="Symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)}/>
            </div>
        </div>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Button 
          label="Submit" 
          className="p-button-rounded p-button-success"
          onClick={handleSubmit}
        />
      </div>
      {submittedData && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <h3>Submitted Data:</h3>
            <pre>{JSON.stringify(submittedData, null, 2)}</pre>
          </div>
        )}
        <TabView>
        <TabPanel header="Header I">
          <p className="m-0">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
          </p>
        </TabPanel>
        <TabPanel header="Header II">
          <p className="m-0">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium...
          </p>
        </TabPanel>
        <TabPanel header="Header III">
          <p className="m-0">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium...
          </p>
        </TabPanel>
      </TabView>

      <ProgressBar value={value}></ProgressBar>
      </div>
        
    </div>
  );
}