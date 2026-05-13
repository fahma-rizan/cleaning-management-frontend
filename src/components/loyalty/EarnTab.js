import React from 'react';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import StarIcon                from '@mui/icons-material/Star';
import GroupAddIcon            from '@mui/icons-material/GroupAdd';
import RateReviewIcon          from '@mui/icons-material/RateReview';
import CelebrationIcon         from '@mui/icons-material/Celebration';
import { useNavigate } from 'react-router-dom';

const WAYS = [
  {
    icon: LocalLaundryServiceIcon,
    color: '#7C3AED',
    title: 'Book a Service',
    subtitle: '1–3 pts per Rs. 100 spent',
    desc: 'Earn points on every confirmed laundry or cleaning booking. Rate scales with your tier: Bronze 1 pt, Silver 1.5, Gold 2, Platinum 3 — per Rs. 100 spent.',
    tag: 'Always Active',
    tagColor: '#10B981',
  },
  {
    icon: StarIcon,
    color: '#F59E0B',
    title: 'Leave a Review',
    subtitle: '+25 pts per review',
    desc: 'Share your experience after each completed service. Genuine reviews help us improve and reward you for the feedback.',
    tag: 'Once per booking',
    tagColor: '#F59E0B',
  },
  {
    icon: GroupAddIcon,
    color: '#06B6D4',
    title: 'Refer a Friend',
    subtitle: '+100 pts per referral',
    desc: 'Invite friends to Cloud Laundry. When they complete their first booking, both of you earn bonus points instantly.',
    tag: 'Unlimited',
    tagColor: '#06B6D4',
  },
  {
    icon: RateReviewIcon,
    color: '#7C3AED',
    title: 'Complete Your Profile',
    subtitle: '+50 pts one-time',
    desc: 'Fill in your full name, phone number, and preferred address. A complete profile unlocks faster checkout and bonus points.',
    tag: 'One-time only',
    tagColor: '#7C3AED',
  },
];

const WayCard = ({ way }) => {
  const { icon: Icon, color, title, subtitle, desc, tag, tagColor } = way;
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 14, padding: '20px 18px',
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        cursor: 'default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 10px 30px ${color}14`;
        e.currentTarget.style.borderColor = `${color}35`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: `${color}0f`,
        border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon sx={{ fontSize: 22, color }}/>
      </div>

      <div>
        <div style={{ color: '#111827', fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{title}</div>
        <div style={{
          display: 'inline-block',
          background: `${color}0f`, border: `1px solid ${color}25`,
          borderRadius: 20, padding: '2px 10px',
          color, fontSize: 11.5, fontWeight: 700,
        }}>
          {subtitle}
        </div>
      </div>

      <div style={{ color: '#6B7280', fontSize: 12.5, lineHeight: 1.65, flex: 1 }}>{desc}</div>

      <div style={{
        alignSelf: 'flex-start',
        padding: '3px 10px', borderRadius: 20,
        background: `${tagColor}0a`,
        border: `1px solid ${tagColor}25`,
        color: tagColor, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.5,
      }}>
        {tag}
      </div>
    </div>
  );
};

/* ── Main EarnTab ─────────────────────────────────────────── */
const EarnTab = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* header */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 12, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          🪙
        </div>
        <div>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: 15 }}>Ways to Earn Points</div>
          <div style={{ color: '#6B7280', fontSize: 12.5, marginTop: 2 }}>
            Every action you take brings you closer to your next tier — here's how to maximise your points.
          </div>
        </div>
      </div>

      {/* 2×2 card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {WAYS.map(way => <WayCard key={way.title} way={way} />)}
      </div>

      {/* CTA banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(147,51,234,0.05) 100%)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 14, padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
          right: -50, top: -50, pointerEvents: 'none',
        }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <CelebrationIcon sx={{ fontSize: 30, color: '#7C3AED' }}/>
          <div>
            <div style={{ color: '#111827', fontWeight: 800, fontSize: 15, marginBottom: 3 }}>
              Start Earning Today!
            </div>
            <div style={{ color: '#6B7280', fontSize: 13 }}>
              Book a service now and earn your first loyalty points instantly.
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/bookings')}
          style={{
            flexShrink: 0, padding: '11px 22px',
            border: 'none', borderRadius: 10,
            background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
            color: '#fff', fontWeight: 700, fontSize: 13.5,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(124,58,237,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'; }}
        >
          Book a Service →
        </button>
      </div>
    </div>
  );
};

export default EarnTab;
