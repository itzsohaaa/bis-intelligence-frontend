import type { Metadata } from "next";
import { Dashboard } from "@/components/platform/dashboard";
import { navigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navigation.dashboard.label} | BIS Intelligence`,
};

export default function Page() {
  return <Dashboard />;
}
