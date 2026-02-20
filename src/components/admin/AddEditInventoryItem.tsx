import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import Header from '../Header';
import type { User } from '../../types';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  reorderQuantity: number;
  supplier: string;
  costPerUnit: number;
  storageLocation: string;
  image?: string;
}

interface AddEditInventoryItemProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function AddEditInventoryItem({
  user,
  onLogout,
  theme,
  onToggleTheme,
  onProfileClick
}: AddEditInventoryItemProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState<InventoryItem>({
    id: '',
    name: '',
    category: 'Cleaning Agents',
    description: '',
    unit: 'Liters',
    currentStock: 0,
    minThreshold: 10,
    reorderQuantity: 20,
    supplier: '',
    costPerUnit: 0,
    storageLocation: '',
    image: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      const storedItems = localStorage.getItem('inventoryItems');
      if (storedItems) {
        const items: InventoryItem[] = JSON.parse(storedItems);
        const item = items.find(i => i.id === id);
        if (item) {
          setFormData(item);
        } else {
          navigate('/admin/inventory');
        }
      }
    }
  }, [id, isEdit, navigate]);

  const categories = ['Cleaning Agents', 'Equipment', 'Protective Gear'];
  const units = ['Liters', 'Pieces', 'Pairs', 'Kilograms', 'Boxes'];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.supplier.trim()) newErrors.supplier = 'Supplier name is required';
    if (formData.currentStock < 0) newErrors.currentStock = 'Stock cannot be negative';
    if (formData.minThreshold < 0) newErrors.minThreshold = 'Minimum threshold cannot be negative';
    if (formData.reorderQuantity < 0) newErrors.reorderQuantity = 'Reorder quantity cannot be negative';
    if (formData.costPerUnit <= 0) newErrors.costPerUnit = 'Cost per unit must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const storedItems = localStorage.getItem('inventoryItems');
    const items: InventoryItem[] = storedItems ? JSON.parse(storedItems) : [];

    if (isEdit) {
      const updatedItems = items.map(item => 
        item.id === id ? { ...formData, id } : item
      );
      localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    } else {
      const newItem = {
        ...formData,
        id: Date.now().toString(),
      };
      localStorage.setItem('inventoryItems', JSON.stringify([...items, newItem]));
    }

    navigate('/admin/inventory');
  };

  const handleChange = (field: keyof InventoryItem, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/inventory')}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {isEdit ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {isEdit ? 'Update item details' : 'Add a new item to inventory'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-xl mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g., Detergent (5L)"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Brief description of the item..."
                />
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-xl mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Stock Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Current Stock *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.currentStock}
                  onChange={(e) => handleChange('currentStock', parseFloat(e.target.value))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } ${errors.currentStock ? 'border-red-500' : ''}`}
                  placeholder="0"
                />
                {errors.currentStock && <p className="text-red-500 text-sm mt-1">{errors.currentStock}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Minimum Threshold *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.minThreshold}
                  onChange={(e) => handleChange('minThreshold', parseFloat(e.target.value))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } ${errors.minThreshold ? 'border-red-500' : ''}`}
                  placeholder="10"
                />
                {errors.minThreshold && <p className="text-red-500 text-sm mt-1">{errors.minThreshold}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Reorder Quantity *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.reorderQuantity}
                  onChange={(e) => handleChange('reorderQuantity', parseFloat(e.target.value))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } ${errors.reorderQuantity ? 'border-red-500' : ''}`}
                  placeholder="20"
                />
                {errors.reorderQuantity && <p className="text-red-500 text-sm mt-1">{errors.reorderQuantity}</p>}
              </div>
            </div>
          </div>

          {/* Supplier & Pricing */}
          <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-xl mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Supplier & Pricing
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Supplier Name *
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } ${errors.supplier ? 'border-red-500' : ''}`}
                  placeholder="e.g., ABC Suppliers"
                />
                {errors.supplier && <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Cost Per Unit (LKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => handleChange('costPerUnit', parseFloat(e.target.value))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } ${errors.costPerUnit ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
                {errors.costPerUnit && <p className="text-red-500 text-sm mt-1">{errors.costPerUnit}</p>}
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Storage Location
                </label>
                <input
                  type="text"
                  value={formData.storageLocation}
                  onChange={(e) => handleChange('storageLocation', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="e.g., Warehouse A, Shelf 3"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/inventory')}
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
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              {isEdit ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
