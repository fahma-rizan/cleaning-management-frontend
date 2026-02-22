import { useState } from 'react';
import {
  LayoutDashboard, Package, AlertTriangle,
  Settings, Clock, RefreshCw, FileBarChart2,
} from 'lucide-react';

import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

import InventoryDashboard    from './admin/InventoryDashboard';
import InventoryStockLevels  from './admin/InventoryStockLevels';
import LowStockAlerts        from './admin/LowStockAlerts';
import ServiceTypeConfiguration from './admin/ServiceTypeConfiguration';
import PendingApprovalsList  from './admin/PendingApprovalsList';
import RestockManagement     from './admin/inventory/RestockManagement';
import InventoryReportsPage  from './admin/InventoryReportsPage';

const INVENTORY_TABS = [
  { id: 'inv-dashboard',   label: 'Dashboard',         icon: LayoutDashboard, badge: null, badgeColor: '' },
  { id: 'inv-stock',       label: 'Stock Levels',      icon: Package,         badge: null, badgeColor: '' },
  { id: 'inv-lowstock',    label: 'Low Stock',         icon: AlertTriangle,   badge: '8',  badgeColor: '#ef4444' },
  { id: 'inv-serviceconf', label: 'Service Config',    icon: Settings,        badge: null, badgeColor: '' },
  { id: 'inv-pending',     label: 'Pending Approvals', icon: Clock,           badge: '12', badgeColor: '#f59e0b' },
  { id: 'inv-restock',     label: 'Restock',           icon: RefreshCw,       badge: '5',  badgeColor: '#10b981' },
  { id: 'inv-reports',     label: 'Report',            icon: FileBarChart2,   badge: null, badgeColor: '' },
];

const DEMO_USER = {
  id: '1',
  name: 'Admin User',
  email: 'admin@cloudlaundry.lk',
  role: 'admin' as const,
  verified: true,
  adminRole: 'System Administrator',
};

export default function InventoryManagementLayout() {
  const [sidebarTab, setSidebarTab] = useState('inventory');
  const [invTab, setInvTab]         = useState('inv-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderInvContent = () => {
    switch (invTab) {
      case 'inv-dashboard':   return <InventoryDashboard />;
      case 'inv-stock':       return <InventoryStockLevels />;
      case 'inv-lowstock':    return <LowStockAlerts />;
      case 'inv-serviceconf': return <ServiceTypeConfiguration />;
      case 'inv-pending':     return <PendingApprovalsList />;
      case 'inv-restock':     return <RestockManagement />;
      case 'inv-reports':     return <InventoryReportsPage user={DEMO_USER} onLogout={() => {}} theme="light" />;
      default:                return <InventoryDashboard />;
    }
  };

  const activeInvLabel = INVENTORY_TABS.find(t => t.id === invTab)?.label || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Sidebar ──────────────────────────────────────── */}
      <AdminSidebar
        user={DEMO_USER}
        activeTab={sidebarTab}
        onTabChange={setSidebarTab}
        onLogout={() => window.location.reload()}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-64">

        {/* ── Top Bar ──────────────────────────────────────── */}
        <AdminTopBar
          activeTab={sidebarTab}
          onBack={() => window.history.back()}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* ── Inventory Sub-Tabs (Rounded Pill Bar) ─────────── */}
        <div style={{ background: '#F8F7FF', flexShrink: 0, padding: '10px 16px' }}>
          <div
            style={{
              background: '#1e1534',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'stretch',
              padding: '4px',
              gap: '2px',
            }}
          >
            {INVENTORY_TABS.map((tab) => {
              const isActive = invTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setInvTab(tab.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '9px 6px',
                    background: isActive ? 'rgba(124,58,237,0.35)' : 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    color: isActive ? '#ffffff' : '#A78BFA',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    boxShadow: isActive ? '0 2px 8px rgba(124,58,237,0.4)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#fff';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#A78BFA';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  <tab.icon size={13} style={{ flexShrink: 0 }} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span style={{
                      background: tab.badgeColor, color: 'white',
                      fontSize: '9px', fontWeight: '800',
                      padding: '1px 5px', borderRadius: '999px',
                      minWidth: '18px', textAlign: 'center',
                      flexShrink: 0,
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Page Content ─────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#F8F7FF' }}>
          <div className="px-4 md:px-8 pt-5 md:pt-7 pb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 hidden sm:block">
              CLOUD LAUNDRY / INVENTORY / {activeInvLabel.toUpperCase()}
            </p>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{activeInvLabel}</h2>
          </div>
          <div className="px-4 md:px-8 py-4 pb-12">
            {renderInvContent()}
          </div>
        </main>

      </div>
    </div>
  );
}
