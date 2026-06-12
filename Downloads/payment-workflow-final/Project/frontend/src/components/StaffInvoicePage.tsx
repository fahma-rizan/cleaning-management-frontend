import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, FileText, Eye } from 'lucide-react';
import InvoiceGenerator, { InvoiceData } from './InvoiceGenerator';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';
import ServiceItemConfigurator from './ServiceItemConfigurator';

import homeCleaningImg    from '../assets/home-cleaning.jpg';
import laundryCleaningImg from '../assets/laundry-cleaning.jpg';
import shampooVacumImg    from '../assets/Shampoo-Vacum.jpg';
import curtainCleaningImg from '../assets/curtain-cleaning.jpg';
import commonImg          from '../assets/common-service.jpg';
import logoImg            from '../assets/61e339fdac995bb65c1169259330f5728c465e0f.png';

const categoryImages: Record<string, string> = {
  home: homeCleaningImg, laundry: laundryCleaningImg,
  shampoo: shampooVacumImg, curtain: curtainCleaningImg, common: commonImg,
};

interface StaffInvoicePageProps { user: User; }

export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  category: 'home' | 'laundry' | 'shampoo' | 'curtain' | 'common';
}

export default function StaffInvoicePage({ user }: StaffInvoicePageProps) {
  const navigate = useNavigate();

  const [customerName,  setCustomerName]  = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddr,  setCustomerAddr]  = useState('');
  const [serviceDate,   setServiceDate]   = useState('');
  const [serviceTime,   setServiceTime]   = useState('');
  const [items,         setItems]         = useState<LineItem[]>([]);
  const [discount,      setDiscount]      = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [preview,       setPreview]       = useState(false);
  const [savedInvoice,  setSavedInvoice]  = useState<InvoiceData | null>(null);
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:4000/api';

  const getInvoiceImage = () => {
    if (items.length === 0) return logoImg;
    const firstCategory = items[0].category;
    const allSame = items.every(i => i.category === firstCategory);
    return allSame ? (categoryImages[firstCategory] || categoryImages.common) : categoryImages.common;
  };

  const handleAddItemFromConfigurator = (item: Omit<LineItem, 'id'>) =>
    setItems(prev => [...prev, { ...item, id: Date.now().toString() }]);

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  // FIX: Validate discount cannot exceed or equal subtotal
  const handleDiscountChange = (val: number) => {
    if (val < 0) { setDiscount(0); setDiscountError(''); return; }
    if (val >= subtotal && subtotal > 0) {
      setDiscountError(`Discount cannot equal or exceed the subtotal (Rs. ${subtotal.toLocaleString()}). Use the Refund workflow for full refunds.`);
    } else {
      setDiscountError('');
    }
    setDiscount(val);
  };

  const total = Math.max(0, subtotal - discount);

  const buildInvoice = (): InvoiceData => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');

    const categoriesSet = new Set<string>();
    items.forEach(item => {
      if (item.category === 'laundry') categoriesSet.add('LND');
      if (item.category === 'curtain') categoriesSet.add('CUR');
      if (item.category === 'shampoo') categoriesSet.add('SVC');
      if (item.category === 'home')    categoriesSet.add('HOC');
    });

    const mainCategories = Array.from(categoriesSet);
    const prefix = mainCategories.length > 1 ? 'MULTI' : (mainCategories[0] || 'SRV');

    return {
      invoiceNumber: `${prefix}-${dateStr}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
      mainCategories,
      invoiceType:  paymentMethod === 'cod' ? 'COD' : 'FULL',
      date:         now.toLocaleDateString(),
      time:         now.toLocaleTimeString(),
      bookingId:    `MANUAL-${Date.now().toString().slice(-6)}`,
      customer:     { name: customerName, email: customerEmail, phone: customerPhone, address: customerAddr },
      service: {
        name: items[0]?.name || 'General Service',
        date: serviceDate || now.toLocaleDateString(),
        time: serviceTime || now.toLocaleTimeString(),
        items: items.map(i => ({
          name: i.name, description: i.description,
          price: i.price, quantity: i.quantity,
          unit: i.category === 'laundry' ? 'kg' : i.category === 'home' ? 'sqft' : 'unit',
        })),
      },
      pricing: {
        subtotal,
        discount,
        total,
        paidAmount:    paymentMethod === 'cod' ? 0 : total,
        balanceAmount: paymentMethod === 'cod' ? total : 0,
      },
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'cash' ? 'Cash' : 'Online Payment',
      status: paymentMethod === 'cod' ? 'SENT' : 'PAID',
    };
  };

  // FIX: Map pricing.discount → discounts[] array so it is saved to MongoDB.
  // Previously the discount was displayed on the PDF but silently dropped from
  // the database because the backend Invoice schema expects discounts[] not
  // a flat pricing.discount number.
  const transformForAPI = (invoice: InvoiceData) => ({
    invoiceType: invoice.invoiceType,
    bookingId:   invoice.bookingId,
    customer: {
      name:    invoice.customer.name,
      email:   invoice.customer.email,
      phone:   invoice.customer.phone,
      address: invoice.customer.address,
    },
    serviceItems: items.map(i => ({ name: i.name, price: i.price * i.quantity, quantity: i.quantity })),
    pricing: {
      basePrice:          invoice.pricing.subtotal,
      customizationTotal: 0,
      // FIX: Send as a flat number — createInvoice controller maps this to discounts[]
      discount:           invoice.pricing.discount,
      total:              invoice.pricing.total,
    },
    payment: {
      method:        invoice.paymentMethod,
      status:        invoice.status,
      paidAmount:    invoice.pricing.paidAmount,
      balanceAmount: invoice.pricing.balanceAmount,
    },
    status:          'active',
    createdByStaff:  user.id,
  });

  const isValid = customerName && customerEmail && items.length > 0 && !discountError;

  const handlePreview = () => {
    if (!isValid) return;
    setSavedInvoice(buildInvoice());
    setPreview(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      const frontendInvoice = buildInvoice();
      const payload = transformForAPI(frontendInvoice);

      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Failed to save invoice.');
      }

      const newInvoiceFromDB = await response.json();
      setSavedInvoice({ ...frontendInvoice, invoiceNumber: newInvoiceFromDB.invoiceNumber });
      setPreview(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (preview && savedInvoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="container mx-auto px-4 py-8">
          <button onClick={() => setPreview(false)} className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4" /> Back to Invoice Form
          </button>
          <InvoiceGenerator invoice={savedInvoice} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoTopBar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Staff Invoice</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">{error}</div>
        )}

        {/* Customer Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['Name', customerName, setCustomerName, 'text'],
              ['Email', customerEmail, setCustomerEmail, 'email'],
              ['Phone', customerPhone, setCustomerPhone, 'tel'],
              ['Address', customerAddr, setCustomerAddr, 'text'],
            ].map(([label, val, setter, type]) => (
              <div key={label as string}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label as string}</label>
                <input type={type as string} value={val as string}
                  onChange={e => (setter as Function)(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Service Date/Time */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Date</label>
              <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Time</label>
              <input type="time" value={serviceTime} onChange={e => setServiceTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
          </div>
        </div>

        {/* Service Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Service Items</h2>
            <button onClick={() => setIsConfiguratorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
              Add Service
            </button>
          </div>
          {items.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No items added yet. Click "Add Service" to begin.</p>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-800">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pricing</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Discount (Rs.)</span>
              <div className="flex flex-col items-end">
                <input type="number" min={0} max={subtotal - 1} value={discount || ''}
                  onChange={e => handleDiscountChange(Number(e.target.value))}
                  className={`w-32 border rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 ${discountError ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-purple-300'}`}
                  placeholder="0" />
                {discountError && <p className="text-xs text-red-500 mt-1 max-w-xs text-right">{discountError}</p>}
              </div>
            </div>
            <div className="flex justify-between text-base font-semibold border-t pt-3">
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="flex gap-3">
              {[['cash', 'Cash'], ['cod', 'COD'], ['online', 'Online']].map(([val, label]) => (
                <label key={val} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm ${paymentMethod === val ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                  <input type="radio" name="paymentMethod" value={val} checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} className="hidden" />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button onClick={handlePreview} disabled={!isValid}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold transition-all ${!isValid ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-purple-600 text-purple-600 hover:bg-purple-50'}`}>
            <Eye className="w-5 h-5" /> Preview
          </button>
          <button onClick={handleSave} disabled={!isValid || loading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all ${!isValid || loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md'}`}>
            <FileText className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      {isConfiguratorOpen && (
        <ServiceItemConfigurator
          onAdd={handleAddItemFromConfigurator}
          onClose={() => setIsConfiguratorOpen(false)}
        />
      )}
    </div>
  );
}
