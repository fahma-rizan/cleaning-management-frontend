import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, AlertTriangle, CheckCircle, XCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';
import { tokenStorage } from '../utils/auth';

interface FeedbackWorkflowProps { user: User; }

interface BookingRecord {
  _id: string;
  bookingId: string;
  serviceType: string;
  serviceName: string;
  date: string;
  status: string;
}

type FeedbackType = 'FEEDBACK' | 'COMPLAINT';

const CATEGORIES: { code: string; label: string }[] = [
  { code: 'SERVICE_QUALITY', label: 'Service Quality' },
  { code: 'STAFF_BEHAVIOR',  label: 'Staff Behavior' },
  { code: 'DAMAGE',          label: 'Damage to Property' },
  { code: 'LATE_ARRIVAL',    label: 'Late Arrival' },
  { code: 'BILLING',         label: 'Billing Issue' },
  { code: 'OTHER',           label: 'Other' },
];

const API = 'http://localhost:4000/api';
const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

// FIX (task #21, C.3a): this whole feature — leaving feedback or filing a
// complaint about a completed job — didn't exist anywhere in the app before.
// AdminSidebar had a "Complaints" nav item, but it was a placeholder pointing
// at the Financial Dashboard with nothing behind it.
export default function FeedbackWorkflow({ user }: FeedbackWorkflowProps) {
  const navigate = useNavigate();
  const [bookings, setBookings]     = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [selected, setSelected]     = useState<BookingRecord | null>(null);

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('FEEDBACK');
  const [rating, setRating]             = useState(0);
  const [category, setCategory]         = useState('OTHER');
  const [comment, setComment]           = useState('');
  const [photos, setPhotos]             = useState<{ url: string; description: string; name: string }[]>([]);
  const [photoError, setPhotoError]     = useState('');
  const [processing, setProcessing]     = useState(false);
  const [done, setDone]                 = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const tokens = tokenStorage.getTokens();
        const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};

        // FIX: same reasoning as PriceReductionWorkflow — demo accounts
        // (user.id like 'user-001') don't map to real Mongo customerId
        // ObjectIds, so filtering client-side by customer identity would
        // silently show zero bookings for every demo user. Shows all
        // completed bookings, same convention already established there.
        const res = await fetch(`${API}/bookings`, { headers: authHeader });
        if (!res.ok) throw new Error('Failed to fetch bookings.');
        const data = await res.json();

        const completed = data
          .filter((b: any) => b.status === 'completed')
          .map((b: any): BookingRecord => ({
            _id:         b._id,
            bookingId:   b.bookingId,
            serviceType: b.serviceType || b.serviceName || 'Service',
            serviceName: b.serviceName || b.serviceType || 'Service',
            date:        b.date || '',
            status:      b.status,
          }));

        setBookings(completed);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoError('');
    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      setPhotoError(`You can attach up to ${MAX_PHOTOS} photos.`);
      return;
    }
    Array.from(files).slice(0, remainingSlots).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setPhotoError('Only image files are supported.');
        return;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setPhotoError(`"${file.name}" is too large (max 3MB per photo).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos(prev => [...prev, { url: String(reader.result), description: '', name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => setPhotos(prev => prev.filter((_, i) => i !== index));

  const isValid = selected
    && comment.trim().length > 0
    && (feedbackType === 'COMPLAINT' || rating > 0);

  const handleSubmit = async () => {
    if (!isValid || !selected) return;
    setProcessing(true);
    try {
      const tokens = tokenStorage.getTokens();
      const authHeader = tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
      const res = await fetch(`${API}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          bookingId: selected._id,
          type: feedbackType,
          category: feedbackType === 'COMPLAINT' ? category : undefined,
          rating: feedbackType === 'FEEDBACK' ? rating : undefined,
          comment,
          photos: photos.map(p => ({ url: p.url, description: p.description })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || 'Failed to submit.');
      }
      setDone(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full"><CheckCircle className="w-14 h-14 text-green-500" /></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {feedbackType === 'COMPLAINT' ? 'Complaint Submitted' : 'Thanks for Your Feedback!'}
            </h2>
            <p className="text-gray-500 mb-6">
              {feedbackType === 'COMPLAINT'
                ? "We've received your complaint and our team will review it and respond soon."
                : 'Your feedback helps us improve our service.'}
            </p>
            <button onClick={() => navigate('/')} className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 font-medium">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoTopBar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">Feedback & Complaints</h1>
        <p className="text-gray-500 mb-8">Tell us how a completed service went, or let us know if something went wrong</p>

        {isLoading ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No completed bookings found yet.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {bookings.map(b => {
              const isSelected = selected?._id === b._id;
              return (
                <button key={b._id} type="button" onClick={() => setSelected(isSelected ? null : b)}
                  className={`w-full text-left rounded-xl p-5 border-2 transition-all ${isSelected ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{b.serviceName}</h3>
                      <p className="text-sm text-gray-500">{b.date}</p>
                      <p className="text-xs text-gray-400 font-mono mt-1">{b.bookingId}</p>
                    </div>
                  </div>
                  {isSelected && <div className="mt-3 flex items-center gap-2 text-purple-600"><CheckCircle className="w-4 h-4" /><span className="text-sm font-medium">Selected</span></div>}
                </button>
              );
            })}
          </div>
        )}

        {selected && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
            {/* Type toggle */}
            <div>
              <h2 className="font-semibold text-gray-800 mb-3">What would you like to share?</h2>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFeedbackType('FEEDBACK')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-colors ${feedbackType === 'FEEDBACK' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <Star className="w-4 h-4" /> Feedback
                </button>
                <button type="button" onClick={() => setFeedbackType('COMPLAINT')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-colors ${feedbackType === 'COMPLAINT' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <AlertTriangle className="w-4 h-4" /> Complaint
                </button>
              </div>
            </div>

            {/* Rating (feedback only) */}
            {feedbackType === 'FEEDBACK' && (
              <div>
                <h2 className="font-semibold text-gray-800 mb-2">How was your experience?</h2>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
                      <Star className={`w-8 h-8 transition-colors ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category (complaint only) */}
            {feedbackType === 'COMPLAINT' && (
              <div>
                <h2 className="font-semibold text-gray-800 mb-2">Category</h2>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                  {CATEGORIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
            )}

            {/* Comment */}
            <div>
              <h2 className="font-semibold text-gray-800 mb-2">
                {feedbackType === 'COMPLAINT' ? 'Describe the issue' : 'Comments (optional details)'}
              </h2>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                placeholder={feedbackType === 'COMPLAINT' ? 'What went wrong?' : 'Anything you\'d like us to know?'}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            {/* Photos */}
            <div>
              <h2 className="font-semibold text-gray-800 mb-1">Photos (optional)</h2>
              <p className="text-xs text-gray-400 mb-2">Attach up to {MAX_PHOTOS} photos.</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => { handlePhotoSelect(e.target.files); e.target.value = ''; }}
                disabled={photos.length >= MAX_PHOTOS}
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {photos.map((p, i) => (
                    <div key={i} className="relative w-20 h-20">
                      <img src={p.url} alt={p.name} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-300 shadow-sm"
                        aria-label={`Remove ${p.name}`}>
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleSubmit} disabled={!isValid || processing}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${!isValid || processing ? 'bg-gray-300 cursor-not-allowed' : feedbackType === 'COMPLAINT' ? 'bg-red-600 hover:bg-red-700 shadow-md' : 'bg-purple-600 hover:bg-purple-700 shadow-md'}`}>
              {processing
                ? <span className="flex items-center justify-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> Submitting...</span>
                : feedbackType === 'COMPLAINT' ? 'Submit Complaint' : 'Submit Feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
