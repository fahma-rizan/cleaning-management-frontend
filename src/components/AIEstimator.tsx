import { useState } from 'react';
import { Calculator, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Price Data (matches database) ────────────────────────────────────────────
const PRICES = {
  home: {
    'House Deep Cleaning': { normal: 25, 'move-in-out': 30, 'after-construction': 35 },
    'General Cleaning': { general: 20 },
    'Commercial Cleaning': { normal: 25, 'move-in-out': 30, 'after-construction': 35 },
    'Floor Cleaning': { floor: 30 },
    'Floor - Cut & Polish': { 'cut-polish': 35 },
  },
  laundry: {
    'Dry Cleaning': {
      'Regular Clothing': [
        { name: 'Shirt', price: 400 }, { name: 'T-Shirt', price: 350 },
        { name: 'Thobe', price: 550 }, { name: 'Kurta', price: 500 },
        { name: 'Trouser', price: 450 }, { name: 'Shorts', price: 400 },
      ],
      'Formal Wear': [
        { name: 'Blazer', price: 700 }, { name: 'Two Piece Suit', price: 850 },
        { name: 'Three Piece Suit', price: 1250 },
      ],
      "Women's Wear": [
        { name: 'Blouse', price: 300 }, { name: 'Dress (Short)', price: 500 },
        { name: 'Dress (Long)', price: 600 }, { name: 'Salwar (Top)', price: 500 },
        { name: 'Salwar (Full Set)', price: 700 }, { name: 'Saree', price: 900 },
        { name: 'Special Work Saree', price: 1250 }, { name: 'Skirts', price: 450 },
        { name: 'Special Work Salwar', price: 1250 },
      ],
      'Traditional Wear': [{ name: 'Dhoti', price: 450 }],
      'Special Occasion': [{ name: 'Bridal Dress / Lehenga', price: 3500 }],
      'Winter Wear': [
        { name: 'Sweaters', price: 650 }, { name: 'Winter Jacket', price: 1000 },
        { name: 'Shawl', price: 175 }, { name: 'Cloak', price: 500 },
      ],
    },
    'Washing & Pressing': {
      'Regular Clothing': [
        { name: 'Shirt', foldPrice: 270, hangPrice: 370 },
        { name: 'T-Shirt', foldPrice: 220, hangPrice: 320 },
        { name: 'Thobe', foldPrice: 370, hangPrice: 470 },
        { name: 'Kurta', foldPrice: 320, hangPrice: 420 },
        { name: 'Trouser', foldPrice: 320, hangPrice: 420 },
        { name: 'Shorts', foldPrice: 270, hangPrice: 370 },
        { name: 'VSet', foldPrice: 170, hangPrice: 270 },
      ],
      "Women's Wear": [
        { name: 'Blouse', foldPrice: 270, hangPrice: 370 },
        { name: 'Dress (Short)', foldPrice: 320, hangPrice: 420 },
        { name: 'Dress (Long)', foldPrice: 420, hangPrice: 520 },
        { name: 'Salwar (Top)', foldPrice: 320, hangPrice: 420 },
        { name: 'Salwar (Full Set)', foldPrice: 420, hangPrice: 520 },
        { name: 'Skirts', foldPrice: 320, hangPrice: 420 },
      ],
      'Traditional Wear': [{ name: 'Sarong', foldPrice: 420, hangPrice: 520 }],
      'Home Textiles': [
        { name: 'Pillowcases', price: 170 },
        { name: 'Bedsheets', price: 350 },
        { name: 'Bathrobe', price: 650 },
      ],
    },
    'Pressing Only': {
      'Regular Clothing': [
        { name: 'Shirt', foldPrice: 175, hangPrice: 275 },
        { name: 'T-Shirt', foldPrice: 125, hangPrice: 225 },
        { name: 'Thobe', foldPrice: 275, hangPrice: 375 },
        { name: 'Kurta', foldPrice: 225, hangPrice: 325 },
        { name: 'Trouser', foldPrice: 225, hangPrice: 325 },
        { name: 'Shorts', foldPrice: 175, hangPrice: 275 },
      ],
      "Women's Wear": [
        { name: 'Blouse', foldPrice: 175, hangPrice: 275 },
        { name: 'Dress (Short)', foldPrice: 225, hangPrice: 325 },
        { name: 'Dress (Long)', foldPrice: 325, hangPrice: 425 },
        { name: 'Salwar (Top)', foldPrice: 225, hangPrice: 325 },
        { name: 'Salwar (Full Set)', foldPrice: 325, hangPrice: 425 },
        { name: 'Skirts', foldPrice: 225, hangPrice: 325 },
      ],
      'Traditional Wear': [
        { name: 'Sarong', foldPrice: 325, hangPrice: 425 },
        { name: 'Dhoti', price: 325 },
      ],
      'Formal Wear': [
        { name: 'Blazer', price: 500 },
        { name: 'Two Piece Suit', price: 750 },
        { name: 'Three Piece Suit', price: 900 },
      ],
      'Special Wear': [
        { name: 'Saree', price: 600 },
        { name: 'Special Work Saree', price: 850 },
        { name: 'Special Work Lehenga / Dresses', price: 720 },
        { name: 'Cloaks', price: 400 },
      ],
      'Home Textiles': [
        { name: 'Bed Sheet', price: 225 },
        { name: 'Pillowcases', price: 125 },
      ],
    },
  },
  shampoo: {
    'Sofa Cleaning': { 2: 2900, 3: 3900, 4: 4900, 5: 5900 },
    'Mattress Cleaning': {
      'King Size': { Full: 11500, 'Top Only': 8500 },
      'Queen Size': { Full: 10500, 'Top Only': 7500 },
      'Double Mattress': { Full: 10000, 'Top Only': 7000 },
      'Single Mattress': { Full: 8000, 'Top Only': 5500 },
    },
    'Carpet Cleaning': { pricePerSqft: 35 },
  },
  curtain: {
    'Curtain Cleaning': {
      'Dry Cleaning & Pressing': 2500,
      'Laundry & Pressing': 3500,
      'Curtain Premium Service': 4500,
      addons: { removal: 100, installation: 100, delivery: 500 },
    },
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface ServiceItem {
  id: string;
  category: string;
  subService: string;
  details: any;
  total: number;
  summary: string;
}

interface LaundryItem {
  name: string;
  quantity: number;
  type: 'fold' | 'hang' | 'single';
  price: number;
}

export default function AIEstimator() {
  const [addedServices, setAddedServices] = useState<ServiceItem[]>([]);
  const [showForm, setShowForm] = useState(true);

  // ─── Current form state ───────────────────────────────────────────────────
  const [category, setCategory] = useState('');
  const [subService, setSubService] = useState('');

  // Home fields
  const [cleaningType, setCleaningType] = useState('');
  const [sqft, setSqft] = useState('');

  // Laundry fields
  const [laundryItems, setLaundryItems] = useState<LaundryItem[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string>('');

  // Shampoo fields
  const [sofaSeats, setSofaSeats] = useState(2);
  const [mattressSize, setMattressSize] = useState('');
  const [mattressType, setMattressType] = useState('');
  const [carpetSqft, setCarpetSqft] = useState('');

  // Curtain fields
  const [curtainType, setCurtainType] = useState('');
  const [curtainQty, setCurtainQty] = useState(1);
  const [curtainAddons, setCurtainAddons] = useState({ removal: false, installation: false, delivery: false });

  // ─── Reset form ───────────────────────────────────────────────────────────
  const resetForm = () => {
    setCategory(''); setSubService(''); setCleaningType(''); setSqft('');
    setLaundryItems([]); setExpandedGroup(''); setSofaSeats(2);
    setMattressSize(''); setMattressType(''); setCarpetSqft('');
    setCurtainType(''); setCurtainQty(1);
    setCurtainAddons({ removal: false, installation: false, delivery: false });
  };

  // ─── Calculate current service total ─────────────────────────────────────
  const calculateCurrentTotal = (): number => {
    if (category === 'home' && subService && cleaningType && sqft) {
      const priceMap = PRICES.home[subService as keyof typeof PRICES.home] as any;
      return (priceMap[cleaningType] || 0) * Number(sqft);
    }
    if (category === 'laundry' && subService) {
      return laundryItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    if (category === 'shampoo') {
      if (subService === 'Sofa Cleaning') {
        return (PRICES.shampoo['Sofa Cleaning'] as any)[sofaSeats] || 0;
      }
      if (subService === 'Mattress Cleaning' && mattressSize && mattressType) {
        return (PRICES.shampoo['Mattress Cleaning'] as any)[mattressSize]?.[mattressType] || 0;
      }
      if (subService === 'Carpet Cleaning' && carpetSqft) {
        return PRICES.shampoo['Carpet Cleaning'].pricePerSqft * Number(carpetSqft);
      }
    }
    if (category === 'curtain' && curtainType) {
      const base = (PRICES.curtain['Curtain Cleaning'] as any)[curtainType] * curtainQty;
      const addons =
        (curtainAddons.removal ? 100 * curtainQty : 0) +
        (curtainAddons.installation ? 100 * curtainQty : 0) +
        (curtainAddons.delivery ? 500 : 0);
      return base + addons;
    }
    return 0;
  };

  // ─── Generate summary text ────────────────────────────────────────────────
  const generateSummary = (): string => {
    if (category === 'home') return `${subService} — ${cleaningType} — ${sqft} sqft`;
    if (category === 'laundry') return `${subService} — ${laundryItems.length} garment type(s)`;
    if (category === 'shampoo') {
      if (subService === 'Sofa Cleaning') return `Sofa Cleaning — ${sofaSeats} seater`;
      if (subService === 'Mattress Cleaning') return `Mattress Cleaning — ${mattressSize} (${mattressType})`;
      if (subService === 'Carpet Cleaning') return `Carpet Cleaning — ${carpetSqft} sqft`;
    }
    if (category === 'curtain') return `${curtainType} — ${curtainQty} curtain(s)`;
    return '';
  };

  // ─── Add service to list ──────────────────────────────────────────────────
  const handleAddService = () => {
    const total = calculateCurrentTotal();
    if (total === 0) return;
    const newService: ServiceItem = {
      id: Date.now().toString(),
      category,
      subService,
      details: {},
      total,
      summary: generateSummary(),
    };
    setAddedServices([...addedServices, newService]);
    resetForm();
  };

  const handleRemoveService = (id: string) => {
    setAddedServices(addedServices.filter(s => s.id !== id));
  };

  const grandTotal = addedServices.reduce((sum, s) => sum + s.total, 0);

  // ─── Laundry item helpers ─────────────────────────────────────────────────
  const handleLaundryAdd = (name: string, price: number, type: 'fold' | 'hang' | 'single') => {
    const existing = laundryItems.find(i => i.name === name && i.type === type);
    if (existing) {
      setLaundryItems(laundryItems.map(i =>
        i.name === name && i.type === type ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setLaundryItems([...laundryItems, { name, quantity: 1, type, price }]);
    }
  };

  const handleLaundryQty = (name: string, type: string, delta: number) => {
    setLaundryItems(laundryItems
      .map(i => i.name === name && i.type === type ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const getLaundryQty = (name: string, type: string) =>
    laundryItems.find(i => i.name === name && i.type === type)?.quantity || 0;

  // ─── Render home form ─────────────────────────────────────────────────────
  const renderHomeForm = () => {
    const services = Object.keys(PRICES.home);
    const cleaningTypes: Record<string, { id: string; label: string }[]> = {
      'House Deep Cleaning': [
        { id: 'normal', label: 'Normal Deep Cleaning — LKR 25/sqft' },
        { id: 'move-in-out', label: 'Move In / Move Out — LKR 30/sqft' },
        { id: 'after-construction', label: 'After Construction — LKR 35/sqft' },
      ],
      'General Cleaning': [{ id: 'general', label: 'General Cleaning — LKR 20/sqft' }],
      'Commercial Cleaning': [
        { id: 'normal', label: 'Normal Deep Cleaning — LKR 25/sqft' },
        { id: 'move-in-out', label: 'Move In / Move Out — LKR 30/sqft' },
        { id: 'after-construction', label: 'After Construction — LKR 35/sqft' },
      ],
      'Floor Cleaning': [{ id: 'floor', label: 'Floor Cleaning — LKR 30/sqft' }],
      'Floor - Cut & Polish': [{ id: 'cut-polish', label: 'Cut & Polish — LKR 35/sqft' }],
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
          <select value={subService} onChange={e => { setSubService(e.target.value); setCleaningType(''); }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Select a service...</option>
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {subService && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cleaning Type</label>
            <div className="space-y-2">
              {cleaningTypes[subService]?.map(ct => (
                <button key={ct.id} onClick={() => setCleaningType(ct.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${cleaningType === ct.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  {ct.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {subService && cleaningType && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Square Feet</label>
            <input type="number" value={sqft} onChange={e => setSqft(e.target.value)}
              placeholder="Enter square feet e.g. 1500"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            {sqft && (
              <p className="mt-2 text-purple-600 font-semibold">
                Estimated: LKR {((PRICES.home[subService as keyof typeof PRICES.home] as any)[cleaningType] * Number(sqft)).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── Render laundry form ──────────────────────────────────────────────────
  const renderLaundryForm = () => {
    const services = Object.keys(PRICES.laundry);
    const isDryClean = subService === 'Dry Cleaning';
    const groups = subService ? PRICES.laundry[subService as keyof typeof PRICES.laundry] : null;
    const laundryTotal = laundryItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
          <select value={subService} onChange={e => { setSubService(e.target.value); setLaundryItems([]); }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Select a service...</option>
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {groups && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName} className="border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setExpandedGroup(expandedGroup === groupName ? '' : groupName)}
                  className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 font-medium">
                  {groupName}
                  {expandedGroup === groupName ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedGroup === groupName && (
                  <div className="p-3 space-y-2">
                    {(items as any[]).map((item: any) => {
                      const hasFoldHang = item.foldPrice && item.hangPrice;
                      const foldQty = getLaundryQty(item.name, 'fold');
                      const hangQty = getLaundryQty(item.name, 'hang');
                      const singleQty = getLaundryQty(item.name, 'single');

                      return (
                        <div key={item.name} className="bg-white border border-gray-100 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">{item.name}</span>
                            {isDryClean && <span className="text-purple-600 font-bold text-sm">LKR {item.price}</span>}
                          </div>

                          {isDryClean && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleLaundryQty(item.name, 'single', -1)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 text-lg">-</button>
                              <span className="w-8 text-center font-bold">{singleQty}</span>
                              <button onClick={() => handleLaundryAdd(item.name, item.price, 'single')} className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 text-lg">+</button>
                            </div>
                          )}

                          {!isDryClean && hasFoldHang && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">FOLD — LKR {item.foldPrice}</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleLaundryQty(item.name, 'fold', -1)} className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200">-</button>
                                  <span className="w-6 text-center text-sm font-bold">{foldQty}</span>
                                  <button onClick={() => handleLaundryAdd(item.name, item.foldPrice, 'fold')} className="w-7 h-7 bg-purple-600 text-white rounded flex items-center justify-center hover:bg-purple-700">+</button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">HANG — LKR {item.hangPrice}</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleLaundryQty(item.name, 'hang', -1)} className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200">-</button>
                                  <span className="w-6 text-center text-sm font-bold">{hangQty}</span>
                                  <button onClick={() => handleLaundryAdd(item.name, item.hangPrice, 'hang')} className="w-7 h-7 bg-purple-600 text-white rounded flex items-center justify-center hover:bg-purple-700">+</button>
                                </div>
                              </div>
                            </div>
                          )}

                          {!isDryClean && !hasFoldHang && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">LKR {item.price || item.foldPrice}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleLaundryQty(item.name, 'single', -1)} className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200">-</button>
                                <span className="w-6 text-center text-sm font-bold">{singleQty}</span>
                                <button onClick={() => handleLaundryAdd(item.name, item.price || item.foldPrice, 'single')} className="w-7 h-7 bg-purple-600 text-white rounded flex items-center justify-center hover:bg-purple-700">+</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {laundryItems.length > 0 && (
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="font-semibold text-purple-700 mb-2">Selected Items:</p>
            {laundryItems.map(i => (
              <div key={`${i.name}-${i.type}`} className="flex justify-between text-sm">
                <span>{i.name} × {i.quantity} {i.type !== 'single' && `(${i.type})`}</span>
                <span>LKR {(i.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 font-bold text-purple-700 flex justify-between">
              <span>Subtotal</span>
              <span>LKR {laundryTotal.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Render shampoo form ──────────────────────────────────────────────────
  const renderShampooForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
        <select value={subService} onChange={e => { setSubService(e.target.value); setSofaSeats(2); setMattressSize(''); setMattressType(''); setCarpetSqft(''); }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">Select a service...</option>
          <option value="Sofa Cleaning">Sofa Cleaning</option>
          <option value="Mattress Cleaning">Mattress Cleaning</option>
          <option value="Carpet Cleaning">Carpet Cleaning</option>
        </select>
      </div>

      {subService === 'Sofa Cleaning' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Seats</label>
          <div className="grid grid-cols-4 gap-3">
            {[2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setSofaSeats(s)}
                className={`py-3 rounded-lg border-2 font-bold transition-all ${sofaSeats === s ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300'}`}>
                {s} Seat
              </button>
            ))}
          </div>
          <p className="mt-3 text-purple-600 font-semibold">
            Estimated: LKR {((PRICES.shampoo['Sofa Cleaning'] as any)[sofaSeats]).toLocaleString()}
          </p>
        </div>
      )}

      {subService === 'Mattress Cleaning' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mattress Size</label>
            <div className="grid grid-cols-2 gap-2">
              {['King Size', 'Queen Size', 'Double Mattress', 'Single Mattress'].map(size => (
                <button key={size} onClick={() => setMattressSize(size)}
                  className={`py-2 px-3 rounded-lg border-2 text-sm transition-all ${mattressSize === size ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>
          {mattressSize && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cleaning Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['Full', 'Top Only'].map(type => (
                  <button key={type} onClick={() => setMattressType(type)}
                    className={`py-2 px-3 rounded-lg border-2 text-sm transition-all ${mattressType === type ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                    {type} — LKR {((PRICES.shampoo['Mattress Cleaning'] as any)[mattressSize]?.[type] || 0).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mattressSize && mattressType && (
            <p className="text-purple-600 font-semibold">
              Estimated: LKR {((PRICES.shampoo['Mattress Cleaning'] as any)[mattressSize]?.[mattressType] || 0).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {subService === 'Carpet Cleaning' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Carpet Area (square feet)</label>
          <input type="number" value={carpetSqft} onChange={e => setCarpetSqft(e.target.value)}
            placeholder="Enter square feet e.g. 200"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          {carpetSqft && (
            <p className="mt-2 text-purple-600 font-semibold">
              Estimated: LKR {(35 * Number(carpetSqft)).toLocaleString()} (LKR 35/sqft)
            </p>
          )}
        </div>
      )}
    </div>
  );

  // ─── Render curtain form ──────────────────────────────────────────────────
  const renderCurtainForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Service Type</label>
        <div className="space-y-2">
          {['Dry Cleaning & Pressing', 'Laundry & Pressing', 'Curtain Premium Service'].map(type => (
            <button key={type} onClick={() => setCurtainType(type)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${curtainType === type ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
              <span className="font-medium">{type}</span>
              <span className="ml-2 text-purple-600">
                — LKR {((PRICES.curtain['Curtain Cleaning'] as any)[type] || 0).toLocaleString()}/curtain
              </span>
            </button>
          ))}
        </div>
      </div>

      {curtainType && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Curtains</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setCurtainQty(Math.max(1, curtainQty - 1))}
                className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center text-xl font-bold">-</button>
              <span className="text-3xl font-bold w-16 text-center">{curtainQty}</span>
              <button onClick={() => setCurtainQty(curtainQty + 1)}
                className="w-12 h-12 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center text-xl font-bold">+</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add-on Services</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={curtainAddons.removal}
                  onChange={e => setCurtainAddons({ ...curtainAddons, removal: e.target.checked })}
                  className="w-4 h-4 accent-purple-600" />
                <span>Curtain Removal — LKR 100/curtain</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={curtainAddons.installation}
                  onChange={e => setCurtainAddons({ ...curtainAddons, installation: e.target.checked })}
                  className="w-4 h-4 accent-purple-600" />
                <span>Curtain Installation — LKR 100/curtain</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={curtainAddons.delivery}
                  onChange={e => setCurtainAddons({ ...curtainAddons, delivery: e.target.checked })}
                  className="w-4 h-4 accent-purple-600" />
                <span>Delivery — LKR 500 (flat)</span>
              </label>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{curtainType} × {curtainQty}</span>
              <span>LKR {(((PRICES.curtain['Curtain Cleaning'] as any)[curtainType] || 0) * curtainQty).toLocaleString()}</span>
            </div>
            {curtainAddons.removal && <div className="flex justify-between text-sm mb-1"><span>Removal × {curtainQty}</span><span>LKR {(100 * curtainQty).toLocaleString()}</span></div>}
            {curtainAddons.installation && <div className="flex justify-between text-sm mb-1"><span>Installation × {curtainQty}</span><span>LKR {(100 * curtainQty).toLocaleString()}</span></div>}
            {curtainAddons.delivery && <div className="flex justify-between text-sm mb-1"><span>Delivery</span><span>LKR 500</span></div>}
            <div className="border-t mt-2 pt-2 font-bold text-purple-700 flex justify-between">
              <span>Subtotal</span>
              <span>LKR {calculateCurrentTotal().toLocaleString()}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const canAdd = calculateCurrentTotal() > 0;

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <Calculator className="w-7 h-7" />
          <h2 className="text-2xl font-bold">AI Price Estimator</h2>
        </div>
        <p className="text-purple-100 text-sm">Add multiple services and get an instant combined estimate</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Added services list */}
        {addedServices.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-700">Added Services</h3>
            {addedServices.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{s.summary}</p>
                  <p className="text-purple-600 font-bold">LKR {s.total.toLocaleString()}</p>
                </div>
                <button onClick={() => handleRemoveService(s.id)}
                  className="text-red-500 hover:text-red-700 p-1">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-700">Grand Total</span>
              <span className="text-2xl font-bold text-purple-700">LKR {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Add service form */}
        {showForm && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">
              {addedServices.length > 0 ? 'Add Another Service' : 'Select a Service'}
            </h3>

            {/* Category selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'home', label: '🏠 Home/Office Cleaning' },
                  { id: 'laundry', label: '👕 Laundry' },
                  { id: 'shampoo', label: '🛋️ Shampoo & Vacuum' },
                  { id: 'curtain', label: '🪟 Curtain Cleaning' },
                ].map(cat => (
                  <button key={cat.id} onClick={() => { setCategory(cat.id); setSubService(''); }}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${category === cat.id ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300'}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Service specific form */}
            {category === 'home' && renderHomeForm()}
            {category === 'laundry' && renderLaundryForm()}
            {category === 'shampoo' && renderShampooForm()}
            {category === 'curtain' && renderCurtainForm()}

            {/* Add to list button */}
            {category && (
              <button onClick={handleAddService} disabled={!canAdd}
                className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium">
                <Plus className="w-5 h-5" />
                Add to Estimate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}