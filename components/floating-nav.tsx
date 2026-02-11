"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { Crown, Home, Info, User } from "lucide-react";
import Link from "next/link";

export function FloatingNav() {
  const { language, setLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["king-section", "queen-section", "about-section"];
      const scrollPosition = window.scrollY + 200;

      // Check if we're at the top (home)
      if (window.scrollY < 300) {
        setActiveSection("home");
        return;
      }

      // Check which section is in view
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("home");
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className=" fixed md:top-6 bottom-4 md:bottom-auto left-1/2 -translate-x-1/2 z-50 w-full md:w-auto px-12 md:px-0">
      <div className=" bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-full p-1 md:py-2.5 grid grid-cols-4 items-center gap-1.5 md:gap-2 max-w-md md:max-w-none mx-auto">
        {/* Navigation Links */}
        <button
          onClick={() => scrollToSection("home")}
          className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-medium transition-all flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-0 ${
            activeSection === "home"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] md:hidden">Home</span>
          <span className="hidden md:inline ml-2">Home</span>
        </button>
        <button
          onClick={() => scrollToSection("king-section")}
          className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-0 ${
            activeSection === "king-section"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chess-king-icon lucide-chess-king w-4 h-4"
          >
            <path d="M4 20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
            <path d="m6.7 18-1-1C4.35 15.682 3 14.09 3 12a5 5 0 0 1 4.95-5c1.584 0 2.7.455 4.05 1.818C13.35 7.455 14.466 7 16.05 7A5 5 0 0 1 21 12c0 2.082-1.359 3.673-2.7 5l-1 1" />
            <path d="M10 4h4" />
            <path d="M12 2v6.818" />
          </svg>
          {/* <ChessKing className="w-4 h-4" /> */}
          <span className="text-[10px] md:hidden">King</span>
          <span className="hidden md:inline ml-2">King</span>
        </button>
        <button
          onClick={() => scrollToSection("queen-section")}
          className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-0 ${
            activeSection === "queen-section"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chess-queen-icon lucide-chess-queen w-4 h-4"
          >
            <path d="M4 20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
            <path d="m12.474 5.943 1.567 5.34a1 1 0 0 0 1.75.328l2.616-3.402" />
            <path d="m20 9-3 9" />
            <path d="m5.594 8.209 2.615 3.403a1 1 0 0 0 1.75-.329l1.567-5.34" />
            <path d="M7 18 4 9" />
            <circle cx="12" cy="4" r="2" />
            <circle cx="20" cy="7" r="2" />
            <circle cx="4" cy="7" r="2" />
          </svg>
          {/* <ChessQueen className="w-4 h-4" /> */}
          <span className="text-[10px] md:hidden">Queen</span>
          <span className="hidden md:inline ml-2">Queen</span>
        </button>
        <button
          onClick={() => scrollToSection("about-section")}
          className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-0 ${
            activeSection === "about-section"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Info className="w-4 h-4" />
          <span className="text-[10px] md:hidden">About</span>
          <span className="hidden md:inline ml-2">About</span>
        </button>
      </div>
    </div>
  );
}
