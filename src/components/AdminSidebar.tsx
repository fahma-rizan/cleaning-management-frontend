import { useState } from 'react';
import {
  LayoutDashboard, Users, ShieldCheck, CreditCard,
  PackageOpen, Star, AlertCircle, MapPin,
  FileText, Settings, LogOut,
} from 'lucide-react';
import logo from '../assets/d0e24839a24076173960597a25c12b48f3330fdf.png';
import ProfileModal from './ProfileModal';
import type { User } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubItem  { id: string; name: string; subItems?: SubItem[] }
interface NavItem  { id: string; name: string; icon: React.ElementType; subItems?: SubItem[]; }

interface AdminSidebarProps {
  user:        User;
  activeTab:   string;
  onTabChange: (id: string) => void;
  onLogout:    () => void;
}

// ─── Nav data ─────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: 'overview',   name: 'Overview',             icon: LayoutDashboard },
  { id: 'staff',      name: 'Staff Management',     icon: Users,
    subItems: [
      { id: 'staff-availability', name: 'Availability'  },
      { id: 'task-reassignment',  name: 'Reassignments' },
    ],
  },
  { id: 'admin-mgmt', name: 'Admin Management',     icon: ShieldCheck  },
  { id: 'payments',   name: 'Payments',             icon: CreditCard   },
  { id: 'inventory',  name: 'Inventory Management', icon: PackageOpen  },
  { id: 'reviews',    name: 'Reviews',              icon: Star         },
  { id: 'complaints', name: 'Complaints',           icon: AlertCircle  },
  { id: 'gps',        name: 'GPS Tracking',         icon: MapPin       },
  { id: 'reports',    name: 'Reports',              icon: FileText     },
  { id: 'settings',   name: 'Settings',             icon: Settings     },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminSidebar({ user, activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <><aside className="w-64 bg-[#1e1534] text-white flex flex-col fixed left-0 top-0 h-screen overflow-y-auto z-50 shadow-2xl">

      {/* ── Logo / Brand ── */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-900/40">
          <img src={logo} alt="Cloud Laundry Logo" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight uppercase leading-none">Cloud Laundry.lk</h1>
          <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mt-1">Admin Control Center</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          const isParentActive = activeTab === item.id ||
            !!item.subItems?.some((s) => s.id === activeTab || !!s.subItems?.some((ss) => ss.id === activeTab));

          return (
            <div key={item.id} className="space-y-1">

              {/* Main nav button */}
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${isParentActive
                    ? 'bg-white/10 text-white shadow-xl'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {/* Active left bar */}
                {isParentActive && (
                  <div className="absolute left-0 w-1.5 h-6 bg-purple-500 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${isParentActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-300'}`} />
                <span className="font-bold text-sm tracking-wide whitespace-nowrap">{item.name}</span>
              </button>

              {/* First-level sub-items — shown when parent is active or any descendant is active */}
              {item.subItems && isParentActive && (
                <div className="pl-12 space-y-1 mt-1">
                  {item.subItems.map((sub) => {
                    const isSubActive = activeTab === sub.id || !!sub.subItems?.some((ss) => ss.id === activeTab);

                    return (
                      <div key={sub.id}>
                        <button
                          onClick={() => onTabChange(sub.id)}
                          className={`w-full text-left py-2 text-xs font-bold uppercase tracking-widest transition-colors ${isSubActive ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'}`}
                        >
                          {sub.name}
                        </button>

                        {/* Second-level sub-items — shown when the sub is active */}
                        {sub.subItems && isSubActive && (
                          <div className="pl-8 space-y-1 mt-1">
                            {sub.subItems.map((ss) => (
                              <button
                                key={ss.id}
                                onClick={() => onTabChange(ss.id)}
                                className={`w-full text-left py-2 text-[11px] font-bold tracking-wide transition-colors ${activeTab === ss.id ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'}`}
                              >
                                {ss.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom: User + Logout ── */}
      <div className="p-4 border-t border-white/5 bg-black/20">

        {/* User card */}
        <button
          onClick={() => setShowProfile(true)}
          className="w-full flex items-center gap-3 mb-4 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-200 group cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-lg border-2 border-white/10 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black truncate leading-tight">{user.name}</p>
            <p className="text-[10px] text-purple-400 uppercase font-black tracking-tighter">
              {user.adminRole ?? 'System Administrator'}
            </p>
          </div>
        </button>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-white hover:bg-red-500/20 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside><ProfileModal
        user={user}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)} /></>
  );
}