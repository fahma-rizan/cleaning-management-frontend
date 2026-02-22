import { useState, useMemo } from 'react';
import { 
  Star, 
  Search, 
  Check, 
  EyeOff, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from "sonner";

interface Review {
  id: string;
  customerName: string;
  initials: string;
  rating: number;
  service: string;
  date: string;
  content: string;
  status: 'Approved' | 'Pending' | 'Hidden';
}

const mockReviews: Review[] = [
  {
    id: '1',
    customerName: 'Sarah J.',
    initials: 'S',
    rating: 5,
    service: 'Deep Cleaning',
    date: 'Feb 10, 2026',
    content: 'Absolutely spotless! Maria did an incredible job with our kitchen and bathrooms. Highly recommend!',
    status: 'Approved'
  },
  {
    id: '2',
    customerName: 'Mike C.',
    initials: 'M',
    rating: 4,
    service: 'Laundry Pickup',
    date: 'Feb 9, 2026',
    content: 'Quick turnaround and clothes came back perfectly folded. Would use again.',
    status: 'Approved'
  },
  {
    id: '3',
    customerName: 'Emily R.',
    initials: 'E',
    rating: 5,
    service: 'Sofa Cleaning',
    date: 'Feb 8, 2026',
    content: 'Our couch looks brand new! The team was professional and on time.',
    status: 'Pending'
  },
  {
    id: '4',
    customerName: 'David L.',
    initials: 'D',
    rating: 2,
    service: 'Regular Cleaning',
    date: 'Feb 7, 2026',
    content: 'Missed some spots in the living room. Disappointed with the quality this time.',
    status: 'Pending'
  },
  {
    id: '5',
    customerName: 'Jessica W.',
    initials: 'J',
    rating: 5,
    service: 'Curtain Cleaning',
    date: 'Feb 6, 2026',
    content: 'Very happy with the service. Curtains smell fresh and look great.',
    status: 'Hidden'
  }
];

const ratingDistribution = [
  { stars: '5★', count: 245 },
  { stars: '4★', count: 185 },
  { stars: '3★', count: 65 },
  { stars: '2★', count: 25 },
  { stars: '1★', count: 16 },
];

export function ReviewsManagement() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'Approved' | 'Hidden'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;

  const filteredReviews = useMemo(() => {
    return mockReviews.filter(review => {
      const matchesFilter = activeFilter === 'All' || review.status === activeFilter;
      const matchesSearch = review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           review.service.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const handleApprove = (id: string) => {
    toast.success("Review approved successfully");
  };

  const handleHide = (id: string) => {
    toast.info("Review has been hidden from public");
  };

  const handleDelete = (id: string) => {
    toast.error("Review deleted");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
        <p className="text-gray-500 mt-1">Moderate customer feedback and track satisfaction</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Summary Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="text-6xl font-bold text-gray-900 mb-2">4.6</div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-6 h-6 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
          </div>
          <div className="text-gray-500 font-medium">536 total reviews</div>
        </div>

        {/* Rating Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Rating Distribution</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={ratingDistribution}
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="stars" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={40}
                  tick={{ fill: '#64748b', fontSize: 14, fontWeight: 500 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#f59e0b" />
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
          {['All', 'Pending', 'Approved', 'Hidden'].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter as any);
                setCurrentPage(1);
              }}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-100'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {paginatedReviews.length > 0 ? (
          paginatedReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                    {review.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-900">{review.customerName}</h4>
                      <Badge className={`
                        ${review.status === 'Approved' ? 'bg-green-50 text-green-600' : ''}
                        ${review.status === 'Pending' ? 'bg-amber-50 text-amber-600' : ''}
                        ${review.status === 'Hidden' ? 'bg-gray-50 text-gray-500' : ''}
                        border-none font-semibold px-2
                      `}>
                        {review.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                      </div>
                      <span>• {review.service} • {review.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleApprove(review.id)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Approve"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleHide(review.id)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Hide"
                  >
                    <EyeOff className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(review.id)}
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query to find what you're looking for.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                  currentPage === i + 1
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border-gray-200"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}