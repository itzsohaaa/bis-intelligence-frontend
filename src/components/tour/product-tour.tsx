"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TourStep {
  id: string;
  route: string;
  selector: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    route: "/dashboard",
    selector: '[data-tour="platform-brand"]',
    title: "Welcome to BIS Intelligence Platform",
    description:
      "An AI-powered regulatory platform delivering forensic verification of Indian Standards (IS), statutory QCO compliance, and testing laboratory discovery.",
    placement: "bottom",
  },
  {
    id: "dashboard-workspace",
    route: "/dashboard",
    selector: '[data-tour="dashboard-metrics"]',
    title: "Dashboard & Live Knowledge Coverage",
    description:
      "Monitor real-time knowledge coverage across 19+ Indian Standards, gazetted Quality Control Orders (QCOs), accredited testing laboratories, and runtime provenance.",
    placement: "bottom",
  },
  {
    id: "ask-bis",
    route: "/ask-bis",
    selector: '[data-tour="ask-bis-input"]',
    title: "Ask BIS Intelligence Engine",
    description:
      "Submit compliance questions in natural language. Features dual English/हिन्दी support, expert/consumer plain-language modes, and zero-hallucination guardrails.",
    placement: "bottom",
  },
  {
    id: "evidence-verification",
    route: "/ask-bis",
    selector: '[data-tour="ask-bis-evidence-controls"]',
    title: "Forensic Evidence & Progressive Disclosure",
    description:
      "Every answer features progressive disclosure: a clear conclusion for general users, with expandable claim entailment, clause citations, and temporal validity audit trails.",
    placement: "bottom",
  },
  {
    id: "standards-explorer",
    route: "/standards",
    selector: '[data-tour="standards-search"]',
    title: "Standards Explorer & QCO Tracking",
    description:
      "Search across the verified Indian Standards catalog. Filter by industry sector (electrical, civil, electronics, etc.) and toggle mandatory Quality Control Orders.",
    placement: "bottom",
  },
  {
    id: "huid-verification",
    route: "/hallmarking",
    selector: '[data-tour="huid-verification"]',
    title: "Dynamic HUID & Hallmark Verification",
    description:
      "Validate 6-character laser-etched Hallmark Unique Identification (HUID) codes fail-closed against authoritative BIS evidence, protecting against counterfeit gold.",
    placement: "top",
  },
  {
    id: "live-hallmarking",
    route: "/hallmarking",
    selector: '[data-tour="purity-table"]',
    title: "Gold Fineness Grades (IS 1417:2016)",
    description:
      "Inspect official purity standards (22K916, 18K750, 14K585) recognized under IS 1417:2016 and mandatory Hallmarking Gazette Order S.O. 4345(E).",
    placement: "top",
  },
  {
    id: "compliance-passport",
    route: "/passport",
    selector: '[data-tour="passport-generator"]',
    title: "Product Compliance Passport",
    description:
      "Generate structured, audit-ready compliance dossiers with SHA-256 cryptographic integrity digests for tenders, export clearance, and regulatory filings.",
    placement: "bottom",
  },
  {
    id: "tour-completion",
    route: "/dashboard",
    selector: '[data-tour="tour-trigger"]',
    title: "Tour Completed!",
    description:
      "You are now familiar with all major modules of the BIS Intelligence Platform. You can relaunch this interactive guided tour anytime by clicking 'Product Tour' in the top bar.",
    placement: "bottom",
  },
];

const STORAGE_KEY = "bis-intelligence-tour-completed";

export function ProductTour({
  isActive,
  onClose,
}: {
  isActive: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const step = TOUR_STEPS[currentStepIndex];
  const totalSteps = TOUR_STEPS.length;

  const updateTargetRect = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    } else {
      setTargetRect(null);
    }
  }, [step]);

  // Navigate if step is on a different route
  useEffect(() => {
    if (!isActive || !step) return;

    if (pathname !== step.route) {
      setIsNavigating(true);
      router.push(step.route);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        updateTargetRect();
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setIsNavigating(false);
      const timer = setTimeout(() => {
        updateTargetRect();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStepIndex, pathname, step, router, updateTargetRect]);

  // Listen to window resize and scroll to reposition
  useEffect(() => {
    if (!isActive) return;
    function handleResize() {
      updateTargetRect();
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [isActive, updateTargetRect]);

  // Keyboard navigation: Escape to close, ArrowRight/Left to navigate
  useEffect(() => {
    if (!isActive) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleComplete();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, currentStepIndex]);

  function handleComplete() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    onClose();
  }

  function handleNext() {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }

  function handlePrev() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }

  if (!isActive || !step) return null;

  // Calculate card position relative to spotlight target or center viewport
  let cardStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
  };

  if (targetRect) {
    const margin = 16;
    const cardWidth = 380;
    const cardHeight = 240;

    let top = targetRect.bottom + margin;
    let left = targetRect.left + (targetRect.width - cardWidth) / 2;

    // Boundary clamping
    if (left < 16) left = 16;
    if (left + cardWidth > window.innerWidth - 16) {
      left = window.innerWidth - cardWidth - 16;
    }

    if (top + cardHeight > window.innerHeight - 16 || step.placement === "top") {
      top = Math.max(16, targetRect.top - cardHeight - margin);
    }

    cardStyle = {
      ...cardStyle,
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${cardWidth}px`,
    };
  } else {
    // Center of screen fallback
    cardStyle = {
      ...cardStyle,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "380px",
    };
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
      className="fixed inset-0 z-[9990] transition-opacity duration-300"
    >
      {/* Dark Spotlight Backdrop */}
      <svg
        className="pointer-events-auto absolute inset-0 size-full"
        style={{ fillRule: "evenodd" }}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White covers entire viewport */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout reveals target element */}
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - 6)}
                y={Math.max(0, targetRect.top - 6)}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.65)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Target Highlight Ring */}
      {targetRect && (
        <div
          className="pointer-events-none fixed rounded-lg ring-4 ring-brand/60 ring-offset-2 transition-all duration-300 ease-out"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            zIndex: 9995,
          }}
        />
      )}

      {/* Floating Tour Step Card */}
      <div
        style={cardStyle}
        className="rounded-xl border border-rule/80 bg-white p-5 shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95 text-ink"
      >
        {/* Card Header: Step counter and Close */}
        <div className="flex items-center justify-between border-b border-rule/60 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand">
            <Sparkles className="size-3.5" />
            <span>
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
          </div>
          <button
            type="button"
            onClick={handleComplete}
            aria-label="Close tour"
            className="rounded p-1 text-ink-muted hover:bg-canvas hover:text-ink transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Card Content */}
        <div className="my-4 space-y-2">
          <h3
            id="tour-step-title"
            className="text-base font-bold tracking-tight text-ink leading-snug"
          >
            {step.title}
          </h3>
          <p className="text-xs leading-relaxed text-ink-muted">
            {step.description}
          </p>
        </div>

        {/* Card Footer: Navigation buttons */}
        <div className="flex items-center justify-between border-t border-rule/60 pt-3">
          <button
            type="button"
            onClick={handleComplete}
            className="text-xs font-medium text-ink-muted hover:text-ink underline-offset-2 hover:underline"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentStepIndex === 0 || isNavigating}
              onClick={handlePrev}
              className="h-8 px-2.5 text-xs font-medium"
            >
              <ArrowLeft className="size-3 mr-1" />
              Back
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isNavigating}
              onClick={handleNext}
              className="h-8 bg-brand px-3 text-xs font-medium text-white hover:bg-brand/90"
            >
              {currentStepIndex === totalSteps - 1 ? (
                <>
                  Finish <CheckCircle2 className="size-3 ml-1" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="size-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
