import React, { useState, useRef, useEffect } from 'react';
import PersonOutlineIcon    from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon    from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon    from '@mui/icons-material/PhoneOutlined';
import EditOutlinedIcon     from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import CustomerLayout       from '../components/layout/CustomerLayout';
import { useAuth }          from '../context/AuthContext';
import { updateProfile }    from '../services/authService';
import { getTier, getNextTier } from '../constants/loyalty';

const TIER_ICONS = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' };

/* ── Field row ───────────────────────────────────────────── */
const Field = ({ label, icon: Icon, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
      {Icon && <Icon sx={{ fontSize: 13, color: '#9CA3AF' }}/>}
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = (focused, error) => ({
  width: '100%', padding: '11px 14px',
  background: '#f3f4f6',
  border: `1px solid ${error ? '#EF4444' : focused ? '#7C3AED' : '#e5e7eb'}`,
  borderRadius: 9, color: '#111827', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
});

/* ── Main ProfilePage ────────────────────────────────────── */
const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [firstName,   setFirstName]   = useState('');
  const [lastName,    setLastName]    = useState('');
  const [phone,       setPhone]       = useState('');
  const [photoSrc,    setPhotoSrc]    = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');
  const [focusedField, setFocusedField] = useState('');

  const fileRef = useRef(null);

  // Pre-fill from auth context on mount / when user loads
  useEffect(() => {
    if (!user) return;
    const parts = (user.name || '').trim().split(' ');
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setPhone(user.phone || '');
  }, [user]);

  const tier     = getTier(user?.lifetimePoints || 0);
  const nextTier = getNextTier(tier.name);
  const lifePts  = user?.lifetimePoints || 0;
  const progress = nextTier
    ? Math.min(100, ((lifePts - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  // Profile completion: name, phone, address (simplified check)
  const hasName    = (firstName.trim() + lastName.trim()).length > 0;
  const hasPhone   = phone.trim().length > 0;
  const hasAddress = (user?.addresses?.length || 0) > 0;
  const completedCount = [hasName, hasPhone, hasAddress].filter(Boolean).length;
  const completionPct  = Math.round((completedCount / 3) * 100);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError('');
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    if (!fullName) { setError('First name is required.'); return; }
    setSaving(true);
    try {
      const updated = await updateProfile({ name: fullName, phone: phone.trim() });
      updateUser({ name: updated.name, phone: updated.phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || (user?.name?.[0] || 'U').toUpperCase();

  return (
    <CustomerLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{
          padding: '22px 32px 18px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: '#ffffff', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PersonOutlineIcon sx={{ fontSize: 18, color: '#7C3AED' }}/>
            </div>
            <div>
              <h1 style={{ color: '#111827', fontWeight: 800, fontSize: 20, margin: 0 }}>My Profile</h1>
              <p style={{ color: '#6B7280', fontSize: 12.5, margin: 0, marginTop: 2 }}>
                Manage your personal information
              </p>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* top row: avatar card + completion card */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>

            {/* Avatar card */}
            <div style={{
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 14, padding: '24px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              {/* photo circle */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: photoSrc ? 'transparent' : `linear-gradient(135deg, #7C3AED, #9333ea)`,
                  border: '3px solid rgba(124,58,237,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  fontSize: 30, color: '#fff', fontWeight: 800,
                }}>
                  {photoSrc
                    ? <img src={photoSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    : initials
                  }
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#7C3AED', border: '2px solid #ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <CameraAltOutlinedIcon sx={{ fontSize: 13, color: '#fff' }}/>
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange}/>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: 15 }}>
                  {[firstName, lastName].filter(Boolean).join(' ') || user?.name || 'Your Name'}
                </div>
                <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>{user?.email}</div>
              </div>

              {/* tier badge */}
              <div style={{
                padding: '6px 14px', borderRadius: 20,
                background: `${tier.color}0d`, border: `1px solid ${tier.color}25`,
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <span style={{ fontSize: 16 }}>{TIER_ICONS[tier.name]}</span>
                <div>
                  <div style={{ color: tier.color, fontWeight: 700, fontSize: 12.5, lineHeight: 1 }}>{tier.name} Member</div>
                  <div style={{ color: '#9CA3AF', fontSize: 10.5, marginTop: 1 }}>{lifePts.toLocaleString()} lifetime pts</div>
                </div>
              </div>
            </div>

            {/* Profile completion card */}
            <div style={{
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 14, padding: '22px 24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: 15 }}>Profile Completion</div>
                <div style={{
                  padding: '3px 12px', borderRadius: 20,
                  background: completionPct === 100 ? 'rgba(16,185,129,0.1)' : 'rgba(124,58,237,0.08)',
                  border: `1px solid ${completionPct === 100 ? 'rgba(16,185,129,0.25)' : 'rgba(124,58,237,0.2)'}`,
                  color: completionPct === 100 ? '#10B981' : '#7C3AED',
                  fontWeight: 700, fontSize: 13,
                }}>
                  {completionPct}%
                </div>
              </div>

              <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${completionPct}%`,
                  background: completionPct === 100 ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #7C3AED, #9333ea)',
                  transition: 'width 0.5s ease',
                }}/>
              </div>

              {[
                { label: 'Full name added',     done: hasName    },
                { label: 'Phone number added',  done: hasPhone   },
                { label: 'Address on file',     done: hasAddress },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 16, color: item.done ? '#10B981' : '#D1D5DB' }}/>
                  <span style={{ fontSize: 13, color: item.done ? '#111827' : '#9CA3AF' }}>{item.label}</span>
                  {item.done && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#10B981', fontWeight: 600 }}>Done</span>}
                </div>
              ))}

              {/* Tier progress */}
              {nextTier && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Progress to {nextTier.name}</span>
                    <span style={{ fontSize: 12, color: tier.color, fontWeight: 600 }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${progress}%`, background: tier.gradient, transition: 'width 0.5s ease' }}/>
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: 11, marginTop: 5 }}>
                    {(nextTier.min - lifePts).toLocaleString()} pts to {nextTier.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edit form card */}
          <div style={{
            background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 14, padding: '24px 28px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              <EditOutlinedIcon sx={{ fontSize: 17, color: '#7C3AED' }}/>
              <div style={{ color: '#111827', fontWeight: 700, fontSize: 15 }}>Personal Information</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
              <Field label="First Name" icon={PersonOutlineIcon}>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onFocus={() => setFocusedField('first')}
                  onBlur={() => setFocusedField('')}
                  placeholder="First name"
                  style={inputStyle(focusedField === 'first', false)}
                />
              </Field>
              <Field label="Last Name" icon={PersonOutlineIcon}>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  onFocus={() => setFocusedField('last')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Last name"
                  style={inputStyle(focusedField === 'last', false)}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
              <Field label="Email Address" icon={EmailOutlinedIcon}>
                <input
                  value={user?.email || ''}
                  readOnly
                  style={{ ...inputStyle(false, false), background: '#f9fafb', color: '#9CA3AF', cursor: 'not-allowed' }}
                />
              </Field>
              <Field label="Mobile Number" icon={PhoneOutlinedIcon}>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  placeholder="+94 7X XXX XXXX"
                  style={inputStyle(focusedField === 'phone', false)}
                />
              </Field>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#DC2626', fontSize: 13 }}>
                {error}
              </div>
            )}
            {saved && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, color: '#10B981', fontSize: 13, fontWeight: 600 }}>
                ✓ Profile saved successfully
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '11px 28px', border: 'none', borderRadius: 9,
                  background: saving ? '#e5e7eb' : 'linear-gradient(135deg, #7C3AED, #9333ea)',
                  color: saving ? '#9CA3AF' : '#fff', fontWeight: 700, fontSize: 14,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 4px 14px rgba(124,58,237,0.35)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>
    </CustomerLayout>
  );
};

export default ProfilePage;
