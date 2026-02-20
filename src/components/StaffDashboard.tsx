import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  Package, 
  User, 
  MapPin,
  Calendar,
  TrendingUp,
  AlertCircle,
  LogOut,
  DollarSign,
  FileText,
  Send,
  UserCheck,
  UserX,
  XCircle,
  MessageSquare
} from 'lucide-react';
import type { User as UserType } from '../types';
import MaterialUsageForm from './MaterialUsageForm';

interface StaffDashboardProps {
  user: UserType;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

interface Booking {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  address: string;
  status: 'pending' | 'in-progress' | 'completed';
  amount: number;
  paymentMethod: 'cod' | 'online';
  cashReceived?: boolean;
}

export default function StaffDashboard({ user, onLogout, theme, onToggleTheme }: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'schedule'>('tasks');
  const navigate = useNavigate();
  
  // Load staff availability status from localStorage
  const getStaffAvailability = () => {
    const staffStatuses = JSON.parse(localStorage.getItem('staffAvailability') || '{}');
    return staffStatuses[user.email] !== undefined ? staffStatuses[user.email] : true;
  };
  
  const [isAvailable, setIsAvailable] = useState<boolean>(getStaffAvailability());
  
  // Decline task modal state
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedTaskToDecline, setSelectedTaskToDecline] = useState<Booking | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  
  // Material usage form state
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [selectedTaskForMaterial, setSelectedTaskForMaterial] = useState<Booking | null>(null);
  
  // Handle material usage submission
  const handleMaterialUsageSubmit = (usedItems: any[], notes: string) => {
    if (!selectedTaskForMaterial) return;

    // Create material usage record
    const usageRecord = {
      id: `MU-${Date.now()}`,
      taskId: selectedTaskForMaterial.id,
      staffId: user.email,
      staffName: user.name,
      customer: selectedTaskForMaterial.customer,
      service: selectedTaskForMaterial.service,
      items: usedItems,
      notes: notes,
      date: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString(),
      displayTime: new Date().toLocaleTimeString(),
    };

    // Save to localStorage
    const existingRecords = JSON.parse(localStorage.getItem('materialUsageRecords') || '[]');
    existingRecords.unshift(usageRecord);
    localStorage.setItem('materialUsageRecords', JSON.stringify(existingRecords));

    // Update inventory stock levels
    const inventoryItems = JSON.parse(localStorage.getItem('inventoryItems') || '[]');
    usedItems.forEach(usedItem => {
      const itemIndex = inventoryItems.findIndex((item: any) => item.id === usedItem.id);
      if (itemIndex !== -1) {
        inventoryItems[itemIndex].currentStock -= usedItem.quantityUsed;
      }
    });
    localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));

    // Close form
    setShowMaterialForm(false);
    setSelectedTaskForMaterial(null);

    // Show success message
    alert(`✅ Material usage report submitted to admin successfully!\\n\\n${usedItems.length} items recorded.`);
  };
  
  // Handle task decline
  const handleDeclineTask = (booking: Booking) => {
    setSelectedTaskToDecline(booking);
    setDeclineReason('');
    setShowDeclineModal(true);
  };
  
  const confirmDeclineTask = () => {
    if (!selectedTaskToDecline) return;
    
    if (!declineReason.trim()) {
      alert('⚠️ Please provide a reason for declining this task.');
      return;
    }
    
    // Remove the task from staff's bookings
    setBookings(bookings.filter(b => b.id !== selectedTaskToDecline.id));
    
    // Store declined task for admin
    const declinedTasks = JSON.parse(localStorage.getItem('declinedTasks') || '[]');
    const declinedTask = {
      ...selectedTaskToDecline,
      declinedBy: user.email,
      declinedByName: user.name,
      declineReason: declineReason,
      declinedAt: new Date().toISOString(),
      declinedDate: new Date().toLocaleDateString(),
      declinedTime: new Date().toLocaleTimeString(),
      status: 'pending-reassignment',
    };
    declinedTasks.unshift(declinedTask);
    localStorage.setItem('declinedTasks', JSON.stringify(declinedTasks));
    
    // Auto-reassign to another available staff
    autoReassignTask(declinedTask);
    
    // Close modal
    setShowDeclineModal(false);
    setSelectedTaskToDecline(null);
    setDeclineReason('');
    
    alert(`✅ Task declined and forwarded to admin for reassignment.\n\nAnother available staff member will be assigned automatically.`);
  };
  
  const autoReassignTask = (declinedTask: any) => {
    // Get all available staff
    const staffStatuses = JSON.parse(localStorage.getItem('staffAvailability') || '{}');
    const availableStaffEmails = Object.keys(staffStatuses).filter(
      email => staffStatuses[email] === true && email !== user.email
    );
    
    if (availableStaffEmails.length === 0) {
      // No available staff, notify admin
      const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      adminNotifications.unshift({
        id: `NOTIF-${Date.now()}`,
        type: 'task-declined-no-staff',
        taskId: declinedTask.id,
        declinedBy: declinedTask.declinedByName,
        reason: declinedTask.declineReason,
        customer: declinedTask.customer,
        service: declinedTask.service,
        date: declinedTask.date,
        time: declinedTask.time,
        message: `Task ${declinedTask.id} declined by ${declinedTask.declinedByName}. No available staff for reassignment.`,
        timestamp: new Date().toISOString(),
        notificationDate: new Date().toLocaleDateString(),
        notificationTime: new Date().toLocaleTimeString(),
        status: 'unread',
      });
      localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
      return;
    }
    
    // Auto-assign to first available staff (round-robin logic can be improved)
    const newStaffEmail = availableStaffEmails[0];
    
    // Store reassignment
    const reassignments = JSON.parse(localStorage.getItem('taskReassignments') || '[]');
    const reassignment = {
      taskId: declinedTask.id,
      originalStaff: user.email,
      originalStaffName: user.name,
      newStaff: newStaffEmail,
      newStaffName: newStaffEmail.split('@')[0], // Simple name extraction
      reason: declinedTask.declineReason,
      reassignedAt: new Date().toISOString(),
      reassignedDate: new Date().toLocaleDateString(),
      reassignedTime: new Date().toLocaleTimeString(),
      taskDetails: declinedTask,
      status: 'completed',
    };
    reassignments.unshift(reassignment);
    localStorage.setItem('taskReassignments', JSON.stringify(reassignments));
    
    // Notify admin of successful reassignment
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.unshift({
      id: `NOTIF-${Date.now()}`,
      type: 'task-reassigned',
      taskId: declinedTask.id,
      originalStaff: user.name,
      newStaff: reassignment.newStaffName,
      reason: declinedTask.declineReason,
      customer: declinedTask.customer,
      service: declinedTask.service,
      date: declinedTask.date,
      time: declinedTask.time,
      message: `Task ${declinedTask.id} automatically reassigned from ${user.name} to ${reassignment.newStaffName}`,
      timestamp: new Date().toISOString(),
      notificationDate: new Date().toLocaleDateString(),
      notificationTime: new Date().toLocaleTimeString(),
      status: 'unread',
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
  };
  
  // Handle availability toggle
  const handleAvailabilityToggle = () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    
    // Save to localStorage
    const staffStatuses = JSON.parse(localStorage.getItem('staffAvailability') || '{}');
    staffStatuses[user.email] = newStatus;
    localStorage.setItem('staffAvailability', JSON.stringify(staffStatuses));
    
    // Log status change
    const statusLogs = JSON.parse(localStorage.getItem('staffStatusLogs') || '[]');
    statusLogs.unshift({
      staffEmail: user.email,
      staffName: user.name,
      status: newStatus ? 'available' : 'unavailable',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });
    localStorage.setItem('staffStatusLogs', JSON.stringify(statusLogs));
    
    // Show confirmation
    if (newStatus) {
      alert('✅ You are now AVAILABLE for service today. Admin has been notified.');
    } else {
      alert('⚠️ You are now UNAVAILABLE. Admin will be notified to reschedule affected bookings.');
    }
  };
  
  // Mock bookings assigned to staff
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'B001',
      customer: 'John Doe',
      service: 'Home Cleaning',
      date: '2026-02-11',
      time: '10:00 AM',
      address: '123 Main St, Colombo',
      status: 'pending',
      amount: 4500,
      paymentMethod: 'cod',
    },
    {
      id: 'B002',
      customer: 'Jane Smith',
      service: 'Laundry Service',
      date: '2026-02-11',
      time: '02:00 PM',
      address: '456 Lake Rd, Kandy',
      status: 'in-progress',
      amount: 2800,
      paymentMethod: 'online',
      cashReceived: true,
    },
    {
      id: 'B003',
      customer: 'Mike Wilson',
      service: 'Sofa Cleaning',
      date: '2026-02-12',
      time: '11:00 AM',
      address: '789 Park Ave, Galle',
      status: 'pending',
      amount: 3500,
      paymentMethod: 'cod',
    },
    {
      id: 'B004',
      customer: 'Sarah Johnson',
      service: 'Curtain Cleaning',
      date: '2026-02-10',
      time: '09:00 AM',
      address: '321 Beach Rd, Negombo',
      status: 'completed',
      amount: 1500,
      paymentMethod: 'online',
      cashReceived: true,
    },
  ]);

  const updateBookingStatus = (id: string, status: 'pending' | 'in-progress' | 'completed') => {
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, status } : booking
    ));
  };

  const markCashReceived = (id: string) => {
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, cashReceived: true } : booking
    ));
  };

  const handleGenerateInvoice = (booking: Booking) => {
    // Save booking to localStorage for invoice generation
    const mockBooking = {
      bookingId: booking.id,
      serviceType: booking.service,
      date: booking.date,
      time: booking.time,
      address: booking.address,
      price: booking.amount,
      bookingDate: new Date().toISOString(),
      rooms: 1400, // mock value
      discount: 0,
      paidAmount: booking.paymentMethod === 'online' ? booking.amount : 0,
    };
    
    const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const bookingExists = existingBookings.find((b: any) => b.bookingId === booking.id);
    
    if (!bookingExists) {
      existingBookings.push(mockBooking);
      localStorage.setItem('userBookings', JSON.stringify(existingBookings));
    }
    
    // Navigate to invoice page
    navigate(`/invoice/${booking.id}`);
  };

  const handleSendInvoice = (booking: Booking) => {
    // Generate invoice first
    handleGenerateInvoice(booking);
    // In a real app, this would send the invoice via email/SMS
    alert(`Invoice sent to ${booking.customer} for ${booking.service} - LKR ${booking.amount.toLocaleString()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      label: 'Today\'s Tasks',
      value: bookings.filter(b => b.date === '2026-02-11').length,
      icon: ClipboardList,
      color: 'bg-purple-500',
    },
    {
      label: 'In Progress',
      value: bookings.filter(b => b.status === 'in-progress').length,
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      label: 'Completed Today',
      value: bookings.filter(b => b.status === 'completed' && b.date === '2026-02-11').length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      label: 'Pending',
      value: bookings.filter(b => b.status === 'pending').length,
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
  ];

  const schedule = [
    { time: '09:00 AM', task: 'Curtain Cleaning - Sarah Johnson', status: 'completed' },
    { time: '10:00 AM', task: 'Home Cleaning - John Doe', status: 'pending' },
    { time: '02:00 PM', task: 'Laundry Service - Jane Smith', status: 'in-progress' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-purple-600">CLOUD LAUNDRY.LK</h1>
              <p className="text-sm text-gray-600">Staff Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Availability Status Card - Prominent */}
        <div className={`rounded-xl shadow-lg p-6 mb-8 border-2 ${
          isAvailable 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isAvailable ? (
                <UserCheck className="w-12 h-12 text-green-600" />
              ) : (
                <UserX className="w-12 h-12 text-red-600" />
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {isAvailable ? '✅ Available for Service Today' : '⚠️ Unavailable Today'}
                </h3>
                <p className={`mt-1 ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                  {isAvailable 
                    ? 'You are marked as available for service assignments' 
                    : 'You are marked as unavailable. Admin will reschedule your bookings.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleAvailabilityToggle}
              className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                isAvailable 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isAvailable ? 'Mark Unavailable' : 'Mark Available'}
            </button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  My Tasks
                </div>
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'schedule'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Assigned Tasks</h3>
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">{booking.service}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <User className="w-4 h-4" />
                          {booking.customer}
                        </div>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.paymentMethod === 'cod' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {booking.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {booking.date} at {booking.time}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {booking.address}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-lg font-bold text-purple-600">
                        LKR {booking.amount.toLocaleString()}
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {/* Task Status Actions */}
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Start Task
                            </button>
                            <button
                              onClick={() => handleDeclineTask(booking)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              Decline Task
                            </button>
                          </>
                        )}
                        
                        {booking.status === 'in-progress' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              Mark Complete
                            </button>
                            <button
                              onClick={() => handleDeclineTask(booking)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              Decline Task
                            </button>
                          </>
                        )}
                        
                        {booking.status === 'completed' && (
                          <>
                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                              ✓ Task Completed
                            </span>
                            <Link
                              to={`/staff/complete-service/${booking.id}`}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                            >
                              <Package className="w-4 h-4" />
                              Record Material Usage
                            </Link>
                          </>
                        )}
                        
                        {/* Payment Actions */}
                        {booking.paymentMethod === 'cod' && !booking.cashReceived && (
                          <button
                            onClick={() => markCashReceived(booking.id)}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          >
                            Mark Cash Received
                          </button>
                        )}
                        {booking.paymentMethod === 'cod' && booking.cashReceived && (
                          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                            ✓ Cash Received
                          </span>
                        )}
                        
                        {/* Invoice Actions */}
                        <button
                          onClick={() => handleGenerateInvoice(booking)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Generate Invoice
                        </button>
                        <button
                          onClick={() => handleSendInvoice(booking)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Send Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Today's Schedule</h3>
                <div className="space-y-3">
                  {schedule.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold min-w-[100px] text-center">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.task}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/gps-tracking"
              className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <MapPin className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-semibold text-gray-800">GPS Tracking</p>
                <p className="text-sm text-gray-600">Track service locations</p>
              </div>
            </Link>
            <Link
              to="/performance"
              className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-semibold text-gray-800">Performance</p>
                <p className="text-sm text-gray-600">View your stats</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decline Task Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Decline Task</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to decline this task? Please provide a reason.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              placeholder="Reason for declining..."
              rows={4}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeclineTask}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Decline Task
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Material Usage Form Modal */}
      {selectedTaskForMaterial && (
        <MaterialUsageForm
          isOpen={showMaterialForm}
          onClose={() => {
            setShowMaterialForm(false);
            setSelectedTaskForMaterial(null);
          }}
          onSubmit={handleMaterialUsageSubmit}
          taskId={selectedTaskForMaterial.id}
          taskService={selectedTaskForMaterial.service}
          customerName={selectedTaskForMaterial.customer}
        />
      )}
    </div>
  );
}