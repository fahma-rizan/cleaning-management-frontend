import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { gpsAPI } from "../../lib/api";
import { io, Socket } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom colored icons
const makeIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="
    width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
    background: ${color}; transform: rotate(-45deg);
    border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

const STATUS_ICONS: Record<string, L.DivIcon> = {
  "On the Way": makeIcon("#3B82F6"),
  "On Site": makeIcon("#22C55E"),
  Completed: makeIcon("#9CA3AF"),
  Offline: makeIcon("#6B7280"),
};

interface Cleaner {
  _id: string;
  staffId: string;
  staffName: string;
  latitude: number;
  longitude: number;
  status: "On the Way" | "On Site" | "Completed" | "Offline";
  currentJob: string;
  customerName: string;
  customerAddress?: string;
  eta: string;
  updatedAt: string;
}

// Fit map to markers
function FitBounds({ cleaners }: { cleaners: Cleaner[] }) {
  const map = useMap();
  useEffect(() => {
    if (cleaners.length === 0) return;
    const bounds = L.latLngBounds(
      cleaners.map((c) => [c.latitude, c.longitude]),
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [cleaners, map]);
  return null;
}

function FlyToCleaner({ cleaner }: { cleaner: Cleaner | null }) {
  const map = useMap();

  useEffect(() => {
    if (!cleaner) return;

    map.flyTo([cleaner.latitude, cleaner.longitude], 17, {
      animate: true,
      duration: 0.8,
    });
  }, [cleaner, map]);

  return null;
}

export function GPSTracking() {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedCleanerId, setSelectedCleanerId] = useState<string | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // Load initial data
  useEffect(() => {
    gpsAPI
      .getActiveCleaners()
      .then((data) => setCleaners(data))
      .catch((err) => console.error("Failed to load GPS:", err))
      .finally(() => setLoading(false));
  }, []);
  // Socket.io real-time updates
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("GPS socket connected");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("cleaner-location-update", (updated: Cleaner) => {
      setCleaners((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c)),
      );
      setLastUpdate(new Date());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const activeCount = cleaners.filter((c) => c.status !== "Completed").length;
  const onTheWayCount = cleaners.filter(
    (c) => c.status === "On the Way",
  ).length;
  const onSiteCount = cleaners.filter((c) => c.status === "On Site").length;
  const completedCount = cleaners.filter(
    (c) => c.status === "Completed",
  ).length;
  const selectedCleaner =
    cleaners.find((c) => c._id === selectedCleanerId) ?? null;

  // derive list according to status filter
  const filteredCleaners =
    statusFilter == null
      ? cleaners
      : statusFilter === "Active"
        ? cleaners.filter((c) => c.status !== "Completed")
        : cleaners.filter((c) => c.status === statusFilter);

  const toggleStatusFilter = (value: string) => {
    setStatusFilter((prev) => (prev === value ? null : value));
  };

  useEffect(() => {
    if (
      selectedCleanerId &&
      !cleaners.some((c) => c._id === selectedCleanerId)
    ) {
      setSelectedCleanerId(null);
    }
  }, [cleaners, selectedCleanerId]);

  useEffect(() => {
    if (
      selectedCleanerId &&
      !filteredCleaners.some((c) => c._id === selectedCleanerId)
    ) {
      setSelectedCleanerId(null);
    }
  }, [filteredCleaners, selectedCleanerId]);

  useEffect(() => {
    if (!selectedCleaner) return;

    markerRefs.current[selectedCleaner._id]?.openPopup();
  }, [selectedCleaner]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            GPS Tracking
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Real-time cleaner location and route visualization
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
            connected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {connected ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          {connected ? "Live" : "Disconnected"}
          {lastUpdate && connected && (
            <span className="text-xs font-normal opacity-70 ml-1">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Map */}
        <div className="xl:col-span-2 space-y-4">
          <div
            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
            style={{ height: "480px" }}
          >
            <MapContainer
              center={[6.9271, 79.8612]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds cleaners={filteredCleaners} />
              <FlyToCleaner cleaner={selectedCleaner} />
              {filteredCleaners.map((cleaner) => (
                <Marker
                  key={cleaner._id}
                  ref={(marker) => {
                    markerRefs.current[cleaner._id] = marker;
                  }}
                  position={[cleaner.latitude, cleaner.longitude]}
                  icon={STATUS_ICONS[cleaner.status] || STATUS_ICONS["Offline"]}
                >
                  <Popup>
                    <div style={{ minWidth: "160px" }}>
                      <p style={{ fontWeight: 600, marginBottom: 4 }}>
                        {cleaner.staffName}
                      </p>
                      <p style={{ fontSize: 13, color: "#6b7280" }}>
                        {cleaner.currentJob || "No active job"}
                      </p>
                      <p style={{ fontSize: 13, color: "#6b7280" }}>
                        Customer: {cleaner.customerName || "—"}
                      </p>
                      {cleaner.customerAddress && (
                        <p
                          style={{
                            fontSize: 13,
                            color: "#6b7280",
                            marginTop: 6,
                          }}
                        >
                          Address: {cleaner.customerAddress}
                        </p>
                      )}
                      {cleaner.eta && (
                        <p style={{ fontSize: 13, color: "#3b82f6" }}>
                          ETA: {cleaner.eta}
                        </p>
                      )}
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 6,
                          padding: "2px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background:
                            cleaner.status === "On Site"
                              ? "#dcfce7"
                              : cleaner.status === "On the Way"
                                ? "#dbeafe"
                                : "#f3f4f6",
                          color:
                            cleaner.status === "On Site"
                              ? "#166534"
                              : cleaner.status === "On the Way"
                                ? "#1d4ed8"
                                : "#6b7280",
                        }}
                      >
                        {cleaner.status}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Stats below map */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "Active",
                count: activeCount,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                label: "On the Way",
                count: onTheWayCount,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "On Site",
                count: onSiteCount,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                label: "Completed",
                count: completedCount,
                color: "text-gray-500",
                bg: "bg-gray-50",
              },
            ].map((s) => {
              const isActive =
                (statusFilter === null && false) ||
                statusFilter === s.label ||
                (s.label === "Active" && statusFilter === "Active");
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => toggleStatusFilter(s.label)}
                  className={`${s.bg} rounded-2xl p-4 text-center transition-all ${isActive ? "ring-2 ring-purple-200" : ""}`}
                >
                  <div className={`text-2xl font-black ${s.color}`}>
                    {s.count}
                  </div>
                  <div className="text-sm font-semibold text-gray-500">
                    {s.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Active Cleaners</h3>
          {filteredCleaners.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-500">
              No active cleaners right now
            </div>
          ) : (
            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
              {filteredCleaners.map((cleaner) => {
                const isSelected = selectedCleanerId === cleaner._id;
                return (
                  <button
                    key={cleaner._id}
                    type="button"
                    onClick={() => setSelectedCleanerId(cleaner._id)}
                    className={`w-full text-left rounded-2xl overflow-hidden border-2 shadow-sm hover:shadow-md transition-all focus:outline-none ${
                      isSelected
                        ? "border-4 border-purple-300 bg-purple-50/30"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-lg border border-purple-100/50">
                            {cleaner.staffName?.charAt(0) ?? "U"}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 leading-tight text-lg">
                              {cleaner.staffName}
                            </h4>
                            <p className="text-gray-500 text-sm font-medium">
                              {cleaner.currentJob || "No active job"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`
                          ${cleaner.status === "On the Way" ? "bg-blue-50 text-blue-600 hover:bg-blue-50" : ""}
                          ${cleaner.status === "On Site" ? "bg-green-50 text-green-600 hover:bg-green-50" : ""}
                          ${cleaner.status === "Completed" ? "bg-gray-50 text-gray-500 hover:bg-gray-50" : ""}
                          border-none shadow-none font-bold px-3 py-1 flex items-center gap-1.5
                        `}
                        >
                          {cleaner.status === "On the Way" && (
                            <Navigation className="w-3.5 h-3.5" />
                          )}
                          {cleaner.status === "On Site" && (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {cleaner.status === "Completed" && (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {cleaner.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {cleaner.latitude.toFixed(4)},{" "}
                          {cleaner.longitude.toFixed(4)}
                        </div>
                        {cleaner.eta && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <Clock className="w-4 h-4 text-gray-400" />
                            ETA: {cleaner.eta}
                          </div>
                        )}
                        {cleaner.customerName && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <User className="w-4 h-4 text-gray-400" />
                            Customer: {cleaner.customerName}
                          </div>
                        )}
                        {cleaner.customerAddress && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {cleaner.customerAddress}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Last update:{" "}
                          {new Date(cleaner.updatedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
