import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import Header from './Header';
import BackButton from './BackButton';
import type { User } from '../types';
import type { FormEvent } from 'react';

interface ReviewsProps {
  user: User | null;
  onLogout: () => void;
}

export default function Reviews({ user, onLogout }: ReviewsProps) {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    // In real app, this would save to backend
    setSubmitted(true);
    
    setTimeout(() => {
      navigate(`/services/${serviceId}`);
    }, 2000);
  };

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
            <p className="text-gray-600 mb-8">Share your experience with this service</p>

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
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors text-lg"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}