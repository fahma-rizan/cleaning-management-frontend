import React, { useState } from 'react';
import { Download, Filter, Eye, Edit, Trash2, X, Calendar, FileText } from 'lucide-react';
import { StatusBadge, SecondaryButton } from './RestockComponents';

export default function RestockHistory() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const historyRecords = [
    {
      id: 1,
      date: 'Feb 19, 2026 2:30 PM',
      material: { name: 'Gloves', icon: '🧤', category: 'Protective Gear' },
      quantityAdded: 20,
      unit: 'pairs',
      previousStock: 3,
      newStock: 23,
      cost: 50.00,
      costPerUnit: 2.50,
      supplier: { name: 'ABC Supply Co', contact: '+1 234-567-8900' },
      invoiceNumber: 'INV-2024-001',
      paymentStatus: 'paid' as const,
      addedBy: { name: 'John Doe', avatar: 'JD' },
      notes: 'Emergency restock due to high demand',
      receiptUrl: '/receipts/inv-001.pdf'
    },
    {
      id: 2,
      date: 'Feb 19, 2026 1:15 PM',
      material: { name: 'All-Purpose Cleaner', icon: '🧴', category: 'Cleaning Agent' },
      quantityAdded: 30,
      unit: 'liters',
      previousStock: 25,
      newStock: 55,
      cost: 150.00,
      costPerUnit: 5.00,
      supplier: { name: 'XYZ Chemicals', contact: '+1 234-567-8901' },
      invoiceNumber: 'INV-2024-002',
      paymentStatus: 'pending' as const,
      addedBy: { name: 'John Doe', avatar: 'JD' },
      notes: 'Scheduled restock',
      receiptUrl: null
    },
    {
      id: 3,
      date: 'Feb 18, 2026 4:00 PM',
      material: { name: 'Mop', icon: '🧹', category: 'Equipment' },
      quantityAdded: 10,
      unit: 'pieces',
      previousStock: 12,
      newStock: 22,
      cost: 80.00,
      costPerUnit: 8.00,
      supplier: { name: 'ABC Supply Co', contact: '+1 234-567-8900' },
      invoiceNumber: 'INV-2024-003',
      paymentStatus: 'credit' as const,
      addedBy: { name: 'Jane Smith', avatar: 'JS' },
      notes: 'Bulk purchase discount applied',
      receiptUrl: '/receipts/inv-003.pdf'
    },
    {
      id: 4,
      date: 'Feb 18, 2026 11:20 AM',
      material: { name: 'Cleaning Sponges', icon: '🧽', category: 'Supplies' },
      quantityAdded: 25,
      unit: 'pieces',
      previousStock: 8,
      newStock: 33,
      cost: 30.00,
      costPerUnit: 1.20,
      supplier: { name: 'CleanPro Supplies', contact: '+1 234-567-8902' },
      invoiceNumber: 'INV-2024-004',
      paymentStatus: 'paid' as const,
      addedBy: { name: 'Mike Johnson', avatar: 'MJ' },
      notes: '',
      receiptUrl: null
    },
    {
      id: 5,
      date: 'Feb 17, 2026 3:45 PM',
      material: { name: 'Trash Bags', icon: '🗑️', category: 'Supplies' },
      quantityAdded: 100,
      unit: 'pieces',
      previousStock: 50,
      newStock: 150,
      cost: 45.00,
      costPerUnit: 0.45,
      supplier: { name: 'ABC Supply Co', contact: '+1 234-567-8900' },
      invoiceNumber: 'INV-2024-005',
      paymentStatus: 'paid' as const,
      addedBy: { name: 'John Doe', avatar: 'JD' },
      notes: 'Monthly stock replenishment',
      receiptUrl: '/receipts/inv-005.pdf'
    },
    {
      id: 6,
      date: 'Feb 17, 2026 10:30 AM',
      material: { name: 'Disinfectant Spray', icon: '💨', category: 'Cleaning Agent' },
      quantityAdded: 15,
      unit: 'bottles',
      previousStock: 6,
      newStock: 21,
      cost: 75.00,
      costPerUnit: 5.00,
      supplier: { name: 'XYZ Chemicals', contact: '+1 234-567-8901' },
      invoiceNumber: 'INV-2024-006',
      paymentStatus: 'paid' as const,
      addedBy: { name: 'Jane Smith', avatar: 'JS' },
      notes: 'Seasonal stock increase',
      receiptUrl: null
    },
    {
      id: 7,
      date: 'Feb 16, 2026 2:15 PM',
      material: { name: 'Microfiber Cloths', icon: '🧽', category: 'Supplies' },
      quantityAdded: 40,
      unit: 'pieces',
      previousStock: 5,
      newStock: 45,
      cost: 120.00,
      costPerUnit: 3.00,
      supplier: { name: 'CleanPro Supplies', contact: '+1 234-567-8902' },
      invoiceNumber: 'INV-2024-007',
      paymentStatus: 'credit' as const,
      addedBy: { name: 'Mike Johnson', avatar: 'MJ' },
      notes: 'Premium quality upgrade',
      receiptUrl: '/receipts/inv-007.pdf'
    },
    {
      id: 8,
      date: 'Feb 15, 2026 5:00 PM',
      material: { name: 'Bucket', icon: '🪣', category: 'Equipment' },
      quantityAdded: 8,
      unit: 'pieces',
      previousStock: 4,
      newStock: 12,
      cost: 64.00,
      costPerUnit: 8.00,
      supplier: { name: 'ABC Supply Co', contact: '+1 234-567-8900' },
      invoiceNumber: 'INV-2024-008',
      paymentStatus: 'paid' as const,
      addedBy: { name: 'John Doe', avatar: 'JD' },
      notes: 'Equipment replacement',
      receiptUrl: null
    },
  ];

  const totalRestocks = historyRecords.length;
  const totalAmount = historyRecords.reduce((sum, record) => sum + record.cost, 0);
  const averageRestock = totalAmount / totalRestocks;
  const mostActiveAdmin = 'John Doe';
  const mostActiveCount = historyRecords.filter(r => r.addedBy.name === mostActiveAdmin).length;

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restock History</h1>
              <p className="text-gray-600 mt-1">View all inventory restocking records</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last 6 months</option>
                <option>Last year</option>
                <option>All time</option>
              </select>
              <SecondaryButton icon={<Download className="w-4 h-4" />}>
                Export History
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            <Filter className="w-4 h-4" />
            Filters {showFilters ? '▼' : '▶'}
          </button>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">From Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">To Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Material</label>
                <input type="text" placeholder="Search..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Suppliers</option>
                  <option>ABC Supply Co</option>
                  <option>XYZ Chemicals</option>
                  <option>CleanPro Supplies</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All</option>
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Credit</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-gray-600 text-sm mb-1">Total Restocks</p>
            <p className="text-3xl font-bold text-gray-900">{totalRestocks}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-gray-600 text-sm mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-gray-600 text-sm mb-1">Average Restock Value</p>
            <p className="text-3xl font-bold text-gray-900">${averageRestock.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-gray-600 text-sm mb-1">Most Active Admin</p>
            <p className="text-xl font-bold text-gray-900">{mostActiveAdmin}</p>
            <p className="text-sm text-gray-600">{mostActiveCount} restocks</p>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity Added</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Added By</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historyRecords.map((record, index) => (
                  <tr key={record.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{record.material.icon}</span>
                        <span className="text-sm font-medium text-gray-900">{record.material.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">+{record.quantityAdded}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${record.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.supplier.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{record.invoiceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={record.paymentStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                          {record.addedBy.avatar}
                        </div>
                        <span className="text-sm text-gray-900">{record.addedBy.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(record)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors" 
                          title="View Details"
                        >
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
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600">Showing 1-{historyRecords.length} of {totalRestocks} records</p>
              <select className="px-3 py-1.5 border border-gray-300 rounded text-sm">
                <option>15</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">Previous</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">3</button>
              <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Restock Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Material Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">Material Information</h3>
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{selectedRecord.material.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-xl text-gray-900">{selectedRecord.material.name}</p>
                    <p className="text-sm text-gray-600">{selectedRecord.material.category}</p>
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Previous Stock</p>
                        <p className="font-bold text-gray-900">{selectedRecord.previousStock} {selectedRecord.unit}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Added Quantity</p>
                        <p className="font-bold text-green-600">+{selectedRecord.quantityAdded} {selectedRecord.unit}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">New Stock</p>
                        <p className="font-bold text-gray-900">{selectedRecord.newStock} {selectedRecord.unit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Details */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Purchase Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Supplier</p>
                    <p className="font-semibold text-gray-900">{selectedRecord.supplier.name}</p>
                    <p className="text-gray-500">{selectedRecord.supplier.contact}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Purchase Date</p>
                    <p className="font-semibold text-gray-900">{selectedRecord.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Invoice Number</p>
                    <p className="font-semibold text-gray-900 font-mono">{selectedRecord.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Receipt</p>
                    {selectedRecord.receiptUrl ? (
                      <a href={selectedRecord.receiptUrl} className="text-blue-600 hover:underline flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Download PDF
                      </a>
                    ) : (
                      <p className="text-gray-400">No receipt uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{selectedRecord.quantityAdded} {selectedRecord.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost per unit:</span>
                    <span className="font-semibold">${selectedRecord.costPerUnit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-bold text-gray-900">Total cost:</span>
                    <span className="font-bold text-xl text-gray-900">${selectedRecord.cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment status:</span>
                    <StatusBadge status={selectedRecord.paymentStatus} />
                  </div>
                </div>
              </div>

              {/* Admin Information */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Admin Information</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    {selectedRecord.addedBy.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedRecord.addedBy.name}</p>
                    <p className="text-sm text-gray-600">{selectedRecord.date}</p>
                  </div>
                </div>
                {selectedRecord.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Notes:</p>
                    <p className="text-sm text-gray-900">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <SecondaryButton icon={<Download className="w-4 h-4" />}>
                Download PDF
              </SecondaryButton>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
