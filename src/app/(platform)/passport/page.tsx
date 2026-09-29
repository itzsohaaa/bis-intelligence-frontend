import type { Metadata } from "next";
import { PassportWorkspace } from "@/components/bis/passport-workspace";
import { navigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navigation.passport.label} | BIS Intelligence`,
};

export default function Page() {
  return <PassportWorkspace />;
}
