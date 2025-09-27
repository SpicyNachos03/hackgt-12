import Image from "next/image";
import CardNav from '../components/CardNav'; 
import { GoArrowUpRight } from 'react-icons/go';

export default function Home() {
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
    </div>
  );
}
