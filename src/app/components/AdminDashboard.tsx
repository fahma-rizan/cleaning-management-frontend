import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, CreditCard,
  PackageOpen, Star, AlertCircle, MapPin,
  FileText, Settings, LogOut, Search, Bell, ArrowLeft,
  Menu, X, Receipt, Mail, UserX, ClipboardX,
} from 'lucide-react';
import logo from '../../assets/d0e24839a24076173960597a25c12b48f3330fdf.png';
import type { User } from '../types';
import { type AdminRole, ALL_ROLES, canAccessTab } from '../lib/permissions';
import ProfileModal from './ProfileModal';
import { fetchWithAuth } from '../utils/api';

// ── Admin sub-components ─────────────────────────────────────────────────────
import AdminOverview            from './admin/AdminOverview';
import { StaffManagement }      from './admin/StaffManagement';
import { StaffAvailabilityManagement } from './admin/StaffAvailabilityManagement';
import { TaskReassignmentManagement }  from './admin/TaskReassignmentManagement';
import { AvailabilityRequests }  from './admin/AvailabilityRequests';
import { TaskDeclineRequests }   from './admin/TaskDeclineRequests';
import { StaffTaskOverview }     from './admin/StaffTaskOverview';
import { AdminManagement }      from './admin/AdminManagement';
import { CustomerManagement }   from './admin/CustomerManagement';
import { ReviewsManagement }    from './admin/ReviewsManagement';
import { ComplaintsManagement } from './admin/ComplaintsManagement';
import { GPSTracking }          from './admin/GPSTracking';
import { ReportsManagement }    from './admin/ReportsManagement';
import { SystemSettings }       from './admin/SystemSettings';
import { PaymentsManagement }   from './admin/PaymentsManagement';

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
  'availability-requests':  'Availability Requests',
  'task-decline-requests':  'Task Decline Requests',
  'staff-task-overview':    'Staff Task Overview',
  'admin-mgmt':         'Admin Management',
  customer:             'Customer Management',
  payments:             'Payments',
  billing:              'Billing & Invoices',
  'billing-financial-dashboard': 'Financial Dashboard',
  'billing-analytics':           'Analytics',
  inventory:            'Inventory Management',
  reviews:              'Reviews',
  complaints:           'Complaints',
  'billing-email-templates': 'Email Templates',
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
      { id: 'availability-requests', name: 'Availability Requests', allowedRoles: ['Super Admin', 'Main Admin', 'Operations Manager'] },
      { id: 'task-decline-requests', name: 'Task Decline Requests', allowedRoles: ['Super Admin', 'Main Admin', 'Operations Manager'] },
      { id: 'staff-task-overview',   name: 'Staff Task Overview',   allowedRoles: ['Super Admin', 'Main Admin', 'Operations Manager'] },
    ],
  },
  { id: 'admin-mgmt', name: 'Admin Management',     icon: ShieldCheck,  allowedRoles: ['Super Admin', 'Main Admin'] },
  { id: 'customer',   name: 'Customer Management',  icon: Users,        allowedRoles: ['Super Admin', 'Main Admin', 'Customer Support'] },
  { id: 'payments',   name: 'Payments',             icon: CreditCard,   allowedRoles: ['Super Admin', 'Main Admin'] },
  // Billing & Invoices opens pages from the payment-invoice-notifications
  // sub-app, mounted separately under /billing/* (its own router tree) —
  // each sub-item below is a real navigate(), not a tab rendered inline.
  { id: 'billing',    name: 'Billing & Invoices',   icon: Receipt,      allowedRoles: ['Super Admin', 'Main Admin'],
    subItems: [
      { id: 'billing-financial-dashboard', name: 'Financial Dashboard', allowedRoles: ['Super Admin', 'Main Admin'] },
      { id: 'billing-analytics',           name: 'Analytics',           allowedRoles: ['Super Admin', 'Main Admin'] },
    ],
  },
  { id: 'inventory',  name: 'Inventory Management', icon: PackageOpen,  allowedRoles: ['Super Admin', 'Main Admin', 'Operations Manager'] },
  { id: 'reviews',    name: 'Reviews',              icon: Star,         allowedRoles: ['Super Admin', 'Main Admin', 'Customer Support'] },
  { id: 'complaints', name: 'Complaints',           icon: AlertCircle,  allowedRoles: ['Super Admin', 'Main Admin', 'Customer Support'] },
  { id: 'billing-email-templates', name: 'Email Templates', icon: Mail, allowedRoles: ['Super Admin', 'Main Admin'] },
  { id: 'gps',        name: 'GPS Tracking',         icon: MapPin,       allowedRoles: ['Super Admin', 'Main Admin', 'Operations Manager'] },
  { id: 'reports',    name: 'Reports',              icon: FileText,     allowedRoles: ['Super Admin', 'Main Admin'] },
  { id: 'settings',   name: 'Settings',             icon: Settings,     allowedRoles: ['Super Admin', 'Main Admin'] },
];

// Sub-item id → real route in the /billing/* sub-app. Add an entry here (and
// a matching subItem + TAB_PERMISSIONS entry above) for each new billing
// page you want reachable from this sidebar.
// Sub-item id → key into the /staff-requests/pending-counts response, for
// the small red notification badge shown next to a sidebar sub-item.
const SUB_ITEM_BADGE_KEY: Record<string, 'availability' | 'decline'> = {
  'availability-requests': 'availability',
  'task-decline-requests': 'decline',
};

const BILLING_ROUTES: Record<string, string> = {
  'billing-financial-dashboard': '/billing/admin/financial-dashboard',
  'billing-analytics':           '/billing/admin/analytics',
  'billing-email-templates':     '/billing/email-templates',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [activeTab,    setActiveTab]    = useState('overview');
  const [showProfile,  setShowProfile]  = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [pendingCounts, setPendingCounts] = useState({ availability: 0, decline: 0 });
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Sidebar notification badges + bell dropdown — pending Availability/Task
  // Decline requests. Poll every 30s as a fallback, but also refresh
  // immediately whenever a request is approved/rejected (AvailabilityRequests
  // / TaskDeclineRequests dispatch 'staff-requests-updated' after acting on
  // one) so the badge and bell clear right away instead of up to 30s later.
  useEffect(() => {
    const loadCounts = () => {
      fetchWithAuth('/staff-requests/pending-counts')
        .then(data => { if (data?.success) setPendingCounts({ availability: data.availability, decline: data.decline }); })
        .catch(() => {});
    };
    loadCounts();
    const interval = setInterval(loadCounts, 30000);
    window.addEventListener('staff-requests-updated', loadCounts);
    return () => {
      clearInterval(interval);
      window.removeEventListener('staff-requests-updated', loadCounts);
    };
  }, []);

  // Close the notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  const totalPendingCount = pendingCounts.availability + pendingCounts.decline;

  const handleTabChange = (id: string) => {
    if (id === 'inventory') {
      // Inventory Management is its own page flow (list/add/edit/restock/reports),
      // not a tab rendered inside this dashboard's content area.
      navigate('/admin/inventory');
      setSidebarOpen(false);
      return;
    }
    if (BILLING_ROUTES[id]) {
      // Billing sub-items are real routes in a separately-mounted sub-app,
      // not tabs rendered inside this dashboard's content area.
      navigate(BILLING_ROUTES[id]);
      setSidebarOpen(false);
      return;
    }
    // 'billing' itself (the parent, id not in BILLING_ROUTES) just expands
    // its sub-item list via the normal activeTab match below — it has no
    // content of its own to render.
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
                      .map((sub) => {
                        const badgeCount = SUB_ITEM_BADGE_KEY[sub.id]
                          ? pendingCounts[SUB_ITEM_BADGE_KEY[sub.id]]
                          : 0;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleTabChange(sub.id)}
                            className={`w-full flex items-center justify-between gap-2 text-left py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                              activeTab === sub.id ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'
                            }`}
                          >
                            <span>{sub.name}</span>
                            {badgeCount > 0 && (
                              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] normal-case tracking-normal font-bold">
                                {badgeCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
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

            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(v => !v)}
                className="p-2.5 bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {totalPendingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white">
                    {totalPendingCount > 9 ? '9+' : totalPendingCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-black text-slate-900">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {totalPendingCount === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-400">
                        You're all caught up.
                      </div>
                    ) : (
                      <>
                        {pendingCounts.availability > 0 && canAccessTab('availability-requests', user.adminRole) && (
                          <button
                            onClick={() => { handleTabChange('availability-requests'); setShowNotifications(false); }}
                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-50"
                          >
                            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                              <UserX className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {pendingCounts.availability} pending availability request{pendingCounts.availability > 1 ? 's' : ''}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">Staff waiting to be marked Unavailable</p>
                            </div>
                          </button>
                        )}
                        {pendingCounts.decline > 0 && canAccessTab('task-decline-requests', user.adminRole) && (
                          <button
                            onClick={() => { handleTabChange('task-decline-requests'); setShowNotifications(false); }}
                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-purple-50 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                              <ClipboardX className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {pendingCounts.decline} pending task decline request{pendingCounts.decline > 1 ? 's' : ''}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">Staff waiting to decline an assigned task</p>
                            </div>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

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
            {activeTab === 'staff-availability' && canAccessTab('staff-availability', user.adminRole) && <StaffAvailabilityManagement />}
            {activeTab === 'task-reassignment'  && canAccessTab('task-reassignment',  user.adminRole) && <TaskReassignmentManagement />}
            {activeTab === 'availability-requests' && canAccessTab('availability-requests', user.adminRole) && <AvailabilityRequests />}
            {activeTab === 'task-decline-requests' && canAccessTab('task-decline-requests', user.adminRole) && <TaskDeclineRequests />}
            {activeTab === 'staff-task-overview'   && canAccessTab('staff-task-overview',   user.adminRole) && <StaffTaskOverview />}
            {activeTab === 'admin-mgmt' && canAccessTab('admin-mgmt', user.adminRole) && <AdminManagement currentUser={user} />}
            {activeTab === 'customer'   && canAccessTab('customer',   user.adminRole) && <CustomerManagement />}
            {activeTab === 'reviews'    && canAccessTab('reviews',    user.adminRole) && <ReviewsManagement />}
            {activeTab === 'complaints' && canAccessTab('complaints', user.adminRole) && <ComplaintsManagement />}
            {activeTab === 'gps'        && canAccessTab('gps',        user.adminRole) && <GPSTracking />}
            {activeTab === 'reports'    && canAccessTab('reports',    user.adminRole) && <ReportsManagement />}
            {activeTab === 'settings'   && canAccessTab('settings',   user.adminRole) && <SystemSettings />}
            {activeTab === 'payments'   && canAccessTab('payments',   user.adminRole) && <PaymentsManagement />}

          </div>
        </div>
      </main>
    </div>
  );
}