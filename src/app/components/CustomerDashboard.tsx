import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Award,
  Bell,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Star,
  Calendar,
  Clock,
  Package,
  Edit,
  Trash2,
  FileText,
  KeyRound,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import LoyaltyManagement from "./LoyaltyManagement";
import SummaryPage from "./loyalty/SummaryPage";
import HistoryPage from "./loyalty/HistoryPage";
import TiersPage from "./loyalty/TiersPage";
import EarnPointsPage from "./loyalty/EarnPointsPage";
import RedemptionPage from "./loyalty/RedemptionPage";
import BackButton from "./BackButton";
import type { User } from "../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchWithAuth } from "../utils/api";
import imgLogo from "figma:asset/d0e24839a24076173960597a25c12b48f3330fdf.png";
import OngoingBookingCard from "./dashboard/OngoingBookingCard";
import UpcomingBookingsList from "./dashboard/UpcomingBookingsList";
import OngoingActivityPanel from "./dashboard/OngoingActivityPanel";
import logo from "figma:asset/d0e24839a24076173960597a25c12b48f3330fdf.png";
import realLogo from "figma:asset/48d18655d35c58a7612f320d66e60e164d500006.png";

// Dashboard Components
import {
  DashboardHeader,
  UpcomingBookingCard,
  QuickActions,
  ActivityFeed,
  LoyaltyPointsCard,
  EmptyBookingState,
  EmptyState,
} from "./dashboard/OverviewCards";
import LoadingSkeletons from "./dashboard/LoadingSkeletons";

interface CustomerDashboardProps {
  user: User;
  onLogout: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function CustomerDashboard({
  user,
  onLogout,
  theme,
  onToggleTheme,
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });
  const [bookingTab, setBookingTab] = useState<"ongoing" | "upcoming" | "past">(
    "ongoing",
  );
  const [loyaltySubTab, setLoyaltySubTab] = useState("summary");
  const [showRedemption, setShowRedemption] = useState(false);

  const sidebarItems = [
    { id: "overview", name: "Overview", icon: LayoutDashboard },
    { id: "bookings", name: "My Bookings", icon: ClipboardList },
    { id: "loyalty", name: "Loyalty Points", icon: Award },
    { id: "notifications", name: "Notifications", icon: Bell },
  ];

  const timeSlots = [
    "9:00AM - 11:00AM",
    "11:00AM - 1:00PM",
    "2:00PM - 4:00PM",
    "4:00PM - 6:00PM",
  ];

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchWithAuth('/bookings/my');
        if (data.success) {
          // MongoDB is the source of truth — use whatever it returns (including empty)
          setBookings(data.bookings);
          localStorage.setItem('userBookings', JSON.stringify(data.bookings));
        } else {
          const stored = JSON.parse(localStorage.getItem('userBookings') || '[]');
          setBookings(stored);
        }
      } catch {
        const stored = JSON.parse(localStorage.getItem('userBookings') || '[]');
        setBookings(stored);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  // Converts "9:00AM - 11:00AM" → minutes from midnight, for time-slot sorting
  const timeSlotToMinutes = (timeStr: string): number => {
    const start = (timeStr || '').split(' - ')[0];
    const match = start.match(/(\d+):(\d+)(AM|PM)/i);
    if (!match) return 0;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const upcomingBookings = bookings
    .filter((b) => {
      if (b.status === "cancelled" || b.status === "completed") return false;
      return new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0));
    })
    .sort((a, b) => {
      // 1. Date ascending (YYYY-MM-DD string comparison is safe)
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      // 2. Time slot ascending (by start hour)
      const timeDiff = timeSlotToMinutes(a.time) - timeSlotToMinutes(b.time);
      if (timeDiff !== 0) return timeDiff;
      // 3. Same date + time → order by when the booking was created
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const totalBookings = bookings.filter((b) => b.status !== 'cancelled').length;
  const activeServices = bookings.filter((b) => b.status === 'in-progress').length;
  const nextAppointment = upcomingBookings.length > 0
    ? new Date(upcomingBookings[0].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—';

  const handleReschedule = (booking: any) => {
    setSelectedBooking(booking);
    setRescheduleData({ date: booking.date, time: booking.time });
    setShowRescheduleModal(true);
  };

  const handleCancel = (booking: any) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmReschedule = async () => {
    if (!selectedBooking || !rescheduleData.date || !rescheduleData.time) return;

    try {
      const bookingMongoId = selectedBooking._id;
      const data = await fetchWithAuth(`/bookings/${bookingMongoId}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({ date: rescheduleData.date, time: rescheduleData.time }),
      });

      if (data.success) {
        const updatedBookings = bookings.map((b) =>
          (b._id === selectedBooking._id || b.bookingId === selectedBooking.bookingId)
            ? { ...b, date: rescheduleData.date, time: rescheduleData.time }
            : b,
        );
        setBookings(updatedBookings);
        localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
      } else {
        alert(data.message || 'Reschedule failed. Please try again.');
        return;
      }
    } catch {
      // Fallback: update locally if API unreachable
      const updatedBookings = bookings.map((b) =>
        b.bookingId === selectedBooking.bookingId
          ? { ...b, date: rescheduleData.date, time: rescheduleData.time }
          : b,
      );
      setBookings(updatedBookings);
      localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
    }

    setShowRescheduleModal(false);
    setSelectedBooking(null);
  };

  const confirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      const bookingMongoId = selectedBooking._id;
      const data = await fetchWithAuth(`/bookings/${bookingMongoId}/cancel`, {
        method: 'PATCH',
      });

      if (data.success) {
        const updatedBookings = bookings.map((b) =>
          (b._id === selectedBooking._id || b.bookingId === selectedBooking.bookingId)
            ? { ...b, status: 'cancelled' }
            : b,
        );
        setBookings(updatedBookings);
        localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
      } else {
        alert(data.message || 'Cancellation failed. Please try again.');
        return;
      }
    } catch {
      // Fallback: update locally if API unreachable
      const updatedBookings = bookings.map((b) =>
        b.bookingId === selectedBooking.bookingId
          ? { ...b, status: 'cancelled' }
          : b,
      );
      setBookings(updatedBookings);
      localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
    }

    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  // Load admin notifications sent to this customer (stored in localStorage by admin panel)
  const notifications = (() => {
    try {
      const all: any[] = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
      return all.filter(n => n.customerEmail === user.email);
    } catch {
      return [];
    }
  })();

  const renderOverview = () => {
    if (loading) return <LoadingSkeletons />;

    // Navigation function to go to ongoing bookings
    const goToOngoing = () => {
      setActiveTab("bookings");
      setBookingTab("ongoing");
    };

    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <DashboardHeader
          name={user.name}
          totalBookings={totalBookings}
          activeServices={activeServices}
          nextAppointment={nextAppointment}
        />

        <div className="flex flex-col gap-6">
          {/* Row 1: Ongoing Activity Card */}
          <div className="w-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔄</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Ongoing Activity
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-green-700 dark:text-green-400">
                      1 Active
                    </span>
                  </div>
                </div>
                <button
                  onClick={goToOngoing}
                  className="text-sm font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Booking Summary */}
              <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      Home Cleaning - Regular Cleaning
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Booking ID: BK-1001
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      ETA
                    </p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      12:30 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-purple-100 dark:border-purple-800">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    MC
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Maria Chen
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Service Professional
                    </p>
                  </div>
                </div>
              </div>

              {/* Mini Progress Timeline */}
              <div className="mb-6">
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-purple-600"
                    style={{ width: "66%" }}
                  ></div>

                  {/* Steps */}
                  {["En Route", "Started", "In Progress", "Completed"].map(
                    (step, idx) => {
                      const isCompleted = idx < 2;
                      const isCurrent = idx === 2;
                      const isPending = idx > 2;

                      return (
                        <div
                          key={step}
                          className="flex flex-col items-center relative z-10 flex-1"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 transition-all ${
                              isCompleted
                                ? "bg-purple-600 border-purple-600"
                                : isCurrent
                                  ? "bg-white dark:bg-gray-800 border-purple-600 ring-4 ring-purple-100 dark:ring-purple-900/30"
                                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {isCompleted ? (
                              <span className="text-white text-lg">✓</span>
                            ) : (
                              <span
                                className={`text-xs font-bold ${
                                  isCurrent
                                    ? "text-purple-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {idx + 1}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[10px] font-bold text-center ${
                              isCurrent
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {step}
                          </p>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Track Button */}
              <button
                onClick={goToOngoing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                Track Your Booking
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Row 2: Upcoming Booking or Empty State */}
          <div className="w-full">
            {upcomingBookings.length > 0 ? (
              <UpcomingBookingCard
                booking={upcomingBookings[0]}
                onReschedule={handleReschedule}
                onCancel={handleCancel}
              />
            ) : (
              <EmptyBookingState />
            )}
          </div>

          {/* Row 3: Loyalty Points */}
          <div className="w-full">
            <LoyaltyPointsCard />
          </div>
        </div>
      </div>
    );
  };

  const renderBookings = () => {
    // Mock ongoing booking data
    const ongoingBooking = {
      bookingId: "BK-1001",
      serviceName: "Home Cleaning",
      serviceType: "Regular Cleaning",
      staff: {
        name: "Maria Chen",
        avatar: "MC",
        role: "Service Professional",
      },
      status: "in-progress" as const,
      address: "123 Oak Street, Unit 4B",
      startTime: "9:00 AM",
      eta: "12:30 PM",
      progress: 68,
    };

    const ongoingBookings = bookings.filter(
      (b) => b.status !== "completed" && b.status !== "cancelled",
    );

    const pastBookings = bookings.filter(
      (b) => b.status === "completed" || b.status === "cancelled",
    );

    return (
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl border-b border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex gap-8 px-6 pt-6">
            <button
              onClick={() => setBookingTab("ongoing")}
              className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                bookingTab === "ongoing"
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Ongoing
              {bookingTab === "ongoing" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
              )}
            </button>
            <button
              onClick={() => setBookingTab("upcoming")}
              className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                bookingTab === "upcoming"
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Upcoming
              {bookingTab === "upcoming" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
              )}
            </button>
            <button
              onClick={() => setBookingTab("past")}
              className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                bookingTab === "past"
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Past
              {bookingTab === "past" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {bookingTab === "ongoing" &&
            (ongoingBookings.length > 0 ? (
              <div className="space-y-6">
                <OngoingActivityPanel />
              </div>
            ) : (
              <div className="space-y-6">
                <OngoingActivityPanel />
              </div>
            ))}

          {bookingTab === "upcoming" &&
            (upcomingBookings.length > 0 ? (
              <div className="space-y-6">
                <UpcomingBookingsList
                  bookings={upcomingBookings}
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                />
                <div className="flex justify-center pt-4">
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold transition-all shadow-lg shadow-purple-500/20"
                  >
                    Book a Service
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Upcoming Bookings
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  You don't have any upcoming bookings at the moment.
                </p>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold transition-all"
                >
                  Book a Service
                </Link>
              </div>
            ))}

          {bookingTab === "past" &&
            (pastBookings.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="space-y-4">
                  {pastBookings.map((booking, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold dark:text-white">
                              {booking.serviceType ||
                                booking.serviceName ||
                                "Cleaning Service"}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">
                              ID: {booking.bookingId}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            booking.status === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
                        <div className="flex items-center gap-2 font-medium">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span>{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            LKR {booking.price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-50 dark:border-gray-700">
                        <Link
                          to={`/invoice/${booking.bookingId}`}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-bold text-sm transition-all"
                        >
                          <FileText className="w-4 h-4" />
                          View Invoice
                        </Link>
                        {booking.status === "completed" && (
                          <>
                            <Link
                              to={`/reviews/${booking.serviceId || "1"}`}
                              className="flex items-center gap-2 px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 font-bold text-sm transition-all"
                            >
                              <Star className="w-4 h-4" />
                              Write Review
                            </Link>
                            <Link
                              to={`/complaint/${booking.bookingId}`}
                              className="flex items-center gap-2 px-4 py-2 border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 font-bold text-sm transition-all"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Submit Complaint
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Past Bookings
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Your completed and cancelled bookings will appear here.
                </p>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-6 dark:text-white">
        Recent Notifications
      </h2>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="group border-l-4 border-purple-600 bg-purple-50/50 dark:bg-purple-900/10 p-5 rounded-r-2xl transition-all hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-gray-900 dark:text-white">
                {notification.message}
              </p>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">
                {notification.type}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{notification.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const userData = {
    name: user.name,
    currentPoints: 1250,
    currentTier: "silver",
    pointsToNextTier: 256,
    earnedThisMonth: 340,
    badgeDiscount: {
      available: true,
      percentage: 5,
      expiryDate: "Apr 5, 2026",
      daysRemaining: 45,
      totalDays: 90,
    },
  };

  const loyaltyTabs = [
    { id: "summary", name: "Summary" },
    { id: "history", name: "History" },
    { id: "tiers", name: "Tiers" },
    { id: "earn", name: "Earn Points" },
  ];

  const renderLoyalty = () => (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 rounded-t-xl overflow-hidden">
        <div className="flex gap-6 px-6 pt-6">
          {loyaltyTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLoyaltySubTab(tab.id)}
              className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                loyaltySubTab === tab.id
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.name}
              {loyaltySubTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        {loyaltySubTab === "summary" && (
          <SummaryPage
            userData={userData}
            onRedeemClick={() => setShowRedemption(true)}
          />
        )}
        {loyaltySubTab === "history" && <HistoryPage />}
        {loyaltySubTab === "tiers" && (
          <TiersPage currentTier={userData.currentTier} />
        )}
        {loyaltySubTab === "earn" && <EarnPointsPage />}
      </div>

      {/* Redemption Modal */}
      {showRedemption && (
        <RedemptionPage
          availablePoints={userData.currentPoints}
          onClose={() => setShowRedemption(false)}
        />
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFCFE] dark:bg-gray-900 transition-colors">
      {/* Sidebar - Desktop */}
      <aside
        className={`w-64 bg-[#1e1534] text-white flex flex-col fixed h-screen overflow-y-auto z-50 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Branding */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={imgLogo}
                alt="Cloud Laundry Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                CLOUD LAUNDRY.LK
              </h1>
              <p className="text-[10px] text-purple-300 font-medium uppercase tracking-widest">
                Customer Panel
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            if (item.link) {
              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 shrink-0 ${isActive ? "text-purple-400" : "text-gray-400 group-hover:text-purple-300"}`}
                  />
                  <span className="font-medium truncate">{item.name}</span>
                  {isActive && (
                    <div className="w-1 h-1 bg-purple-400 rounded-full ml-auto" />
                  )}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-purple-400" : "text-gray-400 group-hover:text-purple-300"}`}
                />
                <span className="font-medium truncate">{item.name}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-purple-400 rounded-full ml-auto" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile / Bottom */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-white/10">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-purple-400 uppercase font-medium">
                {user.badge} Member
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <BackButton />
            <div className="hidden sm:block pl-4 border-l border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {sidebarItems.find((item) => item.id === activeTab)?.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-7xl mx-auto transition-all duration-300">
            {activeTab === "overview" && renderOverview()}
            {activeTab === "bookings" && renderBookings()}
            {activeTab === "loyalty" && renderLoyalty()}
            {activeTab === "notifications" && renderNotifications()}
          </div>
        </div>
      </main>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Reschedule
              </h2>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                  New Date
                </label>
                <DatePicker
                  selected={
                    rescheduleData.date ? new Date(rescheduleData.date) : null
                  }
                  onChange={(date: Date | null) =>
                    setRescheduleData({
                      ...rescheduleData,
                      date: date ? date.toISOString().split("T")[0] : "",
                    })
                  }
                  minDate={new Date()}
                  className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                  New Time
                </label>
                <select
                  value={rescheduleData.time}
                  onChange={(e) =>
                    setRescheduleData({
                      ...rescheduleData,
                      time: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl outline-none"
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={confirmReschedule}
                className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-bold hover:bg-purple-700 transition-all"
              >
                Update Schedule
              </button>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white py-4 rounded-2xl font-bold"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6 text-red-600">
              <h2 className="text-2xl font-bold">Cancel Booking</h2>
              <X
                onClick={() => setShowCancelModal(false)}
                className="w-6 h-6 cursor-pointer"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Are you sure you want to cancel booking{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                #{selectedBooking?.bookingId}
              </span>
              ? This action will notify the team and might incur a fee if within
              24 hours.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmCancel}
                className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-all"
              >
                Cancel Booking
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white py-4 rounded-2xl font-bold"
              >
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
