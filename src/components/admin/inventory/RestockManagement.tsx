import React, { useState } from 'react';
import { Package, DollarSign, AlertCircle, TrendingUp, Download, Filter, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { SummaryStatCard, PrimaryRestockButton, SecondaryButton, StatusBadge, QuickRestockCard } from './RestockComponents';
import AddRestockModal from './AddRestockModal';

export default function RestockManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  // Mock data
  const restockHistory = [
    {
      id: 1,
      date: 'Feb 19, 2:30 PM',
      material: 'Gloves',
      icon: '🧤',
      quantity: '+20',
      unit: 'pairs',
      cost: '$50.00',
      supplier: 'ABC Supply Co',
      addedBy: { name: 'John Doe', avatar: 'JD' },
      status: 'paid' as const
    },
    {
      id: 2,
      date: 'Feb 19, 1:15 PM',
      material: 'All-Purpose Cleaner',
      icon: '🧴',
      quantity: '+30',
      unit: 'liters',
      cost: '$150.00',
      supplier: 'XYZ Chemicals',
      addedBy: { name: 'John Doe', avatar: 'JD' },
      status: 'pending' as const
    },
    {
      id: 3,
      date: 'Feb 18, 4:00 PM',
      material: 'Mop',
      icon: '🧹',
      quantity: '+10',
      unit: 'pieces',
      cost: '$80.00',
      supplier: 'ABC Supply Co',
      addedBy: { name: 'Jane Smith', avatar: 'JS' },
      status: 'credit' as const
    },
    {
      id: 4,
      date: 'Feb 18, 11:20 AM',
      material: 'Cleaning Sponges',
      icon: '🧽',
      quantity: '+25',
      unit: 'pieces',
      cost: '$30.00',
      supplier: 'CleanPro Supplies',
      addedBy: { name: 'Mike Johnson', avatar: 'MJ' },
      status: 'paid' as const
    },
    {
      id: 5,
      date: 'Feb 17, 3:45 PM',
      material: 'Trash Bags',
      icon: '🗑️',
      quantity: '+100',
      unit: 'pieces',
      cost: '$45.00',
      supplier: 'ABC Supply Co',
      addedBy: { name: 'John Doe', avatar: 'JD' },
      status: 'paid' as const
    },
  ];

  const quickRestockMaterials = [
    { id: 1, name: 'Gloves', icon: '🧤', currentStock: 3, unit: 'pairs', minThreshold: 10, status: 'low' as const },
    { id: 2, name: 'All-Purpose Cleaner', icon: '🧴', currentStock: 25, unit: 'liters', minThreshold: 10, status: 'normal' as const },
    { id: 3, name: 'Mop', icon: '🧹', currentStock: 12, unit: 'pieces', minThreshold: 5, status: 'normal' as const },
    { id: 4, name: 'Cleaning Sponges', icon: '🧽', currentStock: 8, unit: 'pieces', minThreshold: 15, status: 'low' as const },
    { id: 5, name: 'Trash Bags', icon: '🗑️', currentStock: 50, unit: 'pieces', minThreshold: 30, status: 'normal' as const },
    { id: 6, name: 'Broom', icon: '🧹', currentStock: 7, unit: 'pieces', minThreshold: 5, status: 'normal' as const },
    { id: 7, name: 'Bucket', icon: '🪣', currentStock: 4, unit: 'pieces', minThreshold: 8, status: 'low' as const },
    { id: 8, name: 'Disinfectant', icon: '🧴', currentStock: 15, unit: 'liters', minThreshold: 12, status: 'normal' as const },
  ];

  const handleRestock = (material?: any) => {
    setSelectedMaterial(material);
    setShowAddModal(true);
  };

  const handleSubmitRestock = (data: any) => {
    console.log('Restock submitted:', data);
    // Handle restock submission
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restock Management</h1>
              <p className="text-gray-600 mt-1">Manage inventory restocking and view history</p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton icon={<Filter className="w-4 h-4" />}>
                Filter
              </SecondaryButton>
              <SecondaryButton icon={<Download className="w-4 h-4" />}>
                Export Report
              </SecondaryButton>
              <PrimaryRestockButton 
                icon={<Plus className="w-4 h-4" />}
                onClick={() => handleRestock()}
              >
                Add Restock
              </PrimaryRestockButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <SummaryStatCard
            title="Total Restocks This Month"
            value={24}
            icon={<Package className="w-6 h-6 text-blue-600" />}
            trend={{ value: '+8 from last month', isPositive: true }}
            iconBgColor="bg-blue-100"
          />
          <SummaryStatCard
            title="Most Restocked Item"
            value="Gloves"
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Restocks - Full Width */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">Recent Restocks</h2>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">24</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Material</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {restockHistory.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-sm font-medium text-gray-900">{item.material}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-green-600">{item.quantity} {item.unit}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="View">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Edit">
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">Showing 1-10 of 24</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">Previous</button>
                  <button className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => handleRestock()}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#2563EB] text-white rounded-full shadow-lg hover:bg-[#1d4ed8] flex items-center justify-center group transition-all hover:scale-110"
        title="Quick Add Restock"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Restock Modal */}
      <AddRestockModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedMaterial(null);
        }}
        selectedMaterial={selectedMaterial}
        onSubmit={handleSubmitRestock}
      />
    </div>
  );
}