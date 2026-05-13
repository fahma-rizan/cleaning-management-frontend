import React from 'react';
import CustomerLayout from '../components/layout/CustomerLayout';

const NotificationsPage = () => (
  <CustomerLayout>
    <div style={{
      flex: 1, background: '#12121E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12,
    }}>
      <span style={{ fontSize: 40 }}>🔔</span>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Notifications</div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Coming soon</div>
    </div>
  </CustomerLayout>
);

export default NotificationsPage;
