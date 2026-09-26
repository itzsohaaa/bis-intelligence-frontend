import type { Metadata } from "next";
import { ModuleWorkspace } from "@/components/platform/module-workspace";
import { navigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navigation.hallmarking.label} | BIS Intelligence`,
};

export default function Page() {
  return <ModuleWorkspace page="hallmarking" />;
}
