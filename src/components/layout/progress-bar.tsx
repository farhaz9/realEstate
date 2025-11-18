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

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50 md:top-16">
        <div
          className="h-1 bg-primary transition-all duration-300 ease-out"
          style={{ width: `${scroll}%` }}
        />
      </div>
      <Button
        size="icon"
        className={cn(
          "fixed bottom-20 right-4 z-50 rounded-full h-14 w-14 shadow-lg transition-opacity duration-300 md:bottom-6",
          showButton ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-7 w-7" />
      </Button>
    </>
  );
}
