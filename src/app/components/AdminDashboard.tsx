import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, ShieldCheck, CreditCard,
  PackageOpen, Star, AlertCircle, MapPin,
  FileText, Settings, LogOut, Search, Bell, ArrowLeft,
  Menu, X,
} from 'lucide-react';
import logo from '../../assets/d0e24839a24076173960597a25c12b48f3330fdf.png';
import type { User } from '../types';
import { type AdminRole, ALL_ROLES, canAccessTab } from '../lib/permissions';
import ProfileModal from './ProfileModal';

// ── Admin sub-components ─────────────────────────────────────────────────────
import AdminOverview            from './admin/AdminOverview';
import { StaffManagement }      from './admin/StaffManagement';
import { AdminManagement }      from './admin/AdminManagement';
import { CustomerManagement }   from './admin/CustomerManagement';
import { ReviewsManagement }    from './admin/ReviewsManagement';
import { ComplaintsManagement } from './admin/ComplaintsManagement';
import { GPSTracking }          from './admin/GPSTracking';
import { ReportsManagement }    from './admin/ReportsManagement';
import { SystemSettings }       from './admin/SystemSettings';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubItem { id: string; name: string; allowedRoles: AdminRole[]; }
interface NavItem { id: string; name: string; icon: React.ElementType; allowedRoles: AdminRole[]; subItems?: SubItem[]; }

interface AdminDashboardProps {
  user:            User;
  onLogout:        () => void;
  theme?:          string;
  onToggleTheme?:  () => void;
  onProfileClick?: () => void;
}

// ─── Tab display names ────────────────────────────────────────────────────────
const TAB_NAMES: Record<string, string> = {
  overview:             'Overview',
  staff:                'Staff Management',
  'staff-availability': 'Staff Availability',
  'task-reassignment':  'Task Reassignment',
  'admin-mgmt':         'Admin Management',
  customer:             'Customer Management',
  payments:             'Payments',
  inventory:            'Inventory Management',
  reviews:              'Reviews',
  complaints:           'Complaints',
  gps:                  'GPS Tracking',
  reports:              'Reports',
  settings:             'Settings',
};

// ─── Navigation definition ────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: 'overview',   name: 'Overview',             icon: LayoutDashboard, allowedRoles: ALL_ROLES },
  { id: 'staff',      name: 'Staff Management',     icon: Users,           allowedRoles: ['Super Admin', 'Main Admin', 'Operations Manager'],
    subItems: [
      { id: 'staff-availability', name: 'Availability',  allowedRoles: ['Super Admin', 'Main Admin', 'Operations Manager'] },
      { id: 'task-reassignment',  name: 'Reassignments', allowedRoles: ['Super Admin', 'Main Admin', 'Operations Manager'] },
    ],
  },
  { id: 'admin-mgmt', name: 'Admin Management',     icon: ShieldCheck,  allowedRoles: ['Super Admin', 'Main Admin'] },
  { id: 'customer',   name: 'Customer Management',  icon: Users,        allowedRoles: ['Super Admin', 'Main Admin', 'Customer Support'] },
  { id: 'payments',   name: 'Payments',             icon: CreditCard,   allowedRoles: ['Super Admin', 'Main Admin'] },
  { id: 'inventory',  name: 'Inventory Management', icon: PackageOpen,  allowedRoles: ['Super Admin', 'Main Admin', 'Operations Manager'] },
  { id: 'reviews',    name: 'Reviews',              icon: Star,         allowedRoles: ['Super Admin', 'Main Admin', 'Customer Support'] },
  { id: 'complaints', name: 'Complaints',           icon: AlertCircle,  allowedRoles: ['Super Admin', 'Main Admin', 'Customer Support'] },
  { id: 'gps',        name: 'GPS Tracking',         icon: MapPin,       allowedRoles: ['Super Admin', 'Main Admin', 'Operations Manager'] },
  { id: 'reports',    name: 'Reports',              icon: FileText,     allowedRoles: ['Super Admin', 'Main Admin'] },
  { id: 'settings',   name: 'Settings',             icon: Settings,     allowedRoles: ['Super Admin', 'Main Admin'] },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab,    setActiveTab]    = useState('overview');
  const [showProfile,  setShowProfile]  = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  // Reset to overview if role loses access
  useEffect(() => {
    if (!canAccessTab(activeTab, user.adminRole)) {
      setActiveTab('overview');
    }
  }, [activeTab, user.adminRole]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const visibleItems = NAV_ITEMS.filter(item => canAccessTab(item.id, user.adminRole));

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false); // close sidebar on mobile after nav
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCFE]">

      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SIDEBAR
          - Desktop (lg+): always visible, pushes main content
          - Mobile (<lg):  hidden off-screen left, slides in when sidebarOpen
      ══════════════════════════════════════════════════════════════════════ */}
      <aside className={`
        w-64 bg-[#1e1534] text-white flex flex-col fixed left-0 top-0 h-screen
        overflow-y-auto z-50 shadow-2xl
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>

        {/* Logo / Brand */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-900/40">
              <img src={logo} alt="Cloud Laundry Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase leading-none">Cloud Laundry.lk</h1>
              <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mt-1">Admin Control Center</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isParentActive =
              activeTab === item.id ||
              !!item.subItems?.some(s => s.id === activeTab);

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                    isParentActive
                      ? 'bg-white/10 text-white shadow-xl'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isParentActive && (
                    <div className="absolute left-0 w-1.5 h-6 bg-purple-500 rounded-r-full" />
                  )}
                  <Icon className={`w-5 h-5 shrink-0 ${isParentActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-300'}`} />
                  <span className="font-bold text-sm tracking-wide whitespace-nowrap">{item.name}</span>
                </button>

                {/* Sub-items */}
                {item.subItems && isParentActive && (
                  <div className="pl-12 space-y-1 mt-1">
                    {item.subItems
                      .filter(s => canAccessTab(s.id, user.adminRole))
                      .map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleTabChange(sub.id)}
                          className={`w-full text-left py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                            activeTab === sub.id ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'
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

        {/* Bottom: User card + Logout */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={() => { setShowProfile(true); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 mb-4 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-200 cursor-pointer text-left"
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

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-white hover:bg-red-500/20 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Profile Modal */}
      <ProfileModal
        user={user}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN AREA
          - lg:ml-64 so it sits beside the sidebar on desktop
          - No margin on mobile (sidebar overlays instead)
      ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 min-w-0 lg:ml-64 min-h-screen bg-[#FDFCFE] transition-all duration-300">

        {/* ── Top Bar ── */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-8 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Back button — desktop only */}
            <button
              onClick={() => setActiveTab('overview')}
              type="button"
              className="hidden lg:flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>

            <div className="hidden lg:block h-6 w-[1px] bg-gray-100" />

            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight capitalize leading-none">
                {TAB_NAMES[activeTab] ?? 'Admin Panel'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 hidden sm:block">
                Real-time Management System
              </p>
            </div>
          </div>

          {/* Right: Search + Bell + Shield */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
              <input
                type="text"
                placeholder="Search resources..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500/20 w-48 lg:w-64 transition-all focus:bg-white"
              />
            </div>

            <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* ── Page Content ── */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

            {activeTab === 'overview'   && canAccessTab('overview',   user.adminRole) && <AdminOverview />}
            {activeTab === 'staff'      && canAccessTab('staff',      user.adminRole) && <StaffManagement />}
            {activeTab === 'admin-mgmt' && canAccessTab('admin-mgmt', user.adminRole) && <AdminManagement currentUser={user} />}
            {activeTab === 'customer'   && canAccessTab('customer',   user.adminRole) && <CustomerManagement />}
            {activeTab === 'reviews'    && canAccessTab('reviews',    user.adminRole) && <ReviewsManagement />}
            {activeTab === 'complaints' && canAccessTab('complaints', user.adminRole) && <ComplaintsManagement />}
            {activeTab === 'gps'        && canAccessTab('gps',        user.adminRole) && <GPSTracking />}
            {activeTab === 'reports'    && canAccessTab('reports',    user.adminRole) && <ReportsManagement />}
            {activeTab === 'settings'   && canAccessTab('settings',   user.adminRole) && <SystemSettings />}

            {/* Tabs owned by other teammates */}
            {(activeTab === 'payments' || activeTab === 'inventory' ||
              activeTab === 'staff-availability' || activeTab === 'task-reassignment') && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Coming soon</p>
                  <p className="text-purple-600 text-3xl font-black capitalize">
                    {activeTab.replace(/-/g, ' ')}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">This section is handled by another team member</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
