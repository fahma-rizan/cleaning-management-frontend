import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, FileText, Eye } from 'lucide-react';
import InvoiceGenerator, { InvoiceData } from './InvoiceGenerator';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';
import ServiceItemConfigurator from './ServiceItemConfigurator';

// Import category images - NOTE: You'll need to add these image assets to your project
import homeCleaningImg from '../assets/home-cleaning.jpg';
import laundryCleaningImg from '../assets/laundry-cleaning.jpg';
import shampooVacumImg from '../assets/Shampoo-Vacum.jpg';
import curtainCleaningImg from '../assets/curtain-cleaning.jpg';
import commonImg from '../assets/common-service.jpg';
import logoImg from '../assets/61e339fdac995bb65c1169259330f5728c465e0f.png';

const categoryImages: Record<string, string> = {
  home: homeCleaningImg,
  laundry: laundryCleaningImg,
  shampoo: shampooVacumImg,
  curtain: curtainCleaningImg,
  common: commonImg,
};

interface StaffInvoicePageProps { user: User; }

export interface LineItem {
  id: string;
  name: string;
  description?: string; // To hold details like 'Type: Normal, SQFT: 1500'
  quantity: number;
  price: number;
  category: 'home' | 'laundry' | 'shampoo' | 'curtain' | 'common';
}

const SERVICE_LIST = ['Home Cleaning', 'Laundry', 'Curtain Cleaning', 'Sofa Cleaning', 'Interior Cleaning', 'Deep Cleaning'];
const ADDON_LIST   = ['Extra Room', 'Stain Removal', 'Pet Hair Cleaning', 'Deep Cleaning Addon', 'Additional Curtains', 'Carpet Cleaning'];

export default function StaffInvoicePage({ user }: StaffInvoicePageProps) {
  const navigate = useNavigate();

  // Customer details
  const [customerName,  setCustomerName]  = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddr,  setCustomerAddr]  = useState('');

  // Service

  const [serviceDate, setServiceDate] = useState('');
  const [serviceTime, setServiceTime] = useState('');

  // Line items (customizations)
  const [items, setItems] = useState<LineItem[]>([]);

  // Discount & payment
  const [discount,       setDiscount]       = useState(0);
  const [paymentMethod,  setPaymentMethod]  = useState('cash');
  const [preview,        setPreview]        = useState(false);
  const [savedInvoice,   setSavedInvoice]   = useState<InvoiceData | null>(null);
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);

  // API state
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:4000/api';

  const getInvoiceImage = () => {
    if (items.length === 0) {
      return logoImg;
    }
    const firstCategory = items[0].category;
    const allSameCategory = items.every(item => item.category === firstCategory);

    if (allSameCategory) {
      return categoryImages[firstCategory] || categoryImages.common;
    }
    return categoryImages.common;
  };

  const handleAddItemFromConfigurator = (item: Omit<LineItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setItems(prev => [...prev, newItem]);
  };
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal         = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total            = Math.max(0, subtotal - discount);

  const buildInvoice = (): InvoiceData => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    
    // Determine Categories and Prefix using the same logic as the backend
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
      invoiceType: paymentMethod === 'cod' ? 'COD' : 'FULL',
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      bookingId: `MANUAL-${Date.now().toString().slice(-6)}`,
      customer: { name: customerName, email: customerEmail, phone: customerPhone, address: customerAddr },
      service: {
        name: items[0]?.name || 'General Service',
        date: serviceDate || now.toLocaleDateString(),
        time: serviceTime || now.toLocaleTimeString(),
        items: items.map(i => ({ 
          name: i.name, 
          description: i.description, 
          price: i.price, 
          quantity: i.quantity,
          unit: i.category === 'laundry' ? 'kg' : i.category === 'home' ? 'sqft' : 'unit' 
        })),
      },
      pricing: {
        subtotal: subtotal,
        discount,
        total,
        paidAmount: paymentMethod === 'cod' ? 0 : total,
        balanceAmount: paymentMethod === 'cod' ? total : 0,
      },
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'cash' ? 'Cash' : 'Online Payment',
      status: paymentMethod === 'cod' ? 'SENT' : 'PAID',
    };
  };

  const handlePreview = () => {
    if (!isValid) return;
    const inv = buildInvoice();
    setSavedInvoice(inv);
    setPreview(true);
    setError(null);
  };

  const transformForAPI = (invoice: InvoiceData, staffId: string) => {
    const serviceDateTime = serviceDate && serviceTime 
      ? new Date(`${serviceDate}T${serviceTime}`)
      : new Date();

    return {
      invoiceType: invoice.invoiceType,
      bookingId: invoice.bookingId,
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
        phone: invoice.customer.phone,
        address: invoice.customer.address,
      },
      service: {
        name: invoice.service.name,
        date: serviceDateTime.toISOString(),
        // The 'customizations' field in the new model contains all items
        customizations: invoice.service.customizations,
      },
      pricing: {
        // The backend might expect the old structure, so we adapt.
        // We can put the full subtotal in basePrice and 0 for customizationTotal.
        basePrice: invoice.pricing.subtotal,
        customizationTotal: 0,
        discount: invoice.pricing.discount,
        total: invoice.pricing.total,
      },
      payment: {
        method: invoice.paymentMethod,
        status: invoice.status,
        paidAmount: invoice.pricing.paidAmount,
        balanceAmount: invoice.pricing.balanceAmount,
      },
      status: 'active', // Default status for a new staff-created invoice
      createdByStaff: staffId,
    };
  };

  const handleSave = async () => {
    if (!isValid) return;
    
    setLoading(true);
    setError(null);

    try {
      const frontendInvoice = buildInvoice();
      const payload = transformForAPI(frontendInvoice, user.id);

      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to save invoice.');
      }

      const newInvoiceFromDB = await response.json();

      // Instead of showing a preview, navigate to the success page
      // with the new invoice data.
      navigate('/booking-success', { 
        state: { 
          // The success page expects a 'booking' object in the state.
          // The invoice object from the DB has a compatible structure.
          booking: newInvoiceFromDB 
        } 
      });

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setPreview(false); // Stay on the form if there's an error
    } finally {
      setLoading(false);
    }
  };

  const isValid = customerName && items.length > 0 && items.every(i => i.name && i.price > 0);

  if (preview && savedInvoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between">
            <button onClick={() => { setPreview(false); setError(null); }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:bg-gray-200">
              <ArrowLeft className="w-4 h-4" /> Back to Form
            </button>
            <button onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm font-medium disabled:bg-purple-300">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Confirm & Save Invoice
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="max-w-[210mm] mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <InvoiceGenerator invoice={savedInvoice} />
        </div>
      </div>
    );
  }

  return (
    <>
      {isConfiguratorOpen && (
        <ServiceItemConfigurator
          onAddItem={handleAddItemFromConfigurator}
          onClose={() => setIsConfiguratorOpen(false)}
        />
      )}
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Staff Invoice Generator</h1>
              <p className="text-gray-500">Create instant invoices for walk-in or manual bookings</p>
            </div>
            <img src={getInvoiceImage()} alt="Service Category" className="h-16 w-24 object-cover rounded-lg shadow-sm" />
          </div>

          <div className="space-y-6">

            {/* Customer Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Customer Name *', value: customerName, set: setCustomerName, placeholder: 'Kavya Perera' },
                  { label: 'Email',           value: customerEmail, set: setCustomerEmail, placeholder: 'kavya@example.com' },
                  { label: 'Phone',           value: customerPhone, set: setCustomerPhone, placeholder: '+94 771 234 567' },
                  { label: 'Address',         value: customerAddr,  set: setCustomerAddr,  placeholder: '123 Flower Road, Colombo' },
                ].map(({ label, value, set, placeholder }) => (
                  <div key={label}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input type="text" value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Service Date & Time */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">Service Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Service Date</label>
                  <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Service Time</label>
                  <input type="time" value={serviceTime} onChange={e => setServiceTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Service Items</h2>
                <button onClick={() => setIsConfiguratorOpen(true)} className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700">
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>

              <div className="space-y-3">
                {/* Display added items */}
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500 whitespace-pre-wrap">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 w-28">
                        Rs. {(item.quantity * item.price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity > 1 ? `${item.quantity} x ${item.price.toLocaleString()}` : ``}
                      </p>
                    </div>
                    <div className="w-10 flex justify-end">
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-center text-gray-400 py-4">No service items added yet.</p>
                )}
              </div>

              {/* Totals */}
              <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Discount (Rs)</span>
                  <input type="number" min={0} value={discount || ''} onChange={e => setDiscount(Number(e.target.value))}
                    className="w-28 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div className="flex justify-between font-bold text-lg text-purple-600 border-t border-gray-100 pt-2">
                  <span>Total</span><span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">Payment Method</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'cash',   label: 'Cash' },
                  { value: 'online', label: 'Online' },
                  { value: 'cod',    label: 'COD' },
                ].map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => setPaymentMethod(value)}
                    className={`py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                      paymentMethod === value ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handlePreview} disabled={!isValid || loading}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                  isValid && !loading ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}>
                <Eye className="w-5 h-5" /> Preview Invoice
              </button>
              <button onClick={handleSave} disabled={!isValid || loading}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-all ${
                  isValid && !loading ? 'bg-purple-600 hover:bg-purple-700 shadow-md' : 'bg-gray-300 cursor-not-allowed'
                }`}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" /> Generate & Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}