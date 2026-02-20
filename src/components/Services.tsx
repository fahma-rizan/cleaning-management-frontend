import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Shirt, Sofa, Wind, Search, Star, Clock, DollarSign } from 'lucide-react';
import Header from './Header';
import BackButton from './BackButton';
import type { User } from '../types';
import AIEstimator from './AIEstimator';
import ChatbotFinder from './ChatbotFinder';
import OffersDiscounts from './OffersDiscounts';

interface ServicesProps {
  user: User | null;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function Services({ user, onLogout, theme = 'light', onToggleTheme, onProfileClick }: ServicesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEstimator, setShowEstimator] = useState(false);

  const services = [
    {
      id: 1,
      name: 'House Deep Cleaning',
      category: 'home',
      icon: Home,
      description: 'Comprehensive deep cleaning service for thorough home sanitization',
      price: 'From LKR 8,000',
      duration: '4-6 hours',
      rating: 4.9,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDY5NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Complete Home Sanitization', 'Hard-to-reach Areas', 'Appliance Cleaning', 'Window Cleaning'],
    },
    {
      id: 6,
      name: 'General Cleaning',
      category: 'home',
      icon: Home,
      description: 'Regular cleaning services including dusting, mopping, and organizing',
      price: 'From LKR 2,500',
      duration: '2-3 hours',
      rating: 4.8,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDY5NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Dusting & Wiping', 'Floor Cleaning', 'Kitchen Cleaning', 'Bathroom Sanitizing'],
    },
    {
      id: 5,
      name: 'Commercial Cleaning',
      category: 'home',
      icon: Home,
      description: 'Professional cleaning services for offices and commercial workspaces',
      price: 'From LKR 5,000',
      duration: '3-4 hours',
      rating: 4.8,
      reviews: 167,
      image: 'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDY5NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Desk Cleaning', 'Floor Mopping', 'Restroom Sanitizing', 'Trash Removal'],
    },
    {
      id: 7,
      name: 'Floor Cleaning',
      category: 'home',
      icon: Home,
      description: 'Specialized floor cleaning for all types of flooring',
      price: 'From LKR 3,000',
      duration: '2-3 hours',
      rating: 4.7,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDY5NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Tile Cleaning', 'Hardwood Care', 'Marble Polishing', 'Grout Cleaning'],
    },
    {
      id: 8,
      name: 'Floor - Cut and Polish',
      category: 'home',
      icon: Home,
      description: 'Professional floor cutting and polishing services for marble and granite',
      price: 'From LKR 6,500',
      duration: '4-5 hours',
      rating: 4.9,
      reviews: 145,
      image: 'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDY5NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Diamond Cutting', 'High-Speed Polishing', 'Crystallization', 'Sealing'],
    },
    {
      id: 3,
      name: 'Sofa Cleaning',
      category: 'shampoo',
      icon: Sofa,
      description: 'Deep shampoo vacuum cleaning for sofas and upholstered furniture',
      price: 'From LKR 3,500',
      duration: '1-2 hours',
      rating: 4.7,
      reviews: 178,
      image: 'https://images.unsplash.com/photo-1759722665623-c4c1075c0a6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2ZhJTIwY2xlYW5pbmclMjBpbnRlcmlvciUyMGZ1cm5pdHVyZXxlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Shampoo Cleaning', 'Stain Removal', 'Odor Elimination', 'Fabric Protection'],
    },
    {
      id: 13,
      name: 'Mattress Cleaning with Steam',
      category: 'shampoo',
      icon: Sofa,
      description: 'Professional steam cleaning for mattresses with deep sanitization',
      price: 'From LKR 4,000',
      duration: '1-2 hours',
      rating: 4.8,
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1759722665623-c4c1075c0a6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2ZhJTIwY2xlYW5pbmclMjBpbnRlcmlvciUyMGZ1cm5pdHVyZXxlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Steam Sanitization', 'Dust Mite Removal', 'Allergen Elimination', 'Deep Cleaning'],
    },
    {
      id: 14,
      name: 'Carpet Cleaning',
      category: 'shampoo',
      icon: Sofa,
      description: 'Professional shampoo vacuum cleaning for carpets and rugs',
      price: 'From LKR 2,800',
      duration: '2-3 hours',
      rating: 4.6,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1759722665623-c4c1075c0a6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2ZhJTIwY2xlYW5pbmclMjBpbnRlcmlvciUyMGZ1cm5pdHVyZXxlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Shampoo Vacuum', 'Stain Treatment', 'Deodorizing', 'Fast Drying'],
    },
    {
      id: 9,
      name: 'Dry Cleaning',
      category: 'laundry',
      icon: Shirt,
      description: 'Professional dry cleaning for delicate fabrics and garments',
      price: 'From LKR 600/piece',
      duration: '48-72 hours',
      rating: 4.9,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1673085518459-c60e0615c099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXVuZHJ5JTIwc2VydmljZSUyMGZyZXNoJTIwY2xvdGhlc3xlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Free Pickup & Delivery', 'Delicate Fabric Care', 'Stain Removal', 'Professional Finishing'],
    },
    {
      id: 10,
      name: 'Washing and Pressing',
      category: 'laundry',
      icon: Shirt,
      description: 'Complete wash, dry, fold, and iron services with free pickup and delivery',
      price: 'From LKR 400/kg',
      duration: '24-48 hours',
      rating: 4.9,
      reviews: 456,
      image: 'https://images.unsplash.com/photo-1673085518459-c60e0615c099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXVuZHJ5JTIwc2VydmljZSUyMGZyZXNoJTIwY2xvdGhlc3xlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Free Pickup & Delivery', 'Wash & Fold', 'Professional Ironing', 'Stain Removal'],
    },
    {
      id: 11,
      name: 'Pressing Only',
      category: 'laundry',
      icon: Shirt,
      description: 'Professional ironing and pressing services for your clean garments',
      price: 'From LKR 150/piece',
      duration: '12-24 hours',
      rating: 4.8,
      reviews: 278,
      image: 'https://images.unsplash.com/photo-1673085518459-c60e0615c099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXVuZHJ5JTIwc2VydmljZSUyMGZyZXNoJTIwY2xvdGhlc3xlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Free Pickup & Delivery', 'Professional Pressing', 'Crease Removal', 'Quick Turnaround'],
    },
    {
      id: 4,
      name: 'Curtain Cleaning',
      category: 'curtains',
      icon: Wind,
      description: 'Expert curtain cleaning with 3 specialized methods and convenient add-on services',
      price: 'From LKR 2,500',
      duration: '2-3 days',
      rating: 4.8,
      reviews: 145,
      image: 'https://images.unsplash.com/photo-1660226817472-2c73d49c6dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXJ0YWluJTIwY2xlYW5pbmclMjB3aW5kb3clMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzcwNzM2MTg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      features: [
        'Dry Cleaning & Pressing',
        'Laundry & Pressing',
        'Curtain Premium Service',
        'Optional Removal & Installation',
        'Pickup & Delivery available'
      ],
    },
  ];

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'home', name: 'Home/Office Cleaning' },
    { id: 'laundry', name: 'Laundry' },
    { id: 'shampoo', name: 'Shampoo Vacuum Cleaning' },
    { id: 'curtains', name: 'Curtains' },
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
      <ChatbotFinder />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          <h1 className="text-4xl mb-4 dark:text-white">Our Services</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Choose from our wide range of professional cleaning services
          </p>

          {/* AI Estimator Toggle */}
          <div className="mb-8">
            <button
              onClick={() => setShowEstimator(!showEstimator)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
            >
              {showEstimator ? 'Hide' : 'Try'} AI Price Estimator ✨
            </button>
          </div>

          {/* AI Estimator */}
          {showEstimator && (
            <div className="mb-12">
              <AIEstimator />
            </div>
          )}

          {/* Offers Section */}
          <OffersDiscounts />

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 mt-12">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <div key={service.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{service.rating}</span>
                      <span className="text-xs text-gray-500">({service.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <IconComponent className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl mb-1 dark:text-white">{service.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{service.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{service.price}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/services/${service.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center"
                      >
                        View Details
                      </Link>
                      <Link
                        to={user ? `/booking/${service.id}` : `/login?redirect=/booking/${service.id}`}
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 text-lg">No services found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}