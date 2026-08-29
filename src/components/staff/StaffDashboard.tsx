import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../../utils/auth';

const API_BASE_URL = 'http://localhost:4000/api';

// Define the shape of a booking object
interface Booking {
  _id: string;
  bookingId: string;
  serviceType: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentMethod: string;
  balancePaid: boolean;
  // FIX (A.3, Tier 1.3): this was typed as an UPPERCASE union ('ADVANCE_PAID'
  // etc.), matching status === 'ADVANCE_PAID' checks below that never
  // actually matched — the real backend status enum (models/Booking.js) is
  // lowercase ('pending'/'confirmed'/'in-progress'/'completed'/'cancelled'),
  // and there is no 'ADVANCE_PAID' value anywhere in it. Every Record-Cash /
  // Complete-Service / Generate-Invoice button gated on that string was
  // therefore permanently hidden for every real booking — staff had no
  // working way to record a cash balance settlement or push an
  // advance-balance job to complete. Fixed below by checking the real
  // fields instead: paymentMethod === 'advance-balance' && !balancePaid &&
  // status not yet 'completed'/'cancelled'.
  status: string;
  customer: {
    name: string;
  };
  createdAt: string;
}

// FIX (Tier 1.3): this whole component's auth was silently broken —
// localStorage.getItem('token') (a key nothing else in the app ever writes;
// the real convention is tokenStorage's 'accessToken'/'refreshToken' keys)
// sent as an 'x-auth-token' header, which middleware/auth.js doesn't read at
// all (it only checks the 'Authorization: Bearer <token>' header). Every
// request from this page was effectively unauthenticated — it only ever
// "worked" because auth.js has a NODE_ENV==='development' bypass that
// fabricates a fake admin user when no Authorization header is present.
// Outside dev (or once that bypass is removed) every call here would 401.
// Also switched bare '/api/...' paths to the same API_BASE_URL convention
// every other page uses — there's no dev-server proxy configured, so a
// relative path resolves against the frontend's own origin, not :4000.
const StaffDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = (): Record<string, string> => {
    const token = tokenStorage.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings`, { headers: authHeaders() });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.msg || 'Failed to fetch bookings.');
        }
        const data = await res.json();
        setBookings(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bookings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleRecordCash = async (bookingId: string) => {
    if (!window.confirm('Are you sure you have received the cash payment for this booking?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/record-cash-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.msg || 'Server Error');
      }
      // Update the booking in the UI — real lowercase status, matching what
      // the backend actually sets in routes/booking.js's /record-cash-payment.
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b._id === bookingId ? { ...b, balancePaid: true, status: 'completed' } : b
        )
      );
      alert('Cash payment recorded successfully.');
    } catch (err: any) {
      alert('Failed to record cash payment: ' + (err.message || 'Server Error'));
    }
  };

  // NEW (Tier 2.2, C.2) — 'in-progress' was a dead status value nothing
  // ever set. This is the missing "Start" action the spec calls for; the
  // customer gets a "Service Started" notification from the backend.
  const handleStartJob = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.msg || 'Server Error');
      }
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b._id === bookingId ? { ...b, status: 'in-progress' } : b
        )
      );
    } catch (err: any) {
      alert('Failed to start job: ' + (err.message || 'Server Error'));
    }
  };

  const handleCompleteService = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to mark this service as complete? A payment link may be sent if the balance is not paid.')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.msg || 'Server Error');
      }
      // Update status in the UI — real lowercase status
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b._id === bookingId ? { ...b, status: 'completed' } : b
        )
      );
      alert('Service marked as complete.');
    } catch (err: any) {
      alert('Failed to complete service: ' + (err.message || 'Server Error'));
    }
  };


  if (loading) return <div className="text-center p-8">Loading bookings...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4">Booking ID</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Service</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Balance Amount</th>
              <th className="py-2 px-4">Balance Paid</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {bookings.map((booking) => {
              // The single condition every advance-balance action button
              // below shares: balance still outstanding, job not yet
              // finished either way.
              const balanceSettleable =
                booking.paymentMethod === 'advance-balance' &&
                !booking.balancePaid &&
                !['completed', 'cancelled'].includes(booking.status);

              return (
              <tr key={booking._id} className="border-b">
                <td className="py-2 px-4">{booking.bookingId}</td>
                <td className="py-2 px-4">{booking.customer.name}</td>
                <td className="py-2 px-4">{booking.serviceType}</td>
                <td className="py-2 px-4">{booking.status}</td>
                <td className="py-2 px-4">LKR {booking.balanceAmount.toFixed(2)}</td>
                <td className="py-2 px-4">{booking.balancePaid ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4">
                  {/* NEW (Tier 2.2, C.2) — the missing "Start" action. */}
                  {['pending', 'confirmed'].includes(booking.status) && (
                    <button
                      onClick={() => handleStartJob(booking._id)}
                      className="bg-purple-500 text-white px-3 py-1 rounded mr-2 hover:bg-purple-600"
                    >
                      Start Job
                    </button>
                  )}
                  {balanceSettleable && (
                    <button
                      onClick={() => handleRecordCash(booking._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                    >
                      Record Cash
                    </button>
                  )}
                  {balanceSettleable && (
                    <button
                      onClick={() => handleCompleteService(booking._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                      title="Marks the job done and sends the customer an online balance payment link, instead of collecting cash on-site"
                    >
                      Complete Service (Online Balance)
                    </button>
                  )}
                  {/* NEW — staff "Generate Invoice" for the outstanding balance.
                      Navigates to the existing staff invoice page, pre-filled
                      from this booking's real advance invoice; staff only pick
                      a payment method there and save. See StaffInvoicePage.tsx
                      and controllers/invoiceController.js (getInvoicePrefillData /
                      createBalanceInvoice) for the rest of this flow.
                      FIX (B.1): added the same status==='completed' guard the
                      COD/PAC branch below already had — previously staff could
                      manually generate a -BAL invoice for a job that hadn't
                      actually been done yet. */}
                  {booking.status === 'completed' && booking.paymentMethod === 'advance-balance' && !booking.balancePaid && (
                    <button
                      onClick={() => navigate(`/staff-invoice/new?bookingId=${booking._id}`)}
                      className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800"
                    >
                      Generate Invoice
                    </button>
                  )}
                  {/* NEW — same "Generate Invoice" flow, for COD / Pay-After-
                      Completion bookings once the job is actually done. Checks
                      the real lowercase status value ('completed'), unlike the
                      pre-existing checks above. StaffInvoicePage.tsx pre-fills
                      everything from the booking and shows "already invoiced"
                      if one exists already (e.g. auto-created by /complete) —
                      no need to check that here. */}
                  {booking.status === 'completed' && ['cod', 'pay-after-completion'].includes(booking.paymentMethod) && (
                    <button
                      onClick={() => navigate(`/staff-invoice/new?bookingId=${booking._id}`)}
                      className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800"
                    >
                      Generate Invoice
                    </button>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffDashboard;
