import type { ReactNode } from "react";
import { ApplicationShell } from "@/components/platform/application-shell";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return <ApplicationShell>{children}</ApplicationShell>;
}
