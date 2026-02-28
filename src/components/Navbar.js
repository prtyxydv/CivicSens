"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { AnimatedButton } from "./ui/AnimatedButton";

export const Navbar = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-16 flex items-center bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-200">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-lg font-bold tracking-tight text-foreground">CivicSens</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <NavLink href="/dashboard" active={pathname === "/dashboard"}>Dashboard</NavLink>
          <NavLink href="/map" active={pathname === "/map"}>Live Map</NavLink>
          <NavLink href="/intelligence" active={pathname === "/intelligence"}>Intelligence</NavLink>
          <NavLink href="/communities" active={pathname === "/communities"}>Communities</NavLink>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login">
              <AnimatedButton variant="ghost">
                Log In
              </AnimatedButton>
            </Link>
            <Link href="/login?role=user">
              <AnimatedButton variant="primary">
                Get Started
              </AnimatedButton>
            </Link>
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border overflow-hidden lg:hidden shadow-lg">
          <div className="p-6 flex flex-col gap-4">
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-foreground">Dashboard</Link>
            <Link href="/map" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-foreground">Live Map</Link>
            <Link href="/intelligence" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-foreground">Intelligence</Link>
            <Link href="/communities" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-foreground">Communities</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ href, children, active }) => (
  <Link 
    href={href} 
    className={`text-sm font-medium transition-colors relative py-1 ${
      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
    {active && (
      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />
    )}
  </Link>
);
