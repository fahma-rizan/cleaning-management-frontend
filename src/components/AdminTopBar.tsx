import { Search, Bell, ShieldCheck, ArrowLeft } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AdminTopBarProps {
  activeTab: string;
  onBack: () => void;
}

// Maps tab id → display name (matches sidebarItems in AdminSidebar)
const tabNames: Record<string, string> = {
  overview:           'Overview',
  staff:              'Staff Management',
  'staff-availability': 'Staff Availability',
  'task-reassignment':  'Task Reassignment',
  'admin-mgmt':       'Admin Management',
  payments:           'Payments',
  inventory:          'Inventory Management',
  reviews:            'Reviews',
  complaints:         'Complaints',
  gps:                'GPS Tracking',
  reports:            'Reports',
  settings:           'Settings',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminTopBar({ activeTab, onBack }: AdminTopBarProps) {
  const tabLabel = tabNames[activeTab] ?? 'Admin Panel';

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-5 flex items-center justify-between">

      {/* ── Left: Back + Divider + Title ── */}
      <div className="flex items-center gap-6">

        {/* Back button */}
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-[1px] bg-gray-100" />

        {/* Tab title */}
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight capitalize leading-none">
            {tabLabel}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Real-time Management System
          </p>
        </div>
      </div>

      {/* ── Right: Search + Bell + Shield ── */}
      <div className="flex items-center gap-4">

        {/* Search box */}
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500/20 w-64 transition-all focus:bg-white outline-none"
          />
        </div>

        {/* Bell / Notification */}
        <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all relative">
          <Bell className="w-5 h-5" />
          {/* Red dot */}
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Shield icon */}
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
        </div>

      </div>
    </div>
  );
}
