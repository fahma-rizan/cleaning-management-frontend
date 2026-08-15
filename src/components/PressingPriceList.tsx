import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { api } from '../services/api.service';

interface GarmentItem {
  id: string;
  name: string;
  foldPrice?: number;
  hangPrice?: number;
  noFoldHang?: boolean;
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
  const [garments, setGarments] = useState<GarmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await api.get('/pricelists/11');
        const groups = data.priceList.pricing.groups;
        const items: GarmentItem[] = [];
        groups.forEach((group: any) => {
          group.items.forEach((item: any) => {
            items.push({
              id: item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              name: item.name.toUpperCase(),
              foldPrice: item.foldPrice || item.price,
              hangPrice: item.hangPrice,
              noFoldHang: item.noFoldHang,
              category: group.label,
            });
          });
        });
        setGarments(items);
      } catch (err) {
        console.error('Failed to load pressing prices', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const handleAddItem = (garment: GarmentItem, type: 'fold' | 'hang' = 'fold') => {
    const existingItem = selectedItems.find(item => item.id === garment.id);
    let updatedItems: SelectedItem[];
    if (existingItem) {
      updatedItems = selectedItems.map(item =>
        item.id === garment.id ? { ...item, quantity: item.quantity + 1, selectedType: type } : item
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
      const price = item.noFoldHang ? item.foldPrice : (item.selectedType === 'fold' ? item.foldPrice : item.hangPrice);
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
    const price = item.noFoldHang ? item.foldPrice : (item.selectedType === 'fold' ? item.foldPrice : item.hangPrice);
    return sum + ((price || 0) * item.quantity);
  }, 0);
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const groupedGarments = garments.reduce((acc, garment) => {
    if (!acc[garment.category]) acc[garment.category] = [];
    acc[garment.category].push(garment);
    return acc;
  }, {} as Record<string, GarmentItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-purple-600 text-lg font-medium">Loading prices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-purple-600 dark:bg-purple-700 text-white rounded-lg p-6">
        <h2 className="text-3xl mb-2 font-bold">PRESSING PRICE LIST</h2>
        <p className="text-purple-100">Select garments, choose fold or hang option, and specify quantities</p>
      </div>

      {Object.entries(groupedGarments).map(([category, items]) => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-2xl mb-4 text-purple-600 dark:text-purple-400 font-bold">{category}</h3>

          {/* ── Grid View ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((garment) => {
              const quantity = getItemQuantity(garment.id);
              const selectedType = getItemType(garment.id);
              const isSelected = quantity > 0;
              const hasBothOptions = garment.foldPrice && garment.hangPrice && !garment.noFoldHang;

              return (
                <div
                  key={garment.id}
                  className={`flex flex-col p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  {/* Name & Price */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">
                      {garment.name}
                    </h4>
                    {hasBothOptions ? (
                      <div className="flex gap-1 text-xs flex-wrap">
                        <span className="text-purple-600 font-bold">F: RS.{garment.foldPrice}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-purple-600 font-bold">H: RS.{garment.hangPrice}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        RS. {garment.foldPrice}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto">
                    {!isSelected ? (
                      <div className="flex flex-col gap-1">
                        {hasBothOptions ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAddItem(garment, 'fold')}
                              className="w-full bg-purple-600 dark:bg-purple-700 text-white py-1.5 rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
                            >
                              + Fold
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddItem(garment, 'hang')}
                              className="w-full bg-purple-600 dark:bg-purple-700 text-white py-1.5 rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
                            >
                              + Hang
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddItem(garment, 'fold')}
                            className="w-full bg-purple-600 dark:bg-purple-700 text-white py-1.5 rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {/* Fold/Hang toggle */}
                        {hasBothOptions && (
                          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => handleChangeType(garment.id, 'fold')}
                              className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                                selectedType === 'fold'
                                  ? 'bg-purple-600 text-white'
                                  : 'text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              Fold
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChangeType(garment.id, 'hang')}
                              className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                                selectedType === 'hang'
                                  ? 'bg-purple-600 text-white'
                                  : 'text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              Hang
                            </button>
                          </div>
                        )}
                        {/* Quantity controls */}
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleDecreaseQuantity(garment.id)}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-1.5 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-lg font-bold dark:text-white">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleIncreaseQuantity(garment.id)}
                            className="bg-purple-600 dark:bg-purple-700 text-white p-1.5 rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(garment.id)}
                            className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1.5 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
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
            {selectedItems.map((item) => {
              const price = item.noFoldHang ? item.foldPrice : (item.selectedType === 'fold' ? item.foldPrice : item.hangPrice);
              return (
                <div key={item.id} className="flex justify-between text-sm bg-white/10 px-3 py-2 rounded">
                  <span>
                    {item.name} × {item.quantity}
                    {!item.noFoldHang && (
                      <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                        {item.selectedType.toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="font-semibold">
                    RS. {((price || 0) * item.quantity).toLocaleString()}
                  </span>
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