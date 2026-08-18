import { useState, useEffect } from 'react';
import axios from 'axios';

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
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'ADVANCE_PAID';
  customer: {
    name: string;
  };
  createdAt: string;
}

const StaffDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Retrieve auth token from local storage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            'x-auth-token': token,
          },
        };

        const res = await axios.get('/api/bookings', config);
        setBookings(res.data);
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to fetch bookings.');
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
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post(`/api/bookings/${bookingId}/record-cash-payment`, {}, config);
      // Update the booking in the UI
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b._id === bookingId ? { ...b, balancePaid: true, status: 'COMPLETED' } : b
        )
      );
      alert('Cash payment recorded successfully.');
    } catch (err: any) {
      alert('Failed to record cash payment: ' + (err.response?.data?.msg || 'Server Error'));
    }
  };

  const handleCompleteService = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to mark this service as complete? A payment link may be sent if the balance is not paid.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post(`/api/bookings/${bookingId}/complete`, {}, config);
      // Update status in the UI
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b._id === bookingId ? { ...b, status: 'COMPLETED' } : b
        )
      );
      alert('Service marked as complete.');
    } catch (err: any) {
      alert('Failed to complete service: ' + (err.response?.data?.msg || 'Server Error'));
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
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-b">
                <td className="py-2 px-4">{booking.bookingId}</td>
                <td className="py-2 px-4">{booking.customer.name}</td>
                <td className="py-2 px-4">{booking.serviceType}</td>
                <td className="py-2 px-4">{booking.status}</td>
                <td className="py-2 px-4">LKR {booking.balanceAmount.toFixed(2)}</td>
                <td className="py-2 px-4">{booking.balancePaid ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4">
                  {booking.status === 'ADVANCE_PAID' && !booking.balancePaid && (
                    <button
                      onClick={() => handleRecordCash(booking._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                    >
                      Record Cash
                    </button>
                  )}
                  {booking.status === 'ADVANCE_PAID' && (
                    <button
                      onClick={() => handleCompleteService(booking._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Complete Service
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffDashboard;