import React, { useState } from 'react';
import { AlertTriangle, X, Eye, XCircle } from 'lucide-react';
import { PrimaryRestockButton, SecondaryButton, ProgressBar, ServiceBadge } from './RestockComponents';
import AddRestockModal from './AddRestockModal';

export default function LowStockAlerts() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'low' | 'resolved'>('all');

  const alerts = [
    {
      id: 1,
      type: 'critical' as const,
      material: { id: 1, name: 'Gloves', icon: '🧤', category: 'Protective Gear' },
      currentStock: 3,
      minThreshold: 10,
      unit: 'pairs',
      deficit: -7,
      percentage: 30,
      services: ['Home Cleaning', 'Deep Cleaning', 'Office Cleaning'],
      lastRestocked: '15 days ago',
      impact: 'High usage item, affects 3 service types',
      date: 'Feb 19, 2026 2:30PM'
    },
    {
      id: 2,
      type: 'critical' as const,
      material: { id: 2, name: 'Floor Cleaner', icon: '🧴', category: 'Cleaning Agent' },
      currentStock: 2,
      minThreshold: 15,
      unit: 'liters',
      deficit: -13,
      percentage: 13,
      services: ['Home Cleaning', 'Office Cleaning'],
      lastRestocked: '20 days ago',
      impact: 'Critical item, multiple bookings pending',
      date: 'Feb 19, 2026 1:00PM'
    },
    {
      id: 3,
      type: 'critical' as const,
      material: { id: 3, name: 'Microfiber Cloths', icon: '🧽', category: 'Supplies' },
      currentStock: 5,
      minThreshold: 20,
      unit: 'pieces',
      deficit: -15,
      percentage: 25,
      services: ['Home Cleaning', 'Deep Cleaning', 'Car Cleaning'],
      lastRestocked: '12 days ago',
      impact: 'High demand item, essential for quality service',
      date: 'Feb 18, 2026 5:15PM'
    },
    {
      id: 4,
      type: 'low' as const,
      material: { id: 4, name: 'Cleaning Sponges', icon: '🧽', category: 'Supplies' },
      currentStock: 8,
      minThreshold: 15,
      unit: 'pieces',
      deficit: -7,
      percentage: 53,
      services: ['Home Cleaning', 'Office Cleaning'],
      lastRestocked: '8 days ago',
      impact: 'Medium usage item',
      date: 'Feb 19, 2026 10:15AM'
    },
    {
      id: 5,
      type: 'low' as const,
      material: { id: 5, name: 'Bucket', icon: '🪣', category: 'Equipment' },
      currentStock: 4,
      minThreshold: 8,
      unit: 'pieces',
      deficit: -4,
      percentage: 50,
      services: ['Home Cleaning'],
      lastRestocked: '10 days ago',
      impact: 'Regular usage item',
      date: 'Feb 18, 2026 9:30AM'
    },
    {
      id: 6,
      type: 'low' as const,
      material: { id: 6, name: 'Disinfectant Spray', icon: '💨', category: 'Cleaning Agent' },
      currentStock: 6,
      minThreshold: 10,
      unit: 'bottles',
      deficit: -4,
      percentage: 60,
      services: ['Deep Cleaning', 'Office Cleaning'],
      lastRestocked: '6 days ago',
      impact: 'Medium priority item',
      date: 'Feb 17, 2026 3:45PM'
    },
    {
      id: 7,
      type: 'low' as const,
      material: { id: 7, name: 'Scrub Brush', icon: '🪥', category: 'Equipment' },
      currentStock: 7,
      minThreshold: 12,
      unit: 'pieces',
      deficit: -5,
      percentage: 58,
      services: ['Deep Cleaning'],
      lastRestocked: '9 days ago',
      impact: 'Low priority item',
      date: 'Feb 17, 2026 11:00AM'
    },
    {
      id: 8,
      type: 'low' as const,
      material: { id: 8, name: 'Vacuum Bags', icon: '📦', category: 'Supplies' },
      currentStock: 12,
      minThreshold: 20,
      unit: 'pieces',
      deficit: -8,
      percentage: 60,
      services: ['Home Cleaning', 'Office Cleaning'],
      lastRestocked: '5 days ago',
      impact: 'Regular restocking needed',
      date: 'Feb 16, 2026 2:20PM'
    },
  ];

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'all') return true;
    if (activeTab === 'critical') return alert.type === 'critical';
    if (activeTab === 'low') return alert.type === 'low';
    return false;
  });

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const lowCount = alerts.filter(a => a.type === 'low').length;

  const handleRestock = (alert: any) => {
    setSelectedMaterial(alert.material);
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Low Stock Alerts</h1>
              <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                {alerts.length} alerts
              </span>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton>Dismiss All Reviewed</SecondaryButton>
              <SecondaryButton>Generate Report</SecondaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-orange-50 border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <p className="text-sm font-semibold text-orange-900">
                You have {alerts.length} items requiring attention ({criticalCount} Critical, {lowCount} Low Stock)
              </p>
            </div>
            <button className="text-orange-600 hover:text-orange-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Main Content */}
          <div className="col-span-1">
            {/* Filter Tabs */}
            <div className="bg-white rounded-t-xl border-x border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex gap-6">
                {[
                  { id: 'all', label: 'All', count: alerts.length },
                  { id: 'critical', label: 'Critical', count: criticalCount },
                  { id: 'low', label: 'Low', count: lowCount },
                  { id: 'resolved', label: 'Resolved', count: 0 },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2 border-b-2 font-semibold text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Sort by: Most Critical First</option>
                <option>Sort by: Date Added</option>
                <option>Sort by: Material Name</option>
              </select>
            </div>

            {/* Alert Cards */}
            <div className="bg-white rounded-b-xl border-x border-b border-gray-200 p-6 space-y-4">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`border-l-4 ${alert.type === 'critical' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'} rounded-r-lg p-6 hover:shadow-md transition-shadow`}
                >
                  {/* Alert Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        alert.type === 'critical' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {alert.type === 'critical' ? '🔴 CRITICAL' : '🟠 LOW STOCK'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">{alert.date}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-6">
                    {/* Material Info */}
                    <div className="col-span-3">
                      <div className="flex flex-col items-center text-center">
                        <span className="text-5xl mb-2">{alert.material.icon}</span>
                        <h3 className="font-bold text-gray-900 mb-1">{alert.material.name}</h3>
                        <p className="text-xs text-gray-600">{alert.material.category}</p>
                      </div>
                    </div>

                    {/* Stock Details */}
                    <div className="col-span-9">
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Current Stock</p>
                          <p className={`font-bold text-lg ${alert.type === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>
                            {alert.currentStock} {alert.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Minimum</p>
                          <p className="font-bold text-lg text-gray-900">{alert.minThreshold} {alert.unit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Deficit</p>
                          <p className={`font-bold text-lg ${alert.type === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>
                            {alert.deficit} {alert.unit}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <ProgressBar 
                          percentage={alert.percentage} 
                          color={alert.type === 'critical' ? 'red' : 'orange'} 
                        />
                        <p className="text-xs text-gray-600 mt-1">{alert.percentage}% of minimum threshold</p>
                      </div>

                      {/* Services & Last Restock */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">Used in:</p>
                        <div className="flex flex-wrap gap-2">
                          {alert.services.map(service => (
                            <ServiceBadge key={service} service={service} />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 mb-3">Last restocked: {alert.lastRestocked}</p>

                      {/* Impact */}
                      <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Impact:</span> {alert.impact}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <PrimaryRestockButton onClick={() => handleRestock(alert)}>
                          Restock Now
                        </PrimaryRestockButton>
                        <SecondaryButton icon={<Eye className="w-4 h-4" />}>
                          View Details
                        </SecondaryButton>
                        <button className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredAlerts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">All stock levels are healthy!</h3>
                  <p className="text-gray-600">No active alerts at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Restock Modal */}
      <AddRestockModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedMaterial(null);
        }}
        selectedMaterial={selectedMaterial}
        onSubmit={(data) => {
          console.log('Restock submitted:', data);
          setShowAddModal(false);
        }}
      />
    </div>
  );
}