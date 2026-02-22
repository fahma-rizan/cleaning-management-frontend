import { Search, Bell, ShieldCheck, ArrowLeft, Menu } from 'lucide-react';

interface AdminTopBarProps {
  activeTab: string;
  onBack: () => void;
  onMenuToggle: () => void;
}

const tabNames: Record<string, string> = {
  overview:             'Overview',
  staff:                'Staff Management',
  'staff-availability': 'Staff Availability',
  'task-reassignment':  'Task Reassignment',
  'admin-mgmt':         'Admin Management',
  payments:             'Payments',
  inventory:            'Inventory Management',
  reviews:              'Reviews',
  complaints:           'Complaints',
  gps:                  'GPS Tracking',
  reports:              'Reports',
  settings:             'Settings',
};

export default function AdminTopBar({ activeTab, onBack, onMenuToggle }: AdminTopBarProps) {
  const tabLabel = tabNames[activeTab] ?? 'Admin Panel';

  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3 shrink-0">

      {/* ── Left ── */}
      <div className="flex items-center gap-3 md:gap-5 min-w-0">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Back button — always visible, styled like the reference image */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-purple-600 transition-colors group shrink-0"
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-gray-200 shrink-0" />

        {/* Title + subtitle */}
        <div className="min-w-0">
          <h2 className="text-base md:text-xl font-black text-slate-900 tracking-tight capitalize leading-none truncate">
            {tabLabel}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Real-time Management System
          </p>
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">

        {/* Search */}
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500/20 w-48 lg:w-64 transition-all focus:bg-white outline-none"
          />
        </div>

        {/* Bell */}
        <button className="p-2 bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all relative">
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Shield */}
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-purple-100 flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
        </div>
      </div>
    </div>
  );
}
