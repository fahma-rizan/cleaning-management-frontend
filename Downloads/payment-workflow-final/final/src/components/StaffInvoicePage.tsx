import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, FileText, Eye } from 'lucide-react';
import InvoiceGenerator, { InvoiceData } from './InvoiceGenerator';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';

interface StaffInvoicePageProps { user: User; }

interface LineItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
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
  const [serviceType, setServiceType] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [serviceTime, setServiceTime] = useState('');

  // Line items (customizations)
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', name: '', quantity: 1, price: 0 },
  ]);

  // Discount & payment
  const [discount,       setDiscount]       = useState(0);
  const [paymentMethod,  setPaymentMethod]  = useState('cash');
  const [preview,        setPreview]        = useState(false);
  const [savedInvoice,   setSavedInvoice]   = useState<InvoiceData | null>(null);

  // API state
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:4000/api';

  const addItem = () => setItems(prev => [...prev, { id: Date.now().toString(), name: '', quantity: 1, price: 0 }]);
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof LineItem, value: any) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const serviceBase      = items[0]?.price || 0;
  const customizations   = items.slice(1);
  const customTotal      = customizations.reduce((s, i) => s + i.price * i.quantity, 0);
  const subtotal         = serviceBase + customTotal;
  const total            = Math.max(0, subtotal - discount);

  const buildInvoice = (): InvoiceData => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const code    = serviceType.substring(0, 3).toUpperCase() || 'SRV';
    return {
      invoiceNumber: `INV-${code}-${dateStr}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
      invoiceType: paymentMethod === 'cod' ? 'cod' : 'full',
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      bookingId: `WALK-${Date.now()}`,
      customer: { name: customerName, email: customerEmail, phone: customerPhone, address: customerAddr },
      service: {
        name: serviceType,
        date: serviceDate || now.toLocaleDateString(),
        time: serviceTime || now.toLocaleTimeString(),
        customizations: customizations.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
      },
      pricing: {
        basePrice: serviceBase,
        customizationTotal: customTotal,
        discount,
        total,
        paidAmount: paymentMethod === 'cod' ? 0 : total,
        balanceAmount: paymentMethod === 'cod' ? total : 0,
      },
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'cash' ? 'Cash' : 'Online Payment',
      status: paymentMethod === 'cod' ? 'pending' : 'paid',
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
        customizations: invoice.service.customizations,
      },
      pricing: {
        basePrice: invoice.pricing.basePrice,
        customizationTotal: invoice.pricing.customizationTotal,
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

  const isValid = customerName && serviceType && items[0]?.price > 0;

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
    <div className="min-h-screen bg-gray-50">
      <DemoTopBar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">Staff Invoice Generator</h1>
        <p className="text-gray-500 mb-8">Create instant invoices for walk-in or manual bookings</p>

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

          {/* Service Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Service Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Service Type *</label>
                <select value={serviceType} onChange={e => setServiceType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                  <option value="">Select service</option>
                  {SERVICE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
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
              <h2 className="font-semibold text-gray-800">Services & Customizations</h2>
              <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    {idx === 0 ? (
                      <input type="text" value={serviceType || item.name}
                        readOnly={!!serviceType}
                        onChange={e => updateItem(item.id, 'name', e.target.value)}
                        placeholder="Base service"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50" />
                    ) : (
                      <select value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                        <option value="">Select add-on</option>
                        {ADDON_LIST.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    )}
                  </div>
                  <div className="col-span-2">
                    <input type="number" min={1} value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                  <div className="col-span-4">
                    <input type="number" min={0} value={item.price || ''}
                      onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                      placeholder="Price (Rs)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {idx > 0 && (
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Base Service</span><span>Rs. {serviceBase.toLocaleString()}</span>
              </div>
              {customTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Customizations</span><span>Rs. {customTotal.toLocaleString()}</span>
                </div>
              )}
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
  );
}