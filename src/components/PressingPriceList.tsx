import { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';

interface GarmentItem {
  id: string;
  name: string;
  foldPrice?: number;
  hangPrice?: number;
  category: string;
}

interface SelectedItem extends GarmentItem {
  quantity: number;
  selectedType: 'fold' | 'hang';
}

interface PressingPriceListProps {
  onTotalChange: (total: number, items: SelectedItem[]) => void;
  theme?: 'light' | 'dark';
}

export default function PressingPriceList({ onTotalChange, theme = 'light' }: PressingPriceListProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const garments: GarmentItem[] = [
    // Regular Clothing with both Fold & Hang options
    { id: 'shirt', name: 'SHIRT', foldPrice: 150, hangPrice: 200, category: 'Regular Clothing' },
    { id: 't-shirt', name: 'T-SHIRT', foldPrice: 120, hangPrice: 170, category: 'Regular Clothing' },
    { id: 'thobe', name: 'THOBE', foldPrice: 200, hangPrice: 250, category: 'Regular Clothing' },
    { id: 'kurta', name: 'KURTA', foldPrice: 170, hangPrice: 220, category: 'Regular Clothing' },
    { id: 'trouser', name: 'TROUSER', foldPrice: 170, hangPrice: 220, category: 'Regular Clothing' },
    { id: 'shorts', name: 'SHORTS', foldPrice: 150, hangPrice: 200, category: 'Regular Clothing' },
    { id: 'vset', name: 'VSET', foldPrice: 100, hangPrice: 150, category: 'Regular Clothing' },
    
    // Women's Wear with both options
    { id: 'blouse', name: 'BLOUSE', foldPrice: 150, hangPrice: 200, category: "Women's Wear" },
    { id: 'dress-short', name: 'DRESS (SHORT)', foldPrice: 170, hangPrice: 220, category: "Women's Wear" },
    { id: 'dress-long', name: 'DRESS (LONG)', foldPrice: 220, hangPrice: 270, category: "Women's Wear" },
    { id: 'salwar-top', name: 'SALWAR (TOP)', foldPrice: 170, hangPrice: 220, category: "Women's Wear" },
    { id: 'salwar-full', name: 'SALWAR (FULL SET)', foldPrice: 220, hangPrice: 270, category: "Women's Wear" },
    { id: 'skirts', name: 'SKIRTS', foldPrice: 170, hangPrice: 220, category: "Women's Wear" },
    
    // Traditional Wear
    { id: 'sarong', name: 'SARONG', foldPrice: 220, hangPrice: 270, category: 'Traditional Wear' },
    
    // Home Textiles (single price)
    { id: 'pillow-cases', name: 'PILLOW CASES', foldPrice: 100, category: 'Home Textiles' },
    { id: 'bedsheets', name: 'BEDSHEETS', foldPrice: 200, category: 'Home Textiles' },
    { id: 'bathrobe', name: 'BATHROBE', foldPrice: 350, category: 'Home Textiles' },
  ];

  const handleAddItem = (garment: GarmentItem, type: 'fold' | 'hang' = 'fold') => {
    const existingItem = selectedItems.find(item => item.id === garment.id);
    
    let updatedItems: SelectedItem[];
    if (existingItem) {
      updatedItems = selectedItems.map(item =>
        item.id === garment.id
          ? { ...item, quantity: item.quantity + 1, selectedType: type }
          : item
      );
    } else {
      updatedItems = [...selectedItems, { ...garment, quantity: 1, selectedType: type }];
    }
    
    setSelectedItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const handleIncreaseQuantity = (id: string) => {
    const updatedItems = selectedItems.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setSelectedItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const handleDecreaseQuantity = (id: string) => {
    const item = selectedItems.find(item => item.id === id);
    if (item && item.quantity > 1) {
      const updatedItems = selectedItems.map(item =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
      setSelectedItems(updatedItems);
      calculateTotal(updatedItems);
    }
  };

  const handleChangeType = (id: string, type: 'fold' | 'hang') => {
    const updatedItems = selectedItems.map(item =>
      item.id === id ? { ...item, selectedType: type } : item
    );
    setSelectedItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = selectedItems.filter(item => item.id !== id);
    setSelectedItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const calculateTotal = (items: SelectedItem[]) => {
    const total = items.reduce((sum, item) => {
      const price = item.selectedType === 'fold' ? item.foldPrice : item.hangPrice;
      return sum + ((price || 0) * item.quantity);
    }, 0);
    onTotalChange(total, items);
  };

  const getItemQuantity = (id: string) => {
    const item = selectedItems.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  const getItemType = (id: string) => {
    const item = selectedItems.find(item => item.id === id);
    return item ? item.selectedType : 'fold';
  };

  const totalAmount = selectedItems.reduce((sum, item) => {
    const price = item.selectedType === 'fold' ? item.foldPrice : item.hangPrice;
    return sum + ((price || 0) * item.quantity);
  }, 0);
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  // Group garments by category
  const groupedGarments = garments.reduce((acc, garment) => {
    if (!acc[garment.category]) {
      acc[garment.category] = [];
    }
    acc[garment.category].push(garment);
    return acc;
  }, {} as Record<string, GarmentItem[]>);

  return (
    <div className="space-y-8">
      {/* Price List Header */}
      <div className="bg-purple-600 dark:bg-purple-700 text-white rounded-lg p-6">
        <h2 className="text-3xl mb-2 font-bold">PRESSING PRICE LIST</h2>
        <p className="text-purple-100">Select garments, choose fold or hang option, and specify quantities</p>
      </div>

      {/* Garment Selection */}
      {Object.entries(groupedGarments).map(([category, items]) => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-2xl mb-4 text-purple-600 dark:text-purple-400 font-bold">{category}</h3>
          <div className="space-y-3">
            {items.map((garment) => {
              const quantity = getItemQuantity(garment.id);
              const selectedType = getItemType(garment.id);
              const isSelected = quantity > 0;
              const hasBothOptions = garment.foldPrice && garment.hangPrice;

              return (
                <div
                  key={garment.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">{garment.name}</h4>
                    </div>
                    
                    {/* Pricing Options */}
                    <div className="flex items-center gap-3">
                      {hasBothOptions ? (
                        <>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">FOLD</div>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              RS. {garment.foldPrice}
                            </div>
                          </div>
                          <div className="text-gray-300 dark:text-gray-600">|</div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">HANG</div>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              RS. {garment.hangPrice}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            RS. {garment.foldPrice}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {!isSelected ? (
                        <div className="flex gap-2">
                          {hasBothOptions ? (
                            <>
                              <button
                                onClick={() => handleAddItem(garment, 'fold')}
                                className="bg-purple-600 dark:bg-purple-700 text-white px-3 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors text-sm font-medium"
                              >
                                <Plus className="w-4 h-4 inline mr-1" />
                                Add Fold
                              </button>
                              <button
                                onClick={() => handleAddItem(garment, 'hang')}
                                className="bg-purple-600 dark:bg-purple-700 text-white px-3 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors text-sm font-medium"
                              >
                                <Plus className="w-4 h-4 inline mr-1" />
                                Add Hang
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAddItem(garment, 'fold')}
                              className="bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors flex items-center gap-2 font-medium"
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Type Selector for items with both options */}
                          {hasBothOptions && (
                            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                              <button
                                onClick={() => handleChangeType(garment.id, 'fold')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  selectedType === 'fold'
                                    ? 'bg-purple-600 dark:bg-purple-700 text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                Fold
                              </button>
                              <button
                                onClick={() => handleChangeType(garment.id, 'hang')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  selectedType === 'hang'
                                    ? 'bg-purple-600 dark:bg-purple-700 text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                Hang
                              </button>
                            </div>
                          )}
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDecreaseQuantity(garment.id)}
                              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-xl font-bold min-w-[40px] text-center dark:text-white">
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleIncreaseQuantity(garment.id)}
                              className="bg-purple-600 dark:bg-purple-700 text-white p-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(garment.id)}
                            className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Items Summary */}
      {selectedItems.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 text-white rounded-lg p-6 shadow-xl sticky bottom-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              <h3 className="text-2xl font-bold">Selected Items</h3>
            </div>
            <span className="text-xl font-semibold bg-white/20 px-4 py-2 rounded-lg">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
            {selectedItems.map((item) => {
              const price = item.selectedType === 'fold' ? item.foldPrice : item.hangPrice;
              return (
                <div key={item.id} className="flex justify-between text-sm bg-white/10 px-3 py-2 rounded">
                  <span>
                    {item.name} × {item.quantity} 
                    <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                      {item.selectedType.toUpperCase()}
                    </span>
                  </span>
                  <span className="font-semibold">RS. {((price || 0) * item.quantity).toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/30 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">Total Amount:</span>
              <span className="text-4xl font-bold">RS. {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
