import { useState, useEffect } from 'react';
import { X, Plus, Minus, Package, CheckCircle } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  category?: string;
}

interface UsedItem {
  id: string;
  name: string;
  unit: string;
  quantityUsed: number;
}

interface MaterialUsageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (usedItems: UsedItem[], notes: string) => void;
  taskId: string;
  taskService: string;
  customerName: string;
}

export default function MaterialUsageForm({
  isOpen,
  onClose,
  onSubmit,
  taskId,
  taskService,
  customerName
}: MaterialUsageFormProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [usedItems, setUsedItems] = useState<UsedItem[]>([]);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load inventory items from localStorage
      const storedItems = localStorage.getItem('inventoryItems');
      if (storedItems) {
        const items: InventoryItem[] = JSON.parse(storedItems);
        setInventoryItems(items);
      }
      // Reset form
      setUsedItems([]);
      setNotes('');
      setSearchTerm('');
    }
  }, [isOpen]);

  const addItemToUsed = (item: InventoryItem) => {
    // Check if item already added
    if (usedItems.find(u => u.id === item.id)) {
      alert('This item is already added to the usage list.');
      return;
    }

    const newUsedItem: UsedItem = {
      id: item.id,
      name: item.name,
      unit: item.unit,
      quantityUsed: 1,
    };

    setUsedItems([...usedItems, newUsedItem]);
  };

  const updateQuantity = (id: string, change: number) => {
    setUsedItems(usedItems.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantityUsed + change;
        return { ...item, quantityUsed: Math.max(0, newQuantity) };
      }
      return item;
    }));
  };

  const removeUsedItem = (id: string) => {
    setUsedItems(usedItems.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    if (usedItems.length === 0) {
      alert('⚠️ Please add at least one inventory item used for this task.');
      return;
    }

    // Check if any item has 0 quantity
    const hasZeroQuantity = usedItems.some(item => item.quantityUsed === 0);
    if (hasZeroQuantity) {
      alert('⚠️ Please ensure all items have a quantity greater than 0, or remove items with 0 quantity.');
      return;
    }

    onSubmit(usedItems, notes);
  };

  const filteredInventory = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/10 bg-[#1e1534] relative overflow-hidden">
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-900/40">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                  Material Usage
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 text-[10px] font-bold rounded uppercase tracking-widest border border-purple-500/20">
                    Task {taskId}
                  </span>
                  <span className="w-1 h-1 bg-purple-400/50 rounded-full"></span>
                  <p className="text-purple-300/80 text-xs font-medium uppercase tracking-wide">
                    Internal Reporting
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl p-2.5 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Task Info Summary */}
        <div className="px-8 py-4 bg-purple-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</span>
              <div className="font-bold text-gray-900 dark:text-white truncate">{customerName}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Type</span>
              <div className="font-bold text-gray-900 dark:text-white truncate">{taskService}</div>
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reporting Date</span>
              <div className="font-bold text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
          {/* Used Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Selected Materials
                {usedItems.length > 0 && (
                  <span className="bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                    {usedItems.length}
                  </span>
                )}
              </h3>
            </div>
            
            {usedItems.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center transition-all">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium max-w-[240px] mx-auto">
                  No materials recorded yet. Search and add items from the inventory below.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {usedItems.map(item => (
                  <div
                    key={item.id}
                    className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-purple-200 dark:hover:border-purple-900/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white leading-tight">{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Unit: {item.unit}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={item.quantityUsed}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setUsedItems(usedItems.map(u =>
                              u.id === item.id ? { ...u, quantityUsed: Math.max(0, value) } : u
                            ));
                          }}
                          className="w-14 text-center font-black text-gray-900 dark:text-white bg-transparent border-none focus:outline-none text-sm"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeUsedItem(item.id)}
                        className="w-9 h-9 flex items-center justify-center bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inventory Selection */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Available Inventory</h3>
            
            {/* Search Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white dark:focus:bg-gray-950 transition-all placeholder:text-gray-400 dark:text-white"
              />
            </div>

            {/* Inventory List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredInventory.length === 0 ? (
                <div className="col-span-full py-10 text-center">
                  <p className="text-gray-400 text-sm font-medium">
                    {searchTerm ? 'No items matching your search' : 'Inventory list is empty'}
                  </p>
                </div>
              ) : (
                filteredInventory.map(item => {
                  const isAdded = usedItems.some(u => u.id === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => !isAdded && addItemToUsed(item)}
                      disabled={isAdded}
                      className={`relative group text-left p-4 rounded-2xl border transition-all duration-300 ${
                        isAdded
                          ? 'bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-900 shadow-sm hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <div className={`font-bold leading-tight ${isAdded ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                              item.currentStock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}>
                              In Stock: {item.currentStock}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.unit}</span>
                          </div>
                        </div>
                        {isAdded ? (
                          <div className="p-1 bg-green-500 rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 group-hover:bg-purple-600 group-hover:text-white rounded-xl transition-all">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              Technician Notes
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-normal font-sans">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Report any wastage, spills, or special usage requirements here..."
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white dark:focus:bg-gray-950 transition-all placeholder:text-gray-400 resize-none dark:text-white"
              rows={3}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-bold text-sm"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            className="px-10 py-3 bg-[#1e1534] text-white rounded-xl hover:bg-purple-700 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-900/20"
          >
            <CheckCircle className="w-4 h-4" />
            Submit Final Usage Report
          </button>
        </div>
      </div>
    </div>
  );
}
