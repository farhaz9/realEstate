
"use client";

import { useEffect, useState } from "react";

export function useOnScroll(scrollThreshold = 0) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > scrollThreshold);
      setIsScrollingUp(currentScrollY < prevScrollY || currentScrollY <= 0);
      setPrevScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollY, scrollThreshold]);

  return { isScrolled, isScrollingUp };
}
