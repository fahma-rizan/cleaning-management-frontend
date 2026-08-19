import { useState, useEffect, useMemo } from 'react';
import { Calculator, Plus, Trash2, ChevronDown, ChevronUp, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api.service';

// ─── API config ────────────────────────────────────────────────────────────
// Matches your backend: app.use('/api/pricelists', require('./routes/priceList.routes'))
// GET /api/pricelists returns { success: true, priceLists: [...] }
// Path is relative to API_BASE — api.service.ts prepends it, same as your other components.
const PRICE_LIST_ENDPOINT = '/pricelists';

// ─── Types (match your PriceList schema) ───────────────────────────────────
interface PriceListDoc {
  _id: string;
  serviceId: number;
  serviceName: string;
  category: 'home' | 'laundry' | 'shampoo' | 'curtain';
  pricingType: 'per-sqft' | 'per-item' | 'per-seat' | 'fixed' | 'per-unit' | string;
  pricing: any; // shape varies by pricingType — see render functions below
}

interface ServiceItem {
  id: string;
  category: string;
  subService: string;
  total: number;
  summary: string;
}

interface LaundryItem {
  name: string;
  quantity: number;
  type: 'fold' | 'hang' | 'single';
  price: number;
}

// ─── Hook: fetch live prices from the DB ───────────────────────────────────
function usePriceLists() {
  const [priceList, setPriceList] = useState<PriceListDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPrices() {
      setLoading(true);
      setError('');
      try {
        const json = await api.get(PRICE_LIST_ENDPOINT);
        const list: PriceListDoc[] = Array.isArray(json) ? json : json.priceLists;
        if (!Array.isArray(list)) throw new Error('Unexpected response shape from price list API');
        if (!cancelled) setPriceList(list);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Could not load current prices.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPrices();
    return () => { cancelled = true; };
  }, [reloadToken]);

  // Group by category → serviceName for easy lookup in the render functions
  const byCategory = useMemo(() => {
    const map: Record<string, Record<string, PriceListDoc>> = {};
    priceList.forEach(doc => {
      if (!map[doc.category]) map[doc.category] = {};
      map[doc.category][doc.serviceName] = doc;
    });
    return map;
  }, [priceList]);

  const refetch = () => setReloadToken(t => t + 1);

  return { priceList, byCategory, loading, error, refetch };
}

export default function AIEstimator() {
  const { byCategory, loading, error, refetch } = usePriceLists();

  const [addedServices, setAddedServices] = useState<ServiceItem[]>([]);
  const [showForm, setShowForm] = useState(true);

  // ─── Current form state ───────────────────────────────────────────────────
  const [category, setCategory] = useState('');
  const [subService, setSubService] = useState('');

  // Home fields
  const [cleaningType, setCleaningType] = useState(''); // stores the type `id`
  const [sqft, setSqft] = useState('');

  // Laundry fields
  const [laundryItems, setLaundryItems] = useState<LaundryItem[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string>('');

  // Shampoo fields
  const [sofaSeats, setSofaSeats] = useState<number | null>(null);
  const [mattressSize, setMattressSize] = useState('');
  const [mattressType, setMattressType] = useState('');
  const [carpetSqft, setCarpetSqft] = useState('');

  // Curtain fields
  const [curtainType, setCurtainType] = useState(''); // stores the type `id`
  const [curtainQty, setCurtainQty] = useState(1);
  const [curtainAddons, setCurtainAddons] = useState<Record<string, boolean>>({});

  // ─── Reset form ───────────────────────────────────────────────────────────
  const resetForm = () => {
    setCategory(''); setSubService(''); setCleaningType(''); setSqft('');
    setLaundryItems([]); setExpandedGroup(''); setSofaSeats(null);
    setMattressSize(''); setMattressType(''); setCarpetSqft('');
    setCurtainType(''); setCurtainQty(1); setCurtainAddons({});
  };

  // ─── Calculate current service total (reads live prices from byCategory) ──
  const calculateCurrentTotal = (): number => {
    if (category === 'home' && subService && cleaningType && sqft) {
      const doc = byCategory.home?.[subService];
      const type = doc?.pricing?.types?.find((t: any) => t.id === cleaningType);
      return (type?.pricePerSqft || 0) * Number(sqft);
    }

    if (category === 'laundry' && subService) {
      // laundryItems already carry the price captured at add-time
      return laundryItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    if (category === 'shampoo' && subService) {
      const doc = byCategory.shampoo?.[subService];
      if (!doc) return 0;

      if (doc.pricingType === 'per-seat' && sofaSeats) {
        const seatEntry = doc.pricing?.seats?.find((s: any) => s.seats === sofaSeats);
        return seatEntry?.price || 0;
      }
      if (doc.pricingType === 'fixed' && mattressSize && mattressType) {
        const sizeEntry = doc.pricing?.sizes?.find((s: any) => s.label === mattressSize);
        const optionEntry = sizeEntry?.options?.find((o: any) => o.type === mattressType);
        return optionEntry?.price || 0;
      }
      if (doc.pricingType === 'per-sqft' && carpetSqft) {
        const rate = doc.pricing?.types?.[0]?.pricePerSqft || 0;
        return rate * Number(carpetSqft);
      }
    }

    if (category === 'curtain' && curtainType) {
      const doc = byCategory.curtain?.['Curtain Cleaning'];
      const typeEntry = doc?.pricing?.types?.find((t: any) => t.id === curtainType);
      const base = (typeEntry?.pricePerCurtain || 0) * curtainQty;
      const addonsList: any[] = doc?.pricing?.addons || [];
      const addonTotal = addonsList.reduce((sum, addon) => {
        if (!curtainAddons[addon.id]) return sum;
        return sum + (addon.perUnit ? addon.price * curtainQty : addon.price);
      }, 0);
      return base + addonTotal;
    }

    return 0;
  };

  // ─── Generate summary text ────────────────────────────────────────────────
  const generateSummary = (): string => {
    if (category === 'home') {
      const doc = byCategory.home?.[subService];
      const type = doc?.pricing?.types?.find((t: any) => t.id === cleaningType);
      return `${subService} — ${type?.label || cleaningType} — ${sqft} sqft`;
    }
    if (category === 'laundry') return `${subService} — ${laundryItems.length} garment type(s)`;
    if (category === 'shampoo') {
      const doc = byCategory.shampoo?.[subService];
      if (doc?.pricingType === 'per-seat') return `${subService} — ${sofaSeats} seater`;
      if (doc?.pricingType === 'fixed') return `${subService} — ${mattressSize} (${mattressType})`;
      if (doc?.pricingType === 'per-sqft') return `${subService} — ${carpetSqft} sqft`;
    }
    if (category === 'curtain') {
      const doc = byCategory.curtain?.['Curtain Cleaning'];
      const typeEntry = doc?.pricing?.types?.find((t: any) => t.id === curtainType);
      return `${typeEntry?.label || curtainType} — ${curtainQty} curtain(s)`;
    }
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
    const services = Object.keys(byCategory.home || {});
    const doc = subService ? byCategory.home?.[subService] : null;
    const types: any[] = doc?.pricing?.types || [];

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
              {types.map((ct: any) => (
                <button key={ct.id} onClick={() => setCleaningType(ct.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${cleaningType === ct.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  {ct.label} — LKR {ct.pricePerSqft}/sqft
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
                Estimated: LKR {calculateCurrentTotal().toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── Render laundry form ──────────────────────────────────────────────────
  const renderLaundryForm = () => {
    const services = Object.keys(byCategory.laundry || {});
    const doc = subService ? byCategory.laundry?.[subService] : null;
    const groups: any[] = doc?.pricing?.groups || [];
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

        {groups.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {groups.map((group: any) => (
              <div key={group.label} className="border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setExpandedGroup(expandedGroup === group.label ? '' : group.label)}
                  className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 font-medium">
                  {group.label}
                  {expandedGroup === group.label ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedGroup === group.label && (
                  <div className="p-3 space-y-2">
                    {group.items.map((item: any) => {
                      // An item has fold/hang pricing only if BOTH are present and it's not flagged noFoldHang
                      const hasFoldHang = item.foldPrice != null && item.hangPrice != null && !item.noFoldHang;
                      const foldQty = getLaundryQty(item.name, 'fold');
                      const hangQty = getLaundryQty(item.name, 'hang');
                      const singleQty = getLaundryQty(item.name, 'single');
                      const singlePrice = item.price ?? item.foldPrice;

                      return (
                        <div key={item.name} className="bg-white border border-gray-100 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">{item.name}</span>
                            {!hasFoldHang && <span className="text-purple-600 font-bold text-sm">LKR {singlePrice}</span>}
                          </div>

                          {hasFoldHang ? (
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
                          ) : (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleLaundryQty(item.name, 'single', -1)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 text-lg">-</button>
                              <span className="w-8 text-center font-bold">{singleQty}</span>
                              <button onClick={() => handleLaundryAdd(item.name, singlePrice, 'single')} className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 text-lg">+</button>
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
  const renderShampooForm = () => {
    const services = Object.keys(byCategory.shampoo || {});
    const doc = subService ? byCategory.shampoo?.[subService] : null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
          <select value={subService} onChange={e => { setSubService(e.target.value); setSofaSeats(null); setMattressSize(''); setMattressType(''); setCarpetSqft(''); }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Select a service...</option>
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {doc?.pricingType === 'per-seat' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Seats</label>
            <div className="grid grid-cols-4 gap-3">
              {doc.pricing.seats.map((s: any) => (
                <button key={s.seats} onClick={() => setSofaSeats(s.seats)}
                  className={`py-3 rounded-lg border-2 font-bold transition-all ${sofaSeats === s.seats ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300'}`}>
                  {s.seats} Seat
                </button>
              ))}
            </div>
            {sofaSeats && (
              <p className="mt-3 text-purple-600 font-semibold">
                Estimated: LKR {calculateCurrentTotal().toLocaleString()}
              </p>
            )}
          </div>
        )}

        {doc?.pricingType === 'fixed' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mattress Size</label>
              <div className="grid grid-cols-2 gap-2">
                {doc.pricing.sizes.map((size: any) => (
                  <button key={size.label} onClick={() => { setMattressSize(size.label); setMattressType(''); }}
                    className={`py-2 px-3 rounded-lg border-2 text-sm transition-all ${mattressSize === size.label ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
            {mattressSize && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cleaning Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {doc.pricing.sizes.find((s: any) => s.label === mattressSize)?.options.map((opt: any) => (
                    <button key={opt.type} onClick={() => setMattressType(opt.type)}
                      className={`py-2 px-3 rounded-lg border-2 text-sm transition-all ${mattressType === opt.type ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                      {opt.type} — LKR {opt.price.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {mattressSize && mattressType && (
              <p className="text-purple-600 font-semibold">
                Estimated: LKR {calculateCurrentTotal().toLocaleString()}
              </p>
            )}
          </div>
        )}

        {doc?.pricingType === 'per-sqft' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Carpet Area (square feet)</label>
            <input type="number" value={carpetSqft} onChange={e => setCarpetSqft(e.target.value)}
              placeholder="Enter square feet e.g. 200"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            {carpetSqft && (
              <p className="mt-2 text-purple-600 font-semibold">
                Estimated: LKR {calculateCurrentTotal().toLocaleString()} (LKR {doc.pricing.types[0].pricePerSqft}/sqft)
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── Render curtain form ──────────────────────────────────────────────────
  const renderCurtainForm = () => {
    const doc = byCategory.curtain?.['Curtain Cleaning'];
    const types: any[] = doc?.pricing?.types || [];
    const addons: any[] = doc?.pricing?.addons || [];

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Service Type</label>
          <div className="space-y-2">
            {types.map((t: any) => (
              <button key={t.id} onClick={() => setCurtainType(t.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${curtainType === t.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                <span className="font-medium">{t.label}</span>
                <span className="ml-2 text-purple-600">— LKR {t.pricePerCurtain.toLocaleString()}/curtain</span>
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
                {addons.map((addon: any) => (
                  <label key={addon.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={!!curtainAddons[addon.id]}
                      onChange={e => setCurtainAddons({ ...curtainAddons, [addon.id]: e.target.checked })}
                      className="w-4 h-4 accent-purple-600" />
                    <span>{addon.label} — LKR {addon.price}{addon.perUnit ? '/curtain' : ' (flat)'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{types.find((t: any) => t.id === curtainType)?.label} × {curtainQty}</span>
                <span>LKR {((types.find((t: any) => t.id === curtainType)?.pricePerCurtain || 0) * curtainQty).toLocaleString()}</span>
              </div>
              {addons.filter((a: any) => curtainAddons[a.id]).map((a: any) => (
                <div key={a.id} className="flex justify-between text-sm mb-1">
                  <span>{a.label}{a.perUnit ? ` × ${curtainQty}` : ''}</span>
                  <span>LKR {(a.perUnit ? a.price * curtainQty : a.price).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 font-bold text-purple-700 flex justify-between">
                <span>Subtotal</span>
                <span>LKR {calculateCurrentTotal().toLocaleString()}</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const canAdd = !loading && calculateCurrentTotal() > 0;

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Calculator className="w-7 h-7" />
            <h2 className="text-2xl font-bold">AI Price Estimator</h2>
          </div>
          <button onClick={refetch} title="Refresh prices" className="p-2 rounded-lg hover:bg-white/10">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-purple-100 text-sm">Add multiple services and get an instant combined estimate</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading current prices...</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 font-medium text-sm">Couldn't load current prices</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={refetch} className="mt-2 text-sm font-medium text-red-700 underline hover:no-underline">
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
