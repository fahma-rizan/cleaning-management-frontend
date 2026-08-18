import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

const API_BASE_URL = 'http://localhost:4000/api';

interface BookingDetails {
  bookingId: string;
  serviceType: string;
  currentDate: string;
  currentTime: string;
  originalDate: string;
  originalTime: string;
  price: number;
  address: string;
}

const ReschedulePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reschedule link');
      setLoading(false);
      return;
    }

    fetchBookingDetails();
  }, [token]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/reschedule/${token}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to load booking details');
      }
      const data = await response.json();
      setBooking(data.booking);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      setError('Please select both date and time');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newDate,
          newTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to reschedule booking');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Rescheduled!</h2>
          <p className="text-gray-600 mb-4">
            Your booking has been successfully rescheduled. You will receive a confirmation email shortly.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Reschedule Booking</h1>
          <p className="text-gray-600 mt-2">Select your new preferred date and time</p>
        </div>

        {booking && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold text-gray-900 mb-2">Current Booking Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Booking ID:</strong> {booking.bookingId}</p>
              <p><strong>Service:</strong> {booking.serviceType}</p>
              <p><strong>Current Date:</strong> {booking.currentDate}</p>
              <p><strong>Current Time:</strong> {booking.currentTime}</p>
              <p><strong>Address:</strong> {booking.address}</p>
              <p><strong>Price:</strong> Rs. {booking.price.toLocaleString()}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Time
            </label>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
              <option value="18:00">6:00 PM</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Rescheduling...
              </>
            ) : (
              'Confirm Reschedule'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel and go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReschedulePage;