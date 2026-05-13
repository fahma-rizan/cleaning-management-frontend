import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../components/layout/CustomerLayout';

/* ── Service type options ───────────────────────────────────── */
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
  general_cleaning: [
    { value: 'standard', label: 'Standard' },
  ],
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
  floor_cut_polish: [
    { value: 'standard', label: 'Standard' },
  ],
  sofa_cleaning: [
    { value: 'standard', label: 'Standard' },
  ],
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
  carpet_cleaning: [
    { value: 'standard', label: 'Standard' },
  ],
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

const getUsageMeta = (serviceType) =>
  USAGE_META[serviceType] || { factor: 'square_feet', label: 'Area (Square Feet)', placeholder: 'e.g. 350' };

/* ── Helpers ────────────────────────────────────────────────── */
const minDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getToken = () =>
  localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';

/* ── BookingsPage ───────────────────────────────────────────── */
const BookingsPage = () => {
  const navigate = useNavigate();

  const EMPTY_FORM = { serviceType: '', subType: '', usageFactorValue: '', scheduledDate: '', notes: '' };

  const [form,       setForm]       = useState(EMPTY_FORM);
  const [focused,    setFocused]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [booking,    setBooking]    = useState(null);

  const setField = (field) => (e) => {
    const val = e.target.value;
    setForm(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'serviceType') next.subType = '';
      return next;
    });
  };

  const subTypeOptions = form.serviceType ? (SUB_TYPES[form.serviceType] || []) : [];
  const usageMeta      = getUsageMeta(form.serviceType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          serviceType:      form.serviceType,
          subType:          form.subType,
          usageFactor:      usageMeta.factor,
          usageFactorValue: Number(form.usageFactorValue),
          scheduledDate:    new Date(form.scheduledDate).toISOString(),
          notes:            form.notes.trim(),
          items:            [{ name: 'Cleaning Service', quantity: 1, unitPrice: 5000 }],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed. Please try again.');
      setBooking(data.booking || data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Style helpers ── */
  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  };

  const inputStyle = (field) => ({
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 14px',
    fontSize: 14,
    borderRadius: 8,
    border: focused === field ? '1px solid #7C3AED' : '1px solid #E5E7EB',
    boxShadow: focused === field ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
    outline: 'none',
    background: '#ffffff',
    color: '#111827',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    appearance: 'auto',
  });

  const focus   = (field) => () => setFocused(field);
  const unfocus = ()       => setFocused('');

  /* ── Success card ── */
  if (booking) {
    return (
      <CustomerLayout>
        <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
          <div style={{ padding: '24px 28px 20px', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: '#111827' }}>Book a Service</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
              Select a service and we will automatically prepare the required materials
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 24px' }}>
            <div style={{
              background: '#ffffff', borderRadius: 14, padding: '44px 40px',
              maxWidth: 520, width: '100%', textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 34,
              }}>
                ✅
              </div>
              <h2 style={{ margin: '0 0 10px', fontWeight: 800, fontSize: 20, color: '#111827' }}>
                Booking Submitted Successfully!
              </h2>
              <p style={{ margin: '0 0 20px', fontSize: 13.5, color: '#6B7280', lineHeight: 1.7 }}>
                Your booking has been received. A material request has been automatically
                generated and sent to the admin for approval.
              </p>
              {(booking._id || booking.bookingRef) && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 18px', borderRadius: 10,
                  background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)',
                  marginBottom: 28,
                }}>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>Booking ID</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED', fontFamily: 'monospace' }}>
                    {booking.bookingRef || booking._id?.slice(-10)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setBooking(null); setForm(EMPTY_FORM); setError(''); }}
                  style={{
                    padding: '10px 22px', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                    background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
                    boxShadow: '0 4px 18px rgba(124,58,237,0.35)',
                    border: 'none', color: '#fff', cursor: 'pointer',
                  }}
                >
                  Book Another Service
                </button>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    padding: '10px 22px', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                    background: '#f3f4f6', border: '1px solid #e5e7eb',
                    color: '#374151', cursor: 'pointer',
                  }}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  /* ── Form ── */
  return (
    <CustomerLayout>
      <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* Page header */}
        <div style={{ padding: '24px 28px 20px', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: '#111827' }}>Book a Service</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
            Select a service and we will automatically prepare the required materials
          </p>
        </div>

        {/* Centered form card */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '36px 24px 48px' }}>
          <div style={{
            background: '#ffffff', borderRadius: 14, padding: '32px',
            maxWidth: 640, width: '100%',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
          }}>
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                {/* Field 1 — Service Type */}
                <div>
                  <label style={labelStyle}>Service Type</label>
                  <select
                    required
                    value={form.serviceType}
                    onChange={setField('serviceType')}
                    onFocus={focus('serviceType')}
                    onBlur={unfocus}
                    style={inputStyle('serviceType')}
                  >
                    <option value="">Select a service...</option>
                    {SERVICE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Field 2 — Sub Type */}
                <div>
                  <label style={labelStyle}>Service Sub-Type</label>
                  <select
                    required
                    disabled={!form.serviceType}
                    value={form.subType}
                    onChange={setField('subType')}
                    onFocus={focus('subType')}
                    onBlur={unfocus}
                    style={{
                      ...inputStyle('subType'),
                      background: !form.serviceType ? '#f9fafb' : '#ffffff',
                      cursor: !form.serviceType ? 'not-allowed' : 'auto',
                      color: !form.serviceType ? '#9CA3AF' : '#111827',
                    }}
                  >
                    <option value="">
                      {form.serviceType ? 'Select a sub-type...' : 'Select a service type first'}
                    </option>
                    {subTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Field 3 — Usage Factor Value */}
                <div>
                  <label style={labelStyle}>{usageMeta.label}</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.usageFactorValue}
                    onChange={setField('usageFactorValue')}
                    onFocus={focus('usageFactorValue')}
                    onBlur={unfocus}
                    placeholder={usageMeta.placeholder}
                    style={inputStyle('usageFactorValue')}
                  />
                </div>

                {/* Field 4 — Scheduled Date */}
                <div>
                  <label style={labelStyle}>Preferred Date</label>
                  <input
                    type="date"
                    required
                    min={minDate()}
                    value={form.scheduledDate}
                    onChange={setField('scheduledDate')}
                    onFocus={focus('scheduledDate')}
                    onBlur={unfocus}
                    style={inputStyle('scheduledDate')}
                  />
                </div>

                {/* Field 5 — Notes */}
                <div>
                  <label style={labelStyle}>
                    Additional Notes{' '}
                    <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={setField('notes')}
                    onFocus={focus('notes')}
                    onBlur={unfocus}
                    placeholder="Any special instructions or requirements..."
                    style={{
                      ...inputStyle('notes'),
                      resize: 'vertical',
                      lineHeight: 1.6,
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    padding: '12px 16px', borderRadius: 10,
                    background: '#fef2f2', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#DC2626', fontSize: 13.5, lineHeight: 1.5,
                  }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '12px',
                    borderRadius: 9, fontSize: 15, fontWeight: 700,
                    border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                    background: submitting
                      ? 'rgba(124,58,237,0.5)'
                      : 'linear-gradient(135deg, #7C3AED, #9333ea)',
                    boxShadow: submitting ? 'none' : '0 4px 20px rgba(124,58,237,0.38)',
                    color: '#ffffff',
                    transition: 'opacity 0.15s, box-shadow 0.15s',
                    opacity: submitting ? 0.7 : 1,
                    marginTop: 4,
                  }}
                >
                  {submitting ? 'Submitting…' : 'Book Service'}
                </button>

              </div>
            </form>
          </div>
        </div>

      </div>
    </CustomerLayout>
  );
};

export default BookingsPage;
