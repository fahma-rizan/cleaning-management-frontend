import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryIcon     from '@mui/icons-material/History';
import ArrowBackIcon   from '@mui/icons-material/ArrowBack';
import CustomerLayout  from '../components/layout/CustomerLayout';
import HistoryTab      from '../components/loyalty/HistoryTab';
import useLoyalty      from '../hooks/useLoyalty';

const PointsHistoryPage = () => {
  const navigate                    = useNavigate();
  const { history, loading, fetchHistory } = useLoyalty();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <CustomerLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#12121E', overflow: 'hidden' }}>

        {/* ── Page header ── */}
        <div style={{
          padding: '22px 32px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => navigate('/loyalty?tab=overview')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)', fontSize: 12.5,
              cursor: 'pointer', marginBottom: 14, padding: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <ArrowBackIcon sx={{ fontSize: 15 }}/> Back to Loyalty
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(147,51,234,0.2))',
              border: '1px solid rgba(124,58,237,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HistoryIcon sx={{ fontSize: 20, color: '#c4b5fd' }}/>
            </div>
            <div>
              <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: 0, lineHeight: 1.2 }}>
                Points History
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12.5, margin: 0, marginTop: 2 }}>
                Full log of all your loyalty point transactions
              </p>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid #7C3AED', borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }}/>
            </div>
          ) : (
            <HistoryTab transactions={history.transactions || []} />
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </CustomerLayout>
  );
};

export default PointsHistoryPage;
