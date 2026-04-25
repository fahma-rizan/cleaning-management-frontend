import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import type { User as UserType } from "../types";
import MaterialUsageForm from "./MaterialUsageForm";
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
  service: string;
  date: string;
  time: string;
  address: string;
  status: "pending" | "confirmed" | "confirmed-paid" | "confirmed-unpaid" | "in-progress" | "completed" | "cancelled";
  amount: number;
  paymentMethod: string;
  cashReceived: boolean;
  isTeam: boolean;
  teamMembers: TeamMember[];
}

export default function StaffDashboard({
  user,
  onLogout,
  theme,
  onToggleTheme,
}: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState<"tasks" | "schedule">("tasks");
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Decline task modal state
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedTaskToDecline, setSelectedTaskToDecline] =
    useState<Booking | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  // Material usage form state
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [selectedTaskForMaterial, setSelectedTaskForMaterial] =
    useState<Booking | null>(null);

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

    alert(
      `✅ Material usage report submitted to admin successfully!\\n\\n${usedItems.length} items recorded.`,
    );
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
      alert("⚠️ Please provide a reason for declining this task.");
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
        setBookings(bookings.filter((b) => b._id !== selectedTaskToDecline._id));
        setShowDeclineModal(false);
        setSelectedTaskToDecline(null);
        setDeclineReason("");
        alert(
          `✅ Task declined and forwarded to admin for reassignment.\n\nAnother available staff member will be assigned automatically.`,
        );
      } else {
        alert("Failed to decline task: " + result.message);
      }
    } catch (err) {
      console.error('Decline task error:', err);
      alert("Failed to decline task. Please try again.");
    }
  };

  // Toggle availability via backend
  const handleAvailabilityToggle = async () => {
    try {
      const data = await fetchWithAuth('/staff/availability', { method: 'PATCH' });
      if (data.success) {
        setIsAvailable(data.isAvailable);
        if (data.isAvailable) {
          alert("✅ You are now AVAILABLE for service today. Admin has been notified.");
        } else {
          alert("⚠️ You are now UNAVAILABLE. Admin will be notified to reschedule affected bookings.");
        }
      }
    } catch (err) {
      console.error('Toggle availability error:', err);
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
          alert(
            "✅ Service marked as completed! Customer has been notified and can now submit a review or complaint.",
          );
        }
      }
    } catch (err) {
      console.error('updateBookingStatus error:', err);
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
      case "confirmed-paid":
      case "confirmed-unpaid":
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
        ["pending", "confirmed", "confirmed-paid", "confirmed-unpaid"].includes(b.status)
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
            isAvailable
              ? "bg-green-50 border-green-500"
              : "bg-red-50 border-red-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isAvailable ? (
                <UserCheck className="w-12 h-12 text-green-600" />
              ) : (
                <UserX className="w-12 h-12 text-red-600" />
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {isAvailable
                    ? "✅ Available for Service Today"
                    : "⚠️ Unavailable Today"}
                </h3>
                <p
                  className={`mt-1 ${isAvailable ? "text-green-700" : "text-red-700"}`}
                >
                  {isAvailable
                    ? "You are marked as available for service assignments"
                    : "You are marked as unavailable. Admin will reschedule your bookings."}
                </p>
              </div>
            </div>
            <button
              onClick={handleAvailabilityToggle}
              className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                isAvailable
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isAvailable ? "Mark Unavailable" : "Mark Available"}
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
                ) : bookings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No tasks assigned yet.</p>
                ) : (
                  bookings.map((booking) => (
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
                                booking.paymentMethod === "cod"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {booking.paymentMethod === "cod"
                                ? "Cash on Delivery"
                                : "Paid Online"}
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
                          {booking.status.replace(/-/g, " ").toUpperCase()}
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
                          {(booking.status === "pending" ||
                            booking.status === "confirmed" ||
                            booking.status === "confirmed-paid" ||
                            booking.status === "confirmed-unpaid") && (
                            <>
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

                          {booking.status === "completed" && (
                            <>
                              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                ✓ Task Completed
                              </span>
                              <Link
                                to={`/staff/complete-service/${booking._id}`}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                              >
                                <Package className="w-4 h-4" />
                                Record Material Usage
                              </Link>
                            </>
                          )}

                          {/* Cash collection */}
                          {booking.paymentMethod === "cod" &&
                            !booking.cashReceived && (
                              <button
                                onClick={() => markCashReceived(booking._id)}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                              >
                                Mark Cash Received
                              </button>
                            )}
                          {booking.paymentMethod === "cod" &&
                            booking.cashReceived && (
                              <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                                ✓ Cash Received
                              </span>
                            )}

                          {/* Invoice buttons (UI only) */}
                          <button
                            type="button"
                            onClick={() => setActiveTab("tasks")}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Generate Invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab("tasks")}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Send Invoice
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
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("tasks")}
              className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left"
            >
              <MapPin className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-semibold text-gray-800">GPS Tracking</p>
                <p className="text-sm text-gray-600">Track service locations</p>
              </div>
            </button>
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
