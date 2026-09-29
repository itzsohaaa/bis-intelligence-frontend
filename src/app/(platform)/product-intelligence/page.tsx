import type { Metadata } from "next";
import { ProductIntelligenceWorkspace } from "@/components/bis/product-intelligence-workspace";
import { navigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navigation.productIntelligence.label} | BIS Intelligence`,
};

export default function Page() {
  return <ProductIntelligenceWorkspace />;
}
