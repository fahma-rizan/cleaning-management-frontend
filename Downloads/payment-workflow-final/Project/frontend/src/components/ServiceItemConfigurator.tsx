import { useState, useEffect } from 'react';
import { priceLists, PriceListEntry } from '../data/pricelist.data';
import type { LineItem } from './StaffInvoicePage';

interface ServiceItemConfiguratorProps {
  onAddItem: (item: Omit<LineItem, 'id'>) => void;
  onClose: () => void;
}

export default function ServiceItemConfigurator({ onAddItem, onClose }: ServiceItemConfiguratorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<PriceListEntry | null>(null);
  const [config, setConfig] = useState<any>({});
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');

  const mainCategories = [
    { id: 'laundry', label: 'Laundry', icon: '🧺' },
    { id: 'curtain', label: 'Curtain Cleaning', icon: '🪟' },
    { id: 'shampoo', label: 'Shampoo Vacuum Cleaning', icon: '🧼' },
    { id: 'home',    label: 'Home / Office Cleaning', icon: '🏠' },
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedService(null);
    setCalculatedPrice(0);
  };

  const handleServiceSelect = (serviceId: number) => {
    const service = priceLists.find(p => p.serviceId === serviceId);
    setSelectedService(service || null);
    // Reset configuration when service changes
    setConfig({});
    setCalculatedPrice(0);
    setItemName(service?.serviceName || '');
    setItemDescription('');
  };

  // Automatically set price for per-unit items when selected
  useEffect(() => {
    if (selectedService?.pricingType === 'per-unit') {
      setCalculatedPrice(selectedService.pricing.price || 0);
    }
  }, [selectedService]);


  // This is the core logic. It renders different inputs based on pricingType.
  const renderPricingOptions = () => {
    if (!selectedService) return null;

    const { pricingType, pricing, serviceName } = selectedService;

    switch (pricingType) {
      case 'per-sqft':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              onChange={(e) => {
                const type = pricing.types?.find(t => t.id === e.target.value);
                const sqft = config.sqft || 0;
                setConfig({ ...config, type });
                setCalculatedPrice((type?.pricePerSqft || 0) * sqft);
                setItemName(`${serviceName}`);
                setItemDescription(`Type: ${type?.label}`);
              }}
            >
              <option>Select a type</option>
              {pricing.types?.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <label className="block text-sm font-medium text-gray-700 mt-4">Square Feet</label>
            <input
              type="number"
              min="1"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              onChange={(e) => {
                const sqft = Number(e.target.value);
                setConfig({ ...config, sqft });
                setCalculatedPrice((config.type?.pricePerSqft || 0) * sqft);
                setItemDescription(`Type: ${config.type?.label}\nSQFT: ${sqft}`);
              }}
            />
          </div>
        );

      case 'per-seat':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Seats</label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              onChange={(e) => {
                const seatConfig = pricing.seats?.find(s => s.seats === Number(e.target.value));
                setConfig({ seatConfig });
                setCalculatedPrice(seatConfig?.price || 0);
                setItemName(`${serviceName}`);
                setItemDescription(`Seats: ${seatConfig?.seats}`);
              }}
            >
              <option>Select seats</option>
              {pricing.seats?.map(s => <option key={s.seats} value={s.seats}>{s.seats} Seats</option>)}
            </select>
          </div>
        );
      
      case 'fixed':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Size</label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              onChange={(e) => {
                const sizeConfig = pricing.sizes?.find(s => s.size === e.target.value);
                setConfig({ sizeConfig });
                setCalculatedPrice(sizeConfig?.price || 0);
                setItemName(`${serviceName}`);
                setItemDescription(`Size: ${sizeConfig?.size}`);
              }}
            >
              <option>Select a size</option>
              {pricing.sizes?.map(s => <option key={s.size} value={s.size}>{s.size}</option>)}
            </select>
          </div>
        );

      case 'per-unit':
        return (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="font-medium text-gray-800">This is a fixed price service.</p>
            <p className="text-sm text-gray-600">Price per unit: Rs. {pricing.price?.toLocaleString()}</p>
          </div>
        );

      case 'per-item':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Type</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                onChange={(e) => {
                  const group = pricing.groups?.find(g => g.id === e.target.value);
                  const quantity = config.quantity || 1;
                  setConfig({ ...config, group, quantity });
                  setCalculatedPrice((group?.price || 0) * quantity);
                  setItemName(`${serviceName}`);
                  setItemDescription(`${group?.label}`);
                }}
              >
                <option>Select a type</option>
                {pricing.groups?.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity (kg or pieces)</label>
              <input
                type="number"
                min="1"
                defaultValue="1"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                onChange={(e) => {
                  const quantity = Number(e.target.value);
                  setConfig({ ...config, quantity });
                  setCalculatedPrice((config.group?.price || 0) * quantity);
                  setItemDescription(`${config.group?.label}\nQuantity: ${quantity}`);
                }}
              />
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-gray-500 pt-4">Please select a service to see configuration options.</p>;
    }
  };

  const handleAddToInvoice = () => {
    if (!selectedService || !selectedCategory) return;

    // Special handling for per-unit case
    if (selectedService.pricingType === 'per-unit') {
      onAddItem({
        name: selectedService.serviceName,
        description: 'Fixed price per unit',
        price: selectedService.pricing.price || 0,
        quantity: 1,
        category: selectedCategory as any,
      });
      onClose();
      return;
    }

    if (calculatedPrice > 0 && itemName) {
      // For 'per-item', the quantity is part of the calculation, so we add it as a single line item.
      const finalQuantity = selectedService.pricingType === 'per-item' ? config.quantity : 1;
      const finalPrice = selectedService.pricingType === 'per-item' ? config.group.price : calculatedPrice;

      onAddItem({
        name: itemName,
        description: itemDescription,
        price: finalPrice,
        quantity: finalQuantity,
        category: selectedCategory as any,
      });
      onClose();
    } else {
      alert('Please configure the service fully before adding.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-purple-50">
          <h3 className="text-xl font-bold text-purple-900">Add Service Item</h3>
          <button onClick={onClose} className="text-purple-400 hover:text-purple-600">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Select Category */}
          {!selectedCategory ? (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">Step 1: Select Main Category</label>
              <div className="grid grid-cols-2 gap-3">
                {mainCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                  >
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Back Button to categories */}
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-purple-600 hover:underline flex items-center gap-1"
              >
                ← Change Category ({mainCategories.find(c => c.id === selectedCategory)?.label})
              </button>

              {/* Step 2: Select Service */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Step 2: Select Specific Service</label>
                <select
                  value={selectedService?.serviceId || ''}
                  onChange={(e) => handleServiceSelect(Number(e.target.value))}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-0 transition-colors bg-gray-50 font-medium"
                >
                  <option value="">Select a {mainCategories.find(c => c.id === selectedCategory)?.label} service</option>
                  {priceLists.filter(p => p.category === selectedCategory).map(p => (
                    <option key={p.serviceId} value={p.serviceId}>{p.serviceName}</option>
                  ))}
                </select>
              </div>

              {/* Step 3: Configure Details */}
              {selectedService && (
                <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-4">
                  <label className="block text-sm font-semibold text-purple-900 uppercase tracking-wider">Step 3: Service Details</label>
                  {renderPricingOptions()}
                  
                  <div className="pt-4 border-t border-purple-100 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Final Price:</span>
                      <span className="text-2xl font-black text-purple-600">
                        Rs. {
                          selectedService?.pricingType === 'per-item' 
                          ? ((config.group?.price || 0) * (config.quantity || 1)).toLocaleString()
                          : calculatedPrice.toLocaleString()
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
          <button 
            onClick={handleAddToInvoice} 
            disabled={!selectedService || (selectedService.pricingType !== 'per-unit' && calculatedPrice === 0)}
            className="px-8 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:bg-gray-300 disabled:shadow-none transition-all"
          >
            Add to Invoice
          </button>
        </div>
      </div>
    </div>
  );
}