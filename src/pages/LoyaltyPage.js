import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CustomerLayout  from '../components/layout/CustomerLayout';
import HistoryTab      from '../components/loyalty/HistoryTab';
import TiersTab        from '../components/loyalty/TiersTab';
import EarnTab         from '../components/loyalty/EarnTab';
import TierProgressBar from '../components/loyalty/TierProgressBar';
import PointsSummaryCard from '../components/loyalty/PointsSummaryCard';
import useLoyalty      from '../hooks/useLoyalty';
import { getTier } from '../constants/loyalty';

const MIN_REDEEM = 100;
const TIER_ICONS = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' };

const TABS = [
  { key: 'overview', label: 'Overview'    },
  { key: 'history',  label: 'History'     },
  { key: 'tiers',    label: 'Tiers'       },
  { key: 'earn',     label: 'Earn Points' },
];

const TIER_PERKS = {
  Bronze:   ['1 pt per Rs. 100 spent', 'Basic customer support', 'Order tracking'],
  Silver:   ['1.5 pts per Rs. 100 spent', '5% one-time upgrade discount', 'Priority customer support', 'Order tracking'],
  Gold:     ['2 pts per Rs. 100 spent', '10% one-time upgrade discount', 'Dedicated support agent', 'Express processing', 'Order tracking'],
  Platinum: ['3 pts per Rs. 100 spent', '15% one-time upgrade discount', 'VIP support line', 'Free express processing', 'Exclusive offers', 'Birthday bonus points'],
};

/* ── Tab button ──────────────────────────────────────────── */
const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '9px 18px 10px', border: 'none', borderRadius: 0,
    background: 'transparent',
    color:      active ? '#7C3AED' : '#6B7280',
    fontWeight: active ? 700 : 500,
    fontSize: 13.5, cursor: 'pointer', transition: 'all 0.15s',
    borderBottom: active ? '2px solid #7C3AED' : '2px solid transparent',
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#374151'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#6B7280'; }}
  >
    {label}
  </button>
);

/* ── Overview: 5-section dashboard ─────────────────────── */
const OverviewTab = ({ account, onRedeem, onApplyDiscount }) => {
  const [redeemInput,  setRedeemInput]  = useState('');
  const [redeemError,  setRedeemError]  = useState('');
  const [redeemOk,     setRedeemOk]     = useState('');
  const [redeemBusy,   setRedeemBusy]   = useState(false);
  const [discountBusy, setDiscountBusy] = useState(false);
  const [discountDone, setDiscountDone] = useState(false);

  if (!account) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #7C3AED', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}/>
    </div>
  );

  const { currentBalance = 0, lifetimePoints = 0, currentTier = 'bronze', tierDiscountsUsed = {} } = account;
  const tierName        = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);
  const tier            = getTier(lifetimePoints);
  const discountPercent = account.discountPercent || 0;
  const discountAvail   = account.discountAvailable && !discountDone;
  const perks           = TIER_PERKS[tierName] || TIER_PERKS.Bronze;
  const redeemValue     = Number(redeemInput) || 0;

  const handleRedeem = async () => {
    setRedeemError('');
    setRedeemOk('');
    const pts = parseInt(redeemInput, 10);
    if (!pts || pts <= 0) { setRedeemError('Enter a valid points amount.'); return; }
    if (pts < MIN_REDEEM) { setRedeemError(`Minimum redemption is ${MIN_REDEEM} points.`); return; }
    if (pts > currentBalance) { setRedeemError('Amount exceeds your current balance.'); return; }
    setRedeemBusy(true);
    try {
      await onRedeem(pts);
      setRedeemOk(`Successfully redeemed ${pts} pts — you saved Rs. ${pts}!`);
      setRedeemInput('');
    } catch (err) {
      setRedeemError(err.response?.data?.message || 'Redemption failed. Try again.');
    } finally {
      setRedeemBusy(false);
    }
  };

  const handleDiscount = async () => {
    setDiscountBusy(true);
    try {
      await onApplyDiscount();
      setDiscountDone(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not apply discount.');
    } finally {
      setDiscountBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Section A — Status Hero ── */}
      <div style={{
        background: `linear-gradient(135deg, ${tier.color}0d 0%, #ffffff 100%)`,
        border: `1px solid ${tier.color}25`,
        borderRadius: 16, padding: '22px 26px',
        display: 'flex', alignItems: 'center', gap: 22,
        position: 'relative', overflow: 'hidden',
        boxShadow: `0 2px 12px ${tier.color}10`,
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 0% 50%, ${tier.color}08 0%, transparent 60%)`,
        }}/>

        {/* Tier icon circle */}
        <div style={{
          width: 76, height: 76, borderRadius: '50%', flexShrink: 0,
          background: `${tier.color}12`,
          border: `2px solid ${tier.color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
          boxShadow: `0 0 20px ${tier.color}20`,
        }}>
          {TIER_ICONS[tierName] || '🥉'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ color: tier.color, fontWeight: 800, fontSize: 20 }}>{tierName}</div>
            <div style={{
              padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
              letterSpacing: 1, textTransform: 'uppercase',
              background: `${tier.color}12`, border: `1px solid ${tier.color}35`, color: tier.color,
            }}>
              Member
            </div>
          </div>
          <div style={{ color: '#6B7280', fontSize: 12.5, marginBottom: 12 }}>
            Lifetime points determine your tier — they never reset
          </div>
          <TierProgressBar lifetimePoints={lifetimePoints} showLabels />
        </div>

        {/* Right stats */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ color: '#9CA3AF', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Lifetime Points
          </div>
          <div style={{ color: '#111827', fontWeight: 800, fontSize: 28, lineHeight: 1 }}>
            {lifetimePoints.toLocaleString()}
          </div>
          <div style={{ color: '#9CA3AF', fontSize: 11, marginTop: 3 }}>
            Earned all-time
          </div>
        </div>
      </div>

      {/* ── Section C — 3 Summary Cards ── */}
      <div style={{ display: 'flex', gap: 12 }}>
        <PointsSummaryCard
          label="Redeemable Balance"
          value={currentBalance}
          subLabel="Resets every December 31"
          color="#10B981"
          icon="🪙"
        />
        <PointsSummaryCard
          label="Lifetime Points"
          value={lifetimePoints}
          subLabel="Determines your tier forever"
          color={tier.color}
          icon={TIER_ICONS[tierName]}
        />
        <div style={{
          flex: 1,
          background: discountAvail ? `${tier.color}08` : '#ffffff',
          border: `1px solid ${discountAvail ? tier.color + '30' : 'rgba(0,0,0,0.06)'}`,
          borderRadius: 14, padding: '18px 20px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🏷️</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9CA3AF' }}>
              Tier Discount
            </span>
          </div>
          {discountAvail ? (
            <>
              <div style={{ color: tier.color, fontWeight: 800, fontSize: 28, lineHeight: 1 }}>
                {discountPercent}%
                <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 5, opacity: 0.7 }}>OFF</span>
              </div>
              <div style={{ color: '#6B7280', fontSize: 11.5, marginTop: 6 }}>
                One-time {tierName} tier reward — available
              </div>
            </>
          ) : tierDiscountsUsed[currentTier] || discountDone ? (
            <>
              <div style={{ color: '#9CA3AF', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>Used</div>
              <div style={{ color: '#9CA3AF', fontSize: 11.5, marginTop: 6 }}>
                {tierName} discount already applied
              </div>
            </>
          ) : (
            <>
              <div style={{ color: '#D1D5DB', fontWeight: 700, fontSize: 15 }}>Bronze</div>
              <div style={{ color: '#9CA3AF', fontSize: 11.5, marginTop: 6 }}>
                Reach Silver to unlock a discount
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Section E — Tier Discount Banner (conditional) ── */}
      {discountAvail && (
        <div style={{
          background: `linear-gradient(135deg, ${tier.color}0d 0%, #ffffff 100%)`,
          border: `1px solid ${tier.color}35`,
          borderRadius: 14, padding: '16px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          position: 'relative', overflow: 'hidden',
          boxShadow: `0 2px 10px ${tier.color}12`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 30 }}>🎉</span>
            <div>
              <div style={{ color: '#111827', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                You have a <span style={{ color: tier.color }}>{discountPercent}% {tierName} discount</span> available!
              </div>
              <div style={{ color: '#6B7280', fontSize: 12.5 }}>
                One-time reward for reaching {tierName} tier. Reserve it now and it will apply to your next booking.
              </div>
            </div>
          </div>
          <button
            onClick={handleDiscount}
            disabled={discountBusy}
            style={{
              flexShrink: 0, padding: '10px 20px', border: 'none', borderRadius: 10,
              background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: discountBusy ? 'wait' : 'pointer',
              boxShadow: `0 4px 14px ${tier.color}35`, opacity: discountBusy ? 0.7 : 1,
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { if (!discountBusy) e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {discountBusy ? 'Applying…' : 'Reserve Discount →'}
          </button>
        </div>
      )}

      {/* ── Section D — Redeem Form ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 14, padding: '20px 22px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ color: '#111827', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          Redeem Points
        </div>
        <div style={{ color: '#6B7280', fontSize: 12.5, marginBottom: 16 }}>
          1 pt = Rs. 1 off your booking · Minimum {MIN_REDEEM} pts to redeem
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="number"
              min={MIN_REDEEM}
              max={currentBalance}
              value={redeemInput}
              onChange={e => { setRedeemInput(e.target.value); setRedeemError(''); setRedeemOk(''); }}
              placeholder={`Enter points (min ${MIN_REDEEM})`}
              style={{
                width: '100%', padding: '11px 14px',
                background: '#f3f4f6',
                border: `1px solid ${redeemError ? '#EF4444' : '#e5e7eb'}`,
                borderRadius: 9, color: '#111827', fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {redeemValue > 0 && (
            <div style={{
              padding: '11px 14px', borderRadius: 9,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              color: '#10B981', fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap',
            }}>
              = Rs. {redeemValue} off
            </div>
          )}

          <button
            onClick={handleRedeem}
            disabled={redeemBusy || currentBalance < MIN_REDEEM}
            style={{
              padding: '11px 20px', border: 'none', borderRadius: 9,
              background: currentBalance < MIN_REDEEM
                ? '#f3f4f6'
                : 'linear-gradient(135deg, #7C3AED, #9333ea)',
              color: currentBalance < MIN_REDEEM ? '#9CA3AF' : '#fff',
              fontWeight: 700, fontSize: 14,
              cursor: (redeemBusy || currentBalance < MIN_REDEEM) ? 'not-allowed' : 'pointer',
              boxShadow: currentBalance >= MIN_REDEEM ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
              transition: 'transform 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (currentBalance >= MIN_REDEEM && !redeemBusy) e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {redeemBusy ? 'Processing…' : currentBalance < MIN_REDEEM ? 'Insufficient balance' : 'Redeem Now'}
          </button>
        </div>

        {redeemError && (
          <div style={{ marginTop: 10, color: '#EF4444', fontSize: 12.5 }}>{redeemError}</div>
        )}
        {redeemOk && (
          <div style={{ marginTop: 10, color: '#10B981', fontSize: 12.5, fontWeight: 600 }}>{redeemOk}</div>
        )}
      </div>

      {/* ── Section B — Tier Benefits ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 14, padding: '20px 22px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 20 }}>{TIER_ICONS[tierName]}</span>
          <div>
            <div style={{ color: '#111827', fontWeight: 700, fontSize: 15 }}>
              Your {tierName} Benefits
            </div>
            <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>
              {tierName === 'Platinum' ? 'You have the highest tier — all benefits unlocked!' : 'Earn more to unlock higher tier perks'}
            </div>
          </div>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {perks.map((perk, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: tier.color }}/>
              <span style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.4 }}>{perk}</span>
            </li>
          ))}
        </ul>

        <div style={{
          padding: '11px 14px', borderRadius: 9,
          background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)',
          color: '#6B7280', fontSize: 12, lineHeight: 1.6,
        }}>
          ℹ️ Tier upgrades are permanent — you never drop a tier.
          Discount rewards are one-time, applied on your next confirmed booking.
        </div>
      </div>
    </div>
  );
};

/* ── Main LoyaltyPage ─────────────────────────────────────── */
const LoyaltyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { account, history, loading, fetchHistory, redeemPoints, applyTierDiscount } = useLoyalty();

  const qp         = new URLSearchParams(location.search);
  const initialTab = TABS.find(t => t.key === qp.get('tab'))?.key || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab, fetchHistory]);

  const handleTab = (key) => {
    setActiveTab(key);
    navigate(`/loyalty?tab=${key}`, { replace: true });
  };

  const tier = getTier(account?.lifetimePoints || 0);

  return (
    <CustomerLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', overflow: 'hidden' }}>

        {/* ── Page header ── */}
        <div style={{
          padding: '20px 32px 0',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          flexShrink: 0,
          background: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <EmojiEventsIcon sx={{ fontSize: 19, color: '#7C3AED' }}/>
            </div>
            <div>
              <h1 style={{ color: '#111827', fontWeight: 800, fontSize: 20, margin: 0, lineHeight: 1.2 }}>
                Loyalty Points
              </h1>
              <p style={{ color: '#6B7280', fontSize: 12.5, margin: 0, marginTop: 2 }}>
                Track your rewards, tier progress and redemption history
              </p>
            </div>

            {account && (
              <div style={{
                marginLeft: 'auto', padding: '7px 14px',
                background: `${tier.color}0a`, border: `1px solid ${tier.color}25`,
                borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 17 }}>{TIER_ICONS[tier.name]}</span>
                <div>
                  <div style={{ color: tier.color, fontWeight: 700, fontSize: 13, lineHeight: 1 }}>
                    {tier.name} Member
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>
                    {(account.currentBalance || 0).toLocaleString()} pts balance
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map(t => (
              <TabBtn key={t.key} label={t.label} active={activeTab === t.key} onClick={() => handleTab(t.key)} />
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 32px' }}>

          {loading && (activeTab === 'overview' || activeTab === 'history') && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid #7C3AED', borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }}/>
            </div>
          )}

          {!loading && activeTab === 'overview' && (
            <OverviewTab
              account={account}
              onRedeem={redeemPoints}
              onApplyDiscount={applyTierDiscount}
            />
          )}

          {!loading && activeTab === 'history' && (
            <HistoryTab transactions={history.transactions || []} />
          )}

          {activeTab === 'tiers' && (
            <TiersTab
              lifetimePoints={account?.lifetimePoints || 0}
              currentTierName={tier.name}
            />
          )}

          {activeTab === 'earn' && <EarnTab />}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>
    </CustomerLayout>
  );
};

export default LoyaltyPage;
