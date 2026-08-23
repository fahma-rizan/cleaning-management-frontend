import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, AlertCircle, CheckCircle, BadgePercent } from 'lucide-react';
import Header from './Header';
import type { User } from '../types';

interface ComplaintFormProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function ComplaintForm({ user, onLogout, theme, onToggleTheme }: ComplaintFormProps) {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [complaintData, setComplaintData] = useState({
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    title: '',
    description: ''
  });

  // Get booking details from localStorage
  const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
  const booking = userBookings.find((b: any) => b.bookingId === bookingId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!complaintData.title.trim() || !complaintData.description.trim()) {
      alert('⚠️ Please fill in all required fields.');
      return;
    }

    // Create complaint record
    const complaint = {
      id: `C-${Date.now()}`,
      bookingId: bookingId,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone || '077-1234567',
      serviceType: booking?.serviceType || booking?.serviceName || 'Service',
      serviceName: booking?.serviceName || booking?.serviceType || 'Service',
      serviceDate: booking?.date || new Date().toLocaleDateString(),
      bookingDate: booking?.date || new Date().toLocaleDateString(),
      assignedStaff: 'Staff Member',
      date: new Date().toLocaleDateString(),
      status: 'Pending',
      priority: complaintData.priority,
      title: complaintData.title,
      description: complaintData.description,
      notes: 0,
      internalNotes: '',
      submittedAt: new Date().toISOString()
    };

    // Save to localStorage (for admin to view)
    const complaints = JSON.parse(localStorage.getItem('customerComplaints') || '[]');
    complaints.unshift(complaint);
    localStorage.setItem('customerComplaints', JSON.stringify(complaints));

    setSubmitted(true);

    // Redirect after 3 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">The booking you're trying to submit a complaint for could not be found.</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Complaint Submitted Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your feedback. Your complaint has been submitted and our team will review it shortly.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Complaint ID: <span className="font-bold text-purple-600">{`C-${Date.now()}`}</span>
              </p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Submit a Complaint</h1>
                <p className="text-gray-500">Tell us about your experience</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-2">Booking Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="ml-2 font-medium text-gray-900">{booking.bookingId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Service:</span>
                  <span className="ml-2 font-medium text-gray-900">{booking.serviceType || booking.serviceName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium text-gray-900">{booking.date}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium text-green-600">{booking.status}</span>
                </div>
              </div>
            </div>

            {/* Complaint Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={complaintData.priority}
                  onChange={(e) => setComplaintData({ ...complaintData, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                >
                  <option value="Low">Low - Minor issue</option>
                  <option value="Medium">Medium - Moderate concern</option>
                  <option value="High">High - Urgent issue (price reduction)</option>
                </select>
              </div>

              {/* Price Reduction shortcut — a High-priority complaint is
                  usually about the service falling short of what was paid
                  for, so offer the price-reduction request flow directly
                  instead of making the customer find it themselves. */}
              {complaintData.priority === 'High' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex gap-3 items-start">
                    <BadgePercent className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-orange-800">
                      <p className="font-semibold mb-1">Looking for a price reduction instead?</p>
                      <p>You can request a partial refund for this booking directly.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/billing/price-reduction')}
                    className="shrink-0 bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-colors font-bold text-sm"
                  >
                    Price Reduction
                  </button>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Complaint Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={complaintData.title}
                  onChange={(e) => setComplaintData({ ...complaintData, title: e.target.value })}
                  placeholder="Brief summary of your complaint"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={complaintData.description}
                  onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                  placeholder="Please provide detailed information about your complaint..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Please be specific about the issue you experienced
                </p>
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Your complaint will be reviewed</p>
                    <p>Our team will investigate your complaint and get back to you within 24-48 hours.</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-4 rounded-lg hover:bg-orange-700 transition-colors font-bold text-lg"
                >
                  Submit Complaint
                </button>
                <Link
                  to="/dashboard"
                  className="px-8 bg-gray-200 text-gray-700 py-4 rounded-lg hover:bg-gray-300 transition-colors font-bold text-lg"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
