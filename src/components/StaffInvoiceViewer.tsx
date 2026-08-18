import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, Loader, CheckCircle } from 'lucide-react';
import { socket } from '../socket';
import InvoiceGenerator, { InvoiceData, InvoiceType } from './InvoiceGenerator';
import { tokenStorage } from '../utils/auth';

interface DBInvoice {
  _id: string;
  invoiceNumber: string;
  invoiceType: string;
  mainCategories: string[];
  status: string;
  customer: {
    userId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  bookingId: string;
  serviceItems: Array<{ name: string; price: number; quantity: number }>;
  discounts: Array<{ description: string; amount: number }>;
  subTotal: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  notes: string;
  createdAt: string;
}

const API = 'http://localhost:5000/api';

function mapDBInvoiceToInvoiceData(inv: DBInvoice): InvoiceData {
  const totalDiscount = (inv.discounts || []).reduce((s, d) => s + d.amount, 0);
  const created = new Date(inv.createdAt);

  return {
    invoiceNumber:  inv.invoiceNumber,
    mainCategories: inv.mainCategories || [],
    invoiceType:    inv.invoiceType as InvoiceType,
    date:           created.toLocaleDateString(),
    time:           created.toLocaleTimeString(),
    bookingId:      inv.bookingId,
    customer: {
      name:    inv.customer.name,
      email:   inv.customer.email,
      phone:   inv.customer.phone   || '',
      address: inv.customer.address || '',
    },
    service: {
      name: inv.serviceItems?.[0]?.name || 'Service',
      date: created.toLocaleDateString(),
      time: created.toLocaleTimeString(),
      items: (inv.serviceItems || []).map(item => ({
        name:     item.name,
        price:    item.price,
        quantity: item.quantity || 1,
      })),
    },
    pricing: {
      subtotal:      inv.subTotal,
      discount:      totalDiscount > 0 ? totalDiscount : undefined,
      total:         inv.totalAmount,
      paidAmount:    inv.paidAmount,
      balanceAmount: inv.balanceAmount,
    },
    paymentMethod: inv.invoiceType === 'COD'     ? 'Cash on Delivery'
                 : inv.invoiceType === 'ADVANCE'  ? 'Online (PayHere) — Advance'
                 : 'Online (PayHere)',
    status: inv.status as InvoiceData['status'],
  };
}

export default function StaffInvoiceViewer() {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const navigate = useNavigate();
  const [dbInvoice,       setDbInvoice]      = useState<DBInvoice | null>(null);
  const [invoiceData,     setInvoiceData]    = useState<InvoiceData | null>(null);
  const [loading,         setLoading]        = useState(true);
  const [error,           setError]          = useState<string | null>(null);
  const [isProcessing,    setIsProcessing]   = useState(false);
  const [processingError, setProcessingError]= useState<string | null>(null);

  const getAuthHeader = () => {
    const tokens = tokenStorage.getTokens();
    return tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
  };

  useEffect(() => {
    if (!invoiceNumber) { setError('No invoice number provided.'); setLoading(false); return; }

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/invoices/${invoiceNumber}`, {
          headers: { ...getAuthHeader() },
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.msg || 'Failed to fetch invoice.');
        }
        const data: DBInvoice = await response.json();
        setDbInvoice(data);
        setInvoiceData(mapDBInvoiceToInvoiceData(data));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();

    const handleUpdate = (updated: DBInvoice) => {
      if (updated.invoiceNumber === invoiceNumber) {
        setDbInvoice(updated);
        setInvoiceData(mapDBInvoiceToInvoiceData(updated));
      }
    };
    socket.on('invoiceUpdate', handleUpdate);
    return () => { socket.off('invoiceUpdate', handleUpdate); };
  }, [invoiceNumber]);

  const handleMarkAsPaid = async () => {
    if (!dbInvoice) return;
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const response = await fetch(`${API}/invoices/${dbInvoice._id}/mark-as-paid`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Failed to mark as paid.');
      }
    } catch (err: any) {
      setProcessingError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Loader className="animate-spin text-purple-600 w-10 h-10" />
      <p className="ml-4 text-gray-600">Loading invoice...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Go Back</button>
      </div>
    </div>
  );

  if (!invoiceData || !dbInvoice) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-600">Invoice not found.</p>
    </div>
  );

  const canMarkAsPaid = dbInvoice.status !== 'PAID' && dbInvoice.balanceAmount > 0;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[210mm] mx-auto">

        <div className="flex justify-between items-center mb-6 no-print">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Staff Invoice</h1>
          <div />
        </div>

        {/* isStaff=true → QR encodes staff invoice URL for on-site management */}
        <InvoiceGenerator invoice={invoiceData} isStaff={true} />

        {canMarkAsPaid && (
          <div className="mt-6 no-print">
            <button
              onClick={handleMarkAsPaid}
              disabled={isProcessing}
              className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all disabled:bg-green-400"
            >
              {isProcessing
                ? <><Loader className="animate-spin w-6 h-6" /> Processing...</>
                : <><Banknote className="w-6 h-6" /> Confirm Cash Payment Received</>}
            </button>
            {processingError && <p className="text-red-500 mt-3 text-sm text-center">{processingError}</p>}
          </div>
        )}

        {dbInvoice.status === 'PAID' && (
          <div className="mt-6 no-print">
            <div className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gray-100 text-gray-500 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span>Payment Completed</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
