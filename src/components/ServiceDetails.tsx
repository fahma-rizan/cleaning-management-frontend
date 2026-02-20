import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Star, Clock, DollarSign, Check, ArrowLeft, MessageCircle } from 'lucide-react';
import Header from './Header';
import BackButton from './BackButton';
import type { User } from '../types';

interface ServiceDetailsProps {
  user: User | null;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function ServiceDetails({ user, onLogout, theme, onToggleTheme }: ServiceDetailsProps) {
  const { id } = useParams();
  const [selectedPackage, setSelectedPackage] = useState<string>('standard');

  // Mock service data - adjusted for curtain service
  const isCurtainService = id === '12' || id === '4';
  
  const service = {
    id: parseInt(id || '1'),
    name: isCurtainService ? 'Curtain Cleaning' : 'Home Cleaning',
    description: isCurtainService 
      ? 'Comprehensive curtain care including specialized cleaning methods, professional removal, and expert reinstallation. Choose from dry cleaning, standard laundry, or our premium package.'
      : 'Professional home cleaning services including dusting, mopping, and organizing. Our trained staff ensures your home is spotless and sanitized.',
    rating: isCurtainService ? 4.8 : 4.8,
    reviews: isCurtainService ? 145 : 234,
    image: isCurtainService 
      ? 'https://images.unsplash.com/photo-1660226817472-2c73d49c6dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXJ0YWluJTIwY2xlYW5pbmclMjB3aW5kb3clMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzcwNzM2MTg2fDA&ixlib=rb-4.1.0&q=80&w=1080'
      : 'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDY5NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    features: isCurtainService 
      ? [
          '3 specialized cleaning methods',
          'Professional removal & reinstallation',
          'Eco-friendly cleaning solvents',
          'Satisfaction guarantee',
          'Free pickup & delivery options',
          'Expert fabric assessment',
        ]
      : [
          'Professional cleaning staff',
          'All cleaning materials included',
          'Satisfaction guarantee',
          'Flexible scheduling',
          'Same-day service available',
          'Eco-friendly products',
        ],
    packages: isCurtainService 
      ? [
          {
            id: 'dry-clean-press',
            name: 'Dry Cleaning & Pressing',
            price: 2500,
            duration: '2-3 days',
            features: ['Delicate fabric care', 'Odor removal', 'Professional pressing', 'Min 2 curtains'],
          },
          {
            id: 'laundry-press',
            name: 'Laundry & Pressing',
            price: 3500,
            duration: '1-2 days',
            features: ['Standard wash', 'Stain treatment', 'Deep cleaning', 'Expert ironing'],
            recommended: true,
          },
          {
            id: 'premium',
            name: 'Curtain Premium Service',
            price: 4500,
            duration: '2 days',
            features: ['Luxury fabric care', 'Ultra-deep cleaning', 'Fabric protection', 'Priority service'],
          },
        ]
      : [
          {
            id: 'basic',
            name: 'Basic',
            price: 2500,
            duration: '2 hours',
            features: ['Living room cleaning', 'Kitchen cleaning', 'Basic dusting'],
          },
          {
            id: 'standard',
            name: 'Standard',
            price: 4500,
            duration: '3 hours',
            features: ['All basic features', 'Bedroom cleaning', 'Bathroom sanitizing', 'Floor mopping'],
            recommended: true,
          },
          {
            id: 'premium',
            name: 'Premium',
            price: 7500,
            duration: '4-5 hours',
            features: ['All standard features', 'Deep cleaning', 'Window cleaning', 'Appliance cleaning', 'Organizing'],
          },
        ],
  };

  const reviews = [
    { id: 1, name: 'Priya Silva', rating: 5, date: '2 days ago', comment: 'Excellent service! The team was professional and thorough. My home looks amazing!' },
    { id: 2, name: 'Rajesh Kumar', rating: 5, date: '1 week ago', comment: 'Very satisfied with the cleaning. They paid attention to every detail.' },
    { id: 3, name: 'Nimal Fernando', rating: 4, date: '2 weeks ago', comment: 'Good service overall. Arrived on time and did a great job.' },
  ];

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
                  <span className="text-lg">{service.rating}</span>
                  <span className="text-gray-600">({service.reviews} reviews)</span>
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
              {service.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-xl p-6 cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? 'ring-2 ring-purple-600 shadow-lg'
                      : 'hover:shadow-md'
                  } ${pkg.recommended ? 'relative' : ''}`}
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
              <Link
                to={`/reviews/${service.id}`}
                className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Write a Review
              </Link>
            </div>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg">{review.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}