import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppHeader } from "@/components/app-header";
import { ConditionalSidebar } from "@/components/conditional-sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kodemaker CReMa",
  description: "Customer Relationship Management for Kodemaker",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AppHeader />
          <ConditionalSidebar>{children}</ConditionalSidebar>
        </Providers>
      </body>
    </html>
  );
}
