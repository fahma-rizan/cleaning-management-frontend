import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { fetchWithAuth } from "../utils/api";
import {
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  User as UserIcon,
  Phone,
  ArrowLeft,
} from "lucide-react";
import Header from "./Header";
import BackButton from "./BackButton";
import type { User } from "../types";

interface TrackingPageProps {
  user: User;
  onLogout: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function TrackingPage({
  user,
  onLogout,
  theme,
  onToggleTheme,
}: TrackingPageProps) {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [cleanerLoc, setCleanerLoc] = useState<{
    lat: number;
    lng: number;
    status: string;
    eta: string;
  } | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    fetchWithAuth(`/bookings/${bookingId}`)
      .then((data) => setBooking(data.booking || data))
      .catch((err) => console.error("Failed to load booking:", err));
  }, [bookingId]);

  useEffect(() => {
    if (!booking?.assignedStaffId) return;
    const socket: Socket = io("http://localhost:5000");
    socket.on("cleaner-location-update", (updated: any) => {
      if (updated.staffId === booking.assignedStaffId) {
        setCleanerLoc({
          lat: updated.latitude,
          lng: updated.longitude,
          status: updated.status,
          eta: updated.eta,
        });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [booking?.assignedStaffId]);

  const getCurrentStep = (booking: any): number => {
  if (!booking) return 1;
  if (booking.status === "completed") return 5;
  if (booking.status === "in-progress") return 4;
  if (booking.status === "confirmed" && cleanerLoc?.status === "On the Way") return 3;
  if (booking.status === "confirmed" && booking.assignedStaffId) return 2;
  if (booking.status === "confirmed" || booking.status === "pending") return 1;
  return 1;
};

const currentStatus = getCurrentStep(booking);

  const statusSteps = [
    {
      id: 1,
      name: "Booking Confirmed",
      icon: CheckCircle,
      description: "Your booking has been confirmed",
    },
    {
      id: 2,
      name: "Staff Assigned",
      icon: UserIcon,
      description: "Cleaner assigned to your booking",
    },
    {
      id: 3,
      name: "On the Way",
      icon: Truck,
      description: "Cleaner is heading to your location",
    },
    {
      id: 4,
      name: "Service in Progress",
      icon: MapPin,
      description: "Cleaning service has started",
    },
    {
      id: 5,
      name: "Completed",
      icon: CheckCircle,
      description: "Service completed successfully",
    },
  ];

  if (!booking) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Loading booking details…</p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        onLogout={onLogout}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

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
                    <div
                      key={step.id}
                      className="flex gap-4 mb-8 last:mb-0 relative"
                    >
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`absolute left-6 top-12 w-0.5 h-full ${
                            isCompleted ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                      )}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                              ? "bg-purple-600 text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1 pt-1">
                        <h3
                          className={`text-lg mb-1 ${isCurrent ? "text-purple-600" : ""}`}
                        >
                          {step.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {step.description}
                        </p>
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
                    <div className="font-mono">{booking.bookingId}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Service</div>
                    <div>{booking.serviceName}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Date & Time</div>
                    <div>
                      {booking.date} at {booking.time}
                    </div>
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
                {booking.assignedStaffName ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">
                        {booking.assignedStaffName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg">{booking.assignedStaffName}</h3>
                      </div>
                    </div>
                    {booking.assignedStaffEmail && (
                      <a
                        href={`mailto:${booking.assignedStaffEmail}`}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Phone className="w-5 h-5" />
                        Contact Cleaner
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">Not yet assigned</p>
                )}
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl mb-4">Live Location</h2>
                {cleanerLoc ? (
                  <div className="text-center text-gray-700">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm">{cleanerLoc.status}</p>
                    {cleanerLoc.eta && (
                      <p className="text-xs mt-1">ETA: {cleanerLoc.eta}</p>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    Waiting for cleaner to start the trip…
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
