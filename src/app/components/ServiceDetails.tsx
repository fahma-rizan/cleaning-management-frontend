import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Clock, Check } from "lucide-react";
import Header from "./Header";
import BackButton from "./BackButton";
import type { User } from "../types";
import { reviewAPI } from "../lib/api";
import { SERVICES } from "../lib/servicesCatalog";

interface ServiceDetailsProps {
  user: User | null;
  onLogout: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

// Generic package tiers shown for every non-curtain service. This section
// is decorative (selectedPackage isn't fed into the real booking flow —
// "Book This Service" always goes to the actual per-service booking form),
// kept as-is from before rather than expanding into 12 real per-service
// pricing tiers, which is separate scope from fixing service identity/reviews.
const GENERIC_PACKAGES = [
  { id: "basic", name: "Basic", price: 2500, duration: "2 hours", features: ["Living room cleaning", "Kitchen cleaning", "Basic dusting"] },
  { id: "standard", name: "Standard", price: 4500, duration: "3 hours", features: ["All basic features", "Bedroom cleaning", "Bathroom sanitizing", "Floor mopping"], recommended: true },
  { id: "premium", name: "Premium", price: 7500, duration: "4-5 hours", features: ["All standard features", "Deep cleaning", "Window cleaning", "Appliance cleaning", "Organizing"] },
];

const CURTAIN_PACKAGES = [
  { id: "dry-clean-press", name: "Dry Cleaning & Pressing", price: 2500, duration: "2-3 days", features: ["Delicate fabric care", "Odor removal", "Professional pressing", "Min 2 curtains"] },
  { id: "laundry-press", name: "Laundry & Pressing", price: 3500, duration: "1-2 days", features: ["Standard wash", "Stain treatment", "Deep cleaning", "Expert ironing"], recommended: true },
  { id: "premium", name: "Curtain Premium Service", price: 4500, duration: "2 days", features: ["Luxury fabric care", "Ultra-deep cleaning", "Fabric protection", "Priority service"] },
];

export default function ServiceDetails({ user, onLogout, theme, onToggleTheme }: ServiceDetailsProps) {
  const { id } = useParams();
  const [selectedPackage, setSelectedPackage] = useState<string>("standard");

  const service = SERVICES.find((s) => s.id === parseInt(id || "0"));

  const [liveStats, setLiveStats] = useState<{ average: string; total: number } | null>(null);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!service) return;
    // Query by reviewKey (matches how Booking.tsx actually stores
    // serviceName), not the display name — see servicesCatalog.ts.
    reviewAPI.getPublicStats(service.reviewKey).then(setLiveStats).catch(console.error);
    reviewAPI.getPublicReviews(service.reviewKey).then(setLiveReviews).catch(console.error);
  }, [service?.reviewKey]);

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <div className="container mx-auto px-4 py-16 text-center text-gray-500">
          Service not found.
        </div>
      </div>
    );
  }

  const packages = service.category === "curtains" ? CURTAIN_PACKAGES : GENERIC_PACKAGES;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />

      <div className="container mx-auto px-4 py-8">
        <BackButton />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Image */}
            <div>
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
            </div>

            {/* Service Info */}
            <div>
              <h1 className="text-4xl mb-4">{service.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg">{liveStats?.average ?? "0.0"}</span>
                  <span className="text-gray-600">({liveStats?.total ?? 0} reviews)</span>
                </div>
              </div>
              <p className="text-gray-700 mb-6 text-lg">{service.description}</p>

              <div className="bg-purple-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl mb-4">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-purple-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to={user ? `/booking/${service.id}` : `/login?redirect=/booking/${service.id}`}
                className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors text-center inline-block"
              >
                Book This Service
              </Link>
            </div>
          </div>

          {/* Packages */}
          <div className="mb-12">
            <h2 className="text-3xl mb-6">Choose Your Package</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-xl p-6 cursor-pointer transition-all ${
                    selectedPackage === pkg.id ? "ring-2 ring-purple-600 shadow-lg" : "hover:shadow-md"
                  } ${pkg.recommended ? "relative" : ""}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {pkg.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                        Recommended
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl mb-2">{pkg.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl">LKR {pkg.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl">Customer Reviews</h2>
            </div>
            <div className="space-y-4">
              {liveReviews.length === 0 && (
                <p className="text-gray-500">No reviews yet for this service.</p>
              )}
              {liveReviews.map((review) => (
                <div key={review._id} className="bg-white rounded-xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg">{review.customerName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}