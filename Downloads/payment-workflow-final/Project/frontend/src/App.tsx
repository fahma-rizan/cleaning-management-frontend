import { useState, useEffect, Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { socket } from './socket'; // Import the shared socket instance

// Core components - load immediately
import PaymentPage from './components/PaymentPage';
import PaymentGatewayPage from './components/PaymentGatewayPage';
import PaymentSuccessPage from './components/PaymentSuccessPage';
import PaymentFailedPage from './components/PaymentFailedPage';
import BookingSuccessPage from './components/BookingSuccessPage';
import WorkflowAssistant from './components/admin/WorkflowAssistant';

// Lazy load heavy/reporting components
const Invoice = lazy(() => import('./components/Invoice'));
const PaymentReportExport = lazy(() => import('./components/PaymentReportExport'));
const RefundWorkflow = lazy(() => import('./components/RefundWorkflow'));
const EmailTemplates = lazy(() => import('./components/EmailTemplates'));
const StaffInvoicePage = lazy(() => import('./components/StaffInvoicePage'));
const StaffInvoiceViewer = lazy(() => import('./components/StaffInvoiceViewer'));
const FinancialDashboard = lazy(() => import('./components/admin/FinancialDashboard'));
const PaymentLinkPage = lazy(() => import('./components/PaymentLinkPage'));
const BalancePaymentPage = lazy(() => import('./components/BalancePaymentPage'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const ReschedulePage = lazy(() => import('./components/ReschedulePage'));
const CancelPage = lazy(() => import('./components/CancelPage'));
const StaffDashboard = lazy(() => import('./components/staff/StaffDashboard'));
const PriceReductionWorkflow = lazy(() => import('./components/PriceReductionWorkflow'));
const AIInvoiceAssistant     = lazy(() => import('./components/AIInvoiceAssistant'));
// FIX: was missing entirely — this is why /job-complete/:bookingId showed
// "No routes matched location" when the staff invoice QR code was scanned.
const JobCompletePage        = lazy(() => import('./components/JobCompletePage'));

import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const DEMO_USER = {
  id: 'user-001',
  name: 'Kavya Perera',
  email: 'kavya@example.com',
  phone: '+94 771 234 567',
  role: 'customer' as const,
  verified: true,
};

// App content that requires authentication
const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Use demo user for development, replace with real auth later

  const DEMO_ADMIN = {
  id:        'admin-001',
  name:      'Aaysha',
  email:     'admin@cloudlaundry.lk',
  phone:     '+94 112 345 678',
  role:      'admin' as const,
  adminRole: 'Admin' as const,
  verified:  true,
  token:     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYWRtaW4tMDAxIiwiZW1haWwiOiJhZG1pbkBjbG91ZGxhdW5kcnkubGsiLCJyb2xlIjoiYWRtaW4ifSwiaWF0IjoxNzgxMTk5OTA5LCJleHAiOjE3ODM3OTE5MDl9.P0zEwvcWh9yX41NHOlqrrGVV4-yHQe-LbHU12eKkZ14',
};


    const currentUser = user ? { ...user, verified: user.verified ?? false, name: user.name || 'Demo User' } : DEMO_ADMIN;

  // Sync the demo token into localStorage so tokenStorage.getTokens() works
  // for all components that read auth via tokenStorage (FinancialDashboard,
  // EmailTemplates, NotificationCenter, AIInvoiceAssistant, StaffInvoiceViewer,
  // WorkflowAssistant). Without this, those components send requests with no
  // Authorization header and get 401 Unauthorized, even though DEMO_ADMIN has
  // a token defined above.
  useEffect(() => {
    if (!user && !localStorage.getItem('accessToken')) {
      localStorage.setItem('accessToken', DEMO_ADMIN.token);
      localStorage.setItem('refreshToken', DEMO_ADMIN.token);
    }
  }, [user]);

  // --- Socket.IO Connection Management ---
  useEffect(() => {
    if (currentUser) {
      // Connect to the server when a user is logged in
      socket.connect();
      socket.once('connect', () => {
        // Register the connected socket with the backend so it can target this user
        socket.emit('register', currentUser.id);
        console.log('Socket connected and registered', socket.id);
      });
    }

    // Disconnect when the component unmounts or user logs out
    return () => {
      socket.disconnect();
      console.log('Socket disconnected');
    };
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/"                  element={<Navigate to="/admin/financial-dashboard" replace />} />
          <Route path="/payment-gateway/:bookingId" element={<PaymentGatewayPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage user={currentUser} />} />
          <Route path="/payment-gateway"   element={<PaymentGatewayPage user={currentUser} />} />
          <Route path="/payment-success"   element={<PaymentSuccessPage user={currentUser} />} />
          <Route path="/payment-failed"    element={<PaymentFailedPage user={currentUser} />} />
          <Route path="/booking-success"   element={<BookingSuccessPage user={currentUser} />} />
          <Route path="/invoice/:bookingId" element={<Invoice user={currentUser} />} />
          <Route path="/payment-report"    element={<PaymentReportExport user={currentUser} />} />
          <Route path="/refund"            element={<RefundWorkflow user={currentUser} />} />
          <Route path="/email-templates"   element={<EmailTemplates user={currentUser} />} />
          <Route path="/staff-invoice/new" element={<StaffInvoicePage user={currentUser} />} />
          <Route path="/staff-invoice/:invoiceNumber" element={<StaffInvoiceViewer user={currentUser} />} />
          <Route path="/staff/invoice-viewer"         element={<StaffInvoiceViewer user={currentUser} />} />
          <Route path="/admin/financial-dashboard"    element={<FinancialDashboard user={currentUser} />} />
          <Route path="/admin/analytics"               element={
            <ErrorBoundary>
              <AnalyticsDashboard user={currentUser} />
            </ErrorBoundary>
          } />
          <Route path="/payment-link"                 element={<PaymentLinkPage user={currentUser} />} />
          <Route path="/balance-payment"              element={<BalancePaymentPage user={currentUser} />} />
          <Route path="/booking/reschedule"           element={<ReschedulePage />} />
          <Route path="/booking/cancel"               element={<CancelPage />} />
          <Route path="/staff-dashboard"             element={<StaffDashboard />} />
          <Route path="/price-reduction" element={<PriceReductionWorkflow user={currentUser} />} />
          <Route path="/ai-invoice" element={<AIInvoiceAssistant user={currentUser} />} />
          <Route path="/ai-assistant" element={<WorkflowAssistant user={currentUser} />} />
          {/* FIX: added — staff invoice QR code links here to mark a job complete on-site */}
          <Route path="/job-complete/:bookingId" element={<JobCompletePage />} />
        </Routes>
      </Suspense>
      </BrowserRouter>
      <WorkflowAssistant user={currentUser} />
    </>
  );
};

// Main App component
export default function App() {
 return (
    <>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
  );
}
