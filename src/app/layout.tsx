import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { GlobalStateProvider } from "@/context/GlobalState";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ColonyGuard - AI-Powered IPSC Instability Detection",
  description: "Advanced AI analysis for high-throughput screening. Detects micro-differentiation and karyotypic anomalies in live stem cell cultures before structural failure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body
        className="bg-background-dark text-gray-200 transition-colors duration-300 min-h-screen relative overflow-x-hidden selection:bg-accent-cyan selection:text-black antialiased"
      >
        <GlobalStateProvider>
          {children}
        </GlobalStateProvider>
      </body>
    </html>
  );
}
