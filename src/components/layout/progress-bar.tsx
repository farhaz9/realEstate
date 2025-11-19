"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProgressBar() {
  const [scroll, setScroll] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const handleScroll = () => {
    const position = window.scrollY;
    const maxHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    if (maxHeight > 0) {
      const scrollPercent = (position / maxHeight) * 100;
      setScroll(scrollPercent);
    } else {
      setScroll(0);
    }

    if (position > 300) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Call on mount to set initial state
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scroll / 100) * circumference;

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 z-40 transition-opacity duration-300 md:bottom-6",
        showButton ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <Button
        size="icon"
        className="relative h-14 w-14 rounded-full shadow-lg"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-7 w-7" />
      </Button>
      <svg
        className="absolute top-0 left-0 h-full w-full -rotate-90"
        width="56"
        height="56"
        viewBox="0 0 56 56"
      >
        <circle
          className="text-primary/20"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="28"
          cy="28"
        />
        <circle
          className="text-primary"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="28"
          cy="28"
        />
      </svg>
    </div>
  );
}
