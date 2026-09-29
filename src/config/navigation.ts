import {
  BookOpen,
  Boxes,
  ClipboardCheck,
  Gem,
  Home,
  LayoutDashboard,
  MessageSquareText,
  Microscope,
  NotebookTabs,
  type LucideIcon,
} from "lucide-react";

export type CapabilityStatus = "available" | "integrated" | "backend-dependent" | "planned";

type NavigationItem = {
  href: `/${string}`;
  label: string;
  icon: LucideIcon;
  status: CapabilityStatus;
  description: string;
};

export const navigation = {
  home: {
    href: "/",
    label: "Landing page",
    icon: Home,
    status: "available",
    description: "BIS Intelligence Platform.",
  },
  dashboard: {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    status: "available",
    description: "Your starting point for standards intelligence and BIS services.",
  },
  askBis: {
    href: "/ask-bis",
    label: "Ask BIS",
    icon: MessageSquareText,
    status: "available",
    description: "A workspace for evidence-grounded questions, answers, and source references.",
  },
  productIntelligence: {
    href: "/product-intelligence",
    label: "Product intelligence",
    icon: Boxes,
    status: "available",
    description: "Connect product context to standards, obligations, and the evidence behind applicability.",
  },
  standards: {
    href: "/standards",
    label: "Standards",
    icon: BookOpen,
    status: "available",
    description: "Explore standards through their scope, source documents, and supporting clauses.",
  },
  certification: {
    href: "/certification",
    label: "Certification",
    icon: ClipboardCheck,
    status: "available",
    description: "Understand certification pathways and the preparation each may require.",
  },
  laboratories: {
    href: "/laboratories",
    label: "Laboratories",
    icon: Microscope,
    status: "available",
    description: "Bring testing requirements and relevant laboratory information into context.",
  },
  hallmarking: {
    href: "/hallmarking",
    label: "Hallmarking",
    icon: Gem,
    status: "available",
    description: "Understand hallmarking requirements through regulatory evidence and currentness checks.",
  },
  passport: {
    href: "/passport",
    label: "Compliance passport",
    icon: NotebookTabs,
    status: "available",
    description: "Auditable Product Compliance Passport dossiers derived from verified corpus facts.",
  },
} as const satisfies Record<string, NavigationItem>;

export type PlatformPage = Exclude<keyof typeof navigation, "home">;

export const platformNavigation = Object.values(navigation).filter(
  (item) => item.href !== "/",
);

export function isRouteActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
