import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import type { Invoice } from './FinancialDashboard'; // We still use the Invoice type for the nested data

// This new interface represents the data coming from our new `GET /api/refunds` endpoint
interface RefundRequest {
  _id: string; // The ID of the Refund document itself
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  refundedAmount: number;
  createdAt: string;
  // The populated invoice details
  invoice: Invoice;
}

interface RefundManagerProps {
  isOpen: boolean;
  onClose: () => void;
}


const API_BASE_URL = 'http://localhost:4000/api';

export default function RefundManager({ isOpen, onClose }: RefundManagerProps) {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchRefunds = async () => {
      if (isOpen) {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch from the new refunds endpoint
          const response = await fetch(`${API_BASE_URL}/refunds`);
          if (!response.ok) {
            throw new Error('Failed to fetch refund requests.');
          }
          const data = await response.json();
          setRefunds(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchRefunds();

    // Note: Real-time updates for this component would need to be adjusted.
    // The `refundUpdate` event on the FinancialDashboard might be sufficient,
    // or we might want a specific event for the manager.
    // For now, we rely on re-fetching when the modal is opened.

  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleApprove = async (refundId: string) => {
    setProcessing(refundId);
    try {
      const response = await fetch(`${API_BASE_URL}/refunds/approve/${refundId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to approve refund');
      }

      // Optimistically remove from the list
      setRefunds(prevRefunds => prevRefunds.filter(r => r._id !== refundId));
      toast.success('Refund approved successfully!');
    } catch (error: any) {
      console.error(`Error approving refund ${refundId}:`, error);
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async (refundId: string) => {
    const reason = prompt('Please provide a reason for denying the refund:');
    if (!reason) {
      return; // User cancelled the prompt
    }

    setProcessing(refundId);
    try {
      const response = await fetch(`${API_BASE_URL}/refunds/reject/${refundId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to deny refund');
      }

      setRefunds(prevRefunds => prevRefunds.filter(r => r._id !== refundId));
      toast.success('Refund denied successfully.');
    } catch (error: any) {
      console.error(`Error denying refund ${refundId}:`, error);
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Pending Refunds</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="animate-spin text-purple-600" size={40} />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <AlertCircle size={48} className="mx-auto" />
              <p className="mt-4 text-lg">Error: {error}</p>
            </div>
          ) : refunds.length > 0 ? (
            refunds.map(refund => (
              <div key={refund._id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold">Invoice: <span className="font-mono">{refund.invoice.invoiceNumber}</span></p>
                  <p className="text-sm text-gray-600">Amount: <span className="font-semibold">Rs. {refund.refundedAmount.toLocaleString()}</span></p>
                  <p className="text-sm text-gray-600">Reason: {refund.reason}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleApprove(refund._id)}
                    disabled={processing === refund._id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300"
                  >
                    <Check size={18} />
                    {processing === refund._id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleDeny(refund._id)}
                    disabled={processing === refund._id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
                  >
                    <X size={18} />
                    {processing === refund._id ? 'Processing...' : 'Deny'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-gray-400" />
              <p className="mt-4 text-lg text-gray-600">No pending refunds.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}