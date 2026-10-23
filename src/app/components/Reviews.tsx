import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import Header from './Header';
import BackButton from './BackButton';
import type { User } from '../types';
import type { FormEvent } from 'react';
import { fetchWithAuth } from '../utils/api';

interface ReviewsProps {
  user: User | null;
  onLogout: () => void;
}

export default function Reviews({ user, onLogout }: ReviewsProps) {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const booking = (location.state as { booking?: any } | null)?.booking;

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!bookingId) {
      setError('Missing booking reference — please go back and try again.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const data = await fetchWithAuth('/reviews', {
        method: 'POST',
        body: JSON.stringify({ bookingId, rating, content: review }),
      });

      if (data.error) {
        setError(data.error);
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Review submit error:', err);
      setError('Failed to submit review. Please try again.');
      setSubmitting(false);
    }
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} />
        <div className="container mx-auto px-4 py-16 text-center text-gray-500">
          No booking specified for this review.
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500 p-4 rounded-full">
                <Star className="w-12 h-12 text-white fill-white" />
              </div>
            </div>
            <h1 className="text-3xl mb-4">Thank You!</h1>
            <p className="text-gray-600">Your review has been submitted successfully</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <BackButton />
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h1 className="text-3xl mb-2">Write a Review</h1>
            <p className="text-gray-600 mb-2">Share your experience with this service</p>
            {booking?.serviceName && (
              <p className="text-sm text-gray-500 mb-6">
                Reviewing: <span className="font-semibold">{booking.serviceName}</span>
                {booking.bookingId && <span className="font-mono ml-2 text-xs">({booking.bookingId})</span>}
              </p>
            )}

            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg mb-4">How would you rate this service?</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-12 h-12 ${
                          value <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center mt-2 text-gray-600">
                    {rating === 5 ? 'Excellent!' :
                     rating === 4 ? 'Great!' :
                     rating === 3 ? 'Good' :
                     rating === 2 ? 'Fair' : 'Poor'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-lg mb-2">Tell us more about your experience</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  rows={6}
                  placeholder="What did you like? Any suggestions for improvement?"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}