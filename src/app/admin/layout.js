"use client";
import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- 1. ADMIN-ONLY GUARD ---
  useEffect(() => {
    // Simple local storage or session check for this prototype
    const auth = localStorage.getItem('civicsens_admin_auth');
    if (auth === 'true') {
      setIsAdmin(true);
    } else {
      // In a real app, you'd check a JWT or Supabase session
      // For now, redirect to home if not logged in
      router.push('/');
    }
    setLoading(false);
  }, [router]);

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
    <div className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden font-sans">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } transition-all duration-300 ease-in-out border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col z-50`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
            <div className="bg-blue-600 p-2 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter">CivicSens</h1>
              <p className="text-[8px] font-bold tracking-[0.2em] uppercase opacity-50">Admin Center</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active isOpen={isSidebarOpen} />
          <NavItem icon={<FileWarning size={20} />} label="Pending Reports" isOpen={isSidebarOpen} />
          <NavItem icon={<MapIcon size={20} />} label="Active Hotspots" isOpen={isSidebarOpen} />
          <NavItem icon={<Activity size={20} />} label="System Health" isOpen={isSidebarOpen} />
          <div className="pt-8 opacity-20 border-t border-slate-700 mx-4 mb-4" />
          <NavItem icon={<Settings size={20} />} label="Settings" isOpen={isSidebarOpen} />
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className={`font-bold text-sm tracking-widest uppercase ${!isSidebarOpen && 'hidden'}`}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Top Header Background Glow */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 p-8">
          {children}
        </div>
      </main>

    </div>
  );
}

function NavItem({ icon, label, active = false, isOpen = true }) {
  return (
    <button className={`
      w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
    `}>
      <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`}>
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
