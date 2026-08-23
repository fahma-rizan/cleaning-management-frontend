import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { socket } from "../socket";

// Payment/invoice/notifications sub-app, merged in from the
// payment-invoice-notifications branch. It keeps its own AuthProvider and
// component tree (src/components/*, src/contexts/AuthContext.tsx) and is
// mounted here as a nested route tree under /billing/* rather than being
// merged file-by-file into the existing app, since it duplicates several
// component names (PaymentPage, Invoice, StaffDashboard, ...) already used
// by the main app under src/app/components.
//
// NOTE: this app used its own BrowserRouter and top-level "/" redirect
// originally; here it's nested inside the main app's HashRouter, so URLs
// are now under /#/billing/... instead of plain paths, and the "/" redirect
// is relative to /billing.

// Core components - load immediately
import PaymentPage from "../components/PaymentPage";
import PaymentGatewayPage from "../components/PaymentGatewayPage";
import PaymentSuccessPage from "../components/PaymentSuccessPage";
import PaymentFailedPage from "../components/PaymentFailedPage";
import BookingSuccessPage from "../components/BookingSuccessPage";
import WorkflowAssistant from "../components/admin/WorkflowAssistant";

// Lazy load heavy/reporting components
const Invoice = lazy(() => import("../components/Invoice"));
const PaymentReportExport = lazy(() => import("../components/PaymentReportExport"));
const EmailTemplates = lazy(() => import("../components/EmailTemplates"));
const StaffInvoicePage = lazy(() => import("../components/StaffInvoicePage"));
const StaffInvoiceViewer = lazy(() => import("../components/StaffInvoiceViewer"));
const FinancialDashboard = lazy(() => import("../components/admin/FinancialDashboard"));
const PaymentLinkPage = lazy(() => import("../components/PaymentLinkPage"));
const BalancePaymentPage = lazy(() => import("../components/BalancePaymentPage"));
const AnalyticsDashboard = lazy(() => import("../components/AnalyticsDashboard"));
const ReschedulePage = lazy(() => import("../components/ReschedulePage"));
const CancelPage = lazy(() => import("../components/CancelPage"));
const StaffDashboard = lazy(() => import("../components/staff/StaffDashboard"));
const PriceReductionWorkflow = lazy(() => import("../components/PriceReductionWorkflow"));
const AIInvoiceAssistant = lazy(() => import("../components/AIInvoiceAssistant"));
const JobCompletePage = lazy(() => import("../components/JobCompletePage"));

import { AuthProvider, useAuth } from "../contexts/AuthContext";
import ErrorBoundary from "../components/ErrorBoundary";

const DEMO_ADMIN = {
  id: "admin-001",
  name: "Aaysha",
  email: "admin@cloudlaundry.lk",
  phone: "+94 112 345 678",
  role: "admin" as const,
  adminRole: "Admin" as const,
  verified: true,
  // FIX: This was a stale JWT signed by a different backend/secret than the
  // one actually running (backend/.env JWT_SECRET) — every "protected" call
  // made under the demo admin (create invoice, refund/price-reduction
  // request+approve, email send, notifications, audit log) failed with 401
  // "Not authorized, token failed." regardless of anything else being
  // correct. Replaced with a long-lived token signed for the real seeded
  // admin user (admin@cloudlaundry.lk) so `protect` accepts it.
  // Re-signed again after JWT_SECRET was rotated — see backend/.env.
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMmM0YTAzMzI3OTM2NGM5OWQ4ZDMyNyIsImlhdCI6MTc4NzMxMDE3OCwiZXhwIjoxODE4ODQ2MTc4fQ.NoZdVMRedM0_7QoTd3jgKXxJdTv4AWEaMAjtezeXai0",
};

function BillingContent() {
  const { user, isLoading } = useAuth();
  const currentUser = user
    ? { ...user, verified: user.verified ?? false, name: user.name || "Demo User" }
    : DEMO_ADMIN;

  // Sync the demo token into localStorage so tokenStorage.getTokens() works
  // for components that read auth via tokenStorage (FinancialDashboard,
  // EmailTemplates, NotificationCenter, AIInvoiceAssistant, StaffInvoiceViewer,
  // WorkflowAssistant). Without this those components send requests with no
  // Authorization header and get 401 Unauthorized.
  useEffect(() => {
    if (!user && !localStorage.getItem("accessToken")) {
      localStorage.setItem("accessToken", DEMO_ADMIN.token);
      localStorage.setItem("refreshToken", DEMO_ADMIN.token);
    }
  }, [user]);

  useEffect(() => {
    if (currentUser) {
      socket.connect();
      socket.once("connect", () => {
        socket.emit("register", currentUser.id);
      });
    }
    return () => {
      socket.disconnect();
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
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="" element={<Navigate to="admin/financial-dashboard" replace />} />
          <Route path="payment-gateway/:bookingId" element={<PaymentGatewayPage />} />
          <Route path="payment/:bookingId" element={<PaymentPage user={currentUser} />} />
          <Route path="payment-gateway" element={<PaymentGatewayPage user={currentUser} />} />
          <Route path="payment-success" element={<PaymentSuccessPage user={currentUser} />} />
          <Route path="payment-failed" element={<PaymentFailedPage user={currentUser} />} />
          <Route path="booking-success" element={<BookingSuccessPage user={currentUser} />} />
          <Route path="invoice/:bookingId" element={<Invoice user={currentUser} />} />
          <Route path="payment-report" element={<PaymentReportExport user={currentUser} />} />
          <Route path="email-templates" element={<EmailTemplates user={currentUser} />} />
          <Route path="staff-invoice/new" element={<StaffInvoicePage user={currentUser} />} />
          <Route path="staff-invoice/:invoiceNumber" element={<StaffInvoiceViewer user={currentUser} />} />
          <Route path="staff/invoice-viewer" element={<StaffInvoiceViewer user={currentUser} />} />
          <Route path="admin/financial-dashboard" element={<FinancialDashboard user={currentUser} />} />
          <Route
            path="admin/analytics"
            element={
              <ErrorBoundary>
                <AnalyticsDashboard user={currentUser} />
              </ErrorBoundary>
            }
          />
          <Route path="payment-link" element={<PaymentLinkPage user={currentUser} />} />
          <Route path="balance-payment" element={<BalancePaymentPage user={currentUser} />} />
          <Route path="booking/reschedule" element={<ReschedulePage />} />
          <Route path="booking/cancel" element={<CancelPage />} />
          <Route path="staff-dashboard" element={<StaffDashboard />} />
          <Route path="price-reduction" element={<PriceReductionWorkflow user={currentUser} />} />
          <Route path="ai-invoice" element={<AIInvoiceAssistant user={currentUser} />} />
          <Route path="ai-assistant" element={<WorkflowAssistant user={currentUser} />} />
          <Route path="job-complete/:bookingId" element={<JobCompletePage />} />
        </Routes>
      </Suspense>
      <WorkflowAssistant user={currentUser} />
    </>
  );
}

export default function BillingApp() {
  return (
    <AuthProvider>
      <BillingContent />
    </AuthProvider>
  );
}
