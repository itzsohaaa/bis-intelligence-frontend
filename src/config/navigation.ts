import {
  BookOpen, Boxes, ClipboardCheck, Gem, Home, LayoutDashboard,
  MessageSquareText, Microscope, NotebookTabs, type LucideIcon,
} from "lucide-react";

export type CapabilityStatus = "foundation" | "supported" | "planned";

type NavigationItem = {
  href: `/${string}`;
  label: string;
  icon: LucideIcon;
  status: CapabilityStatus;
  description: string;
};

export const navigation = {
  home: {
    href: "/", label: "Landing page", icon: Home, status: "foundation",
    description: "BIS Intelligence Platform.",
  },
  dashboard: {
    href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, status: "foundation",
    description: "Your starting point for standards intelligence and BIS services.",
  },
  askBis: {
    href: "/ask-bis", label: "Ask BIS", icon: MessageSquareText, status: "supported",
    description: "A workspace for evidence-grounded questions, answers, and source references.",
  },
  productIntelligence: {
    href: "/product-intelligence", label: "Product intelligence", icon: Boxes, status: "planned",
    description: "A future experience for exploring standards relevant to a product.",
  },
  standards: {
    href: "/standards", label: "Standards", icon: BookOpen, status: "planned",
    description: "A planned space for standards discovery and detailed evidence.",
  },
  certification: {
    href: "/certification", label: "Certification", icon: ClipboardCheck, status: "planned",
    description: "A planned guide to certification pathways and related BIS services.",
  },
  laboratories: {
    href: "/laboratories", label: "Laboratories", icon: Microscope, status: "planned",
    description: "A planned experience for laboratory and testing information.",
  },
  hallmarking: {
    href: "/hallmarking", label: "Hallmarking", icon: Gem, status: "planned",
    description: "A planned space for hallmarking information and supporting evidence.",
  },
  passport: {
    href: "/passport", label: "Compliance passport", icon: NotebookTabs, status: "planned",
    description: "A future Product Compliance Passport experience.",
  },
} as const satisfies Record<string, NavigationItem>;

export type PlatformPage = Exclude<keyof typeof navigation, "home">;

export const platformNavigation = Object.values(navigation).filter(
  (item) => item.href !== "/",
);

export function isRouteActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
