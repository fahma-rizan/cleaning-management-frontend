import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User } from './types';
import Services from './components/Services';
import ServiceDetails from './components/ServiceDetails';
import Booking from './components/Booking';
import Login from './components/Login';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // On app load, restore user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };


  const handleToggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to /services */}
          <Route path="/" element={<Navigate to="/services" replace />} />

          {/* Services listing page */}
          <Route
            path="/services"
            element={
              <Services
                user={user}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={handleToggleTheme}
              />
            }
          />

          {/* Service detail page */}
          <Route
            path="/services/:id"
            element={
              <ServiceDetails
                user={user}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={handleToggleTheme}
              />
            }
          />

          {/* Booking page — requires a logged-in user */}
          <Route
            path="/booking/:serviceId"
            element={
              user ? (
                <Booking
                  user={user}
                  onLogout={handleLogout}
                  theme={theme}
                  onToggleTheme={handleToggleTheme}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Placeholder routes referenced by components (prevents broken navigation) */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/payment" element={<PlaceholderPage title="Payment Page" />} />
          <Route path="/reviews/:id" element={<PlaceholderPage title="Reviews Page" />} />
          <Route path="/dashboard" element={<PlaceholderPage title="Customer Dashboard" />} />
          <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard" />} />
          <Route path="*" element={<Navigate to="/services" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-700 mb-4">{title}</h1>
        <p className="text-gray-500 mb-6">This page belongs to another team member's scope.</p>
        <a href="/services" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
          ← Back to Services
        </a>
      </div>
    </div>
  );
}
