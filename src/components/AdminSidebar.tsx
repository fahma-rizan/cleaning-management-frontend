import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  PackageOpen,
  Star,
  AlertCircle,
  MapPin,
  FileText,
  Settings,
  UserCheck,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import logo from '../assets/d0e24839a24076173960597a25c12b48f3330fdf.png';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubItem {
  id: string;
  name: string;
  icon: React.ElementType;
}

interface SidebarItem {
  id: string;
  name: string;
  icon: React.ElementType;
  subItems?: SubItem[];
}

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    adminRole?: string;
  };
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
}

// ── Sidebar nav items ─────────────────────────────────────────────────────────
const sidebarItems: SidebarItem[] = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard },
  {
    id: 'staff',
    name: 'Staff Management',
    icon: Users,
    subItems: [
      { id: 'staff-availability', name: 'Availability', icon: UserCheck },
      { id: 'task-reassignment', name: 'Reassignments', icon: RefreshCw },
    ],
  },
  { id: 'admin-mgmt', name: 'Admin Management', icon: ShieldCheck },
  { id: 'payments', name: 'Payments', icon: CreditCard },
  { id: 'inventory', name: 'Inventory Management', icon: PackageOpen },
  { id: 'reviews', name: 'Reviews', icon: Star },
  { id: 'complaints', name: 'Complaints', icon: AlertCircle },
  { id: 'gps', name: 'GPS Tracking', icon: MapPin },
  { id: 'reports', name: 'Reports', icon: FileText },
  { id: 'settings', name: 'Settings', icon: Settings },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminSidebar({
  user,
  activeTab,
  onTabChange,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-[#1e1534] text-white flex flex-col fixed h-screen overflow-y-auto z-50 shadow-2xl">

      {/* ── Branding ── */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-900/40">
          <img
            src={logo}
            alt="Cloud Laundry Logo"
            className="w-8 h-8 object-contain"
          />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight uppercase leading-none">
            Cloud Laundry.lk
          </h1>
          <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mt-1">
            Admin Control Center
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.subItems?.some((sub) => sub.id === activeTab) ?? false);

          return (
            <div key={item.id} className="space-y-1">
              {/* Main nav button */}
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white/10 text-white shadow-xl'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Active left indicator bar */}
                {isActive && (
                  <div className="absolute left-0 w-1.5 h-6 bg-purple-500 rounded-r-full" />
                )}

                <IconComponent
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? 'text-purple-400'
                      : 'text-gray-400 group-hover:text-purple-300'
                  }`}
                />
                <span className="font-bold text-sm tracking-wide text-left truncate">
                  {item.name}
                </span>
              </button>

              {/* Sub items — visible only when parent is active */}
              {item.subItems && isActive && (
                <div className="pl-12 space-y-1 mt-1">
                  {item.subItems.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => onTabChange(sub.id)}
                      className={`w-full text-left py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                        activeTab === sub.id
                          ? 'text-purple-400'
                          : 'text-gray-400 hover:text-purple-400'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom: User info + Logout ── */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        {/* User card */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-lg border-2 border-white/10 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black truncate leading-tight">
              {user.name}
            </p>
            <p className="text-[10px] text-purple-400 uppercase font-black tracking-tighter">
              {user.adminRole ?? 'System Administrator'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-white hover:bg-red-500/20 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
}
