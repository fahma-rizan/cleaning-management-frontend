import { Calendar, Clock, MapPin, Edit, Trash2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookingCardProps {
  booking: any;
  onReschedule: (booking: any) => void;
  onCancel: (booking: any) => void;
}

export default function BookingCard({ booking, onReschedule, onCancel }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';
      case 'completed':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
      default:
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-purple-300 dark:hover:border-purple-600 transition-all hover:shadow-md">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h3 className="text-xl dark:text-white font-medium">
                {booking.serviceType || booking.serviceName || 'Cleaning Service'}
              </h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Booking ID: <span className="font-mono">{booking.bookingId}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold mb-1 dark:text-white">
            LKR {booking.price?.toLocaleString()}
          </div>
          <Link
            to={`/tracking/${booking.bookingId}`}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            Track Service →
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>{booking.date}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>{booking.time}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="truncate">{booking.address?.slice(0, 30)}...</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <>
            <button
              onClick={() => onReschedule(booking)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors font-medium"
            >
              <Edit className="w-4 h-4" />
              Reschedule
            </button>
            <button
              onClick={() => onCancel(booking)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Cancel
            </button>
          </>
        )}
        <Link
          to={`/invoice/${booking.bookingId}`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors font-medium"
        >
          <FileText className="w-4 h-4" />
          View Invoice
        </Link>
      </div>
    </div>
  );
}