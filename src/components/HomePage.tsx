import { Link } from 'react-router-dom';
import { Sparkles, Home, Shirt, Sofa, Wind, Star, Clock, Shield, DollarSign } from 'lucide-react';
import Header from './Header';
import ChatbotFinder from './ChatbotFinder';
import type { User } from '../types';

interface HomePageProps {
  user: User | null;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function HomePage({ user, onLogout, theme = 'light', onToggleTheme, onProfileClick }: HomePageProps) {
  const services = [
    { id: 1, name: 'Home/Office Cleaning', icon: Home, description: 'Complete home and office cleaning services', color: 'bg-purple-500' },
    { id: 2, name: 'Laundry Service', icon: Shirt, description: 'Professional laundry and ironing', color: 'bg-purple-400' },
    { id: 3, name: 'Shampoo Vacuum Cleaning', icon: Sofa, description: 'Deep cleaning for sofas, mattresses & carpets', color: 'bg-purple-600' },
    { id: 4, name: 'Curtain Cleaning', icon: Wind, description: 'Dry cleaning, laundry, or premium curtain care with removal & reinstallation options', color: 'bg-purple-700' },
  ];

  const features = [
    { icon: Clock, title: 'Flexible Scheduling', description: 'Book at your preferred time' },
    { icon: Shield, title: 'Verified Staff', description: 'Trusted and trained cleaners' },
    { icon: Star, title: 'Quality Service', description: 'Top-rated cleaning services' },
    { icon: DollarSign, title: 'Transparent Pricing', description: 'No hidden charges' },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors flex flex-col">
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
      <ChatbotFinder />
      
      {/* Main Content Container - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-4xl mb-3 dark:text-white leading-tight">
              Professional Cleaning Services at Your Doorstep
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-5">
              Book reliable cleaning services online with real-time tracking, secure payments, and verified professionals.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to={user ? "/services" : "/login?redirect=/services"}
                className="bg-purple-600 text-white px-7 py-2.5 rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 transition-colors text-sm font-medium"
              >
                Browse Services
              </Link>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-6 py-8">
          <h2 className="text-2xl text-center mb-6 dark:text-white font-semibold">Our Services</h2>
          <div className="grid grid-cols-4 gap-4 max-w-6xl mx-auto">
            {services.map((service) => {
              const IconComponent = service.icon;
              // Map service IDs to category filters in Services page
              const categoryMap: { [key: number]: string } = {
                1: 'home',
                2: 'laundry',
                3: 'shampoo',
                4: 'curtains'
              };
              const category = categoryMap[service.id] || 'all';
              
              return (
                <Link
                  key={service.id}
                  to={user ? `/services?category=${category}` : "/login"}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className={`${service.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base mb-1 dark:text-white font-semibold">{service.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{service.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 dark:bg-gray-800/50 py-8 transition-colors">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl text-center mb-6 dark:text-white font-semibold">Why Choose Us</h2>
            <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <IconComponent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-base mb-1 dark:text-white font-semibold">{feature.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-8">
          <div className="bg-purple-600 dark:bg-purple-700 rounded-2xl p-8 text-center text-white max-w-4xl mx-auto transition-colors">
            <h2 className="text-2xl mb-3 font-semibold">Ready to Get Started?</h2>
            <p className="text-base mb-5 opacity-90">
              Join thousands of satisfied customers enjoying hassle-free cleaning services
            </p>
            <Link
              to={user ? "/services" : "/login"}
              className="bg-white dark:bg-gray-100 text-purple-600 dark:text-purple-700 px-7 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors inline-block text-sm font-medium"
            >
              Book a Service Now
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-black text-white py-4 transition-colors">
          <div className="container mx-auto px-6 text-center">
            <p className="text-sm mb-1 font-medium">&copy; 2025 CLOUD LAUNDRY.LK</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">DevXcel - University of Moratuwa - IS2901 Project</p>
          </div>
        </footer>
      </div>
    </div>
  );
}