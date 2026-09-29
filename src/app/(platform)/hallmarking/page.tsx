import type { Metadata } from "next";
import { HallmarkingWorkspace } from "@/components/bis/hallmarking-workspace";
import { navigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navigation.hallmarking.label} | BIS Intelligence`,
};

export default function Page() {
  return <HallmarkingWorkspace />;
}
