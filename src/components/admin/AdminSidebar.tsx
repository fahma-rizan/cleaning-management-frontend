import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Sparkles,
  BarChart3,
  Bell,
  Tag,
  ClipboardList,
} from 'lucide-react';
// FIX: this pointed at a hashed filename that doesn't exist anywhere in
// src/assets (a leftover from a design-tool export) — Vite failed the whole
// production build on it. AdminSidebar was never actually rendered anywhere
// before now (this file was dead code, imported but unused in
// FinancialDashboard.tsx), so the build never got exercised far enough to
// surface it until this component was wired up for real.
import logo from '../../assets/logo.png';

interface AdminSidebarProps {
  user: {
    name:       string;
    email:      string;
    adminRole?: string;
  };
  onLogout: () => void;
}

interface NavItem {
  id:       string;
  label:    string;
  icon:     React.ElementType;
  path?:    string;   // react-router path — navigates when clicked
  action?:  string;   // special action key — handled by onAction callback
  subItems?: {
    id:    string;
    label: string;
    icon:  React.ElementType;
    path:  string;
  }[];
}

// ── Navigation items wired to real routes ─────────────────────────────────────
// Paths marked ⚠️ are planned but not yet built — they show a "Coming Soon" notice
const NAV_ITEMS: NavItem[] = [
  {
    id:    'dashboard',
    label: 'Financial Dashboard',
    icon:  LayoutDashboard,
    path:  '/admin/financial-dashboard',
  },
  {
    id:    'analytics',
    label: 'Analytics',
    icon:  BarChart3,
    path:  '/admin/analytics',
  },
  {
    id:    'bookings',
    label: 'Bookings',
    icon:  ClipboardList,
    path:  '/admin/bookings',
  },
  {
    id:    'ai-assistant',
    label: 'AI Assistant',
    icon:  Sparkles,
    path:  '/ai-invoice',
  },
  {
    id:    'invoices',
    label: 'Invoices',
    icon:  FileText,
    path:  '/admin/financial-dashboard?tab=invoices',
    subItems: [
      { id: 'create-invoice',  label: 'Create Invoice',  icon: FileText,   path: '/staff-invoice/new' },
      { id: 'ai-invoice',      label: 'AI Invoice',      icon: Sparkles,   path: '/ai-invoice' },
      { id: 'payment-report',  label: 'Payment Report',  icon: BarChart3,  path: '/payment-report' },
    ],
  },
  {
    id:    'payments',
    label: 'Payments',
    icon:  CreditCard,
    subItems: [
      // FIX: was '/refund' (RefundWorkflow — a standalone "pick any
      // invoice, manually request a refund" page). That page is retired:
      // refunds now only get created automatically when a booking is
      // cancelled (customer or admin), so this link now goes straight to
      // the Financial Dashboard's own Refunds & Credit Notes tab, where
      // those auto-created refunds are actually reviewed/approved.
      { id: 'refunds',          label: 'Refunds',         icon: RefreshCw,  path: '/admin/refunds' },
      { id: 'price-reductions', label: 'Price Reductions',icon: Tag,        path: '/admin/price-reductions' },
    ],
  },
  {
    id:    'staff',
    label: 'Staff',
    icon:  Users,
    subItems: [
      { id: 'staff-dashboard',    label: 'Staff Dashboard',   icon: UserCheck,  path: '/staff-dashboard' },
      { id: 'staff-availability', label: 'Availability',      icon: UserCheck,  path: '/staff-dashboard' },  // ⚠️ coming soon
      { id: 'task-reassignment',  label: 'Reassignments',     icon: RefreshCw,  path: '/staff-dashboard' },  // ⚠️ coming soon
    ],
  },
  {
    id:    'communications',
    label: 'Communications',
    icon:  Bell,
    subItems: [
      { id: 'email-templates', label: 'Email Templates', icon: Bell, path: '/email-templates' },
    ],
  },
  // FIX (task #21, C.3a): both used to be placeholders pointing at the
  // Financial Dashboard — Feedback & Complaints is now a real page.
  {
    id:    'reviews',
    label: 'Reviews',
    icon:  Star,
    path:  '/admin/feedback',
  },
  {
    id:    'complaints',
    label: 'Complaints',
    icon:  AlertCircle,
    path:  '/admin/feedback',
  },
  {
    id:    'gps',
    label: 'GPS Tracking',    // ⚠️ coming soon
    icon:  MapPin,
    path:  '/admin/financial-dashboard',
  },
  {
    id:    'inventory',
    label: 'Inventory',       // ⚠️ coming soon
    icon:  PackageOpen,
    path:  '/admin/financial-dashboard',
  },
  {
    id:    'settings',
    label: 'Settings',        // ⚠️ coming soon
    icon:  Settings,
    path:  '/admin/financial-dashboard',
  },
];

export default function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const pathOnly = (p: string) => p.split('?')[0];
  const queryOnly = (p: string) => p.includes('?') ? p.slice(p.indexOf('?')) : '';
  const matchesPath = (path?: string): boolean => {
    if (!path) return false;
    const dashboardTab =
      path === '/admin/refunds' ? '?tab=refunds' :
      path === '/admin/price-reductions' ? '?tab=price-reductions' :
      null;
    if (dashboardTab) {
      return location.pathname === '/admin/financial-dashboard' && location.search === dashboardTab;
    }
    const base = pathOnly(path);
    const query = queryOnly(path);
    if (location.pathname !== base && !location.pathname.startsWith(base + '/')) {
      return false;
    }
    return !query || location.search === query;
  };

  const [expandedId, setExpandedId] = useState<string | null>(() => {
    // Auto-expand the group whose child matches the current path
    for (const item of NAV_ITEMS) {
      if (item.subItems?.some(s => {
        if (matchesPath(s.path)) return true;
        const base = pathOnly(s.path);
        const query = queryOnly(s.path);
        return location.pathname.startsWith(base) && (!query || location.search === query);
      })) {
        return item.id;
      }
    }
    return null;
  });

  const isActive = (path?: string): boolean => {
    return matchesPath(path);
  };

  const handleNav = (item: NavItem) => {
    if (item.subItems) {
      setExpandedId(expandedId === item.id ? null : item.id);
      if (item.path) navigate(item.path);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside className="w-64 bg-[#1e1534] text-white flex flex-col fixed h-screen overflow-y-auto z-50 shadow-2xl">

      {/* Branding */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-900/40">
          <img src={logo} alt="Cloud Laundry Logo" className="w-8 h-8 object-contain" />
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

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon        = item.icon;
          const isExpanded  = expandedId === item.id;
          const itemActive  = item.path ? isActive(item.path) : (item.subItems?.some(s => isActive(s.path)) ?? false);

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => handleNav(item)}
                className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                  itemActive
                    ? 'bg-white/10 text-white shadow-xl'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {itemActive && (
                  <div className="absolute left-0 w-1.5 h-6 bg-purple-500 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${
                  itemActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-300'
                }`} />
                <span className="font-bold text-sm tracking-wide text-left truncate flex-1">
                  {item.label}
                </span>
                {item.subItems && (
                  <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                )}
              </button>

              {/* Sub items */}
              {item.subItems && isExpanded && (
                <div className="pl-12 space-y-1 mt-1">
                  {item.subItems.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => navigate(sub.path)}
                      className={`w-full text-left py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                        isActive(sub.path) ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-white/5 bg-black/20 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-lg border-2 border-white/10 shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black truncate leading-tight">{user.name}</p>
            <p className="text-[10px] text-purple-400 uppercase font-black tracking-tighter">
              {user.adminRole ?? 'System Administrator'}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-white hover:bg-red-500/20 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </button>
      </div>
    </aside>
  );
}
