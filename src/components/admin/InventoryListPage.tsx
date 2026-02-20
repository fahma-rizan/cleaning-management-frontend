import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Filter,
  Package,
  AlertTriangle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import Header from '../Header';
import type { User } from '../../types';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  supplier: string;
  lastUpdated: string;
}

interface InventoryListPageProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function InventoryListPage({
  user,
  onLogout,
  theme,
  onToggleTheme,
  onProfileClick
}: InventoryListPageProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    const storedItems = localStorage.getItem('inventoryItems');
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      // Initialize with default items
      const defaultItems: InventoryItem[] = [
        { 
          id: '1', 
          name: 'Detergent (5L)', 
          category: 'Cleaning Agents', 
          currentStock: 45, 
          unit: 'Liters',
          minThreshold: 20,
          costPerUnit: 850,
          supplier: 'ABC Suppliers',
          lastUpdated: new Date().toISOString()
        },
        { 
          id: '2', 
          name: 'Floor Cleaner', 
          category: 'Cleaning Agents', 
          currentStock: 30, 
          unit: 'Liters',
          minThreshold: 15,
          costPerUnit: 450,
          supplier: 'ABC Suppliers',
          lastUpdated: new Date().toISOString()
        },
        { 
          id: '3', 
          name: 'Glass Cleaner', 
          category: 'Cleaning Agents', 
          currentStock: 22, 
          unit: 'Liters',
          minThreshold: 10,
          costPerUnit: 380,
          supplier: 'XYZ Traders',
          lastUpdated: new Date().toISOString()
        },
        { 
          id: '4', 
          name: 'Disinfectant Spray', 
          category: 'Cleaning Agents', 
          currentStock: 18, 
          unit: 'Liters',
          minThreshold: 12,
          costPerUnit: 550,
          supplier: 'ABC Suppliers',
          lastUpdated: new Date().toISOString()
        },
        { 
          id: '5', 
          name: 'Vacuum Cleaner Bags', 
          category: 'Equipment', 
          currentStock: 8, 
          unit: 'Pieces',
          minThreshold: 10,
          costPerUnit: 120,
          supplier: 'Tech Equipment Co.',
          lastUpdated: new Date().toISOString()
        },
        { 
          id: '6', 
          name: 'Microfiber Cloths', 
          category: 'Equipment', 
          currentStock: 100, 
          unit: 'Pieces',
          minThreshold: 50,
          costPerUnit: 85,
          supplier: 'Textile Supplies',
          lastUpdated: new Date().toISOString()
        },
        { 
          id: '7', 
          name: 'Mop Heads', 
          category: 'Equipment', 
          currentStock: 15, 
          unit: 'Pieces',
          minThreshold: 8,
          costPerUnit: 320,
          supplier: 'Cleaning Tools Ltd',
          lastUpdated: new Date().toISOString()
        },
        { 
          id: '8', 
          name: 'Rubber Gloves', 
          category: 'Protective Gear', 
          currentStock: 50, 
          unit: 'Pairs',
          minThreshold: 30,
          costPerUnit: 95,
          supplier: 'Safety First',
          lastUpdated: new Date().toISOString()
        },
        { 
          id: '9', 
          name: 'Face Masks', 
          category: 'Protective Gear', 
          currentStock: 5, 
          unit: 'Pieces',
          minThreshold: 20,
          costPerUnit: 25,
          supplier: 'Safety First',
          lastUpdated: new Date().toISOString()
        },
      ];
      setItems(defaultItems);
      localStorage.setItem('inventoryItems', JSON.stringify(defaultItems));
    }
  };

  const categories = ['All', 'Cleaning Agents', 'Equipment', 'Protective Gear'];

  const getStockStatus = (item: InventoryItem) => {
    const percentage = (item.currentStock / item.minThreshold) * 100;
    if (percentage <= 50) return 'critical';
    if (percentage <= 100) return 'low';
    return 'good';
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      critical: { 
        bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100', 
        text: theme === 'dark' ? 'text-red-400' : 'text-red-700',
        icon: AlertTriangle,
        label: 'Critical'
      },
      low: { 
        bg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100', 
        text: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700',
        icon: AlertTriangle,
        label: 'Low'
      },
      good: { 
        bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100', 
        text: theme === 'dark' ? 'text-green-400' : 'text-green-700',
        icon: CheckCircle,
        label: 'Sufficient'
      }
    };
    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
                           item.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    if (window.confirm(`Delete ${selectedItems.length} selected items?`)) {
      const updatedItems = items.filter(item => !selectedItems.includes(item.id));
      setItems(updatedItems);
      localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
      setSelectedItems([]);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedItems(prev =>
      prev.length === filteredItems.length ? [] : filteredItems.map(item => item.id)
    );
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Category', 'Stock', 'Unit', 'Min Threshold', 'Status', 'Cost Per Unit', 'Supplier'];
    const data = filteredItems.map(item => [
      item.name,
      item.category,
      item.currentStock,
      item.unit,
      item.minThreshold,
      getStockStatus(item),
      item.costPerUnit,
      item.supplier
    ]);
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
                Inventory Management
              </h1>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage cleaning materials and supplies
              </p>
            </div>
          </div>
          <Link
            to="/admin/inventory/add"
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Item
          </Link>
        </div>

        {/* Filters and Actions */}
        <div className={`rounded-xl p-4 mb-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 hover:bg-gray-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Download className="w-5 h-5" />
              Export
            </button>

            {/* Bulk Delete */}
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Delete ({selectedItems.length})
              </button>
            )}
          </div>
        </div>

        {/* Inventory Table */}
        <div className={`rounded-xl overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Item Name
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Category
                  </th>
                  <th className={`px-4 py-3 text-right text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Current Stock
                  </th>
                  <th className={`px-4 py-3 text-right text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Min Threshold
                  </th>
                  <th className={`px-4 py-3 text-center text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-right text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Cost/Unit
                  </th>
                  <th className={`px-4 py-3 text-center text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </td>
                      <td className={`px-4 py-4 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </td>
                      <td className={`px-4 py-4 text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {item.category}
                      </td>
                      <td className={`px-4 py-4 text-right ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.currentStock} {item.unit}
                      </td>
                      <td className={`px-4 py-4 text-right text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {item.minThreshold} {item.unit}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(getStockStatus(item))}
                      </td>
                      <td className={`px-4 py-4 text-right ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        LKR {item.costPerUnit}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/inventory/edit/${item.id}`)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            }`}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            }`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <Package className={`w-12 h-12 mx-auto mb-3 ${
                        theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        No items found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className={`mt-6 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-sm`}>
          <div className="flex items-center justify-between text-sm">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Showing {filteredItems.length} of {items.length} items
            </span>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Total Value: LKR {filteredItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
