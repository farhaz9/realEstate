
"use client";

import { useEffect, useState } from "react";

export function useOnScroll(threshold: number | string = 0) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let scrollThreshold = 0;

    if (typeof threshold === 'string') {
      const element = document.getElementById(threshold);
      if (element) {
        scrollThreshold = window.scrollY + element.getBoundingClientRect().top - 70; // 70px header offset
      }
    } else {
      scrollThreshold = threshold;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return { isScrolled };
}
