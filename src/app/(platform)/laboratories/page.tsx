import { Suspense } from "react";
import type { Metadata } from "next";
import { LaboratoriesWorkspace } from "@/components/bis/laboratories-workspace";
import { navigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navigation.laboratories.label} | BIS Intelligence`,
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="bis-stack">
          <div className="bis-panel bis-panel-pad text-sm text-ink-muted">
            Loading testing laboratories workspace…
          </div>
        </div>
      }
    >
      <LaboratoriesWorkspace />
    </Suspense>
  );
}
