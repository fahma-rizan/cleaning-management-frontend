import React from 'react';
import { Calendar, Clock, Package, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Staff count scales with the service's size/quantity (backend
// getRequiredStaffCount) rather than being a fixed team size, so this reads
// however many ended up assigned instead of assuming 1 or 3.
const getStaffCount = (booking: any): number => {
  if (booking.assignedTeam && booking.assignedTeam.length > 0) return booking.assignedTeam.length;
  return booking.assignedStaffId ? 1 : 0;
};

interface UpcomingBookingsListProps {
  bookings: any[];
  onReschedule: (booking: any) => void;
  onCancel: (booking: any) => void;
}

export default function UpcomingBookingsList({ bookings, onReschedule, onCancel }: UpcomingBookingsListProps) {
  return (
    <div className="space-y-4">
      {bookings.map((booking, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <Package className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {booking.serviceType || booking.serviceName || 'Cleaning Service'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                  Booking ID: {booking.bookingId}
                </p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {booking.status || 'Scheduled'}
            </span>
          </div>

          {/* Booking Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Date</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{booking.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Time</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{booking.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:col-start-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Staff Count</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {getStaffCount(booking) > 0
                    ? `${getStaffCount(booking)} Staff Member${getStaffCount(booking) > 1 ? 's' : ''}`
                    : 'To be assigned'}
                </p>
              </div>
            </div>
            {booking.address && (
              <div className="flex items-center gap-3 md:col-span-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Location</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{booking.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Laundry only — pickup is shown above via Date/Time; delivery is
              a separate, independently-scheduled slot (see the booking
              flow's Simple Laundry Booking Logic). */}
          {booking.deliveryDate && booking.deliveryTime && (
            <div className="flex items-center gap-3 mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-purple-500 dark:text-purple-400 font-semibold uppercase tracking-wider">Delivery</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {booking.deliveryDate} · {booking.deliveryTime}
                </p>
              </div>
            </div>
          )}

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                LKR {booking.price?.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onReschedule(booking)}
                className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold text-sm transition-all shadow-lg shadow-purple-500/20"
              >
                <Edit className="w-4 h-4" /> {/*reschedule icon*/}
                Reschedule
              </button>
              <button
                onClick={() => onCancel(booking)}
                className="flex items-center gap-2 px-5 py-3 border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm transition-all"
              >
                <Trash2 className="w-4 h-4" /> {/*cancel icon*/}
                Cancel
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
