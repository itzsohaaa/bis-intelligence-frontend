"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: server-rendered content is visible without JS. */
export function SectionReveals() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (preference.matches || !("IntersectionObserver" in window)) return;

    const reveal = (section: HTMLElement) => {
      section.dataset.revealState = "visible";
      observer.unobserve(section);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target as HTMLElement);
      });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });

    // One batch of layout reads before writes. Never hide already-visible content.
    const positions = sections.map((section) => section.getBoundingClientRect().top);
    sections.forEach((section, index) => {
      if (section.dataset.revealState === "visible" || section.dataset.revealState === "complete") return;
      if (positions[index] < window.innerHeight) reveal(section);
      else { section.dataset.revealState = "waiting"; observer.observe(section); }
    });
    const onPreference = () => {
      if (preference.matches) { observer.disconnect(); sections.forEach((section) => { section.dataset.revealState = "complete"; }); }
    };
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const section = event.target.closest<HTMLElement>("[data-reveal]");
      if (section?.dataset.revealState === "waiting") reveal(section);
    };
    preference.addEventListener("change", onPreference);
    document.addEventListener("focusin", onFocus);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", onPreference);
      document.removeEventListener("focusin", onFocus);
      sections.forEach((section) => { if (section.dataset.revealState === "waiting") delete section.dataset.revealState; });
    };
  }, [pathname]);
  return null;
}
