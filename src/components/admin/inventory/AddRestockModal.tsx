import React, { useState } from 'react';
import { X, Search, Calculator, Upload, Check } from 'lucide-react';
import { NumberInput, CurrencyInput, FileUpload, StatusBadge } from './RestockComponents';

interface AddRestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMaterial?: any;
  onSubmit: (data: any) => void;
}

const materials = [
  { id: 1, name: 'Gloves', icon: '🧤', currentStock: 3, unit: 'pairs', minThreshold: 10, category: 'Protective Gear' },
  { id: 2, name: 'All-Purpose Cleaner', icon: '🧴', currentStock: 25, unit: 'liters', minThreshold: 10, category: 'Cleaning Agent' },
  { id: 3, name: 'Mop', icon: '🧹', currentStock: 12, unit: 'pieces', minThreshold: 5, category: 'Equipment' },
  { id: 4, name: 'Cleaning Sponges', icon: '🧽', currentStock: 8, unit: 'pieces', minThreshold: 15, category: 'Supplies' },
  { id: 5, name: 'Trash Bags', icon: '🗑️', currentStock: 50, unit: 'pieces', minThreshold: 30, category: 'Supplies' },
];

const suppliers = [
  { id: 1, name: 'ABC Supply Co', contact: '+1 234-567-8900' },
  { id: 2, name: 'XYZ Chemicals', contact: '+1 234-567-8901' },
  { id: 3, name: 'CleanPro Supplies', contact: '+1 234-567-8902' },
];

export default function AddRestockModal({ isOpen, onClose, selectedMaterial, onSubmit }: AddRestockModalProps) {
  const [formData, setFormData] = useState({
    materialId: selectedMaterial?.id || null,
    quantity: 0,
    unit: 'pairs',
    supplierId: null,
    purchaseDate: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    costPerUnit: 0,
    paymentStatus: 'paid' as 'paid' | 'pending' | 'credit',
    notes: '',
    receipt: null as File | null,
  });

  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const material = materials.find(m => m.id === formData.materialId);
  const totalCost = formData.quantity * formData.costPerUnit;
  const newStock = material ? material.currentStock + formData.quantity : 0;
  const willBeNormal = material ? newStock >= material.minThreshold : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add Restock</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Material Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Material <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {searchTerm && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, materialId: m.id, unit: m.unit });
                      setSearchTerm('');
                    }}
                    className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left border-b border-gray-100 last:border-0"
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{m.name}</p>
                      <p className="text-sm text-gray-500">Current: {m.currentStock} {m.unit}</p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">{m.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Status Card */}
          {material && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{material.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">{material.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-orange-600 font-semibold">Current Stock: {material.currentStock} {material.unit}</p>
                    <p className="text-gray-600">Minimum Threshold: {material.minThreshold} {material.unit}</p>
                    <div>
                      <StatusBadge status={material.currentStock < material.minThreshold ? 'low' : 'normal'} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Restock Quantity */}
          <div>
            <NumberInput
              label={`Quantity to Add ${material ? `(${material.unit})` : ''} *`}
              value={formData.quantity}
              onChange={(value) => setFormData({ ...formData, quantity: value })}
              min={0}
              max={9999}
            />
            <p className="text-sm text-gray-500 mt-1">Enter the quantity you want to add to inventory</p>
          </div>

          {/* Preview Calculation */}
          {material && formData.quantity > 0 && (
            <div className={`${willBeNormal ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
              <div className="flex items-start gap-3">
                <Calculator className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Current ({material.currentStock}) + Adding ({formData.quantity}) = New Stock ({newStock}) {willBeNormal ? '✅' : '⚠️'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status after restock: {willBeNormal ? '🟢 Normal (Above threshold)' : '🟠 Still Low (Below threshold)'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Purchase Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-gray-900 mb-4">Purchase Information</h3>
            
            {/* Supplier */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
              <select
                value={formData.supplierId || ''}
                onChange={(e) => setFormData({ ...formData, supplierId: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Purchase Date & Invoice Number */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Number</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="INV-2024-001"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Cost per Unit & Total Cost */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <CurrencyInput
                label="Cost per Unit"
                value={formData.costPerUnit}
                onChange={(value) => setFormData({ ...formData, costPerUnit: value })}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Cost</label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg font-bold text-xl text-gray-900">
                  ${totalCost.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
              <div className="flex gap-4">
                {(['paid', 'pending', 'credit'] as const).map(status => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentStatus"
                      value={status}
                      checked={formData.paymentStatus === status}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Receipt Upload */}
            <FileUpload
              label="Receipt Upload (Optional)"
              onFileSelect={(file) => setFormData({ ...formData, receipt: file })}
            />
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes about this restock..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 text-right mt-1">{formData.notes.length}/500</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.materialId || formData.quantity === 0}
              className="px-6 py-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
            >
              Add Restock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
