import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, Save, Upload } from 'lucide-react';
import Header from '../Header';
import type { User } from '../../types';

interface RestockPageProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function RestockPage({
  user,
  onLogout,
  theme,
  onToggleTheme,
  onProfileClick
}: RestockPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    itemId: id || '',
    itemName: '',
    currentStock: 0,
    unit: '',
    quantityAdded: 0,
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    cost: 0,
    invoiceNumber: '',
    expiryDate: '',
    reason: 'Restock',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      const storedItems = localStorage.getItem('inventoryItems');
      if (storedItems) {
        const items = JSON.parse(storedItems);
        const item = items.find((i: any) => i.id === id);
        if (item) {
          setFormData(prev => ({
            ...prev,
            itemId: item.id,
            itemName: item.name,
            currentStock: item.currentStock,
            unit: item.unit,
            supplier: item.supplier,
            cost: item.costPerUnit
          }));
        }
      }
    }
  }, [id]);

  const reasons = [
    'Restock',
    'Initial Stock',
    'Emergency Purchase',
    'Bulk Order',
    'Promotional Stock'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.quantityAdded <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    // Update inventory
    const storedItems = localStorage.getItem('inventoryItems');
    if (storedItems) {
      const items = JSON.parse(storedItems);
      const updatedItems = items.map((item: any) => {
        if (item.id === formData.itemId) {
          return {
            ...item,
            currentStock: item.currentStock + formData.quantityAdded,
            lastUpdated: new Date().toISOString()
          };
        }
        return item;
      });
      localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    }

    // Save restock record
    const restockRecord = {
      id: Date.now().toString(),
      ...formData,
      date: new Date().toISOString(),
      newStock: formData.currentStock + formData.quantityAdded,
      totalCost: formData.quantityAdded * formData.cost
    };

    const existingRecords = JSON.parse(localStorage.getItem('restockRecords') || '[]');
    localStorage.setItem('restockRecords', JSON.stringify([...existingRecords, restockRecord]));

    alert(`Successfully added ${formData.quantityAdded} ${formData.unit} to ${formData.itemName}`);
    navigate('/admin/inventory');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Add Stock / Restock
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Record new inventory purchase
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Selection */}
          <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-xl mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Item Information
            </h2>
            
            {id ? (
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {formData.itemName}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Current Stock: {formData.currentStock} {formData.unit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/inventory/restock')}
                    className="text-purple-600 hover:text-purple-700 text-sm"
                  >
                    Change Item
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={formData.itemId}
                onChange={(e) => {
                  const storedItems = localStorage.getItem('inventoryItems');
                  if (storedItems) {
                    const items = JSON.parse(storedItems);
                    const item = items.find((i: any) => i.id === e.target.value);
                    if (item) {
                      setFormData({
                        ...formData,
                        itemId: item.id,
                        itemName: item.name,
                        currentStock: item.currentStock,
                        unit: item.unit,
                        supplier: item.supplier,
                        cost: item.costPerUnit
                      });
                    }
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                required
              >
                <option value="">Select an item to restock...</option>
                {(() => {
                  const storedItems = localStorage.getItem('inventoryItems');
                  if (!storedItems) return null;
                  const items = JSON.parse(storedItems);
                  return items.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - Current: {item.currentStock} {item.unit}
                    </option>
                  ));
                })()}
              </select>
            )}
          </div>

          {/* Stock Details */}
          {formData.itemId && (
            <>
              <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h2 className={`text-xl mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Stock Addition Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Quantity to Add *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.quantityAdded || ''}
                      onChange={(e) => setFormData({...formData, quantityAdded: parseFloat(e.target.value)})}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      placeholder={`Enter quantity in ${formData.unit}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Cost Per Unit (LKR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost || ''}
                      onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      placeholder="Supplier name"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Purchase Date *
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      placeholder="INV-2024-001"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Reason
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {reasons.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              {formData.quantityAdded > 0 && (
                <div className={`rounded-xl p-6 ${
                  theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-purple-300' : 'text-purple-900'
                  }`}>
                    Restock Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className={`text-sm mb-1 ${
                        theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        Current Stock
                      </p>
                      <p className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {formData.currentStock}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm mb-1 ${
                        theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        Adding
                      </p>
                      <p className={`text-2xl font-bold text-green-600`}>
                        +{formData.quantityAdded}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm mb-1 ${
                        theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        New Stock
                      </p>
                      <p className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {formData.currentStock + formData.quantityAdded}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm mb-1 ${
                        theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        Total Cost
                      </p>
                      <p className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        LKR {(formData.quantityAdded * formData.cost).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`px-6 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.itemId || formData.quantityAdded <= 0}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
