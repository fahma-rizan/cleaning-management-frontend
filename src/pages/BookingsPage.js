import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../components/layout/CustomerLayout';
import useLoyalty from '../hooks/useLoyalty';
import { useAuth } from '../context/AuthContext';

const SERVICE_OPTIONS = [
  { value: 'house_deep_cleaning', label: 'House Deep Cleaning'  },
  { value: 'general_cleaning',    label: 'General Cleaning'     },
  { value: 'commercial_cleaning', label: 'Commercial Cleaning'  },
  { value: 'floor_cleaning',      label: 'Floor Cleaning'       },
  { value: 'floor_cut_polish',    label: 'Floor Cut & Polish'   },
  { value: 'sofa_cleaning',       label: 'Sofa Cleaning'        },
  { value: 'mattress_cleaning',   label: 'Mattress Cleaning'    },
  { value: 'carpet_cleaning',     label: 'Carpet Cleaning'      },
  { value: 'curtain_cleaning',    label: 'Curtain Cleaning'     },
];

const SUB_TYPES = {
  house_deep_cleaning: [
    { value: 'normal',             label: 'Normal Deep Cleaning' },
    { value: 'move_in_out',        label: 'Move In / Move Out'   },
    { value: 'after_construction', label: 'After Construction'   },
  ],
  general_cleaning:   [{ value: 'standard', label: 'Standard' }],
  commercial_cleaning: [
    { value: 'normal',             label: 'Normal Deep Cleaning' },
    { value: 'move_in_out',        label: 'Move In / Move Out'   },
    { value: 'after_construction', label: 'After Construction'   },
  ],
  floor_cleaning: [
    { value: 'tile',     label: 'Tile Cleaning'    },
    { value: 'hardwood', label: 'Hardwood Care'    },
    { value: 'marble',   label: 'Marble Polishing' },
  ],
  floor_cut_polish:  [{ value: 'standard', label: 'Standard' }],
  sofa_cleaning:     [{ value: 'standard', label: 'Standard' }],
  mattress_cleaning: [
    { value: 'single_top',  label: 'Single - Top Only' },
    { value: 'single_full', label: 'Single - Full'     },
    { value: 'double_top',  label: 'Double - Top Only' },
    { value: 'double_full', label: 'Double - Full'     },
    { value: 'queen_top',   label: 'Queen - Top Only'  },
    { value: 'queen_full',  label: 'Queen - Full'      },
    { value: 'king_top',    label: 'King - Top Only'   },
    { value: 'king_full',   label: 'King - Full'       },
  ],
  carpet_cleaning:  [{ value: 'standard', label: 'Standard' }],
  curtain_cleaning: [
    { value: 'dry_cleaning', label: 'Dry Cleaning & Pressing' },
    { value: 'laundry',      label: 'Laundry & Pressing'      },
    { value: 'premium',      label: 'Premium Service'         },
  ],
};

const USAGE_META = {
  sofa_cleaning:     { factor: 'seats',              label: 'Number of Seats',      placeholder: 'e.g. 3'   },
  mattress_cleaning: { factor: 'mattress_size_type', label: 'Number of Mattresses', placeholder: 'e.g. 1'   },
  curtain_cleaning:  { factor: 'curtains',           label: 'Number of Curtains',   placeholder: 'e.g. 6'   },
};

const getUsageMeta = (st) =>
  USAGE_META[st] || { factor: 'square_feet', label: 'Area (Square Feet)', placeholder: 'e.g. 350' };

const minDate = () => {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getToken = () =>
  sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') || '';

const API_BASE       = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const BOOKING_AMOUNT = 5000;
const ADVANCE_AMOUNT = BOOKING_AMOUNT * 0.2;
const TIER_RATES     = { bronze: 1, silver: 1.5, gold: 2, platinum: 3 };
const MIN_REDEEM     = 100;

const CANCELLABLE_STATUSES = ['pending_materials', 'materials_approved'];

const STATUS_META = {
  pending_materials:    { label: 'Pending',         color: '#F59E0B' },
  materials_approved:   { label: 'Materials Ready', color: '#2563EB' },
  materials_rejected:   { label: 'Rejected',        color: '#EF4444' },
  in_progress:          { label: 'In Progress',     color: '#7C3AED' },
  pending_verification: { label: 'Pending Review',  color: '#F97316' },
  completed:            { label: 'Completed',       color: '#10B981' },
  cancelled:            { label: 'Cancelled',       color: '#EF4444' },
};

const SERVICE_LABEL_MAP = Object.fromEntries(SERVICE_OPTIONS.map(o => [o.value, o.label]));

const PAYMENT_OPTIONS = [
  { value: 'full',         icon: '💳', label: 'Pay Full Amount Online',         tag: 'Instant Confirmation', description: 'Pay the complete amount now and confirm your booking',      amount: `Rs. ${BOOKING_AMOUNT.toLocaleString()}`, earnsPoints: true  },
  { value: 'advance',      icon: '👛', label: 'Pay Advance (20%)',               tag: 'Most Popular',         description: `Pay Rs.${ADVANCE_AMOUNT.toLocaleString()} now, Rs.${(BOOKING_AMOUNT-ADVANCE_AMOUNT).toLocaleString()} after service`, amount: `Rs. ${ADVANCE_AMOUNT.toLocaleString()}`, earnsPoints: true  },
  { value: 'cod',          icon: '💵', label: 'Cash on Delivery',                tag: 'Pay Later',            description: 'Pay cash to our service professional after completion',      amount: 'No advance payment', earnsPoints: false },
  { value: 'online_after', icon: '⏰', label: 'Online Payment After Completion', tag: 'Service First',        description: 'Complete service first, pay online later',                   amount: 'No advance payment', earnsPoints: false },
];

/* ────────────────────────────────────────────────────────────── */

const BookingsPage = () => {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const { account } = useLoyalty();

  const currentTier   = account?.currentTier || 'bronze';
  const rate          = TIER_RATES[currentTier] || 1;
  const tierName      = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);
  const fullPoints    = Math.floor((BOOKING_AMOUNT / 100) * rate);
  const advancePoints = Math.floor((ADVANCE_AMOUNT / 100) * rate);
  const currentBalance = account?.currentBalance || 0;

  const [activeTab, setActiveTab] = useState('book');

  const EMPTY_FORM = { serviceType: '', subType: '', usageFactorValue: '', scheduledDate: '', notes: '' };
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [focused,       setFocused]       = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState('');
  const [booking,       setBooking]       = useState(null);
  const [pointsEarned,  setPointsEarned]  = useState(0);

  // Redeem state — keep as plain string, convert to number only when needed
  const [redeemInput,    setRedeemInput]    = useState('');
  const [pointsRedeemed, setPointsRedeemed] = useState(0); // confirmed after booking

  const setField = (field) => (e) => {
    const val = e.target.value;
    setForm(prev => { const n = { ...prev, [field]: val }; if (field === 'serviceType') n.subType = ''; return n; });
  };

  const subTypeOptions = form.serviceType ? (SUB_TYPES[form.serviceType] || []) : [];
  const usageMeta      = getUsageMeta(form.serviceType);

  // Derived redeem values
  const redeemPts      = Math.max(0, parseInt(redeemInput, 10) || 0);
  const redeemValid    = redeemPts >= MIN_REDEEM && redeemPts <= currentBalance;
  const discountAmt    = redeemValid ? redeemPts : 0;
  const baseAmt        = paymentMethod === 'advance' ? ADVANCE_AMOUNT : BOOKING_AMOUNT;
  const finalAmt       = Math.max(0, baseAmt - discountAmt);

  // My Bookings
  const [myBookings,      setMyBookings]      = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [cancelTarget,    setCancelTarget]    = useState(null);
  const [cancelBusy,      setCancelBusy]      = useState(false);
  const [cancelDone,      setCancelDone]      = useState('');

  const fetchMyBookings = async () => {
    setBookingsLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (res.ok) {
        const list = data?.data?.bookings || data?.bookings || data?.data || [];
        setMyBookings(Array.isArray(list) ? list : []);
      }
    } catch { /* ignore */ }
    finally { setBookingsLoading(false); }
  };

  useEffect(() => { if (activeTab === 'my-bookings') fetchMyBookings(); }, [activeTab]); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentMethod) { setError('Please select a payment method to continue.'); return; }
    setSubmitting(true);
    setError('');

    try {
      // Step 1 — create booking
      const bookRes  = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          serviceType:      form.serviceType,
          subType:          form.subType,
          usageFactor:      usageMeta.factor,
          usageFactorValue: Number(form.usageFactorValue),
          scheduledDate:    new Date(form.scheduledDate).toISOString(),
          notes:            form.notes.trim(),
          items:            [{ name: 'Cleaning Service', quantity: 1, unitPrice: BOOKING_AMOUNT }],
          paymentMethod,
        }),
      });
      const bookData = await bookRes.json();
      if (!bookRes.ok) throw new Error(bookData.message || 'Booking failed. Please try again.');

      const createdBooking = bookData?.data?._id ? bookData.data : (bookData.booking || bookData);
      let awarded   = 0;
      let redeemed  = 0;

      // Step 2 — redeem points if entered and valid
      if (redeemPts >= MIN_REDEEM && redeemPts <= currentBalance && createdBooking?._id) {
        try {
          const redeemRes = await fetch(`${API_BASE}/loyalty/redeem`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body:    JSON.stringify({
              bookingId:        createdBooking._id,
              points:           redeemPts,
              bookingAmountInRs: BOOKING_AMOUNT,
            }),
          });
          if (redeemRes.ok) redeemed = redeemPts;
        } catch { /* non-critical */ }
      }

      // Step 3 — award points for online payment methods
      const userId = user?._id || user?.id;
      if ((paymentMethod === 'full' || paymentMethod === 'advance') && userId && createdBooking?._id) {
        const amountPaid   = paymentMethod === 'full' ? BOOKING_AMOUNT : ADVANCE_AMOUNT;
        const paymentStage = paymentMethod === 'full' ? 'full' : 'partial';
        try {
          const awardRes = await fetch(`${API_BASE}/loyalty/award`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body:    JSON.stringify({ customerId: userId, bookingId: createdBooking._id, amountPaid, paymentStage }),
          });
          if (awardRes.ok) awarded = paymentMethod === 'full' ? fullPoints : advancePoints;
        } catch { /* non-critical */ }
      }

      setPointsEarned(awarded);
      setPointsRedeemed(redeemed);
      setBooking(createdBooking);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelBusy(true);
    try {
      const res  = await fetch(`${API_BASE}/bookings/${cancelTarget._id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ status: 'cancelled', cancelReason: 'Customer requested cancellation' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cancellation failed');
      const pts = cancelTarget.pointsEarned || 0;
      setCancelDone(pts > 0
        ? `Booking cancelled. ${pts} loyalty points have been reversed from your account.`
        : 'Your booking has been cancelled successfully.');
      setCancelTarget(null);
      await fetchMyBookings();
    } catch { setCancelTarget(null); }
    finally { setCancelBusy(false); }
  };

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
  const inputStyle = (field) => ({
    width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: 14, borderRadius: 8,
    border:    focused === field ? '1px solid #7C3AED' : '1px solid #E5E7EB',
    boxShadow: focused === field ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
    outline: 'none', background: '#ffffff', color: '#111827',
    transition: 'border-color 0.15s, box-shadow 0.15s', appearance: 'auto',
  });
  const focus   = (f) => () => setFocused(f);
  const unfocus = ()  => setFocused('');

  const earnsPoints = paymentMethod === 'full' || paymentMethod === 'advance';
  const previewPts  = paymentMethod === 'full' ? fullPoints : advancePoints;
  const previewLine = paymentMethod === 'full'
    ? `You will earn ${fullPoints} pts for this payment`
    : paymentMethod === 'advance'
      ? `You will earn ${advancePoints} pts for the advance payment`
      : 'No loyalty points for this payment method';
  const previewSub = earnsPoints
    ? `Based on your ${tierName} tier rate (${rate} pt${rate !== 1 ? 's' : ''} per Rs.100)`
    : 'Choose Pay Full or Pay Advance to earn points';

  const TabBtn = ({ label, tabKey }) => (
    <button onClick={() => { setActiveTab(tabKey); setCancelDone(''); }} style={{
      padding: '10px 20px 11px', border: 'none', borderRadius: 0, background: 'transparent',
      color:      activeTab === tabKey ? '#7C3AED' : '#6B7280',
      fontWeight: activeTab === tabKey ? 700 : 500,
      fontSize: 13.5, cursor: 'pointer',
      borderBottom: activeTab === tabKey ? '2px solid #7C3AED' : '2px solid transparent',
      transition: 'all 0.15s',
    }}>{label}</button>
  );

  const Spinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #7C3AED', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}/>
    </div>
  );

  const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });

  const successCard = (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ background: '#ffffff', borderRadius: 14, padding: '44px 40px', maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 34 }}>✅</div>
        <h2 style={{ margin: '0 0 10px', fontWeight: 800, fontSize: 20, color: '#111827' }}>Booking Submitted Successfully!</h2>
        <p style={{ margin: '0 0 20px', fontSize: 13.5, color: '#6B7280', lineHeight: 1.7 }}>Your booking has been received. A material request has been automatically generated and sent to the admin for approval.</p>

        {(booking?._id || booking?.bookingRef) && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 10, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Booking ID</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED', fontFamily: 'monospace' }}>{booking?.bookingRef || booking?._id?.slice(-10)?.toUpperCase()}</span>
          </div>
        )}

        {pointsRedeemed > 0 && (
          <div style={{ margin: '0 0 16px', padding: '14px 18px', borderRadius: 12, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>💰</span>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: '#7C3AED' }}>Loyalty Points Redeemed</span>
            </div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>
              <span style={{ color: '#7C3AED', fontWeight: 700 }}>{pointsRedeemed} pts</span> = <span style={{ color: '#10B981', fontWeight: 700 }}>Rs. {pointsRedeemed} discount</span> applied
            </div>
          </div>
        )}

        {pointsEarned > 0 && (
          <div style={{ margin: '0 0 24px', padding: '16px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>🎁</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#065F46' }}>Loyalty Points Earned!</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10B981', marginBottom: 4 }}>+{pointsEarned} pts</div>
            <div style={{ fontSize: 12.5, color: '#6B7280' }}>Added to your loyalty account</div>
            <button onClick={() => navigate('/loyalty')} style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#065F46', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>View Loyalty Dashboard →</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { setBooking(null); setForm(EMPTY_FORM); setError(''); setPaymentMethod(''); setPointsEarned(0); setPointsRedeemed(0); setRedeemInput(''); }}
            style={{ padding: '10px 22px', borderRadius: 9, fontSize: 13.5, fontWeight: 600, background: 'linear-gradient(135deg, #7C3AED, #9333ea)', boxShadow: '0 4px 18px rgba(124,58,237,0.35)', border: 'none', color: '#fff', cursor: 'pointer' }}>
            Book Another Service
          </button>
          <button onClick={() => navigate('/')} style={{ padding: '10px 22px', borderRadius: 9, fontSize: 13.5, fontWeight: 600, background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151', cursor: 'pointer' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const bookingForm = (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '36px 24px 48px' }}>
      <div style={{ background: '#ffffff', borderRadius: 14, padding: '32px', maxWidth: 640, width: '100%', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            <div>
              <label style={labelStyle}>Service Type</label>
              <select required value={form.serviceType} onChange={setField('serviceType')} onFocus={focus('serviceType')} onBlur={unfocus} style={inputStyle('serviceType')}>
                <option value="">Select a service...</option>
                {SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Service Sub-Type</label>
              <select required disabled={!form.serviceType} value={form.subType} onChange={setField('subType')} onFocus={focus('subType')} onBlur={unfocus}
                style={{ ...inputStyle('subType'), background: !form.serviceType ? '#f9fafb' : '#ffffff', cursor: !form.serviceType ? 'not-allowed' : 'auto', color: !form.serviceType ? '#9CA3AF' : '#111827' }}>
                <option value="">{form.serviceType ? 'Select a sub-type...' : 'Select a service type first'}</option>
                {subTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>{usageMeta.label}</label>
              <input type="number" required min={1} value={form.usageFactorValue} onChange={setField('usageFactorValue')} onFocus={focus('usageFactorValue')} onBlur={unfocus} placeholder={usageMeta.placeholder} style={inputStyle('usageFactorValue')} />
            </div>

            <div>
              <label style={labelStyle}>Preferred Date</label>
              <input type="date" required min={minDate()} value={form.scheduledDate} onChange={setField('scheduledDate')} onFocus={focus('scheduledDate')} onBlur={unfocus} style={inputStyle('scheduledDate')} />
            </div>

            <div>
              <label style={labelStyle}>Additional Notes <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span></label>
              <textarea rows={3} value={form.notes} onChange={setField('notes')} onFocus={focus('notes')} onBlur={unfocus} placeholder="Any special instructions or requirements..." style={{ ...inputStyle('notes'), resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }} />
            </div>

            {/* Payment Method */}
            <div>
              <label style={labelStyle}>Payment Method</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PAYMENT_OPTIONS.map(opt => {
                  const sel = paymentMethod === opt.value;
                  return (
                    <div key={opt.value} onClick={() => setPaymentMethod(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 10, cursor: 'pointer', position: 'relative', border: sel ? '2px solid #7C3AED' : '1px solid #E5E7EB', background: sel ? 'rgba(124,58,237,0.04)' : '#ffffff', boxShadow: sel ? '0 0 0 3px rgba(124,58,237,0.08)' : 'none', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 13.5, color: '#111827' }}>{opt.label}</span>
                          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10.5, fontWeight: 600, background: sel ? 'rgba(124,58,237,0.12)' : '#f3f4f6', color: sel ? '#7C3AED' : '#6B7280', border: sel ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent' }}>{opt.tag}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{opt.description}</div>
                      </div>
                      <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: sel ? '#7C3AED' : '#374151', whiteSpace: 'nowrap' }}>{opt.amount}</span>
                      {sel && <div style={{ position: 'absolute', top: 10, right: 14, width: 18, height: 18, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800 }}>✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Points earning preview */}
            {paymentMethod && (
              <div style={{ padding: '13px 16px', borderRadius: 10, background: earnsPoints ? 'rgba(16,185,129,0.07)' : '#f9fafb', border: `1px solid ${earnsPoints ? 'rgba(16,185,129,0.25)' : '#e5e7eb'}`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{earnsPoints ? '🎁' : 'ℹ️'}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: earnsPoints ? '#065F46' : '#374151', marginBottom: 3 }}>{previewLine}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{previewSub}</div>
                  {paymentMethod === 'advance' && <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Remaining {fullPoints - advancePoints} pts earned after service completion</div>}
                </div>
                {earnsPoints && <span style={{ marginLeft: 'auto', flexShrink: 0, fontWeight: 800, fontSize: 16, color: '#10B981' }}>+{previewPts} pts</span>}
              </div>
            )}

            {/* Redeem loyalty points */}
            {earnsPoints && (
              <div style={{ padding: '16px', borderRadius: 10, background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>🎁</span>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: '#7C3AED' }}>Use Loyalty Points (optional)</span>
                </div>

                {currentBalance < MIN_REDEEM ? (
                  <div style={{ fontSize: 12.5, color: '#9CA3AF' }}>
                    You need at least {MIN_REDEEM} pts to redeem. Current balance:{' '}
                    <span style={{ color: '#7C3AED', fontWeight: 600 }}>{currentBalance} pts</span>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 10 }}>
                      Available: <span style={{ color: '#7C3AED', fontWeight: 700 }}>{currentBalance} pts</span> = <span style={{ color: '#10B981', fontWeight: 600 }}>Rs. {currentBalance}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="number"
                        min={MIN_REDEEM}
                        max={currentBalance}
                        value={redeemInput}
                        placeholder={`${MIN_REDEEM} – ${currentBalance}`}
                        onChange={(e) => setRedeemInput(e.target.value)}
                        style={{ flex: 1, padding: '9px 12px', fontSize: 14, borderRadius: 8, border: '1px solid rgba(124,58,237,0.3)', outline: 'none', background: '#ffffff', color: '#111827', boxSizing: 'border-box' }}
                      />
                      {redeemInput && (
                        <button type="button" onClick={() => setRedeemInput('')}
                          style={{ padding: '9px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#6B7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Clear
                        </button>
                      )}
                    </div>

                    {redeemPts > 0 && !redeemValid && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#DC2626' }}>
                        {redeemPts < MIN_REDEEM ? `Minimum ${MIN_REDEEM} pts required` : `Maximum ${currentBalance} pts available`}
                      </div>
                    )}

                    {redeemValid && (
                      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 12.5, color: '#6B7280' }}>
                          <span style={{ color: '#7C3AED', fontWeight: 700 }}>{redeemPts} pts</span> = <span style={{ color: '#10B981', fontWeight: 700 }}>Rs. {discountAmt} discount</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>
                          Final amount: Rs. {finalAmt.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {error && <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid rgba(239,68,68,0.3)', color: '#DC2626', fontSize: 13.5, lineHeight: 1.5 }}>{error}</div>}

            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px', borderRadius: 9, fontSize: 15, fontWeight: 700, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', background: submitting ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7C3AED, #9333ea)', boxShadow: submitting ? 'none' : '0 4px 20px rgba(124,58,237,0.38)', color: '#ffffff', transition: 'opacity 0.15s, box-shadow 0.15s', opacity: submitting ? 0.7 : 1, marginTop: 4 }}>
              {submitting ? 'Submitting…' : 'Book Service'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );

  const myBookingsContent = (
    <div style={{ padding: '28px 24px 48px', maxWidth: 720, margin: '0 auto' }}>
      {cancelDone && <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#065F46', fontSize: 13.5, lineHeight: 1.5 }}>✅ {cancelDone}</div>}

      {bookingsLoading ? <Spinner /> : myBookings.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '56px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 6 }}>No bookings yet</div>
          <div style={{ color: '#6B7280', fontSize: 13.5 }}>Your service bookings will appear here.</div>
          <button onClick={() => setActiveTab('book')} style={{ marginTop: 20, padding: '10px 22px', borderRadius: 9, background: 'linear-gradient(135deg, #7C3AED, #9333ea)', border: 'none', color: '#fff', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>Book a Service</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myBookings.map((b) => {
            const sm = STATUS_META[b.materialStatus] || { label: b.materialStatus, color: '#6B7280' };
            const canCancel = CANCELLABLE_STATUSES.includes(b.materialStatus);
            return (
              <div key={b._id} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧹</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 3 }}>{SERVICE_LABEL_MAP[b.serviceType] || b.serviceType}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{b.scheduledDate ? fmtDate(b.scheduledDate) : ''}{b.pointsEarned > 0 ? ` · +${b.pointsEarned} pts` : ''}</div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: `${sm.color}12`, border: `1px solid ${sm.color}30`, color: sm.color, whiteSpace: 'nowrap', flexShrink: 0 }}>{sm.label}</span>
                {canCancel && <button onClick={() => { setCancelTarget(b); setCancelDone(''); }} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid rgba(239,68,68,0.3)', color: '#DC2626', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const cancelModal = cancelTarget && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#ffffff', borderRadius: 16, padding: '32px 28px', maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', border: '2px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 18px', fontSize: 26 }}>⚠️</div>
        <h3 style={{ margin: '0 0 10px', fontWeight: 800, fontSize: 18, color: '#111827' }}>Cancel Booking?</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13.5, color: '#6B7280', lineHeight: 1.6 }}>
          This will cancel your booking for <strong style={{ color: '#374151' }}>{SERVICE_LABEL_MAP[cancelTarget.serviceType] || cancelTarget.serviceType}</strong>{cancelTarget.scheduledDate ? ` on ${fmtDate(cancelTarget.scheduledDate)}` : ''}.
        </p>
        {(cancelTarget.pointsEarned || 0) > 0 && (
          <div style={{ padding: '11px 14px', borderRadius: 9, marginBottom: 20, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#DC2626', lineHeight: 1.5 }}>
            Cancelling will reverse <strong>{cancelTarget.pointsEarned} loyalty points</strong> earned for this booking.
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleCancel} disabled={cancelBusy} style={{ flex: 1, padding: '11px', borderRadius: 9, fontWeight: 700, fontSize: 14, background: cancelBusy ? 'rgba(239,68,68,0.4)' : '#EF4444', border: 'none', color: '#fff', cursor: cancelBusy ? 'not-allowed' : 'pointer', opacity: cancelBusy ? 0.7 : 1 }}>{cancelBusy ? 'Cancelling…' : 'Confirm Cancel'}</button>
          <button onClick={() => setCancelTarget(null)} disabled={cancelBusy} style={{ flex: 1, padding: '11px', borderRadius: 9, fontWeight: 600, fontSize: 14, background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151', cursor: cancelBusy ? 'not-allowed' : 'pointer' }}>Keep Booking</button>
        </div>
      </div>
    </div>
  );

  return (
    <CustomerLayout>
      <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ padding: '24px 28px 0', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 22, color: '#111827' }}>My Bookings</h1>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6B7280' }}>Book a new service or manage your existing bookings</p>
          <div style={{ display: 'flex' }}>
            <TabBtn label="Book a Service" tabKey="book" />
            <TabBtn label="My Bookings"    tabKey="my-bookings" />
          </div>
        </div>
        {activeTab === 'book'        && (booking ? successCard : bookingForm)}
        {activeTab === 'my-bookings' && myBookingsContent}
      </div>
      {cancelModal}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </CustomerLayout>
  );
};

export default BookingsPage;