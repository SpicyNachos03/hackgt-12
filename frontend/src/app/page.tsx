"use client";

import Image from "next/image";
import CardNav from '../components/CardNav'; 
import SpotlightCard from '../components/SpotlightCard';
import Stepper, { Step } from '../components/Stepper';
import LiquidEther from '../components/LiquidEther';
import { GoArrowUpRight } from 'react-icons/go'; 

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const items = [
    {
      label: "Unique Factor",
      bgColor: "#0D0716",
      textColor: "#fff",
      
      links: [
        { label: "Chat page", href: "./routes/chat-page", ariaLabel: "Chat page" }
      ]
    },
    {
      label: "Tutorials", 
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Sample Cases", href: "google.com",ariaLabel: "Sample Cases" },
        { label: "Step-By-Step", href: "google.com",ariaLabel: "Step by Step" }
      ]
    },
    {
      label: "Settings",
      bgColor: "#271E37", 
      textColor: "#fff",
      links: [
        { label: "Docs", href: "google.com",ariaLabel: "Docs" },
        { label: "Contact Us", href: "google.com",ariaLabel: "Step by Step" }
      ]
    }
  ];
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>

    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
  <LiquidEther
    colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
    mouseForce={20}
    cursorSize={100}
    isViscous={false}
    viscous={30}
    iterationsViscous={32}
    iterationsPoisson={32}
    resolution={0.5}
    isBounce={false}
    autoDemo={true}
    autoSpeed={0.5}
    autoIntensity={2.2}
    takeoverDuration={0.25}
    autoResumeDelay={3000}
    autoRampDuration={0.6}
  />
  </div>

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
        <SpotlightCard spotlightColor="rgba(132, 0, 255, 0.39)">
          <p style={{ color: '#ffffff'}}>Main Purpose of This Here</p>
        </SpotlightCard>
        <SpotlightCard spotlightColor="rgba(132, 0, 255, 0.39)">
          <p style={{ color: '#ffffff' }}>Picture of Something Here</p>
        </SpotlightCard>
        <SpotlightCard spotlightColor="rgba(132, 0, 255, 0.39)">
          <p style={{ color: '#ffffff' }}>Unique Different Thing Here</p>
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



