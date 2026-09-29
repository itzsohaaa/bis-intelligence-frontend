import type { Metadata } from "next";
import { StandardsWorkspace } from "@/components/bis/standards-workspace";
import { navigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navigation.standards.label} | BIS Intelligence`,
};

export default function Page() {
  return <StandardsWorkspace />;
}
