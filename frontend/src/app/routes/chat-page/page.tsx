"use client";
import { CedarCaptionChat } from "../../../cedar/components/chatComponents/CedarCaptionChat";
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';
import React from 'react'; 
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import "primereact/resources/themes/bootstrap4-dark-purple/theme.css"

export default function ChatPage() {


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