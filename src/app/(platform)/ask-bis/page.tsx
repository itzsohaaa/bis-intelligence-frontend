import type { Metadata } from "next";
import { AskBISWorkspace } from "@/components/bis/ask-bis-workspace";
import { navigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navigation.askBis.label} | BIS Intelligence`,
};

export default function Page() {
  return <AskBISWorkspace />;
}
