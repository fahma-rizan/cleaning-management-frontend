import { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';

interface GarmentItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface SelectedItem extends GarmentItem {
  quantity: number;
}

interface DryCleaningPriceListProps {
  onTotalChange: (total: number, items: SelectedItem[]) => void;
  theme?: 'light' | 'dark';
}

export default function DryCleaningPriceList({ onTotalChange, theme = 'light' }: DryCleaningPriceListProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const garments: GarmentItem[] = [
    // Regular Clothing
    { id: 'shirt', name: 'SHIRT', price: 400, category: 'Regular Clothing' },
    { id: 't-shirt', name: 'T-SHIRT', price: 350, category: 'Regular Clothing' },
    { id: 'thobe', name: 'THOBE', price: 550, category: 'Regular Clothing' },
    { id: 'kurta', name: 'KURTA', price: 500, category: 'Regular Clothing' },
    { id: 'trouser', name: 'TROUSER', price: 450, category: 'Regular Clothing' },
    { id: 'shorts', name: 'SHORTS', price: 400, category: 'Regular Clothing' },
    
    // Formal Wear
    { id: 'blazer', name: 'BLAZER', price: 700, category: 'Formal Wear' },
    { id: 'two-piece-suit', name: 'TWO PIECE SUIT', price: 850, category: 'Formal Wear' },
    { id: 'three-piece-suit', name: 'THREE PIECE SUIT', price: 1250, category: 'Formal Wear' },
    
    // Women's Wear
    { id: 'blouse', name: 'BLOUSE', price: 300, category: "Women's Wear" },
    { id: 'dress-short', name: 'DRESS (SHORT)', price: 500, category: "Women's Wear" },
    { id: 'dress-long', name: 'DRESS (LONG)', price: 600, category: "Women's Wear" },
    { id: 'salwar-top', name: 'SALWAR (TOP)', price: 500, category: "Women's Wear" },
    { id: 'salwar-full', name: 'SALWAR (FULL SET)', price: 700, category: "Women's Wear" },
    { id: 'saree', name: 'SAREE', price: 900, category: "Women's Wear" },
    { id: 'special-saree', name: 'SPECIAL WORK SAREE', price: 1250, category: "Women's Wear" },
    { id: 'skirts', name: 'SKIRTS', price: 450, category: "Women's Wear" },
    { id: 'special-salwar', name: 'SPECIAL WORK SALWAR', price: 1250, category: "Women's Wear" },
    
    // Traditional & Special
    { id: 'dhoti', name: 'DHOTI', price: 450, category: 'Traditional Wear' },
    { id: 'bridal-dress', name: 'BRIDAL DRESS/LEHENGA', price: 3500, category: 'Special Occasion' },
    
    // Winter Wear
    { id: 'sweaters', name: 'SWEATERS', price: 650, category: 'Winter Wear' },
    { id: 'winter-jacket', name: 'WINTER JACKET', price: 1000, category: 'Winter Wear' },
    { id: 'shawl', name: 'SHAWL', price: 175, category: 'Winter Wear' },
    { id: 'cloak', name: 'CLOAK', price: 500, category: 'Winter Wear' },
  ];

  const handleAddItem = (garment: GarmentItem) => {
    const existingItem = selectedItems.find(item => item.id === garment.id);
    
    let updatedItems: SelectedItem[];
    if (existingItem) {
      updatedItems = selectedItems.map(item =>
        item.id === garment.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedItems = [...selectedItems, { ...garment, quantity: 1 }];
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

  const handleRemoveItem = (id: string) => {
    const updatedItems = selectedItems.filter(item => item.id !== id);
    setSelectedItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const calculateTotal = (items: SelectedItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    onTotalChange(total, items);
  };

  const getItemQuantity = (id: string) => {
    const item = selectedItems.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
        <h2 className="text-3xl mb-2 font-bold">DRY CLEANING PRICE LIST</h2>
        <p className="text-purple-100">Select garments and specify quantities for your dry cleaning service</p>
      </div>

      {/* Garment Selection */}
      {Object.entries(groupedGarments).map(([category, items]) => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-2xl mb-4 text-purple-600 dark:text-purple-400 font-bold">{category}</h3>
          <div className="space-y-3">
            {items.map((garment) => {
              const quantity = getItemQuantity(garment.id);
              const isSelected = quantity > 0;

              return (
                <div
                  key={garment.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{garment.name}</h4>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400 min-w-[100px] text-right">
                      RS. {garment.price}
                    </span>

                    {!isSelected ? (
                      <button
                        onClick={() => handleAddItem(garment)}
                        className="bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors flex items-center gap-2 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
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
            {selectedItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm bg-white/10 px-3 py-2 rounded">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-semibold">RS. {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
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
