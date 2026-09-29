import type { Metadata } from "next";
import { CertificationWorkspace } from "@/components/bis/certification-workspace";
import { navigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navigation.certification.label} | BIS Intelligence`,
};

export default function Page() {
  return <CertificationWorkspace />;
}
