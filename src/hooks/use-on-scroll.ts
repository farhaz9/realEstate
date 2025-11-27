
"use client";

import { useEffect, useState } from "react";

export function useOnScroll(threshold: number | string = 0) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [prevScrollY, setPrevScrollY] = useState(0);

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
      setIsScrollingUp(currentScrollY < prevScrollY || currentScrollY <= 0);
      setPrevScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollY, threshold]);

  return { isScrolled, isScrollingUp };
}
