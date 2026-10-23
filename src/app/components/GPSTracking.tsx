import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  CheckCircle,
  Clock,
  X,
  RefreshCw,
} from "lucide-react";
import type { User } from "../types";
import { fetchWithAuth } from "../utils/api";
import { gpsAPI } from "../lib/api";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default marker icons under Vite (same fix used in admin/GPSTracking.tsx)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// A distinct green pin for the customer's destination, so it's visually
// different from the default blue "you are here" marker.
const destinationIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
    background: #22C55E; transform: rotate(-45deg);
    border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

interface GPSTrackingProps {
  user: User;
  onLogout: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

interface Task {
  id: string;
  bookingId: string;
  customer: string;
  service: string;
  address: string;
  status: string;
  startTime: string;
  estimatedCompletion: string;
  completedAt?: string;
}

const parseTimeSlot = (slot: string) => {
  const parts = (slot || "").split(" - ");
  return { startTime: parts[0] || "—", endTime: parts[1] || "—" };
};

const todayStr = () => new Date().toISOString().split("T")[0];

const ACTIVE_STATUSES = ["pending", "confirmed", "in-progress"];

export default function GPSTracking({ user }: GPSTrackingProps) {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedToday, setCompletedToday] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Live map state — staff's own position, and the geocoded customer
  // destination for whichever task is currently open in the modal.
  const [staffPos, setStaffPos] = useState<[number, number] | null>(null);
  const [destPos, setDestPos] = useState<[number, number] | null>(null);
  const [geocodeError, setGeocodeError] = useState(false);

  // Real road-following route between staffPos and destPos (via OSRM).
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  // Manually confirmed "On the Way" status per task (set via the button in
  // the navigation modal). "On Site" and "Completed" are set separately, from
  // StaffDashboard's Start Task / Mark Complete buttons.
  const [confirmedStatus, setConfirmedStatus] = useState<Record<string, "On the Way">>({});

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth("/bookings/assigned");
      if (data.success) {
        const today = todayStr();
        const todayBookings = (data.bookings || []).filter(
          (b: any) => b.date === today,
        );

        const toTask = (b: any): Task => {
          const { startTime, endTime } = parseTimeSlot(b.time);
          return {
            id: b._id,
            bookingId: b.bookingId || b._id,
            customer: b.customer || b.customerName || "Customer",
            service: b.service || b.serviceName || "Service",
            address: b.address || "—",
            status: b.status,
            startTime,
            estimatedCompletion: endTime,
            completedAt: b.taskCompletedAt
              ? new Date(b.taskCompletedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : undefined,
          };
        };

        setActiveTasks(
          todayBookings
            .filter((b: any) => ACTIVE_STATUSES.includes(b.status))
            .map(toTask),
        );
        setCompletedToday(
          todayBookings
            .filter((b: any) => b.status === "completed")
            .map(toTask),
        );
      }
    } catch (err) {
      console.error("GPS load error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // On load (and after a refresh), check this staff member's own current
  // gpsStatus on the backend and seed confirmedStatus from it, so the "On
  // the Way" button correctly shows as already-confirmed instead of
  // resetting to its default state every time the page reloads.
  useEffect(() => {
    if (activeTasks.length === 0) return;
    gpsAPI
      .getActiveCleaners()
      .then((cleaners: any[]) => {
        const mine = cleaners.find((c) => c.staffId === user.id);
        if (mine?.status === "On the Way" || mine?.status === "On Site") {
          setConfirmedStatus((prev) => ({ ...prev, [activeTasks[0].id]: "On the Way" }));
        }
      })
      .catch((err) => console.error("Failed to check existing GPS status:", err));
  }, [activeTasks, user.id]);

  // Continuously track the staff member's own position, purely for this
  // page's own map display — runs regardless of whether they've confirmed
  // "On the Way" yet, so the map is usable the moment the modal opens.
  useEffect(() => {
    const current = activeTasks[0]; // simplest: track the next active task
    if (!current || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setStaffPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeTasks]);

  // Push location to the backend — so the admin GPS dashboard can show this
  // cleaner's position in real time — only once the staff member has
  // manually confirmed "On the Way" for this task. Fires on every position
  // update from the effect above, as long as a status is confirmed.
  useEffect(() => {
    const current = activeTasks[0];
    if (!current || !staffPos) return;

    const status = confirmedStatus[current.id];
    if (!status) return;

    gpsAPI
      .updateStatus(user.id, {
        status,
        latitude: staffPos[0],
        longitude: staffPos[1],
        eta: current.estimatedCompletion,
        customerName: current.customer,
        currentJob: current.service,
      })
      .catch((err) => console.error("GPS push failed:", err));
  }, [staffPos, confirmedStatus, activeTasks, user.id]);

  // Mark offline once there's nothing active left today.
  useEffect(() => {
    if (activeTasks.length === 0 && !loading) {
      gpsAPI
        .updateStatus(user.id, { status: "Offline", latitude: 0, longitude: 0 })
        .catch(() => {});
    }
  }, [activeTasks.length, loading, user.id]);

  // Geocode the customer's address (via OpenStreetMap's free Nominatim
  // service, no API key needed) whenever the navigation modal opens.
  useEffect(() => {
    if (!selectedTask) {
      setDestPos(null);
      setGeocodeError(false);
      return;
    }
    setGeocodeError(false);
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        selectedTask.address,
      )}`,
    )
      .then((res) => res.json())
      .then((results) => {
        if (results[0]) {
          setDestPos([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
        } else {
          setGeocodeError(true);
        }
      })
      .catch((err) => {
        console.error("Geocoding failed:", err);
        setGeocodeError(true);
      });
  }, [selectedTask]);

  // Once both the staff position and the geocoded destination are known,
  // fetch the actual road-following route from OSRM (free, no API key) and
  // draw that instead of a straight line between the two points.
  useEffect(() => {
    if (!staffPos || !destPos) {
      setRoutePath([]);
      return;
    }
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${staffPos[1]},${staffPos[0]};${destPos[1]},${destPos[0]}?overview=full&geometries=geojson`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.routes?.[0]) {
          // OSRM returns [lng, lat] pairs — Leaflet wants [lat, lng].
          const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng],
          );
          setRoutePath(coords);
        }
      })
      .catch((err) => console.error("Route fetch failed:", err));
  }, [staffPos, destPos]);

  const handleStatusButtonClick = () => {
    if (!selectedTask) return;
    const confirmed = window.confirm('Mark this job as "On the Way"?');
    if (!confirmed) return;

    setConfirmedStatus((prev) => ({ ...prev, [selectedTask.id]: "On the Way" }));

    // Persist the timestamp on the booking itself (separate from the GPS
    // status push below, which only updates the live-tracking snapshot).
    fetchWithAuth(`/bookings/${selectedTask.id}/on-the-way`, {
      method: "PATCH",
      body: JSON.stringify({ latitude: staffPos?.[0], longitude: staffPos?.[1] }),
    }).catch(
      (err) => console.error("Failed to record On the Way time:", err),
    );

    // Fire an immediate update so the admin dashboard reflects the change
    // right away, rather than waiting for the next background GPS tick.
    if (staffPos) {
      gpsAPI
        .updateStatus(user.id, {
          status: "On the Way",
          latitude: staffPos[0],
          longitude: staffPos[1],
          eta: selectedTask.estimatedCompletion,
          customerName: selectedTask.customer,
          currentJob: selectedTask.service,
        })
        .catch((err) => console.error("GPS push failed:", err));
    }
  };

  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, "_blank");
  };

  const statusBadge = (status: string) => {
    if (status === "in-progress") return "bg-blue-100 text-blue-800";
    if (status === "completed") return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const statusLabel = (status: string) =>
    status === "in-progress"
      ? "In Progress"
      : status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/staff"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  GPS Tracking
                </h1>
                <p className="text-gray-600">
                  Track your service locations in real-time
                </p>
              </div>
            </div>
            <button
              onClick={loadTasks}
              className="p-2 text-purple-600 hover:text-purple-800"
              title="Refresh"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Navigation Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Navigation className="w-6 h-6 text-purple-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      GPS Navigation
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedTask.customer} — {selectedTask.service}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                {/* Live map (Leaflet + OpenStreetMap) */}
                <div className="rounded-lg h-64 mb-6 overflow-hidden border border-gray-200">
                  {staffPos ? (
                    <MapContainer
                      center={staffPos}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={staffPos}>
                        <Popup>You are here</Popup>
                      </Marker>
                      {destPos && (
                        <Marker position={destPos} icon={destinationIcon}>
                          <Popup>{selectedTask.address}</Popup>
                        </Marker>
                      )}
                      {routePath.length > 0 && (
                        <Polyline positions={routePath} color="#7c3aed" weight={4} />
                      )}
                    </MapContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
                      Getting your location…
                    </div>
                  )}
                </div>
                {geocodeError && (
                  <p className="text-xs text-amber-600 -mt-4 mb-4">
                    Couldn't locate this address on the map — the route line
                    isn't available, but you can still use "Open in Google
                    Maps" below.
                  </p>
                )}

                {/* Booking info */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-sm text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 mb-1">Booking ID</p>
                    <p className="font-semibold text-gray-800">
                      {selectedTask.bookingId}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 mb-1">Start Time</p>
                    <p className="font-semibold text-gray-800">
                      {selectedTask.startTime}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 mb-1">ETA</p>
                    <p className="font-semibold text-gray-800">
                      {selectedTask.estimatedCompletion}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleStatusButtonClick}
                    disabled={!!confirmedStatus[selectedTask.id]}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {confirmedStatus[selectedTask.id] ? "On the Way ✓" : "On the Way"}
                  </button>
                  <button
                    onClick={() => openGoogleMaps(selectedTask.address)}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Open in Google Maps
                  </button>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-6 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-purple-400" />
            <p>Loading today's tasks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Tasks */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Active Tasks
                </h2>
                <span className="ml-auto text-sm text-gray-500">
                  {activeTasks.length} task{activeTasks.length !== 1 ? "s" : ""}
                </span>
              </div>

              {activeTasks.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Clock className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">No active tasks for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {task.customer}
                          </p>
                          <p className="text-sm text-gray-600">
                            {task.service}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(task.status)}`}
                        >
                          {statusLabel(task.status)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-700">{task.address}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>Start: {task.startTime}</span>
                        <span>ETA: {task.estimatedCompletion}</span>
                      </div>
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Navigate to Location
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Today + Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Completed Today
                  </h2>
                  <span className="ml-auto text-sm text-gray-500">
                    {completedToday.length} task
                    {completedToday.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {completedToday.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm">No completed tasks yet today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedToday.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 bg-green-50 border-2 border-green-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {task.customer}
                            </p>
                            <p className="text-sm text-gray-600">
                              {task.service}
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                        </div>
                        <div className="flex items-start gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-700">
                            {task.address}
                          </p>
                        </div>
                        {task.completedAt && (
                          <p className="text-sm text-green-600 font-medium">
                            Completed at {task.completedAt}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Today's Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Today's Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {completedToday.length}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Completed</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {activeTasks.length}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}