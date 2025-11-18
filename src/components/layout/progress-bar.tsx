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
    const scrollPercent = (position / maxHeight) * 100;
    setScroll(scrollPercent);

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
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className="fixed top-16 left-0 w-full h-1 bg-transparent z-50">
        <div
          className="h-1 bg-primary transition-all duration-300 ease-out"
          style={{ width: `${scroll}%` }}
        />
      </div>
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-opacity duration-300",
          showButton ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
    </>
  );
}
