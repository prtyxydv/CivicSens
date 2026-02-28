import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import LayoutTransition from "@/components/LayoutTransition";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { CommandPalette } from "@/components/ui/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CivicSens | AI-Powered Civic Intelligence",
  description: "Next-generation platform for community insights and civic engagement powered by artificial intelligence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary/30 min-h-screen bg-background`}
      >
        <CursorGlow />
        <CommandPalette />
        <AnimatedBackground />
        <Navbar />
        <main className="relative z-10 pt-32 pb-20">
          <LayoutTransition>
            {children}
          </LayoutTransition>
        </main>
      </body>
    </html>
  );
}
