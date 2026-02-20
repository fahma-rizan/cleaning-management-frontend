import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, AlertTriangle, Package, Plus, X } from 'lucide-react';
import Header from '../Header';
import type { User } from '../../types';

interface LowStockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  deficit: number;
  suggestedReorder: number;
  costPerUnit: number;
}

interface LowStockAlertsPageProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function LowStockAlertsPage({
  user,
  onLogout,
  theme,
  onToggleTheme,
  onProfileClick
}: LowStockAlertsPageProps) {
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [dismissedItems, setDismissedItems] = useState<string[]>([]);

  useEffect(() => {
    loadLowStockItems();
    loadDismissedItems();
  }, []);

  const loadLowStockItems = () => {
    const storedItems = localStorage.getItem('inventoryItems');
    if (storedItems) {
      const items = JSON.parse(storedItems);
      const lowStock = items
        .filter((item: any) => item.currentStock <= item.minThreshold)
        .map((item: any) => ({
          ...item,
          deficit: item.minThreshold - item.currentStock,
          suggestedReorder: Math.max(item.reorderQuantity || 20, item.minThreshold * 2)
        }))
        .sort((a: any, b: any) => {
          // Sort by severity (critical first)
          const aPercentage = (a.currentStock / a.minThreshold) * 100;
          const bPercentage = (b.currentStock / b.minThreshold) * 100;
          return aPercentage - bPercentage;
        });
      
      setLowStockItems(lowStock);
    }
  };

  const loadDismissedItems = () => {
    const dismissed = localStorage.getItem('dismissedLowStockAlerts');
    if (dismissed) {
      setDismissedItems(JSON.parse(dismissed));
    }
  };

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedItems, id];
    setDismissedItems(newDismissed);
    localStorage.setItem('dismissedLowStockAlerts', JSON.stringify(newDismissed));
  };

  const getAlertLevel = (item: LowStockItem) => {
    const percentage = (item.currentStock / item.minThreshold) * 100;
    if (percentage <= 25) return 'critical';
    if (percentage <= 50) return 'warning';
    return 'low';
  };

  const getAlertConfig = (level: string) => {
    const configs = {
      critical: {
        bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50',
        border: 'border-red-500',
        text: theme === 'dark' ? 'text-red-400' : 'text-red-700',
        badge: theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
        label: 'CRITICAL',
        icon: '🔴'
      },
      warning: {
        bg: theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-50',
        border: 'border-orange-500',
        text: theme === 'dark' ? 'text-orange-400' : 'text-orange-700',
        badge: theme === 'dark' ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800',
        label: 'WARNING',
        icon: '🟠'
      },
      low: {
        bg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50',
        border: 'border-yellow-500',
        text: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700',
        badge: theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
        label: 'LOW STOCK',
        icon: '🟡'
      }
    };
    return configs[level as keyof typeof configs];
  };

  const visibleItems = lowStockItems.filter(item => !dismissedItems.includes(item.id));

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Low Stock Alerts
              </h1>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Items that need immediate attention
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${
              visibleItems.length > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {visibleItems.length}
            </span>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Alert{visibleItems.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Alerts List */}
        {visibleItems.length > 0 ? (
          <div className="space-y-4">
            {visibleItems.map((item) => {
              const level = getAlertLevel(item);
              const config = getAlertConfig(level);
              
              return (
                <div
                  key={item.id}
                  className={`rounded-xl p-6 border-2 ${config.bg} ${config.border} shadow-sm`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{config.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-xl font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {item.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.badge}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.category}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismiss(item.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-white'
                      }`}
                      title="Dismiss alert"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Current Stock
                      </p>
                      <p className={`text-2xl font-bold ${config.text}`}>
                        {item.currentStock} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Minimum Required
                      </p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {item.minThreshold} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Deficit
                      </p>
                      <p className={`text-2xl font-bold ${config.text}`}>
                        -{item.deficit} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Suggested Reorder
                      </p>
                      <p className={`text-2xl font-bold text-green-600`}>
                        {item.suggestedReorder} {item.unit}
                      </p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg mb-4 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Estimated Cost:</strong> LKR {(item.suggestedReorder * item.costPerUnit).toLocaleString()} 
                      <span className={`ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        ({item.costPerUnit} per {item.unit})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/admin/inventory/restock/${item.id}`}
                      className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Restock Now
                    </Link>
                    <Link
                      to={`/admin/inventory/edit/${item.id}`}
                      className={`px-6 py-2 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'border-gray-600 hover:bg-gray-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Edit Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`rounded-xl p-12 text-center ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              All Stock Levels Are Good!
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No items below minimum threshold at this time
            </p>
            <Link
              to="/admin/inventory"
              className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              View Full Inventory →
            </Link>
          </div>
        )}

        {/* Dismissed Alerts Info */}
        {dismissedItems.length > 0 && (
          <div className={`mt-6 p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {dismissedItems.length} alert{dismissedItems.length !== 1 ? 's' : ''} dismissed. 
              <button
                onClick={() => {
                  setDismissedItems([]);
                  localStorage.removeItem('dismissedLowStockAlerts');
                }}
                className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                Show all alerts
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
