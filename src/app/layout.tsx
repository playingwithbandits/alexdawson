import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alex Dawson - Portfolio",
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
      <body className={inter.className}>
        <header>
          <Navigation />
        </header>
        {children}
        <footer>
          <p>
            &copy; {new Date().getFullYear()} Alex Dawson. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
