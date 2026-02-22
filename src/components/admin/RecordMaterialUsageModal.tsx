import { useState, useEffect } from 'react';
import { X, Plus, Minus, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  costPerUnit: number;
}

interface UsageItem {
  materialId: string;
  materialName: string;
  quantityUsed: number;
  availableStock: number;
  unit: string;
  cost: number;
}

interface RecordMaterialUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobType: string;
  onSubmit: (usageData: UsageItem[]) => void;
  theme?: 'light' | 'dark';
}

export default function RecordMaterialUsageModal({
  isOpen,
  onClose,
  jobId,
  jobType,
  onSubmit,
  theme = 'light'
}: RecordMaterialUsageModalProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [usageItems, setUsageItems] = useState<UsageItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Load materials from localStorage
  useEffect(() => {
    const storedMaterials = localStorage.getItem('inventoryItems');
    if (storedMaterials) {
      setMaterials(JSON.parse(storedMaterials));
    } else {
      // Initialize with default materials
      const defaultMaterials: Material[] = [
        { id: '1', name: 'Detergent (5L)', category: 'Cleaning Agents', currentStock: 45, unit: 'Liters', costPerUnit: 850 },
        { id: '2', name: 'Floor Cleaner', category: 'Cleaning Agents', currentStock: 30, unit: 'Liters', costPerUnit: 450 },
        { id: '3', name: 'Glass Cleaner', category: 'Cleaning Agents', currentStock: 22, unit: 'Liters', costPerUnit: 380 },
        { id: '4', name: 'Disinfectant Spray', category: 'Cleaning Agents', currentStock: 18, unit: 'Liters', costPerUnit: 550 },
        { id: '5', name: 'Vacuum Cleaner Bags', category: 'Equipment', currentStock: 25, unit: 'Pieces', costPerUnit: 120 },
        { id: '6', name: 'Microfiber Cloths', category: 'Equipment', currentStock: 100, unit: 'Pieces', costPerUnit: 85 },
        { id: '7', name: 'Mop Heads', category: 'Equipment', currentStock: 15, unit: 'Pieces', costPerUnit: 320 },
        { id: '8', name: 'Rubber Gloves', category: 'Protective Gear', currentStock: 50, unit: 'Pairs', costPerUnit: 95 },
        { id: '9', name: 'Face Masks', category: 'Protective Gear', currentStock: 200, unit: 'Pieces', costPerUnit: 25 },
      ];
      setMaterials(defaultMaterials);
      localStorage.setItem('inventoryItems', JSON.stringify(defaultMaterials));
    }
  }, []);

  const addUsageItem = () => {
    if (!selectedMaterial) return;
    
    const material = materials.find(m => m.id === selectedMaterial);
    if (!material) return;

    // Check if material already added
    if (usageItems.find(item => item.materialId === selectedMaterial)) {
      alert('This material is already added');
      return;
    }

    const newItem: UsageItem = {
      materialId: material.id,
      materialName: material.name,
      quantityUsed: 1,
      availableStock: material.currentStock,
      unit: material.unit,
      cost: material.costPerUnit,
    };

    setUsageItems([...usageItems, newItem]);
    setSelectedMaterial('');
  };

  const updateQuantity = (materialId: string, change: number) => {
    setUsageItems(usageItems.map(item => {
      if (item.materialId === materialId) {
        const newQuantity = Math.max(0.5, Math.min(item.availableStock, item.quantityUsed + change));
        return { ...item, quantityUsed: newQuantity };
      }
      return item;
    }));
  };

  const removeUsageItem = (materialId: string) => {
    setUsageItems(usageItems.filter(item => item.materialId !== materialId));
  };

  const getTotalCost = () => {
    return usageItems.reduce((total, item) => total + (item.cost * item.quantityUsed), 0);
  };

  const handleSubmit = () => {
    if (usageItems.length === 0) {
      alert('Please add at least one material');
      return;
    }

    // Update inventory stock
    const updatedMaterials = materials.map(material => {
      const usage = usageItems.find(item => item.materialId === material.id);
      if (usage) {
        return {
          ...material,
          currentStock: material.currentStock - usage.quantityUsed
        };
      }
      return material;
    });

    localStorage.setItem('inventoryItems', JSON.stringify(updatedMaterials));

    // Save usage record
    const usageRecord = {
      jobId,
      jobType,
      date: new Date().toISOString(),
      items: usageItems,
      totalCost: getTotalCost()
    };

    const existingRecords = JSON.parse(localStorage.getItem('materialUsageRecords') || '[]');
    localStorage.setItem('materialUsageRecords', JSON.stringify([...existingRecords, usageRecord]));

    setShowSuccess(true);
    setTimeout(() => {
      onSubmit(usageItems);
      onClose();
      setShowSuccess(false);
      setUsageItems([]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div>
            <h2 className={`text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Record Material Usage
            </h2>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Job ID: {jobId} • {jobType}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add Material Section */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Add Material
            </label>
            <div className="flex gap-3">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                  theme === 'dark' 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Select material...</option>
                {materials
                  .filter(m => !usageItems.find(item => item.materialId === m.id))
                  .map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.currentStock} {material.unit} available)
                    </option>
                  ))}
              </select>
              <button
                onClick={addUsageItem}
                disabled={!selectedMaterial}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Usage Items List */}
          {usageItems.length > 0 ? (
            <div className="space-y-3">
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Materials Used
              </h3>
              {usageItems.map((item) => (
                <div
                  key={item.materialId}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {item.materialName}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Available: {item.availableStock} {item.unit} • Cost: LKR {item.cost}/{item.unit}
                      </div>
                    </div>
                    <button
                      onClick={() => removeUsageItem(item.materialId)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.materialId, -0.5)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="text-center min-w-[80px]">
                        <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {item.quantityUsed}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.unit}
                        </div>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.materialId, 0.5)}
                        disabled={item.quantityUsed >= item.availableStock}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                          theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Subtotal
                      </div>
                      <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        LKR {(item.cost * item.quantityUsed).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {item.quantityUsed > item.availableStock * 0.8 && (
                    <div className="mt-3 flex items-center gap-2 text-yellow-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Stock running low for this material</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 rounded-lg border-2 border-dashed ${
              theme === 'dark' ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
            }`}>
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No materials added yet</p>
              <p className="text-sm">Select materials from the dropdown above</p>
            </div>
          )}

          {/* Total Cost */}
          {usageItems.length > 0 && (
            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-medium ${
                  theme === 'dark' ? 'text-purple-300' : 'text-purple-900'
                }`}>
                  Total Material Cost
                </span>
                <span className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-purple-200' : 'text-purple-600'
                }`}>
                  LKR {getTotalCost().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle className="w-6 h-6" />
              <div>
                <div className="font-medium">Material usage recorded successfully!</div>
                <div className="text-sm">Inventory has been updated</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={usageItems.length === 0 || showSuccess}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Record Usage
          </button>
        </div>
      </div>
    </div>
  );
}
