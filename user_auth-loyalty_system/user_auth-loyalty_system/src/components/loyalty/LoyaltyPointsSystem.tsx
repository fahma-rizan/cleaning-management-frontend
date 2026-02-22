import { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Award, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  TrendingUp,
  Target,
  Tag,
  Calendar,
  Gift,
  Medal,
  Clock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SummaryPage from './SummaryPage';
import HistoryPage from './HistoryPage';
import TiersPage from './TiersPage';
import EarnPointsPage from './EarnPointsPage';
import RedemptionPage from './RedemptionPage';
import BadgeUpgradeModal from './BadgeUpgradeModal';
import logo from 'figma:asset/d0e24839a24076173960597a25c12b48f3330fdf.png';

interface LoyaltyPointsSystemProps {
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function LoyaltyPointsSystem({ onLogout, theme = 'light', onToggleTheme }: LoyaltyPointsSystemProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [showRedemption, setShowRedemption] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState<'silver' | 'gold' | 'platinum'>('gold');

  // Mock user data
  const userData = {
    name: 'John Doe',
    currentPoints: 1250,
    currentTier: 'silver',
    pointsToNextTier: 256,
    earnedThisMonth: 340,
    badgeDiscount: {
      available: true,
      percentage: 5,
      expiryDate: 'Apr 5, 2026',
      daysRemaining: 45,
      totalDays: 90
    }
  };

  const sidebarItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, link: '/dashboard' },
    { id: 'bookings', name: 'My Bookings', icon: ClipboardList, link: '/dashboard' },
    { id: 'loyalty', name: 'Loyalty Points', icon: Award, active: true },
    { id: 'notifications', name: 'Notifications', icon: Bell, link: '/dashboard' },
    { id: 'profile', name: 'My Profile', icon: User, link: '/dashboard' },
    { id: 'settings', name: 'Settings', icon: Settings, link: '/dashboard' },
  ];

  const tabs = [
    { id: 'summary', name: 'Summary' },
    { id: 'history', name: 'History' },
    { id: 'tiers', name: 'Tiers' },
    { id: 'earn', name: 'Earn Points' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white font-['Inter']">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[200px] bg-[#1a1a2e] border-r border-white/8 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/8">
          <img src={logo} alt="Cloud Laundry.LK" className="h-8 mb-2" />
          <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide">
            CUSTOMER PANEL
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {sidebarItems.map((item) => (
            item.link ? (
              <Link
                key={item.id}
                to={item.link}
                className={`flex items-center gap-3 px-6 py-3 transition-all ${
                  item.active
                    ? 'bg-[#7c3aed]/10 border-l-2 border-[#7c3aed] text-white'
                    : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ) : (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
                  item.active
                    ? 'bg-[#7c3aed]/10 border-l-2 border-[#7c3aed] text-white'
                    : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            )
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-white/8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{userData.name}</p>
              <p className="text-[10px] font-medium text-[#94a3b8] uppercase">
                {userData.currentTier}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[200px] min-h-screen">
        {/* Tab Navigation */}
        <div className="bg-[#1a1a2e] border-b border-white/8 sticky top-0 z-10">
          <div className="px-8 pt-8">
            <h1 className="text-2xl font-bold mb-6">Loyalty Points</h1>
            <div className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-2 text-sm font-semibold transition-all relative ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {tab.name}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c3aed]"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'summary' && (
            <SummaryPage
              userData={userData}
              onRedeemClick={() => setShowRedemption(true)}
            />
          )}
          {activeTab === 'history' && <HistoryPage />}
          {activeTab === 'tiers' && <TiersPage currentTier={userData.currentTier} />}
          {activeTab === 'earn' && <EarnPointsPage />}
        </div>
      </main>

      {/* Redemption Modal */}
      {showRedemption && (
        <RedemptionPage
          availablePoints={userData.currentPoints}
          onClose={() => setShowRedemption(false)}
        />
      )}

      {/* Badge Upgrade Modal */}
      {showBadgeModal && (
        <BadgeUpgradeModal
          tier={upgradeTier}
          onClose={() => setShowBadgeModal(false)}
        />
      )}
    </div>
  );
}