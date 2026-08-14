import React from 'react';

const StaffPage = () => (
  <div style={{
    minHeight: '100vh', background: '#12121E',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: 12,
    fontFamily: "'Inter', system-ui, sans-serif",
  }}>
    <span style={{ fontSize: 40 }}>🧑‍💼</span>
    <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Staff Dashboard</div>
    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Coming soon</div>
  </div>
);

export default StaffPage;
