import React, { useState, useRef } from 'react';

const OTP_LENGTH = 6;

const fmt = (secs) => {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
};

const OtpVerifyForm = ({ email, onSubmit, onResend, loading, error, timeLeft, expired }) => {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const updated = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((c, i) => (updated[i] = c));
    setDigits(updated);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) return;
    onSubmit({ email, otp });
  };

  const handleResend = () => {
    setDigits(Array(OTP_LENGTH).fill(''));
    onResend();
  };

  const filled = digits.join('').length;
  const disabled = loading || filled < OTP_LENGTH || expired;

  const timerColor = timeLeft <= 60 ? '#DC2626' : '#6B7280';

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', margin: 0 }}>
        We sent a 6-digit code to <strong style={{ color: '#7C3AED' }}>{email}</strong>.
      </p>

      {/* countdown */}
      <div style={{ textAlign: 'center' }}>
        {expired ? (
          <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>
            Code expired — request a new one
          </span>
        ) : (
          <span style={{ fontSize: 13, color: timerColor, fontWeight: 500 }}>
            Expires in{' '}
            <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {fmt(timeLeft)}
            </span>
          </span>
        )}
      </div>

      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 9, fontSize: 13,
          background: '#FEF2F2', border: '1px solid #FECACA',
          color: '#DC2626', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⚠</span> {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }} onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            disabled={expired}
            style={{
              width: 46, height: 56, textAlign: 'center',
              fontSize: 22, fontWeight: 700,
              background: expired ? '#F3F4F6' : digit ? '#F5F3FF' : '#F9FAFB',
              border: digit ? '2px solid #7C3AED' : '2px solid #E5E7EB',
              borderRadius: 10, color: expired ? '#9CA3AF' : '#111827', outline: 'none',
              transition: 'all 0.15s',
              boxShadow: digit && !expired ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
            }}
          />
        ))}
      </div>

      {!expired ? (
        <button
          type="submit"
          disabled={disabled}
          style={{
            width: '100%', padding: '12px 0', border: 'none', borderRadius: 10,
            background: disabled ? 'rgba(124,58,237,0.35)' : '#7C3AED',
            color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: disabled ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#6D28D9'; }}
          onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = '#7C3AED'; }}
        >
          {loading ? 'Verifying…' : 'Verify Code'}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          style={{
            width: '100%', padding: '12px 0', border: 'none', borderRadius: 10,
            background: '#7C3AED', color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#6D28D9'}
          onMouseLeave={e => e.currentTarget.style.background = '#7C3AED'}
        >
          Resend New Code
        </button>
      )}

      {!expired && (
        <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', margin: 0 }}>
          Didn't receive it?{' '}
          <button
            type="button"
            onClick={handleResend}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#7C3AED', fontWeight: 600, fontSize: 13, padding: 0,
            }}
          >
            Resend OTP
          </button>
        </p>
      )}
    </form>
  );
};

export default OtpVerifyForm;
