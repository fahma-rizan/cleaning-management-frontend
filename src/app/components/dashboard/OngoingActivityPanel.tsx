import { useState, useEffect } from "react";
import { Phone, MapPin, ChevronDown, ChevronUp, Zap, CheckCircle } from "lucide-react";
import { fetchWithAuth } from "../../utils/api";
import { io, Socket } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default marker icons under Vite (same fix used elsewhere)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const destinationIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
    background: #EC4899; transform: rotate(-45deg);
    border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

interface OngoingActivityPanelProps {
  booking: {
    _id: string;
    bookingId: string;
    serviceName: string;
    serviceCategory?: string;
    address: string;
  };
}

interface TrackingData {
  booking: {
    status: string;
    taskStartedAt: string | null;
    taskCompletedAt: string | null;
  };
  staff: {
    staffId: string;
    name: string;
    phone: string | null;
    latitude: number;
    longitude: number;
    gpsStatus: string;
    updatedAt: string;
  } | null;
  timeline: {
    onTheWayAt: string | null;
    onSiteAt: string | null;
    completedAt: string | null;
  };
}

const formatTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

export default function OngoingActivityPanel({ booking }: OngoingActivityPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [staffPos, setStaffPos] = useState<[number, number] | null>(null);
  const [destPos, setDestPos] = useState<[number, number] | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  // Load initial tracking data (staff info, current position, timeline)
  useEffect(() => {
    fetchWithAuth(`/bookings/${booking._id}/tracking`)
      .then((data) => {
        if (data.success) {
          setTracking(data);
          if (data.staff?.latitude && data.staff?.longitude) {
            setStaffPos([data.staff.latitude, data.staff.longitude]);
          }
        }
      })
      .catch((err) => console.error("Failed to load tracking data:", err));
  }, [booking._id]);

  // Live position updates over the same socket the staff/admin pages use
  useEffect(() => {
    if (!tracking?.staff?.staffId) return;
    const socket: Socket = io("http://localhost:5000");
    socket.on("cleaner-location-update", (updated: any) => {
      if (updated.staffId === tracking.staff?.staffId) {
        setStaffPos([updated.latitude, updated.longitude]);
        setTracking((prev) =>
          prev
            ? { ...prev, staff: prev.staff ? { ...prev.staff, gpsStatus: updated.status } : prev.staff }
            : prev,
        );
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [tracking?.staff?.staffId]);

  // Geocode the customer's own address once, for the destination pin
  useEffect(() => {
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(booking.address)}`,
    )
      .then((res) => res.json())
      .then((results) => {
        if (results[0]) setDestPos([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
      })
      .catch((err) => console.error("Geocoding failed:", err));
  }, [booking.address]);

  // Real road-following route via OSRM, once both points are known
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
          const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng],
          );
          setRoutePath(coords);
        }
      })
      .catch((err) => console.error("Route fetch failed:", err));
  }, [staffPos, destPos]);

  const stages = [
    { id: "onTheWay", label: "Staff En Route", time: tracking?.timeline.onTheWayAt ?? null },
    { id: "onSite", label: "Service Started", time: tracking?.timeline.onSiteAt ?? null },
    { id: "completed", label: "Completed", time: tracking?.timeline.completedAt ?? null },
  ];
  const currentStageIndex = stages.reduce(
    (idx, stage, i) => (stage.time ? i : idx),
    -1,
  );

  if (!tracking) {
    return (
      <div className="w-full max-w-[820px] mx-auto bg-white border border-gray-200 rounded-[20px] shadow-lg p-8 text-center text-gray-400">
        Loading tracking information…
      </div>
    );
  }

  return (
    <div className="w-full max-w-[820px] mx-auto" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* INFO BANNER */}
      <div className="bg-gradient-to-r from-purple-50 via-purple-100/50 to-purple-50 border border-purple-200 rounded-xl px-5 py-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <p className="text-sm text-purple-900 leading-relaxed">
            <span className="font-bold">Live tracking.</span>{" "}
            {tracking.staff ? "Your cleaner's location updates in real time." : "Waiting for staff to be assigned."}
          </p>
        </div>
      </div>

      {/* EXPANDABLE BOOKING CARD */}
      <div className="bg-white border border-gray-200 rounded-[20px] shadow-lg overflow-hidden">
        {/* CARD HEADER */}
        <div
          className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </div>
              <span className="text-red-600 text-xs font-bold uppercase tracking-wider">LIVE</span>
            </div>

            <div className="flex-1">
              <h3 className="text-gray-900 font-bold text-[15px] mb-1">{booking.serviceName}</h3>
              <div className="flex items-center gap-2">
                {booking.serviceCategory && (
                  <div className="inline-flex items-center bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md">
                    <span className="text-purple-600 text-xs font-semibold">{booking.serviceCategory}</span>
                  </div>
                )}
                <div className="inline-flex items-center bg-gray-100 px-2.5 py-1 rounded-md">
                  <span className="text-gray-600 text-xs font-mono">{booking.bookingId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-4">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="px-6 pb-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* STAFF ROW */}
            {tracking.staff && (
              <div className="bg-purple-50 border border-purple-100 rounded-[14px] px-[18px] py-[14px] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {tracking.staff.name?.charAt(0) ?? "S"}
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold text-[14px]">{tracking.staff.name}</h4>
                    <p className="text-gray-600 text-xs mt-0.5">Service Professional</p>
                  </div>
                </div>

                {tracking.staff.phone && (
                  <a
                    href={`tel:${tracking.staff.phone}`}
                    className="flex items-center gap-2 px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-100 transition-all text-sm font-semibold"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                )}
              </div>
            )}

            {/* LIVE TRACKING TIMELINE */}
            <div>
              <h5 className="text-gray-600 text-[11px] font-bold uppercase tracking-wider mb-[14px]">
                LIVE TRACKING
              </h5>
              <div className="relative mb-8">
                <div className="absolute top-3 left-0 right-0 h-[2px] bg-gray-200" />
                <div
                  className="absolute top-3 left-0 h-[2px] bg-gradient-to-r from-purple-600 to-purple-500 transition-all duration-500"
                  style={{
                    width: currentStageIndex >= 0 ? `${(currentStageIndex / (stages.length - 1)) * 100}%` : "0%",
                  }}
                />
                <div className="relative flex items-start justify-between">
                  {stages.map((stage, index) => {
                    const isCompleted = index <= currentStageIndex;
                    return (
                      <div key={stage.id} className="flex flex-col items-center" style={{ flex: 1 }}>
                        <div
                          className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCompleted
                              ? "bg-purple-600 shadow-lg shadow-purple-500/40"
                              : "bg-white border-2 border-gray-300"
                          }`}
                        >
                          {isCompleted && <CheckCircle className="w-4 h-4 text-white fill-white" />}
                        </div>
                        <div className="mt-3 text-center max-w-[90px]">
                          <p
                            className={`text-[10px] font-semibold leading-tight mb-1 ${
                              isCompleted ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {stage.label}
                          </p>
                          {stage.time && (
                            <p className="text-[9px] text-purple-600">{formatTime(stage.time)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LIVE MAP */}
            {tracking.staff && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-gray-600 text-[11px] font-bold uppercase tracking-wider">
                    LIVE LOCATION
                  </h5>
                  <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse" />
                    <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wider">
                      {tracking.staff.gpsStatus}
                    </span>
                  </div>
                </div>

                <div className="h-[200px] rounded-[14px] overflow-hidden border border-purple-100 shadow-inner">
                  {staffPos ? (
                    <MapContainer center={staffPos} zoom={13} style={{ height: "100%", width: "100%" }}>
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={staffPos}>
                        <Popup>{tracking.staff.name}</Popup>
                      </Marker>
                      {destPos && (
                        <Marker position={destPos} icon={destinationIcon}>
                          <Popup>{booking.address}</Popup>
                        </Marker>
                      )}
                      {routePath.length > 0 && (
                        <Polyline positions={routePath} color="#7c3aed" weight={4} />
                      )}
                    </MapContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
                      Waiting for staff location…
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ADDRESS */}
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg">
              <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
              <span className="text-gray-900 text-xs font-medium leading-relaxed">{booking.address}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}