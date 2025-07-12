import type { Metadata } from "next";
import { Inter } from "next/font/google";

import QueryProvider from "@/components/query-provider";
import { TopNav } from "@/components/top-nav";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solace Candidate Assignment",
  description: "Show us what you got",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <TopNav />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
