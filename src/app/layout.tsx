import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Momentum — Start Before You're Ready",
  description:
    "AI-powered emotional support for students who procrastinate. Break overwhelming tasks into manageable steps, build momentum, and finally start.",
  icons: {
    icon: "/momentum.png",
    apple: "/momentum.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
