import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { MapPin, Clock, CheckCircle, Truck, User as UserIcon, Phone, ArrowLeft } from 'lucide-react';
import Header from './Header';
import BackButton from './BackButton';
import type { User } from '../types';

interface TrackingPageProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function TrackingPage({ user, onLogout, theme, onToggleTheme }: TrackingPageProps) {
  const { bookingId } = useParams();
  const [currentStatus, setCurrentStatus] = useState(1);

  useEffect(() => {
    // Simulate status updates
    const timer = setInterval(() => {
      setCurrentStatus((prev) => (prev < 4 ? prev + 1 : prev));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const booking = {
    id: bookingId,
    service: 'Home Cleaning',
    date: '2025-02-12',
    time: '10:00 AM',
    address: 'No. 123, Main Street, Colombo 07',
    cleaner: {
      name: 'John Doe',
      phone: '+94 77 123 4567',
      rating: 4.9,
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    },
  };

  const statusSteps = [
    { id: 1, name: 'Booking Confirmed', icon: CheckCircle, description: 'Your booking has been confirmed' },
    { id: 2, name: 'Staff Assigned', icon: UserIcon, description: 'Cleaner assigned to your booking' },
    { id: 3, name: 'On the Way', icon: Truck, description: 'Cleaner is heading to your location' },
    { id: 4, name: 'Service in Progress', icon: MapPin, description: 'Cleaning service has started' },
    { id: 5, name: 'Completed', icon: CheckCircle, description: 'Service completed successfully' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <h1 className="text-4xl mb-8">Track Your Service</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tracking Timeline */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl mb-6">Service Status</h2>
              
              <div className="relative">
                {statusSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isCompleted = currentStatus > step.id;
                  const isCurrent = currentStatus === step.id;
                  
                  return (
                    <div key={step.id} className="flex gap-4 mb-8 last:mb-0 relative">
                      {index < statusSteps.length - 1 && (
                        <div className={`absolute left-6 top-12 w-0.5 h-full ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-purple-600 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className={`text-lg mb-1 ${isCurrent ? 'text-purple-600' : ''}`}>
                          {step.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                        {isCurrent && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-purple-600">
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                            <span>In Progress</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking & Cleaner Info */}
            <div className="space-y-6">
              {/* Booking Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl mb-4">Booking Details</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Booking ID</div>
                    <div className="font-mono">{booking.id}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Service</div>
                    <div>{booking.service}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Date & Time</div>
                    <div>{booking.date} at {booking.time}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Address</div>
                    <div>{booking.address}</div>
                  </div>
                </div>
              </div>

              {/* Cleaner Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl mb-4">Your Cleaner</h2>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={booking.cleaner.photo}
                    alt={booking.cleaner.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg">{booking.cleaner.name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Verified • {booking.cleaner.rating} ⭐</span>
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${booking.cleaner.phone}`}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call Cleaner
                </a>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl mb-4">Live Location</h2>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">GPS tracking active</p>
                    <p className="text-xs mt-1">ETA: 15 minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}