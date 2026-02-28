import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import LayoutTransition from "@/components/LayoutTransition";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CivicSens | Intelligent Urban Maintenance",
  description: "Advanced neural protocol for metropolitan infrastructure reporting and tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary selection:text-white min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider>
          <AnimatedBackground />
          <CursorGlow />
          <CommandPalette />
          <Navbar />
          <main className="relative z-10 pt-20">
            <LayoutTransition>
              {children}
            </LayoutTransition>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
