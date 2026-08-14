import React, { useEffect, useRef, useState } from 'react';

const PointsSummaryCard = ({ label, value = 0, subLabel, color = '#7C3AED', icon, suffix = 'pts' }) => {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const end      = value;
    const duration = 900;
    const startTs  = performance.now();

    const step = (ts) => {
      const elapsed  = ts - startTs;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(end * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <div style={{
      flex:         1,
      background:   '#ffffff',
      border:       `1px solid ${color}25`,
      borderRadius: 14,
      padding:      '18px 20px',
      position:     'relative',
      overflow:     'hidden',
      boxShadow:    '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        position:   'absolute',
        inset:      0,
        background: `radial-gradient(ellipse at 80% 20%, ${color}0a 0%, transparent 60%)`,
        pointerEvents: 'none',
      }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9CA3AF' }}>
          {label}
        </span>
      </div>

      <div style={{ color, fontWeight: 800, fontSize: 28, lineHeight: 1 }}>
        {displayed.toLocaleString()}
        <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 5, opacity: 0.7 }}>{suffix}</span>
      </div>

      {subLabel && (
        <div style={{ color: '#9CA3AF', fontSize: 11.5, marginTop: 6, lineHeight: 1.4 }}>
          {subLabel}
        </div>
      )}
    </div>
  );
};

export default PointsSummaryCard;
