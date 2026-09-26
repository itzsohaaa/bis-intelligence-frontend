import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SectionReveals } from "@/components/motion/section-reveals";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "optional",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "BIS Intelligence Platform",
  description:
    "Evidence-grounded intelligence for Indian Standards and BIS services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <SectionReveals />
      </body>
    </html>
  );
}
