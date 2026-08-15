import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Home, Shirt, Sofa, Wind, Search, Star, Clock, DollarSign } from 'lucide-react';
import Header from './Header';
import BackButton from './BackButton';
import type { User } from '../types';
import AIEstimator from './AIEstimator';
import ChatbotFinder from './ChatbotFinder';
import OffersDiscounts from './OffersDiscounts';
import { api } from '../services/api.service';

interface ServicesProps {
  user: User | null;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function Services({ user, onLogout, theme = 'light', onToggleTheme, onProfileClick }: ServicesProps) {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'all';
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [showEstimator, setShowEstimator] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

 
// Keep only this (add categoryFromUrl to sync):
useEffect(() => {
  setSelectedCategory(categoryFromUrl);
  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const data = await api.get(
        categoryFromUrl === 'all'
          ? '/services'
          : `/services?category=${categoryFromUrl}`
      );
      setServices(data.services);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoadingServices(false);
    }
  };
  fetchServices();
}, [categoryFromUrl]);

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'home', name: 'Home/Office Cleaning' },
    { id: 'laundry', name: 'Laundry' },
    { id: 'shampoo', name: 'Shampoo Vacuum Cleaning' },
    { id: 'curtain', name: 'Curtains' },
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          <p className="text-gray-600 dark:text-gray-300 mb-8">Choose from our wide range of professional cleaning services</p>

          {/* AI Estimator Toggle */}
          <div className="mb-8">
            <button
              onClick={() => setShowEstimator(!showEstimator)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
            >
              {showEstimator ? 'Hide' : 'Try'} AI Price Estimator ✨
            </button>
          </div>

          {showEstimator && (
            <div className="mb-12">
              <AIEstimator />
            </div>
          )}

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
                    onClick={() => navigate(`/services?category=${category.id}`)}
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
              const IconComponent = service.icon ||null;
              return (
                <div key={service._id || service.serviceId} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{service.rating}</span>
                      <span className="text-xs text-gray-500">({service.reviews})</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        {IconComponent && typeof IconComponent !== 'string' && <IconComponent className="w-6 h-6 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl mb-1 dark:text-white">{service.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{service.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {(service.features || []).slice(0, 3).map((feature: string, idx: number) => (
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
                        to={`/services/${service.serviceId}`}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center"
                      >
                        View Details
                      </Link>
                      <Link
                        to={user ? `/booking/${service.serviceId}` : `/login?redirect=/booking/${service.serviceId}`}
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
