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
      <div className="fixed inset-0 pointer-events-none z-[60]">
        <div className="absolute top-0 left-0 bg-primary transition-all duration-300 ease-out" style={{ width: `${scroll}%`, height: '4px' }} />
        <div className="absolute top-0 right-0 bg-primary transition-all duration-300 ease-out" style={{ height: `${scroll}%`, width: '4px' }} />
        <div className="absolute bottom-0 right-0 bg-primary transition-all duration-300 ease-out" style={{ width: `${100-scroll}%`, height: '4px' }} />
        <div className="absolute bottom-0 left-0 bg-primary transition-all duration-300 ease-out" style={{ height: `${100-scroll}%`, width: '4px' }} />
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