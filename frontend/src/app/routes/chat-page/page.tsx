"use client";

import { useRouter } from "next/navigation";
import { CedarCaptionChat } from "../../../cedar/components/chatComponents/CedarCaptionChat";
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';
import React from 'react'; 
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import "primereact/resources/themes/bootstrap4-dark-purple/theme.css"
import { TabView, TabPanel } from "primereact/tabview";
import "primereact/resources/themes/tailwind-light/theme.css";

export default function ChatPage() {
  const router = useRouter();

  return (
    <div>
      <PrimeReactProvider>
        <div style={{ marginTop: "5%" }}>
        <div className="card flex flex-column md:flex-row gap-3">
            <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">1.</span>
                <InputNumber placeholder="Paitent ID" />
            </div>

            <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">2.</span>
                <InputText placeholder="Drugs" />
            </div>

            <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">3.</span>
                <InputText placeholder="Symptoms" />
            </div>
        </div>
        </div>
        
        </PrimeReactProvider>
    </div>
  );
}