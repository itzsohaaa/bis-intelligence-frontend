import { CircleCheck, Clock3, Link2, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CapabilityStatus as Status } from "@/config/navigation";

const states = {
  available: { label: "Available", icon: CircleCheck },
  integrated: { label: "Integrated", icon: Link2 },
  "backend-dependent": { label: "Backend-dependent", icon: Layers },
  planned: { label: "Planned", icon: Clock3 },
} as const;

export function CapabilityStatus({ status }: { status: Status }) {
  const { label, icon: Icon } = states[status];
  return <Badge variant="outline" className="bis-status" data-capability={status}><Icon aria-hidden="true" />{label}</Badge>;
}
