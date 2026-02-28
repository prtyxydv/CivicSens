export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading dashboard...</p>
      </div>
    </div>
  );
}
