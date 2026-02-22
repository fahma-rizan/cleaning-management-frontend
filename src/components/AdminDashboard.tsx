import { useState } from 'react';
import type { User } from '../types';

// ── Your components ────────────────────────────────────────────────────────────
import AdminSidebar  from './AdminSidebar';
import AdminTopBar   from './AdminTopBar';

// ── Admin sub-components (from zip) ───────────────────────────────────────────
import AdminOverview from './admin/AdminOverview';
import { StaffManagement    } from './admin/StaffManagement';
import { AdminManagement    } from './admin/AdminManagement';
import { ReviewsManagement  } from './admin/ReviewsManagement';
import { ComplaintsManagement } from './admin/ComplaintsManagement';
import { GPSTracking        } from './admin/GPSTracking';
import { ReportsManagement  } from './admin/ReportsManagement';
import { SystemSettings     } from './admin/SystemSettings';

// ─── Props ────────────────────────────────────────────────────────────────────
interface AdminDashboardProps {
  user:     User;
  onLogout: () => void;
  theme?:   string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard({ user, onLogout, theme }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex min-h-screen bg-[#FDFCFE]">

      {/* ── Sidebar (left, fixed) ── */}
      <AdminSidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />

      {/* ── Main area (right of sidebar) ── */}
      <main className="flex-1 lg:ml-64 min-h-screen bg-[#FDFCFE] transition-all duration-300">

        {/* ── Top bar (sticky) ── */}
        <AdminTopBar
          activeTab={activeTab}
          onBack={() => setActiveTab('overview')}
        />

        {/* ── Page content ── */}
        <div className="p-8">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

            {activeTab === 'overview'   && <AdminOverview />}
            {activeTab === 'staff'      && <StaffManagement />}
            {activeTab === 'admin-mgmt' && <AdminManagement />}
            {activeTab === 'reviews'    && <ReviewsManagement />}
            {activeTab === 'complaints' && <ComplaintsManagement />}
            {activeTab === 'gps'        && <GPSTracking />}
            {activeTab === 'reports'    && <ReportsManagement />}
            {activeTab === 'settings'   && <SystemSettings />}

            {/* Tabs owned by other teammates — placeholder */}
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