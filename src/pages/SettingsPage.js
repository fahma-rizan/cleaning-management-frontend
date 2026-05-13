import React, { useState } from 'react';
import SettingsOutlinedIcon    from '@mui/icons-material/SettingsOutlined';
import LockOutlinedIcon        from '@mui/icons-material/LockOutlined';
import LanguageOutlinedIcon    from '@mui/icons-material/LanguageOutlined';
import VisibilityOutlinedIcon  from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CheckCircleOutlineIcon  from '@mui/icons-material/CheckCircleOutline';
import CustomerLayout from '../components/layout/CustomerLayout';
import api from '../services/api';

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'si', label: 'Sinhala',  flag: '🇱🇰' },
  { code: 'ta', label: 'Tamil',    flag: '🇱🇰' },
];

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
    <div style={{
      width: 34, height: 34, borderRadius: 9,
      background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon sx={{ fontSize: 17, color: '#7C3AED' }}/>
    </div>
    <div>
      <div style={{ color: '#111827', fontWeight: 700, fontSize: 15 }}>{title}</div>
      {subtitle && <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 1 }}>{subtitle}</div>}
    </div>
  </div>
);

const PasswordInput = ({ label, value, onChange, show, onToggle, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '11px 44px 11px 14px',
          background: '#f3f4f6', border: '1px solid #e5e7eb',
          borderRadius: 9, color: '#111827', fontSize: 14,
          outline: 'none', boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = '#7C3AED'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 2,
          display: 'flex', alignItems: 'center',
        }}
      >
        {show
          ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18, color: '#9CA3AF' }}/>
          : <VisibilityOutlinedIcon    sx={{ fontSize: 18, color: '#9CA3AF' }}/>
        }
      </button>
    </div>
  </div>
);

/* ── Main SettingsPage ───────────────────────────────────── */
const SettingsPage = () => {
  // Change password state
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving,   setPwSaving]   = useState(false);
  const [pwError,    setPwError]    = useState('');
  const [pwSuccess,  setPwSuccess]  = useState(false);

  // Language state (persisted in localStorage for demo)
  const [language, setLanguage] = useState(() => localStorage.getItem('cl_language') || 'en');
  const [langSaved, setLangSaved] = useState(false);

  // Password strength indicator
  const strengthChecks = [
    { label: 'At least 8 characters', pass: newPw.length >= 8 },
    { label: 'Uppercase letter',       pass: /[A-Z]/.test(newPw) },
    { label: 'Lowercase letter',       pass: /[a-z]/.test(newPw) },
    { label: 'Number',                 pass: /[0-9]/.test(newPw) },
  ];
  const strengthScore = strengthChecks.filter(c => c.pass).length;
  const strengthColor = strengthScore <= 1 ? '#EF4444' : strengthScore <= 2 ? '#F59E0B' : strengthScore === 3 ? '#3B82F6' : '#10B981';
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore];

  const handleChangePassword = async () => {
    setPwError('');
    if (!currentPw || !newPw || !confirmPw) { setPwError('All fields are required.'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
    if (strengthScore < 4) { setPwError('Password must have uppercase, lowercase, number, and be at least 8 characters.'); return; }
    setPwSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setPwSuccess(true);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Password change failed. Please try again.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLanguageSave = () => {
    localStorage.setItem('cl_language', language);
    setLangSaved(true);
    setTimeout(() => setLangSaved(false), 3000);
  };

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
              <SettingsOutlinedIcon sx={{ fontSize: 18, color: '#7C3AED' }}/>
            </div>
            <div>
              <h1 style={{ color: '#111827', fontWeight: 800, fontSize: 20, margin: 0 }}>Settings</h1>
              <p style={{ color: '#6B7280', fontSize: 12.5, margin: 0, marginTop: 2 }}>
                Manage your account preferences
              </p>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Change Password card ── */}
          <div style={{
            background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 14, padding: '24px 28px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <SectionHeader icon={LockOutlinedIcon} title="Change Password" subtitle="Keep your account secure with a strong password"/>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
              <PasswordInput
                label="Current Password"
                value={currentPw} onChange={setCurrentPw}
                show={showCurrent} onToggle={() => setShowCurrent(v => !v)}
                placeholder="Enter current password"
              />
              <PasswordInput
                label="New Password"
                value={newPw} onChange={v => { setNewPw(v); setPwError(''); }}
                show={showNew} onToggle={() => setShowNew(v => !v)}
                placeholder="Enter new password"
              />

              {/* strength bar */}
              {newPw.length > 0 && (
                <div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: i <= strengthScore ? strengthColor : '#e5e7eb',
                        transition: 'background 0.2s',
                      }}/>
                    ))}
                    <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600, marginLeft: 8, whiteSpace: 'nowrap' }}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {strengthChecks.map(c => (
                      <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 13, color: c.pass ? '#10B981' : '#D1D5DB' }}/>
                        <span style={{ fontSize: 11.5, color: c.pass ? '#10B981' : '#9CA3AF' }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PasswordInput
                label="Confirm New Password"
                value={confirmPw} onChange={v => { setConfirmPw(v); setPwError(''); }}
                show={showConfirm} onToggle={() => setShowConfirm(v => !v)}
                placeholder="Repeat new password"
              />

              {confirmPw && newPw !== confirmPw && (
                <div style={{ fontSize: 12.5, color: '#EF4444' }}>Passwords do not match</div>
              )}

              {pwError && (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#DC2626', fontSize: 13 }}>
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, color: '#10B981', fontSize: 13, fontWeight: 600 }}>
                  ✓ Password changed successfully
                </div>
              )}

              <div>
                <button
                  onClick={handleChangePassword}
                  disabled={pwSaving}
                  style={{
                    padding: '11px 24px', border: 'none', borderRadius: 9,
                    background: pwSaving ? '#e5e7eb' : 'linear-gradient(135deg, #7C3AED, #9333ea)',
                    color: pwSaving ? '#9CA3AF' : '#fff', fontWeight: 700, fontSize: 14,
                    cursor: pwSaving ? 'not-allowed' : 'pointer',
                    boxShadow: pwSaving ? 'none' : '0 4px 14px rgba(124,58,237,0.35)',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => { if (!pwSaving) e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Language card ── */}
          <div style={{
            background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 14, padding: '24px 28px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <SectionHeader icon={LanguageOutlinedIcon} title="Language" subtitle="Choose your preferred display language"/>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setLangSaved(false); }}
                  style={{
                    padding: '12px 20px',
                    border: `2px solid ${language === lang.code ? '#7C3AED' : '#e5e7eb'}`,
                    borderRadius: 10,
                    background: language === lang.code ? 'rgba(124,58,237,0.06)' : '#ffffff',
                    color: language === lang.code ? '#7C3AED' : '#374151',
                    fontWeight: language === lang.code ? 700 : 500,
                    fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{lang.flag}</span>
                  {lang.label}
                  {language === lang.code && (
                    <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#7C3AED', marginLeft: 2 }}/>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={handleLanguageSave}
                style={{
                  padding: '10px 22px', border: 'none', borderRadius: 9,
                  background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Save Language
              </button>
              {langSaved && (
                <span style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>✓ Language preference saved</span>
              )}
            </div>

            <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)', borderRadius: 8, color: '#6B7280', fontSize: 12 }}>
              ℹ️ Full multilingual support is coming soon. English is currently used for all content.
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

export default SettingsPage;
