import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutIcon             from '@mui/icons-material/Logout';
import AssignmentIcon         from '@mui/icons-material/Assignment';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import CheckCircleIcon        from '@mui/icons-material/CheckCircle';
import WarningAmberIcon       from '@mui/icons-material/WarningAmber';
import HourglassEmptyIcon     from '@mui/icons-material/HourglassEmpty';
import PersonIcon             from '@mui/icons-material/Person';
import CalendarMonthIcon      from '@mui/icons-material/CalendarMonth';
import LocationOnIcon         from '@mui/icons-material/LocationOn';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GpsFixedIcon           from '@mui/icons-material/GpsFixed';
import BarChartIcon           from '@mui/icons-material/BarChart';
import CloseIcon              from '@mui/icons-material/Close';

/* ─── Task data ────────────────────────────────────────────── */
const TASKS = [
  {
    id: 1,
    service: 'Home Cleaning',
    customer: 'John Doe',
    payment: 'Cash on Delivery',
    paymentType: 'cash',
    date: '2026-10-11',
    time: '10:00 AM',
    address: '123 Main St, Colombo',
    price: 'LKR 4,500',
    status: 'PENDING',
  },
  {
    id: 2,
    service: 'Laundry Service',
    customer: 'Jane Smith',
    payment: 'Paid Online',
    paymentType: 'online',
    date: '2026-10-11',
    time: '02:00 PM',
    address: '456 Lake Rd, Kandy',
    price: 'LKR 2,800',
    status: 'IN_PROGRESS',
  },
  {
    id: 3,
    service: 'Sofa Cleaning',
    customer: 'Mike Wilson',
    payment: 'Cash on Delivery',
    paymentType: 'cash',
    date: '2026-10-12',
    time: '11:00 AM',
    address: '789 Park Ave, Galle',
    price: 'LKR 3,500',
    status: 'PENDING',
  },
  {
    id: 4,
    service: 'Curtain Cleaning',
    customer: 'Sarah Johnson',
    payment: 'Paid Online',
    paymentType: 'online',
    date: '2026-10-10',
    time: '09:00 AM',
    address: '321 Beach Rd, Negombo',
    price: 'LKR 1,500',
    status: 'COMPLETED',
  },
];

const STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     bg: '#FEF9C3', color: '#CA8A04', border: '#FDE047' },
  IN_PROGRESS: { label: 'In Progress', bg: '#DBEAFE', color: '#2563EB', border: '#93C5FD' },
  COMPLETED:   { label: 'Completed',   bg: '#DCFCE7', color: '#16A34A', border: '#86EFAC' },
};

const STATS = [
  { label: "Today's Tasks",   value: 2, Icon: AssignmentIcon,   color: '#7C3AED' },
  { label: 'In Progress',     value: 1, Icon: AccessTimeIcon,   color: '#2563EB' },
  { label: 'Completed Today', value: 0, Icon: CheckCircleIcon,  color: '#10B981' },
  { label: 'Pending',         value: 2, Icon: WarningAmberIcon, color: '#F59E0B' },
];

/* ─── Material usage demo data ─────────────────────────────── */
const DEMO_CONSUMABLES = [
  { id: 'c1', name: 'All-purpose cleaner', unit: 'litres',  allocated: 2  },
  { id: 'c2', name: 'Floor cleaner',       unit: 'litres',  allocated: 2  },
  { id: 'c3', name: 'Bathroom cleaner',    unit: 'litre',   allocated: 1  },
  { id: 'c4', name: 'Microfiber cloths',   unit: 'pieces',  allocated: 10 },
  { id: 'c5', name: 'Garbage bags',        unit: 'pieces',  allocated: 10 },
  { id: 'c6', name: 'Gloves',              unit: 'pairs',   allocated: 5  },
];

const DEMO_EQUIPMENT = [
  { id: 'e1', name: 'Vacuum cleaner'      },
  { id: 'e2', name: 'Mop and bucket set'  },
  { id: 'e3', name: 'Extendable duster'   },
];

const FILL_LEVELS = [
  { value: 'empty',         label: 'Empty (0%)'           },
  { value: 'quarter',       label: 'Quarter (25%)'         },
  { value: 'half',          label: 'Half (50%)'            },
  { value: 'three_quarter', label: 'Three-quarters (75%)'  },
  { value: 'nearly_full',   label: 'Nearly Full (90%)'     },
];

const EQUIPMENT_CONDITIONS = [
  { value: 'good',    label: 'Good'    },
  { value: 'damaged', label: 'Damaged' },
  { value: 'lost',    label: 'Lost'    },
];

const initConsumables = () =>
  DEMO_CONSUMABLES.map(c => ({ ...c, used: '', fillLevel: 'empty' }));

const initEquipment = () =>
  DEMO_EQUIPMENT.map(e => ({ ...e, condition: 'good' }));

/* ─── MaterialUsageModal ───────────────────────────────────── */
const MaterialUsageModal = ({ task, onClose }) => {
  const [consumables, setConsumables] = useState(initConsumables);
  const [equipment,   setEquipment]   = useState(initEquipment);
  // 'form' | 'confirming' | 'submitting' | 'success'
  const [step, setStep] = useState('form');

  // Auto-close after success
  useEffect(() => {
    if (step === 'success') {
      const t = setTimeout(onClose, 2000);
      return () => clearTimeout(t);
    }
  }, [step, onClose]);

  const setConsumableField = (id, field) => (e) => {
    const val = e.target.value;
    setConsumables(prev =>
      prev.map(c => c.id === id ? { ...c, [field]: val } : c)
    );
  };

  const setEquipmentField = (id, field) => (e) => {
    const val = e.target.value;
    setEquipment(prev =>
      prev.map(eq => eq.id === id ? { ...eq, [field]: val } : eq)
    );
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setStep('confirming');
  };

  const handleConfirm = async () => {
    setStep('submitting');
    // Demo: simulate a brief API delay then show success
    await new Promise(r => setTimeout(r, 900));
    setStep('success');
  };

  /* ── Shared styles ── */
  const selectStyle = {
    padding: '7px 10px', fontSize: 13, borderRadius: 7,
    border: '1px solid #E5E7EB', background: '#ffffff',
    color: '#111827', cursor: 'pointer', outline: 'none',
  };

  const inputStyle = {
    padding: '7px 10px', fontSize: 13, borderRadius: 7,
    border: '1px solid #E5E7EB', background: '#ffffff',
    color: '#111827', outline: 'none', width: 80,
    textAlign: 'right',
  };

  const sectionHeader = {
    fontSize: 10.5, fontWeight: 700, color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 1.2,
    margin: '0 0 12px',
  };

  /* ── Modal content by step ── */
  const renderBody = () => {
    if (step === 'success') {
      return (
        <div style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', fontSize: 30,
          }}>
            ✅
          </div>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#111827', marginBottom: 10 }}>
            Report Submitted Successfully!
          </div>
          <div style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.7, marginBottom: 16 }}>
            Your report is now pending admin verification.
            Stock will be updated after admin approval.
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>Closing automatically…</div>
        </div>
      );
    }

    if (step === 'confirming' || step === 'submitting') {
      return (
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', fontSize: 26,
          }}>
            ⚠️
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 8 }}>
            Are you sure?
          </div>
          <div style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, marginBottom: 28 }}>
            This report <strong>cannot be edited</strong> after submission.
            <br />Please confirm that all values are correct.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => setStep('form')}
              disabled={step === 'submitting'}
              style={{
                padding: '9px 22px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                background: '#f3f4f6', border: '1px solid #e5e7eb',
                color: '#374151', cursor: step === 'submitting' ? 'not-allowed' : 'pointer',
                opacity: step === 'submitting' ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={step === 'submitting'}
              style={{
                padding: '9px 24px', borderRadius: 8, fontSize: 13.5, fontWeight: 700,
                background: step === 'submitting' ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7C3AED, #9333ea)',
                boxShadow: step === 'submitting' ? 'none' : '0 4px 18px rgba(124,58,237,0.35)',
                border: 'none', color: '#fff',
                cursor: step === 'submitting' ? 'not-allowed' : 'pointer',
              }}
            >
              {step === 'submitting' ? 'Submitting…' : 'Confirm & Submit'}
            </button>
          </div>
        </div>
      );
    }

    /* ── Main form (step === 'form') ── */
    return (
      <form onSubmit={handleSubmitClick}>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Warning notice */}
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '12px 16px', borderRadius: 10,
            background: '#fffbeb', border: '1px solid rgba(245,158,11,0.35)',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠</span>
            <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
              <strong>Once submitted, this report is locked and cannot be edited.</strong>
              {' '}Please review carefully before submitting. Your report will be reviewed
              by an admin before stock is updated.
            </div>
          </div>

          {/* ── CONSUMABLES ── */}
          <div>
            <p style={sectionHeader}>Consumables</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {consumables.map(c => (
                <div
                  key={c.id}
                  style={{
                    background: '#f9fafb', border: '1px solid #e5e7eb',
                    borderRadius: 10, padding: '12px 14px',
                  }}
                >
                  {/* Item name + allocated badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: '#111827', flex: 1 }}>
                      {c.name}
                    </span>
                    <span style={{
                      padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: 'rgba(124,58,237,0.08)', color: '#7C3AED',
                      border: '1px solid rgba(124,58,237,0.2)', whiteSpace: 'nowrap',
                    }}>
                      Allocated: {c.allocated} {c.unit}
                    </span>
                  </div>

                  {/* Inputs row */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <label style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        Actually Used:
                      </label>
                      <input
                        type="number"
                        className="mu-input"
                        min={0}
                        max={c.allocated}
                        step="0.1"
                        value={c.used}
                        onChange={setConsumableField(c.id, 'used')}
                        placeholder="0"
                        required
                        style={inputStyle}
                      />
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>{c.unit}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <label style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        Bottle Fill Level:
                      </label>
                      <select
                        className="mu-input"
                        value={c.fillLevel}
                        onChange={setConsumableField(c.id, 'fillLevel')}
                        style={selectStyle}
                      >
                        {FILL_LEVELS.map(fl => (
                          <option key={fl.value} value={fl.value}>{fl.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── EQUIPMENT ── */}
          <div>
            <p style={sectionHeader}>Equipment</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {equipment.map(eq => (
                <div
                  key={eq.id}
                  style={{
                    background: '#f9fafb', border: '1px solid #e5e7eb',
                    borderRadius: 10, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 13.5, color: '#111827', flex: 1 }}>
                    {eq.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                      Condition:
                    </label>
                    <select
                      className="mu-input"
                      value={eq.condition}
                      onChange={setEquipmentField(eq.id, 'condition')}
                      style={{
                        ...selectStyle,
                        color:
                          eq.condition === 'damaged' ? '#D97706' :
                          eq.condition === 'lost'    ? '#DC2626' : '#16A34A',
                        fontWeight: 600,
                      }}
                    >
                      {EQUIPMENT_CONDITIONS.map(ec => (
                        <option key={ec.value} value={ec.value}>{ec.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div style={{
            display: 'flex', gap: 10, justifyContent: 'flex-end',
            paddingTop: 4, borderTop: '1px solid #f1f5f9',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 22px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                background: '#f3f4f6', border: '1px solid #e5e7eb',
                color: '#374151', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 24px', borderRadius: 8, fontSize: 13.5, fontWeight: 700,
                background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
                boxShadow: '0 4px 18px rgba(124,58,237,0.35)',
                border: 'none', color: '#fff', cursor: 'pointer',
              }}
            >
              Submit Usage Report
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,17,26,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div style={{
        background: '#ffffff', borderRadius: 16,
        width: '100%', maxWidth: 600,
        maxHeight: '82vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}>
        {/* Sticky header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>
              Record Material Usage
            </div>
            {task && (
              <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>
                {task.service} · {task.customer}
              </div>
            )}
          </div>
          {step !== 'submitting' && step !== 'success' && (
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none',
                background: '#f3f4f6', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6B7280', flexShrink: 0,
              }}
            >
              <CloseIcon sx={{ fontSize: 17 }} />
            </button>
          )}
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {renderBody()}
        </div>
      </div>

      <style>{`
        .mu-input:focus {
          border-color: #7C3AED !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
          outline: none !important;
        }
      `}</style>
    </div>
  );
};

/* ─── Btn ──────────────────────────────────────────────────── */
const Btn = ({ children, variant = 'ghost', color = '#7C3AED', onClick }) => {
  const variantStyles = {
    filled:   { background: color,         color: '#fff',     border: 'none'                    },
    outlined: { background: 'transparent', color,             border: `1.5px solid ${color}`    },
    ghost:    { background: '#F3F4F6',     color: '#374151',  border: '1.5px solid #E5E7EB'     },
    danger:   { background: 'transparent', color: '#DC2626',  border: '1.5px solid #FCA5A5'     },
    success:  { background: '#16A34A',     color: '#fff',     border: 'none'                    },
  };
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 13px', borderRadius: 7,
        fontSize: 12.5, fontWeight: 600,
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'opacity 0.15s',
        ...variantStyles[variant],
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
};

/* ─── TaskCard ─────────────────────────────────────────────── */
const TaskCard = ({ task, onRecordUsage }) => {
  const sc = STATUS_CONFIG[task.status];
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: 12,
      padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Row 1: service name + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{task.service}</span>
        <span style={{
          padding: '4px 12px', borderRadius: 20,
          fontSize: 11.5, fontWeight: 700, flexShrink: 0,
          background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
        }}>
          {sc.label}
        </span>
      </div>

      {/* Row 2: customer + payment badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6B7280', fontSize: 13 }}>
          <PersonIcon sx={{ fontSize: 15, color: '#9CA3AF' }} />
          {task.customer}
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600,
          ...(task.paymentType === 'cash'
            ? { background: '#F3E8FF', color: '#7C3AED', border: '1px solid #DDD6FE' }
            : { background: '#DCFCE7', color: '#16A34A', border: '1px solid #86EFAC' }),
        }}>
          {task.payment}
        </span>
      </div>

      {/* Row 3: date + address */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6B7280', fontSize: 13 }}>
          <CalendarMonthIcon sx={{ fontSize: 15, color: '#9CA3AF' }} />
          {task.date} · {task.time}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6B7280', fontSize: 13 }}>
          <LocationOnIcon sx={{ fontSize: 15, color: '#9CA3AF' }} />
          {task.address}
        </div>
      </div>

      {/* Price */}
      <div style={{ fontWeight: 700, fontSize: 16, color: '#7C3AED' }}>{task.price}</div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {task.status === 'PENDING' && (
          <>
            <Btn variant="filled"   color="#7C3AED">Start Task</Btn>
            <Btn variant="danger">Decline Task</Btn>
            <Btn variant="ghost">Mark Cash Received</Btn>
            <Btn variant="ghost">Generate Invoice</Btn>
            <Btn variant="ghost">Send Invoice</Btn>
          </>
        )}
        {task.status === 'IN_PROGRESS' && (
          <>
            <Btn variant="success">Mark Complete</Btn>
            <Btn variant="danger">Decline Task</Btn>
            <Btn variant="ghost">Generate Invoice</Btn>
            <Btn variant="ghost">Send Invoice</Btn>
          </>
        )}
        {task.status === 'COMPLETED' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16A34A', fontWeight: 600, fontSize: 13 }}>
              <CheckCircleIcon sx={{ fontSize: 16, color: '#16A34A' }} />
              Task Completed
            </div>
            <Btn variant="outlined" color="#7C3AED" onClick={() => onRecordUsage(task)}>
              Record Material Usage
            </Btn>
            <Btn variant="ghost">Generate Invoice</Btn>
            <Btn variant="ghost">Send Invoice</Btn>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── StaffDashboard ───────────────────────────────────────── */
const StaffDashboard = () => {
  const auth     = useAuth();
  const user     = auth?.user   || {};
  const logout   = auth?.logout || (() => Promise.resolve());
  const navigate = useNavigate();

  const [available,   setAvailable]   = useState(true);
  const [activeTab,   setActiveTab]   = useState('tasks');
  const [activeTask,  setActiveTask]  = useState(null); // task being reported on

  const handleLogout = async () => {
    try { await logout(); } finally { navigate('/login', { replace: true }); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* ── Material Usage Modal ── */}
      {activeTask && (
        <MaterialUsageModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
        />
      )}

      {/* ── Header ── */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', letterSpacing: 0.3 }}>
            CLOUD LAUNDRY.LK
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>Staff Dashboard</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#374151' }}>
              {user?.name || 'Staff Member'}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{user?.email || ''}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 8,
              background: '#7C3AED', color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600,
              boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#6D28D9'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#7C3AED'; }}
          >
            <LogoutIcon sx={{ fontSize: 16 }} />
            Logout
          </button>
        </div>
      </header>

      {/* ── Availability Banner ── */}
      {available ? (
        <div style={{
          background: '#f0fdf4',
          borderTop: '1px solid #bbf7d0', borderBottom: '1px solid #bbf7d0',
          padding: '14px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#dcfce7', border: '1.5px solid #86efac',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircleIcon sx={{ fontSize: 22, color: '#16A34A' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#166534' }}>
                Available for Service Today
              </div>
              <div style={{ fontSize: 12.5, color: '#15803d', marginTop: 2 }}>
                You are marked as available for service assignments
              </div>
            </div>
          </div>
          <button
            onClick={() => setAvailable(false)}
            style={{
              padding: '8px 18px', borderRadius: 8,
              background: '#DC2626', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#b91c1c'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#DC2626'; }}
          >
            Mark Unavailable
          </button>
        </div>
      ) : (
        <div style={{
          background: '#fff7ed',
          borderTop: '1px solid #fed7aa', borderBottom: '1px solid #fed7aa',
          padding: '14px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#fed7aa', border: '1.5px solid #fb923c',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HourglassEmptyIcon sx={{ fontSize: 22, color: '#ea580c' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#9a3412' }}>
                Unavailable for Service
              </div>
              <div style={{ fontSize: 12.5, color: '#c2410c', marginTop: 2 }}>
                You are currently marked as unavailable for assignments
              </div>
            </div>
          </div>
          <button
            onClick={() => setAvailable(true)}
            style={{
              padding: '8px 18px', borderRadius: 8,
              background: '#16A34A', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#15803d'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#16A34A'; }}
          >
            Mark Available
          </button>
        </div>
      )}

      {/* ── Page body ── */}
      <div style={{
        padding: '24px 32px',
        display: 'flex', flexDirection: 'column', gap: 20,
        maxWidth: 1200, margin: '0 auto',
      }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {STATS.map(({ label, value, Icon, color }) => (
            <div
              key={label}
              style={{
                background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: 12, padding: '18px 20px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{
                  fontSize: 11.5, color: '#9CA3AF', fontWeight: 600,
                  letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8,
                }}>
                  {label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                  {value}
                </div>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 11,
                background: `${color}12`, border: `1px solid ${color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon sx={{ fontSize: 22, color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '2px solid #E5E7EB', display: 'flex', gap: 0 }}>
          {[
            { id: 'tasks',    label: 'My Tasks', Icon: FormatListBulletedIcon },
            { id: 'schedule', label: 'Schedule', Icon: CalendarMonthIcon      },
          ].map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '12px 20px', border: 'none', background: 'transparent',
                  color: active ? '#7C3AED' : '#6B7280',
                  borderBottom: active ? '2px solid #7C3AED' : '2px solid transparent',
                  marginBottom: -2,
                  fontWeight: active ? 700 : 500,
                  fontSize: 14, cursor: 'pointer', transition: 'color 0.15s',
                }}
              >
                <Icon sx={{ fontSize: 17 }} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'tasks' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: '#111827', margin: 0 }}>
              Assigned Tasks
            </h2>
            {TASKS.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onRecordUsage={setActiveTask}
              />
            ))}
          </div>
        ) : (
          <div style={{
            background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 12, padding: '52px', textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <CalendarMonthIcon sx={{ fontSize: 48, color: '#E5E7EB', display: 'block', margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 600, fontSize: 15, color: '#374151', marginBottom: 6 }}>
              Schedule View
            </div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>
              Your weekly schedule will appear here
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: '#111827', margin: '4px 0 14px' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { Icon: GpsFixedIcon, color: '#2563EB', title: 'GPS Tracking', desc: 'Track service locations' },
              { Icon: BarChartIcon, color: '#7C3AED', title: 'Performance',  desc: 'View your stats'        },
            ].map(({ Icon, color, title, desc }) => (
              <div
                key={title}
                style={{
                  background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
                  borderRadius: 12, padding: '20px 22px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow   = `0 4px 14px ${color}18`;
                  e.currentTarget.style.borderColor = `${color}30`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow   = '0 1px 4px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)';
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                  background: `${color}10`, border: `1px solid ${color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon sx={{ fontSize: 22, color }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{title}</div>
                  <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 3 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 900px) {
          .staff-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .staff-quick { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .staff-stats { grid-template-columns: 1fr 1fr !important; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
      `}</style>
    </div>
  );
};

export default StaffDashboard;
