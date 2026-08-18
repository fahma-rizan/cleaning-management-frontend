import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import type { User } from '../types';
import { useEffect, useState } from 'react';
import InvoiceGenerator, { InvoiceData, InvoiceType } from './InvoiceGenerator';

interface InvoiceProps {
  user: User;
}

// Shape of the invoice as it comes from the MongoDB API
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

// FIX: This was the missing piece — the fetched MongoDB document was passed
// straight to InvoiceGenerator without mapping field names. InvoiceGenerator
// expects invoice.pricing.total / .paidAmount / .balanceAmount and
// invoice.service.items — but the raw DB document has totalAmount,
// paidAmount, balanceAmount, and serviceItems at the TOP level instead.
// That mismatch is why Total/Paid showed Rs. 0 and the service table was
// empty — the fields InvoiceGenerator was reading simply didn't exist.
function mapDBInvoiceToInvoiceData(inv: DBInvoice): InvoiceData {
  const totalDiscount = (inv.discounts || []).reduce((s, d) => s + d.amount, 0);
  const created = inv.createdAt ? new Date(inv.createdAt) : new Date();

  return {
    invoiceNumber:  inv.invoiceNumber,
    mainCategories: inv.mainCategories || [],
    invoiceType:    inv.invoiceType as InvoiceType,
    date:           created.toLocaleDateString(),
    time:           created.toLocaleTimeString(),
    bookingId:      inv.bookingId,
    customer: {
      name:    inv.customer?.name    || 'N/A',
      email:   inv.customer?.email   || 'N/A',
      phone:   inv.customer?.phone   || '',
      address: inv.customer?.address || '',
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
      subtotal:      inv.subTotal      || 0,
      discount:      totalDiscount > 0 ? totalDiscount : undefined,
      total:         inv.totalAmount   || 0,
      paidAmount:    inv.paidAmount    || 0,
      balanceAmount: inv.balanceAmount || 0,
    },
    paymentMethod: inv.invoiceType === 'COD'     ? 'Cash on Delivery'
                 : inv.invoiceType === 'ADVANCE'  ? 'Online (PayHere) — Advance'
                 : 'Online (PayHere)',
    status: inv.status as InvoiceData['status'],
  };
}

export default function Invoice({ user }: InvoiceProps) {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      navigate('/billing/admin/financial-dashboard');
      return;
    }
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:4000/api/invoices/booking/${bookingId}`);
        if (!response.ok) throw new Error('Invoice not found');
        const data: DBInvoice = await response.json();
        // FIX: map the raw DB document into the shape InvoiceGenerator expects
        setInvoice(mapDBInvoiceToInvoiceData(data));
      } catch (error) {
        console.error('Failed to fetch invoice:', error);
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [bookingId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-purple-600" size={40} />
        <p className="ml-4 text-xl text-gray-600">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4 text-gray-600">Invoice not found.</p>
        </div>
      </div>
    );
  }

  // FIX: Removed the top action bar entirely (Back button + duplicate
  // "Download PDF" button). This page is reached via a public link sent
  // in the customer's email — there's no "back" page to return to, and
  // the duplicate download button used an old implementation with none
  // of the oklch color fixes, so it silently failed while the bottom
  // "Download Invoice (PDF)" button (built into InvoiceGenerator) worked.
  // One correct download button, at the bottom, is all that's needed.
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <InvoiceGenerator invoice={invoice} />
      </div>
    </div>
  );
}
