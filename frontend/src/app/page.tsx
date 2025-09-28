"use client";
import Image from "next/image";
import CardNav from "../components/CardNav";
import SpotlightCard from "../components/SpotlightCard";
import Stepper, { Step } from "../components/Stepper";
import LiquidEther from "../components/LiquidEther";
import { GoArrowUpRight } from "react-icons/go";
export default function Home() {
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
        { label: "Docs", href: "https://github.com/SpicyNachos03/hackgt-12/tree/main", ariaLabel: "Docs" },
        { label: "Contact Us", href: "google.com", ariaLabel: "Step by Step" },
      ],
    },
  ];
  return (
    <div style={{ padding: "25px", minHeight: "100vh", zIndex: 1 }}>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={50}
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
        logo="/Clairvoyance.png"
        logoAlt="Company Logo"
        items={items}
        baseColor="#fff"
        menuColor="#000"
        buttonBgColor="#111"
        buttonTextColor="#fff"
        ease="power3.out"
        postLoginRedirect="/routes/chat-page"
      />

      <header
        style={{
          position: "relative",
          zIndex: 2, // ensures it's above background
          textAlign: "center",
          marginBottom: "10%",
        }}
      >
        <h1 style={{ fontWeight: "900", fontSize: "10rem", marginTop: "25%", color: "#271E37" }}>
          Clairvoyance
        </h1>
        <p style={{ fontSize: "1.5rem", color: "#555", marginTop: "10px" }}>
          Where New Knowledge Meets Old Knowledge
        </p>
      </header>

      <div className="spotlight-container" >
        <SpotlightCard className="spotlight-card" spotlightColor="rgba(132, 0, 255, 0.39)">
          <p className="spotlight-text">
            Our core mission is to solve the knowledge gap where experienced doctors may struggle to keep pace with rapidly evolving medication research compared to newer providers. Closing this gap is vital to ensure every patient receives care informed by the latest medical evidence, regardless of their doctor’s career stage.
          </p>
        </SpotlightCard>

        <SpotlightCard className="spotlight-card" spotlightColor="rgba(132, 0, 255, 0.39)">
          <p className="spotlight-text">
            Our agentic AI keeps HCPs current by comparing existing prescriptions with the latest drug data, highlighting compatibility issues and surfacing newer, evidence-backed alternatives. This ensures providers always know whether a patient’s treatment plan can be improved with safer or more effective options.
          </p>
        </SpotlightCard>

        <SpotlightCard className="spotlight-card" spotlightColor="rgba(132, 0, 255, 0.39)">
          <p className="spotlight-text">
            Our solution stands apart by focusing on prescription affirmation, reducing uncertainty for doctors and freeing patients from unnecessary visits. While other health tech tools chase efficiency, we deliver confidence and clarity in care.
          </p>
        </SpotlightCard>
      </div>

    <div style={{ position: "relative", zIndex: 2 }}>
      <Stepper
        initialStep={1}
        onStepChange={(step) => {
          console.log(step);
        }}
        onFinalStepCompleted={() => console.log("All steps completed!")}
        backButtonText="Previous"
        nextButtonText="Next"
        style={{ paddingBottom: "250px" }}
      >
        <Step>
          <h2>Welcome to Clairvoyance!</h2>
          <p>Click the arrow to learn more!</p>
        </Step>
        <Step>
          <h2>Struggling to diagnose your patients properly?</h2>
          <img
            style={{
              height: "100px",
              width: "100%",
              objectFit: "cover",
              objectPosition: "center -70px",
              borderRadius: "15px",
              marginTop: "1em",
            }}
            src="/doctorpatient.png"
          />

          <p style={{ paddingTop: '20px' }}>Utilize our Agentic AI to help diagnose your patients better!</p>
        </Step>
        <Step>
          <h2>How do I use it?</h2>
          <p>Simply enter in your patient's symptoms, your diagnosis, and their information!</p>
        </Step>
        <Step>
          <h2>Want to try it out?</h2>
          <p>Click the button to try it out yourself?</p>
        </Step>
      </Stepper>
      </div>
    </div>
  );
}
