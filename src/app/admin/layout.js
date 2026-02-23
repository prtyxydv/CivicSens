"use client";
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileWarning, 
  Map as MapIcon, 
  Activity, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

// Create Context for Theme
export const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {}
});

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(true);

  // --- 1. ADMIN-ONLY GUARD ---
  useEffect(() => {
    const auth = localStorage.getItem('civicsens_admin_auth');
    if (auth === 'true') {
      setIsAdmin(true);
    } else {
      router.push('/');
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('civicsens_admin_theme');
    if (savedTheme !== null) {
      setIsDark(savedTheme === 'dark');
    }
    
    setLoading(false);
  }, [router]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('civicsens_admin_theme', newTheme ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('civicsens_admin_auth');
    router.push('/');
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!isAdmin) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={`min-h-screen flex overflow-hidden font-sans transition-colors duration-500 ${isDark ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        
        {/* --- SIDEBAR NAVIGATION (GLASSMORPHIC) --- */}
        <aside 
          className={`
            ${isSidebarOpen ? 'w-72' : 'w-20'} 
            transition-all duration-300 ease-in-out border-r 
            ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white/60'} 
            backdrop-blur-2xl flex flex-col z-50
          `}
        >
          {/* Brand Header */}
          <div className="p-6 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter">CivicSens</h1>
                <p className="text-[8px] font-bold tracking-[0.2em] uppercase opacity-50">Admin Center</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active isOpen={isSidebarOpen} isDark={isDark} />
            <NavItem icon={<FileWarning size={20} />} label="Pending Reports" isOpen={isSidebarOpen} isDark={isDark} />
            <NavItem icon={<MapIcon size={20} />} label="Active Hotspots" isOpen={isSidebarOpen} isDark={isDark} />
            <NavItem icon={<Activity size={20} />} label="System Health" isOpen={isSidebarOpen} isDark={isDark} />
            <div className={`pt-8 opacity-20 border-t mx-4 mb-4 ${isDark ? 'border-slate-700' : 'border-slate-300'}`} />
            <NavItem icon={<Settings size={20} />} label="Settings" isOpen={isSidebarOpen} isDark={isDark} />
          </nav>

          {/* Bottom Actions */}
          <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <button 
              onClick={toggleTheme}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all mb-2 ${isDark ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              <span className={`font-bold text-sm tracking-widest uppercase ${!isSidebarOpen && 'hidden'}`}>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}`}
            >
              <LogOut size={20} />
              <span className={`font-bold text-sm tracking-widest uppercase ${!isSidebarOpen && 'hidden'}`}>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          {/* Background Glow */}
          <div className={`absolute top-0 left-0 w-full h-[500px] pointer-events-none transition-opacity duration-1000 ${isDark ? 'bg-gradient-to-b from-blue-600/10 to-transparent opacity-100' : 'bg-gradient-to-b from-blue-500/5 to-transparent opacity-100'}`} />
          
          <div className="relative z-10 p-8">
            {children}
          </div>
        </main>

      </div>
    </ThemeContext.Provider>
  );
}

function NavItem({ icon, label, active = false, isOpen = true, isDark = true }) {
  return (
    <button className={`
      w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
      ${active 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' 
        : isDark 
          ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100' 
          : 'text-slate-500 hover:bg-white hover:text-blue-600 shadow-sm hover:shadow-md'}
    `}>
      <span className={`${active ? 'text-white' : isDark ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-500 group-hover:text-blue-600'} transition-colors`}>
        {icon}
      </span>
      <span className={`font-bold text-sm tracking-tight ${!isOpen && 'hidden opacity-0'} transition-all`}>
        {label}
      </span>
      {active && isOpen && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
      )}
    </button>
  );
}
