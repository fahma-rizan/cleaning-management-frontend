import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Banknote, Loader, CheckCircle } from 'lucide-react';
import { socket } from '../socket'; // Import the shared socket instance


// This interface defines the exact shape of the invoice data we expect from our backend API.
interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceType: string;
  status: string;
  customer: {
    userId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  bookingId: string;
  serviceItems: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subTotal: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  notes: string;
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:4000/api';

export default function StaffInvoiceViewer() {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceNumber) {
      setError('No invoice number provided in the URL.');
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/invoices/${invoiceNumber}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to fetch invoice.');
        }
        const data = await response.json();
        setInvoice(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();

    // Listen for real-time updates
    const handleInvoiceUpdate = (updatedInvoice: Invoice) => {
      if (updatedInvoice.invoiceNumber === invoiceNumber) {
        setInvoice(updatedInvoice);
      }
    };

    socket.on('invoiceUpdate', handleInvoiceUpdate);

    return () => {
      socket.off('invoiceUpdate', handleInvoiceUpdate);
    };

  }, [invoiceNumber]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!invoice) {
    return <div className="p-8 text-center text-gray-600">Invoice not found.</div>;
  }

  const handleMarkAsPaid = async () => {
    if (!invoice) return;

    setIsProcessing(true);
    setProcessingError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoice._id}/mark-as-paid`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to mark as paid.');
      }

      // The socket event will update the invoice state, so no need to do it here.
      // setInvoice(await response.json());

    } catch (err: any) {
      setProcessingError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const canMarkAsPaid = invoice.status !== 'PAID' && invoice.balanceAmount > 0;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-2xl font-bold">Staff Invoice View</h1>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Printer className="w-5 h-5" /> Print
          </button>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Invoice #{invoice.invoiceNumber}</h2>
              <p className={`text-sm font-bold ${invoice.status === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>
                Status: {invoice.status}
              </p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
              <p><strong>Booking ID:</strong> {invoice.bookingId}</p>
            </div>
          </div>

          <div className="border-b pb-4 mb-4">
            <h3 className="font-semibold mb-2">Customer Details</h3>
            <p>{invoice.customer.name}</p>
            <p>{invoice.customer.email}</p>
            <p>{invoice.customer.phone}</p>
            <p>{invoice.customer.address}</p>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-2">Service Details</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {invoice.serviceItems.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2">{item.name}</td>
                    <td className="text-right py-2">Rs. {item.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{invoice.notes || 'No notes provided.'}</p>
            </div>
            <div className="text-right">
              <p><strong>Subtotal:</strong> Rs. {invoice.subTotal.toLocaleString()}</p>
              <p><strong>Paid Amount:</strong> Rs. {invoice.paidAmount.toLocaleString()}</p>
              <p className="font-bold text-lg"><strong>Balance Due:</strong> Rs. {invoice.balanceAmount.toLocaleString()}</p>
            </div>
          </div>

          {canMarkAsPaid && (
            <div className="mt-8 text-center print:hidden">
              <button 
                onClick={handleMarkAsPaid}
                disabled={isProcessing}
                className="flex items-center justify-center gap-3 w-full max-w-md mx-auto px-6 py-4 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all disabled:bg-green-400"
              >
                {isProcessing ? (
                  <><Loader className="animate-spin w-6 h-6" /> Processing...</>
                ) : (
                  <><Banknote className="w-6 h-6" /> Confirm Cash Payment Received</>
                )}
              </button>
              {processingError && <p className="text-red-500 mt-4">Error: {processingError}</p>}
            </div>
          )}

          {invoice.status === 'PAID' && (
             <div className="mt-8 text-center print:hidden">
                <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto px-6 py-4 bg-gray-100 text-gray-500 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span>Payment Completed</span>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}