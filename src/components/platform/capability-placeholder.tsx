import { Clock3, Info, Unplug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { navigation, type CapabilityStatus, type PlatformPage } from "@/config/navigation";

const capabilityStates = {
  foundation: {
    label: "Frontend foundation", icon: Info,
    title: "Your platform starts here",
    message: "Navigation is available. Live activity, summaries, and BIS data are not connected. Explore the sections to see their current availability.",
  },
  supported: {
    label: "Supported · not connected", icon: Unplug,
    title: "Evidence-grounded queries are supported by the backend contract",
    message: "This workspace is not connected yet. Asking questions and viewing answers, citations, and verification requirements will become available after integration.",
  },
  planned: {
    label: "Planned · backend dependent", icon: Clock3,
    title: "This capability is planned",
    message: "This section is a placeholder. Its dedicated experience depends on confirmed backend support and future integration. No live results or actions are available here.",
  },
} satisfies Record<CapabilityStatus, { label: string; icon: typeof Info; title: string; message: string }>;

export function CapabilityPlaceholder({ page }: { page: PlatformPage }) {
  const item = navigation[page];
  const state = capabilityStates[item.status];
  const Icon = item.icon;
  const StatusIcon = state.icon;

  return (
    <section aria-labelledby="page-title" className="max-w-3xl space-y-8">
      <div className="space-y-4">
        <div className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
          <Icon aria-hidden="true" className="size-6" />
        </div>
        <Badge variant="outline" className="h-auto whitespace-normal py-1">
          <StatusIcon aria-hidden="true" />{state.label}
        </Badge>
        <h1 id="page-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">{item.label}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
      <Card>
        <CardHeader><h2 className="font-medium">{state.title}</h2></CardHeader>
        <CardContent><p className="leading-relaxed text-muted-foreground">{state.message}</p></CardContent>
      </Card>
    </section>
  );
}
