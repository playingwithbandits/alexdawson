import type { Metadata } from "next";
import "./globals.css";

import { Aldrich } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";

const aldrich = Aldrich({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alex Dawson",
  description: "Personal portfolio and projects showcase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body className={`${aldrich.className} antialiased`}>{children}</body>
    </html>
  );
}
