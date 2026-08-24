import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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
  FileText,
  Send,
  UserCheck,
  UserX,
  X,
  Upload,
  Save,
} from "lucide-react";
import type { User as UserType } from "../types";
import MaterialUsageForm from "./MaterialUsageForm";
import InvoiceGenerator from "./InvoiceGenerator";
import type { InvoiceData } from "./InvoiceGenerator";
import { fetchWithAuth } from "../utils/api";

interface StaffDashboardProps {
  user: UserType;
  onLogout: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

interface TeamMember {
  staffId: string;
  staffName: string;
  staffEmail: string;
}

interface Booking {
  _id: string;
  id: string;
  bookingId?: string;
  customer: string;
  customerEmail: string;
  service: string;
  date: string;
  time: string;
  address: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  amount: number;
  paymentMethod: string;
  cashReceived: boolean;
  isTeam: boolean;
  teamMembers: TeamMember[];
  // Laundry pickup + delivery — present only on laundry bookings.
  laundryStatus?: "booking-confirmed" | "picked-up" | "in-progress" | "delivered" | "completed";
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryStaffName?: string;
  isPickupStaff?: boolean;
  isDeliveryStaff?: boolean;
}

export default function StaffDashboard({
  user,
  onLogout,
  theme: _theme,
  onToggleTheme: _onToggleTheme,
}: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState<"tasks" | "schedule" | "completed">("tasks");
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittedMaterialIds, setSubmittedMaterialIds] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('submittedMaterialUsage') || '[]'))
  );

  // Profile edit modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName:        '',
    phone:           '',
    address:         '',
    specializations: [] as string[],
    nic:             '',
  });
  const [photoPreview, setPhotoPreview]   = useState<string | null>(null);
  const [photoBase64, setPhotoBase64]     = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError]   = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const SPECS = ['Home Cleaning', 'Laundry Service', 'Sofa/Mattress Cleaning', 'Curtain Cleaning'];

  const openProfileModal = async () => {
    try {
      const data = await fetchWithAuth('/staff/me');
      if (data.success) {
        const s = data.staff;
        setProfileForm({
          fullName:        s.name        || user.name || '',
          phone:           s.phone       || '',
          address:         s.address     || '',
          specializations: s.specializations || [],
          nic:             s.nic         || '',
        });
        setPhotoPreview(s.profilePhoto || user.image || null);
        setPhotoBase64(null);
      }
    } catch {
      setProfileForm({ fullName: user.name || '', phone: '', address: '', specializations: [], nic: '' });
    }
    setProfileError('');
    setShowProfileModal(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!profileForm.fullName.trim()) { setProfileError('Full name is required.'); return; }
    setProfileSaving(true);
    setProfileError('');
    try {
      const payload: any = {
        fullName:        profileForm.fullName,
        phone:           profileForm.phone,
        address:         profileForm.address,
        specializations: profileForm.specializations,
      };
      if (photoBase64) payload.profilePhoto = photoBase64;

      const data = await fetchWithAuth('/staff/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (data.success) {
        setShowProfileModal(false);
      } else {
        setProfileError(data.message || 'Update failed.');
      }
    } catch {
      setProfileError('Network error. Please try again.');
    }
    setProfileSaving(false);
  };

  const fetchBookings = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await fetchWithAuth('/bookings/assigned');
      if (data.success) {
        setBookings(data.bookings);
        setIsAvailable(data.isAvailable ?? true);
      }
    } catch (err) {
      console.error('Failed to load staff data:', err);
    }
    if (showLoader) setLoading(false);
  };

  // Initial load + polling every 30 s so team status stays in sync
  useEffect(() => {
    fetchBookings(true);
    const interval = setInterval(() => fetchBookings(false), 30000);
    return () => clearInterval(interval);
  }, []);

  // Re-read submitted material IDs when the tab regains focus (staff returns from CompleteServiceForm)
  useEffect(() => {
    const refresh = () => {
      setSubmittedMaterialIds(
        new Set(JSON.parse(localStorage.getItem('submittedMaterialUsage') || '[]'))
      );
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // Decline task modal state
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedTaskToDecline, setSelectedTaskToDecline] =
    useState<Booking | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  // Unavailability request modal state — becoming Unavailable now requires
  // admin approval; it's no longer an immediate self-toggle.
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState("");
  const [submittingUnavailable, setSubmittingUnavailable] = useState(false);
  const [pendingAvailabilityRequest, setPendingAvailabilityRequest] =
    useState<{ _id: string; reason: string; createdAt: string } | null>(null);

  // Check for an already-pending request on load (survives page refresh)
  useEffect(() => {
    fetchWithAuth('/staff-requests/availability/mine')
      .then((data) => { if (data?.success) setPendingAvailabilityRequest(data.request); })
      .catch(() => {});
  }, []);

  // Material usage form state
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [selectedTaskForMaterial, setSelectedTaskForMaterial] =
    useState<Booking | null>(null);

  // Invoice modal state
  const [invoiceModalData, setInvoiceModalData] = useState<InvoiceData | null>(null);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);

  // Payment methods where cash/payment must be collected in person after the job
  const isDeferredPayment = (method: string) =>
    ['cod', 'pay-after-completion'].includes(method);

  const paymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'cod':                  'Cash on Delivery',
      'pay-after-completion': 'Pay After Service',
      'full-online':          'Paid Online',
      'advance-balance':      'Advance Payment',
      'online':               'Paid Online',
      'card':                 'Card Payment',
      'cash':                 'Cash',
    };
    return labels[method] || method;
  };

  // A completed task is fully done (ready to leave My Tasks) when:
  // material usage submitted + cash received (deferred payments only)
  const isTaskDone = (b: Booking) =>
    b.status === "completed" &&
    submittedMaterialIds.has(b._id) &&
    (!isDeferredPayment(b.paymentMethod) || b.cashReceived);

  const buildInvoiceData = (booking: Booking): InvoiceData => {
    const now       = new Date();
    const dateStr   = now.toISOString().split('T')[0].replace(/-/g, '');
    const code      = booking.service.substring(0, 3).toUpperCase();
    const rand      = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const total     = booking.amount;
    const paid      = isDeferredPayment(booking.paymentMethod) ? 0 : total;
    const balance   = total - paid;
    const status: InvoiceData['status'] = balance === 0 ? 'paid' : paid > 0 ? 'partial' : 'pending';
    return {
      invoiceNumber: `INV-${code}-${dateStr}-${rand}`,
      invoiceType:   isDeferredPayment(booking.paymentMethod) ? 'cod' : 'full',
      date:          now.toLocaleDateString(),
      time:          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bookingId:     booking.bookingId || booking._id,
      customer: {
        name:    booking.customer,
        email:   booking.customerEmail || '—',
        phone:   '—',
        address: booking.address,
      },
      service: {
        name: booking.service,
        date: booking.date,
        time: booking.time,
      },
      pricing: {
        basePrice:    total,
        total,
        paidAmount:   paid,
        balanceAmount: balance,
      },
      paymentMethod: paymentMethodLabel(booking.paymentMethod),
      status,
    };
  };

  // Handle material usage submission (localStorage — not in this workload scope)
  const handleMaterialUsageSubmit = (usedItems: any[], notes: string) => {
    if (!selectedTaskForMaterial) return;

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

    const existingRecords = JSON.parse(
      localStorage.getItem("materialUsageRecords") || "[]",
    );
    existingRecords.unshift(usageRecord);
    localStorage.setItem(
      "materialUsageRecords",
      JSON.stringify(existingRecords),
    );

    const inventoryItems = JSON.parse(
      localStorage.getItem("inventoryItems") || "[]",
    );
    usedItems.forEach((usedItem) => {
      const itemIndex = inventoryItems.findIndex(
        (item: any) => item.id === usedItem.id,
      );
      if (itemIndex !== -1) {
        inventoryItems[itemIndex].currentStock -= usedItem.quantityUsed;
      }
    });
    localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));

    setShowMaterialForm(false);
    setSelectedTaskForMaterial(null);

    toast.success(`Material usage report submitted — ${usedItems.length} items recorded.`);
  };

  // Opens decline modal
  const handleDeclineTask = (booking: Booking) => {
    setSelectedTaskToDecline(booking);
    setDeclineReason("");
    setShowDeclineModal(true);
  };

  // Sends decline request to backend → auto-reassign happens server-side
  const confirmDeclineTask = async () => {
    if (!selectedTaskToDecline) return;

    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining this task.");
      return;
    }

    try {
      const result = await fetchWithAuth(
        `/bookings/${selectedTaskToDecline._id}/decline`,
        {
          method: 'PATCH',
          body: JSON.stringify({ reason: declineReason }),
        },
      );

      if (result.success) {
        setShowDeclineModal(false);
        setSelectedTaskToDecline(null);
        setDeclineReason("");
        await fetchBookings(false);
        toast.success(
          result.message ||
          "Decline request sent to admin for approval. The task remains assigned to you until the admin approves it.",
        );
      } else {
        toast.error("Failed to decline task: " + result.message);
      }
    } catch (err) {
      console.error('Decline task error:', err);
      toast.error("Failed to decline task. Please try again.");
    }
  };

  // Becoming Unavailable now requires admin approval — opens a reason modal
  // instead of toggling immediately. Ending an already-approved leave early
  // (going back to Available) is still immediate, no approval needed.
  const handleAvailabilityToggle = async () => {
    if (isAvailable) {
      setUnavailableReason("");
      setShowUnavailableModal(true);
      return;
    }
    try {
      const data = await fetchWithAuth('/staff-requests/availability/end', { method: 'PATCH' });
      if (data.success) {
        setIsAvailable(true);
        toast.success("You are now AVAILABLE for service today.");
      }
    } catch (err) {
      console.error('End unavailability error:', err);
    }
  };

  const submitUnavailabilityRequest = async () => {
    if (!unavailableReason.trim()) {
      toast.error("Please provide a reason for going unavailable.");
      return;
    }
    setSubmittingUnavailable(true);
    try {
      const data = await fetchWithAuth('/staff-requests/availability', {
        method: 'POST',
        body: JSON.stringify({ reason: unavailableReason }),
      });
      if (data.success) {
        setPendingAvailabilityRequest(data.request);
        setShowUnavailableModal(false);
        setUnavailableReason("");
        toast.success(data.message || "Unavailability request submitted — waiting for admin approval.");
      } else {
        toast.error(data.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error('Request unavailability error:', err);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setSubmittingUnavailable(false);
    }
  };

  // Start / Complete a task via backend
  const updateBookingStatus = async (
    id: string,
    status: "in-progress" | "completed",
  ) => {
    try {
      const endpoint = status === "in-progress"
        ? `/bookings/${id}/start`
        : `/bookings/${id}/complete`;

      const result = await fetchWithAuth(endpoint, { method: 'PATCH' });

      if (result.success) {
        setBookings(
          bookings.map((booking) =>
            booking._id === id ? { ...booking, status } : booking,
          ),
        );
        if (status === "completed") {
          toast.success(
            "Service marked as completed! Customer has been notified and can now submit a review or complaint.",
          );
        }
      }
    } catch (err) {
      console.error('updateBookingStatus error:', err);
    }
  };

  // Advances a laundry booking one step through Booking Confirmed → Picked
  // Up → In Progress → Delivered → Completed. Either the pickup or delivery
  // staff member can advance any stage (see backend updateLaundryStatus).
  const LAUNDRY_STAGE_ORDER = ["booking-confirmed", "picked-up", "in-progress", "delivered", "completed"] as const;
  const advanceLaundryStage = async (booking: Booking) => {
    const currentIdx = LAUNDRY_STAGE_ORDER.indexOf(booking.laundryStatus || "booking-confirmed");
    const nextStage = LAUNDRY_STAGE_ORDER[currentIdx + 1];
    if (!nextStage) return;
    try {
      const result = await fetchWithAuth(`/bookings/${booking._id}/laundry-status`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: nextStage }),
      });
      if (result.success) {
        setBookings(bookings.map((b) =>
          b._id === booking._id
            ? { ...b, laundryStatus: nextStage, status: result.booking.status }
            : b,
        ));
        if (nextStage === "completed") {
          toast.success("Laundry delivered and completed! Customer has been notified.");
        }
      } else {
        toast.error(result.message || "Failed to update laundry status.");
      }
    } catch (err) {
      console.error('advanceLaundryStage error:', err);
      toast.error("Failed to update laundry status. Please try again.");
    }
  };

  // Mark cash collected for COD tasks
  const markCashReceived = async (id: string) => {
    try {
      const result = await fetchWithAuth(`/bookings/${id}/cash-received`, {
        method: 'PATCH',
      });
      if (result.success) {
        setBookings(
          bookings.map((booking) =>
            booking._id === id ? { ...booking, cashReceived: true } : booking,
          ),
        );
      }
    } catch (err) {
      console.error('markCashReceived error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const stats = [
    {
      label: "Today's Tasks",
      value: bookings.filter((b) => b.date === today).length,
      icon: ClipboardList,
      color: "bg-purple-500",
    },
    {
      label: "In Progress",
      value: bookings.filter((b) => b.status === "in-progress").length,
      icon: Clock,
      color: "bg-blue-500",
    },
    {
      label: "Completed Today",
      value: bookings.filter(
        (b) => b.status === "completed" && b.date === today,
      ).length,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "Pending",
      value: bookings.filter((b) =>
        ["pending", "confirmed"].includes(b.status)
      ).length,
      icon: AlertCircle,
      color: "bg-yellow-500",
    },
  ];

  // Today's bookings sorted by time, formatted for the Schedule tab
  const schedule = bookings
    .filter((b) => b.date === today)
    .map((b) => ({
      time:   b.time,
      task:   `${b.service} - ${b.customer}`,
      status: b.status,
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-purple-600">
                CLOUD LAUNDRY.LK
              </h1>
              <p className="text-sm text-gray-600">Staff Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              {/* Profile avatar — click to edit profile */}
              <button
                onClick={openProfileModal}
                title="edit Profile"
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-300 shrink-0 bg-purple-100 flex items-center justify-center hover:border-purple-500 transition-colors"
              >
                {photoPreview || user.image ? (
                  <img src={photoPreview || user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-purple-700 font-bold text-sm">
                    {user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                )}
              </button>
              
              {/*logout button*/}
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
        {/* Availability Status Card */}
        <div
          className={`rounded-xl shadow-lg p-6 mb-8 border-2 ${
            pendingAvailabilityRequest
              ? "bg-amber-50 border-amber-500"
              : isAvailable
              ? "bg-green-50 border-green-500"
              : "bg-red-50 border-red-500"
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {pendingAvailabilityRequest ? (
                <Clock className="w-12 h-12 text-amber-600" />
              ) : isAvailable ? (
                <UserCheck className="w-12 h-12 text-green-600" />
              ) : (
                <UserX className="w-12 h-12 text-red-600" />
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {pendingAvailabilityRequest
                    ? "⏳ Unavailability Request Pending"
                    : isAvailable
                    ? "✅ Available for Service Today"
                    : "⚠️ Unavailable Today"}
                </h3>
                <p
                  className={`mt-1 ${
                    pendingAvailabilityRequest ? "text-amber-700" : isAvailable ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {pendingAvailabilityRequest
                    ? `Waiting for admin approval — reason: "${pendingAvailabilityRequest.reason}". You remain Available until approved.`
                    : isAvailable
                    ? "You are marked as available for service assignments"
                    : "You are marked as unavailable. Admin has approved your leave."}
                </p>
              </div>
            </div>
            {/* mark unavailability button */}
            <button
              onClick={handleAvailabilityToggle}
              disabled={!!pendingAvailabilityRequest}
              className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                isAvailable
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {pendingAvailabilityRequest
                ? "Request Pending..."
                : isAvailable
                ? "Mark Unavailable"
                : "Mark Available"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value}
                  </p>
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
                onClick={() => setActiveTab("tasks")}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === "tasks"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  My Tasks
                </div>
              </button>
              <button
                onClick={() => setActiveTab("schedule")}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === "schedule"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule
                </div>
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === "completed"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Completed Tasks
                  {bookings.filter(isTaskDone).length > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {bookings.filter(isTaskDone).length}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "tasks" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Assigned Tasks
                </h3>
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Loading tasks...</p>
                ) : bookings.filter(b => !isTaskDone(b)).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No active tasks assigned.</p>
                ) : (
                  bookings.filter(b => !isTaskDone(b)).map((booking) => (
                    <div
                      key={booking._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-lg">
                            {booking.service}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <User className="w-4 h-4" />
                            {booking.customer}
                          </div>
                          <div className="mt-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                isDeferredPayment(booking.paymentMethod)
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {paymentMethodLabel(booking.paymentMethod)}
                            </span>
                            {booking.isTeam && (
                              <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Team Task
                              </span>
                            )}
                          </div>

                          {/* Team members */}
                          {booking.isTeam && booking.teamMembers.length > 0 && (
                            <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-100">
                              <p className="text-xs font-semibold text-purple-700 mb-1">Team Members:</p>
                              <div className="flex flex-wrap gap-1">
                                {booking.teamMembers.map((m, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      m.staffEmail === user.email
                                        ? "bg-purple-200 text-purple-900 font-bold"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {m.staffEmail === user.email ? `${m.staffName} (You)` : m.staffName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status,
                          )}`}
                        >
                          {(booking.laundryStatus || booking.status).replace(/-/g, " ").toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {booking.laundryStatus ? 'Pickup: ' : ''}{booking.date} at {booking.time}
                          {booking.isPickupStaff && booking.laundryStatus && <span className="text-purple-600 font-semibold"> (You)</span>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {booking.address}
                        </div>
                        {booking.laundryStatus && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
                            <Calendar className="w-4 h-4" />
                            Delivery: {booking.deliveryDate} at {booking.deliveryTime}
                            {' — '}{booking.deliveryStaffName || 'unassigned'}
                            {booking.isDeliveryStaff && <span className="text-purple-600 font-semibold"> (You)</span>}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-lg font-bold text-purple-600">
                          LKR {booking.amount.toLocaleString()}
                        </span>
                        <div className="flex gap-2 flex-wrap">
                          {/* Laundry pickup + delivery — separate stage flow
                              instead of the generic Start/Complete below.
                              Either the pickup or delivery staff member can
                              advance any stage (matches the backend, which
                              doesn't hard-split who can touch what). */}
                          {booking.laundryStatus ? (
                            booking.laundryStatus === "completed" ? (
                              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                ✓ Delivered & Completed
                              </span>
                            ) : (
                              <button
                                onClick={() => advanceLaundryStage(booking)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                {{
                                  "booking-confirmed": "Mark Picked Up",
                                  "picked-up": "Start Processing",
                                  "in-progress": "Mark Delivered",
                                  "delivered": "Mark Completed",
                                }[booking.laundryStatus]}
                              </button>
                            )
                          ) : (
                            <>
                              {/* Task Status Actions */}
                              {(booking.status === "pending" ||
                                booking.status === "confirmed") && (
                                <>
                                  {/*assigned task buttons */}
                                  <button
                                    onClick={() =>
                                      updateBookingStatus(booking._id, "in-progress")
                                    }
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

                              {booking.status === "in-progress" && (
                                <>
                                  <button
                                    onClick={() =>
                                      updateBookingStatus(booking._id, "completed")
                                    }
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
                            </>
                          )}

                          {booking.status === "completed" && (
                            <>
                              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                ✓ Task Completed
                              </span>
                              {submittedMaterialIds.has(booking._id) ? (
                                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                  <Package className="w-4 h-4" />
                                  ✓ Submitted Material Usage
                                </span>
                              ) : (
                                <Link
                                  to={`/staff/complete-service/${booking._id}`}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                                >
                                  <Package className="w-4 h-4" />
                                  Record Material Usage
                                </Link>
                              )}
                            </>
                          )}

                          {/* Cash collection */}
                          {isDeferredPayment(booking.paymentMethod) &&
                            !booking.cashReceived && (
                              <button
                                onClick={() => markCashReceived(booking._id)}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                              >
                                Mark Cash Received
                              </button>
                            )}
                          {isDeferredPayment(booking.paymentMethod) &&
                            booking.cashReceived && (
                              <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                                ✓ Cash Received
                              </span>
                            )}

                          {/* assigned task Invoice buttons */}
                          <button
                            type="button"
                            onClick={() => setInvoiceModalData(buildInvoiceData(booking))}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Generate Invoice
                          </button>
                          <button
                            type="button"
                            disabled={sendingInvoiceId === booking._id}
                            onClick={async () => {
                              setSendingInvoiceId(booking._id);
                              try {
                                const result = await fetchWithAuth(`/bookings/${booking._id}/send-invoice`, { method: 'POST' });
                                if (result.success) {
                                  toast.success(result.message);
                                } else {
                                  toast.error(result.message);
                                }
                              } catch {
                                toast.error('Failed to send invoice. Please try again.');
                              }
                              setSendingInvoiceId(null);
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            {sendingInvoiceId === booking._id ? 'Sending…' : 'Send Invoice'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Today's Schedule
                </h3>
                {schedule.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No tasks scheduled for today.</p>
                ) : (
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
                            item.status,
                          )}`}
                        >
                          {item.status.replace(/-/g, " ").toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "completed" && (() => {
              const completedBookings = bookings
                .filter(isTaskDone)
                .slice()
                .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Completed Tasks</h3>
                    <span className="text-sm text-gray-500">{completedBookings.length} task{completedBookings.length !== 1 ? 's' : ''} completed</span>
                  </div>
                  {completedBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No completed tasks yet.</p>
                    </div>
                  ) : (
                    completedBookings.map(booking => (
                      <div key={booking._id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg">{booking.service}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <User className="w-4 h-4" />
                              {booking.customer}
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            COMPLETED
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
                        <div className="flex justify-between items-center pt-3 border-t border-green-200">
                          <span className="text-lg font-bold text-purple-600">LKR {booking.amount.toLocaleString()}</span>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setInvoiceModalData(buildInvoiceData(booking))}
                              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              Generate Invoice
                            </button>
                            <button
                              type="button"
                              disabled={sendingInvoiceId === booking._id}
                              onClick={async () => {
                                setSendingInvoiceId(booking._id);
                                try {
                                  const result = await fetchWithAuth(`/bookings/${booking._id}/send-invoice`, { method: 'POST' });
                                  result.success ? toast.success(result.message) : toast.error(result.message);
                                } catch {
                                  toast.error('Failed to send invoice.');
                                }
                                setSendingInvoiceId(null);
                              }}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                            >
                              <Send className="w-4 h-4" />
                              {sendingInvoiceId === booking._id ? 'Sending…' : 'Send Invoice'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Decline Task
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to decline this task? Please provide a
              reason.
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

      {/* Request Unavailability Modal */}
      {showUnavailableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Request Unavailability
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This sends a request to the admin — you'll stay marked Available
              until they approve it. Please provide a reason.
            </p>
            <textarea
              value={unavailableReason}
              onChange={(e) => setUnavailableReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              placeholder="Reason for going unavailable..."
              rows={4}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowUnavailableModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitUnavailabilityRequest}
                disabled={submittingUnavailable}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {submittingUnavailable ? "Submitting..." : "Submit Request"}
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

      {/* ── Invoice Preview Modal ─────────────────────────────────────────── */}
      {invoiceModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-[230mm] mt-4 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-lg">Invoice Preview</h2>
              <button
                onClick={() => setInvoiceModalData(null)}
                className="text-white bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <InvoiceGenerator invoice={invoiceModalData} theme="light" />
          </div>
        </div>
      )}

      {/* ── Edit Profile Modal ─────────────────────────────────────────────── */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit your Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Photo upload */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-200 bg-purple-50 flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-purple-600 font-bold text-2xl">
                      {profileForm.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || <User className="w-10 h-10" />}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  <Upload className="w-4 h-4" />
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <span className="text-xs text-gray-400">(Optional)</span>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter full name"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter phone number"
                />
              </div>

              {/* NIC (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">NIC Number</label>
                <input
                  type="text"
                  value={profileForm.nic || '—'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Address <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter home address"
                />
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specializations</label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECS.map(spec => (
                    <label key={spec} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileForm.specializations.includes(spec)}
                        onChange={() =>
                          setProfileForm(p => ({
                            ...p,
                            specializations: p.specializations.includes(spec)
                              ? p.specializations.filter(s => s !== spec)
                              : [...p.specializations, spec],
                          }))
                        }
                        className="accent-purple-600"
                      />
                      <span className="text-sm text-gray-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              {profileError && (
                <p className="text-sm text-red-600 font-medium">{profileError}</p>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={saveProfile}
                disabled={profileSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
