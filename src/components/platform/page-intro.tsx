import type { CapabilityStatus as Status } from "@/config/navigation";
import { CapabilityStatus } from "./capability-status";

export function PageIntro({ eyebrow, title, description, status }: {
  eyebrow: string; title: string; description: string; status: Status;
}) {
  return <header className="bis-intro">
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3"><p className="bis-eyebrow">{eyebrow}</p><CapabilityStatus status={status} /></div>
    <h1 className="bis-page-title">{title}</h1>
    <p className="bis-lead">{description}</p>
  </header>;
}
