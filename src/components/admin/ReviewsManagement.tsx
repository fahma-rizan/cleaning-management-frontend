import { useState, useEffect } from "react";
import {
  Star,
  Search,
  Check,
  EyeOff,
  Trash2,
  MessageSquare,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  Label,
} from "recharts";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { Pagination } from "../ui/pagination";
import { reviewAPI } from "../../lib/api";

interface Review {
  _id: string;
  customerName: string;
  serviceName: string;
  rating: number;
  content: string;
  status: "Approved" | "Pending" | "Hidden";
  createdAt: string;
}

interface RatingStats {
  distribution: { star: number; count: number }[];
  total: number;
  average: string;
  counts: {
    All:      number;
    Pending:  number;
    Approved: number;
    Hidden:   number;
  };
}

export function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Pending" | "Approved" | "Hidden"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  // Load stats once
  useEffect(() => {
    reviewAPI
      .getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  // Load reviews once; status and search are applied locally to avoid refetches.
  useEffect(() => {
    setLoading(true);
    reviewAPI
      .getAll()
      .then((data) => {
        setReviews(data);
        setCurrentPage(1);
      })
      .catch((err) => setError(err.error || "Failed to load reviews"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const filteredReviews = reviews.filter((review) => {
    const matchesStatus =
      activeFilter === "All" || review.status === activeFilter;
    const matchesSearch =
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage,
  );
  const averageRounded = stats ? Math.round(parseFloat(stats.average)) : 0;

  const refreshStats = () => {
  reviewAPI.getStats()
    .then(data => setStats(data))
    .catch(err => console.error(err));
};

  const handleApprove = async (id: string) => {
    try {
      await reviewAPI.approve(id);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "Approved" } : r)),
      );
      refreshStats(); 
      try {
        const updatedStats = await reviewAPI.getStats();
        setStats(updatedStats);
      } catch (e) {
        console.error("Failed to refresh stats after approve", e);
      }
      toast.success("Review approved successfully");
    } catch (err: any) {
      toast.error(err.error || "Failed to approve review");
    }
  };

  const handleHide = async (id: string) => {
    try {
      await reviewAPI.hide(id);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "Hidden" } : r)),
      );
      refreshStats(); 
      try {
        const updatedStats = await reviewAPI.getStats();
        setStats(updatedStats);
      } catch (e) {
        console.error("Failed to refresh stats after hide", e);
      }
      toast.info("Review has been hidden from public");
    } catch (err: any) {
      toast.error(err.error || "Failed to hide review");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await reviewAPI.delete(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      refreshStats(); 
      try {
        const updatedStats = await reviewAPI.getStats();
        setStats(updatedStats);
      } catch (e) {
        console.error("Failed to refresh stats after delete", e);
      }
      toast.error("Review deleted");
    } catch (err: any) {
      toast.error(err.error || "Failed to delete review");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-medium">
        {error}
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
        <p className="text-gray-500 mt-1">
          Moderate customer feedback and track satisfaction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Rating Summary Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="text-6xl font-bold text-gray-900 mb-2">
            {stats?.average ?? "0.0"}
          </div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${star <= averageRounded ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
              />
            ))}
          </div>
          <div className="text-gray-500 font-medium">
            {stats?.total ?? 0} total approved reviews
          </div>
        </div>

        {/* Rating Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Rating Distribution
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={stats?.distribution}
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f0f0f0"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="star"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={{ fill: "#64748b", fontSize: 14, fontWeight: 500 }}
                />
                <RechartsTooltip
                  cursor={{ fill: "rgba(245, 158, 11, 0.08)" }}
                  formatter={(value: number) => [`${value}`, "Count"]}
                  labelFormatter={(label) => `${label} star rating`}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                  
                >
                  {stats?.distribution.map(({ star }) => (
                    <Cell
                      key={star}
                      fill="#f59e0b"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search reviews..."
            className="pl-11 h-14 border-gray-100 rounded-2xl bg-white shadow-sm focus-visible:ring-purple-600 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(["All", "Pending", "Approved", "Hidden"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                activeFilter === filter
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-100"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
              }`}
            >
              {filter}
              {stats?.counts && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          activeFilter === filter
            ? 'bg-white/20 text-white'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {stats.counts[filter]}
        </span>
      )}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {paginatedReviews.length > 0 ? (
          paginatedReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-900">
                        {review.customerName}
                      </h4>
                      <Badge
                        className={`
                        ${review.status === "Approved" ? "bg-green-50 text-green-600" : ""}
                        ${review.status === "Pending" ? "bg-amber-50 text-amber-600" : ""}
                        ${review.status === "Hidden" ? "bg-gray-50 text-gray-500" : ""}
                        border-none font-semibold px-2
                      `}
                      >
                        {review.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                          />
                        ))}
                      </div>
                      <span>
                        • {review.serviceName} •{" "}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(review._id)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Approve"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleHide(review._id)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Hide"
                  >
                    <EyeOff className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">{review.content}</p>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 border-dashed">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No reviews found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search query to find what you're
              looking for.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredReviews.length}
        itemsPerPage={reviewsPerPage}
        onPageChange={setCurrentPage}
        itemLabel="reviews"
      />
    </div>
  );
}
