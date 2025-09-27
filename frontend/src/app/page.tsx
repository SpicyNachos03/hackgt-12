"use client";

import Image from "next/image";
import CardNav from '../components/CardNav'; 
import SpotlightCard from '../components/SpotlightCard';
import Stepper, { Step } from '../components/Stepper';
import { GoArrowUpRight } from 'react-icons/go';

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const items = [
    {
      label: "Tutorials",
      bgColor: "#0D0716",
      textColor: "#fff",
      
      links: [
        { label: "Company", href: "google.com", ariaLabel: "About Company" },
        { label: "Careers", href: "google.com",ariaLabel: "About Careers" }
      ]
    },
    {
      label: "Unique Factor", 
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Featured", href: "google.com",ariaLabel: "Featured Projects" },
        { label: "Case Studies", href: "google.com",ariaLabel: "Project Case Studies" }
      ]
    },
    {
      label: "Settings",
      bgColor: "#271E37", 
      textColor: "#fff",
      links: [
        { label: "Email", href: "google.com",ariaLabel: "Email us" },
        { label: "Twitter", href: "google.com",ariaLabel: "Twitter" },
        { label: "LinkedIn", href: "google.com", ariaLabel: "LinkedIn" }
      ]
    }
  ];
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
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

    <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginTop: '25%' }}>Title</h1>
        <p style={{ fontSize: '1.5rem', color: '#555', marginTop: '10px' }}>
          Slogan Slogan Slogan
        </p>
    </header>
  
    
    <div style={{ marginTop: '15%', display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.39)">
          <p style={{ color: '#ffffff'}}>Card 1 content goes here.</p>
        </SpotlightCard>
        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(255, 0, 229, 0.39)">
          <p style={{ color: '#ffffff' }}>Card 2 content goes here.</p>
        </SpotlightCard>
        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 255, 100, 0.39)">
          <p style={{ color: '#ffffff' }}>Card 3 content goes here.</p>
        </SpotlightCard>
      </div>
        <Stepper
      initialStep={1}
      onStepChange={(step) => {
        console.log(step);
      }}
      onFinalStepCompleted={() => console.log("All steps completed!")}
      backButtonText="Previous"
      nextButtonText="Next"
    >
      <Step>
        <h2>Welcome to the React Bits stepper!</h2>
        <p>Check out the next step!</p>
      </Step>
      <Step>
        <h2>Step 2</h2>
        <img style={{ height: '100px', width: '100%', objectFit: 'cover', objectPosition: 'center -70px', borderRadius: '15px', marginTop: '1em' }} src="https://www.purrfectcatgifts.co.uk/cdn/shop/collections/Funny_Cat_Cards_640x640.png?v=1663150894" />
        <p>Custom step content!</p>
      </Step>
      <Step>
        <h2>How about an input?</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name?" />
      </Step>
      <Step>
        <h2>Final Step</h2>
        <p>You made it!</p>
      </Step>
    </Stepper>
    </div>
  );
}

