import type { Metadata } from "next";
import { CapabilityPlaceholder } from "@/components/platform/capability-placeholder";
import { navigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navigation.standards.label} | BIS Intelligence`,
};

export default function Page() {
  return <CapabilityPlaceholder page="standards" />;
}
