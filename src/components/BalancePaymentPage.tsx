import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';
import { tokenStorage } from '../utils/auth';

interface BalancePaymentPageProps {
  user: User;
}

const API_BASE_URL = 'http://localhost:4000/api';

interface BalanceInfo {
  invoiceId: string;
  invoiceNumber: string;
  bookingId: string;
  serviceType: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  customerName: string;
}

interface PayHerePayment {
  sandbox: string;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
}

type Stage = 'loading' | 'ready' | 'redirecting' | 'processing' | 'done' | 'cancelled' | 'error';

// FIX (task #20): this entire page used to be a demo shell — a fake 2.5s
// "processing" delay, a client-generated invoice number, and a bare
// POST /invoices that created a brand-new, unlinked invoice (the same
// double-counting bug fixed elsewhere via createCompletionInvoice, just
// unfixed here). Rebuilt around the real flow: fetch the actual invoice by
// invoiceId, hand off to PayHere's hosted checkout the same way
// PaymentGatewayPage.tsx does for new bookings, and let the
// /api/payhere/balance-notify webhook be the one place that actually marks
// the balance paid — this page just polls for that to have happened.
const pollForCompletion = async (
  invoiceId: string,
  authHeader: Record<string, string>,
  attempts = 10,
  delayMs = 1200
): Promise<BalanceInfo | null> => {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${API_BASE_URL}/payhere/balance-info/${invoiceId}`, { headers: authHeader });
      if (res.ok) {
        const data: BalanceInfo = await res.json();
        if (data.balanceAmount <= 0) return data;
      }
    } catch {
      // network hiccup — keep retrying until attempts run out
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return null;
};

export default function BalancePaymentPage({ user }: BalancePaymentPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const invoiceId = searchParams.get('invoiceId');
  const returnStatus = searchParams.get('payment_status'); // 'returned' | 'cancelled' (from PayHere's return/cancel redirect)

  const [stage, setStage] = useState<Stage>('loading');
  const [info, setInfo] = useState<BalanceInfo | null>(null);
  const [error, setError] = useState<string>('');

  const authHeader = (): Record<string, string> => {
    const tokens = tokenStorage.getTokens();
    return tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
  };

  const fetchInfo = useCallback(async () => {
    if (!invoiceId) {
      setError('This payment link is missing its invoice reference. Please use the link from your reminder email.');
      setStage('error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/payhere/balance-info/${invoiceId}`, { headers: authHeader() });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || 'Could not find this invoice.');
      }
      const data: BalanceInfo = await res.json();
      setInfo(data);
      if (data.balanceAmount <= 0) {
        setStage('done');
      } else if (returnStatus === 'cancelled') {
        setStage('cancelled');
      } else {
        setStage('ready');
      }
    } catch (err: any) {
      setError(err.message || 'Could not load payment details.');
      setStage('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  // If PayHere redirected the main window back here with ?payment_status=returned
  // (rather than the popup flow below), the webhook may still be a beat behind —
  // give it a moment and re-check.
  useEffect(() => {
    if (returnStatus === 'returned' && invoiceId && stage === 'ready') {
      setStage('processing');
      pollForCompletion(invoiceId, authHeader()).then((result) => {
        if (result) {
          setInfo(result);
          setStage('done');
        } else {
          setError('We could not confirm your payment yet. If money left your account, it will be reflected here shortly — please refresh in a minute.');
          setStage('error');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnStatus, stage, invoiceId]);

  const handlePay = async () => {
    if (!invoiceId) return;
    setStage('redirecting');
    try {
      const res = await fetch(`${API_BASE_URL}/payhere/generate-balance-hash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ invoiceId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || 'Could not start the payment.');
      }
      const { payhere_payment, hash } = await res.json();
      const params: PayHerePayment = { ...payhere_payment, hash };

      const popup = window.open('', 'payhere_balance_checkout', 'width=720,height=800');
      const submitInCurrentWindow = !popup || popup.closed;
      const targetDoc = submitInCurrentWindow ? document : (popup as Window).document;

      const form = targetDoc.createElement('form');
      form.method = 'POST';
      form.action = 'https://sandbox.payhere.lk/pay/checkout';
      form.target = '_self';
      for (const key in params) {
        const input = targetDoc.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = (params as any)[key];
        form.appendChild(input);
      }
      targetDoc.body.appendChild(form);
      form.submit();

      if (!submitInCurrentWindow && popup) {
        popup.focus();
        setStage('processing');
        const timer = setInterval(async () => {
          try {
            if (popup.closed) {
              clearInterval(timer);
              const result = await pollForCompletion(invoiceId, authHeader());
              if (result) {
                setInfo(result);
                setStage('done');
              } else {
                setError('Payment was not completed. This could be due to insufficient funds, a cancelled payment, or a declined card.');
                setStage('error');
              }
            }
          } catch {
            // ignore cross-origin access errors while the popup is still on PayHere
          }
        }, 500);
      }
      // If submitInCurrentWindow, the browser is now navigating away to
      // PayHere — it will come back via return_url/cancel_url with
      // ?payment_status=... handled by the effect above.
    } catch (err: any) {
      setError(err.message || 'Could not connect to the payment gateway.');
      setStage('error');
    }
  };

  // ── Error screen ─────────────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full"><XCircle className="w-14 h-14 text-red-500" /></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something Went Wrong</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <div className="space-y-3">
              <button onClick={fetchInfo} className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 font-medium">
                Try Again
              </button>
              <button onClick={() => navigate('/')} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Cancelled screen ─────────────────────────────────────────────────
  if (stage === 'cancelled' && info) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-100 p-4 rounded-full"><AlertCircle className="w-14 h-14 text-amber-500" /></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
            <p className="text-gray-500 text-sm mb-6">
              You cancelled the checkout. Your balance of Rs. {info.balanceAmount.toLocaleString()} is still outstanding — you can try again below.
            </p>
            <button onClick={() => setStage('ready')} className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 font-medium">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Processing / redirecting ─────────────────────────────────────────
  if (stage === 'loading' || stage === 'redirecting' || stage === 'processing') {
    const message = stage === 'loading'
      ? 'Loading payment details...'
      : stage === 'redirecting'
      ? 'Connecting to secure payment gateway...'
      : 'Confirming your payment...';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <DemoTopBar user={user} />
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  // ── Done screen ───────────────────────────────────────────────────────
  if (stage === 'done' && info) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DemoTopBar user={user} />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full"><CheckCircle className="w-14 h-14 text-green-500" /></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Balance Paid! 🎉</h1>
            <p className="text-gray-500 mb-6">Your booking is now fully paid.</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Booking ID</span><span className="font-mono font-semibold">{info.bookingId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Invoice</span><span className="font-mono text-xs">{info.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Paid</span><span className="font-semibold text-green-600">Rs. {info.paidAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-semibold text-green-600">Fully Paid ✅</span></div>
            </div>
            <button onClick={() => navigate('/')} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Balance payment form ─────────────────────────────────────────────
  if (!info) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoTopBar user={user} />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Balance Payment Due</h1>
            <p className="text-gray-500 text-sm mt-1">Please pay the remaining balance after service completion</p>
          </div>

          <div className="bg-orange-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span className="font-semibold">{info.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-mono font-semibold">{info.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Invoice</span>
              <span className="font-mono text-xs">{info.invoiceNumber}</span>
            </div>
            <div className="flex justify-between border-t border-orange-200 pt-2 text-base">
              <span className="text-gray-700 font-semibold">Balance Due</span>
              <span className="font-bold text-orange-600">Rs. {info.balanceAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-sm text-blue-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>This is the remaining balance from your advance payment. The service has been completed.</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5 justify-center">
            <Shield className="w-4 h-4" />
            <span>Secure 256-bit SSL encrypted payment</span>
          </div>

          <button onClick={handlePay}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-md flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pay Balance — Rs. {info.balanceAmount.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
