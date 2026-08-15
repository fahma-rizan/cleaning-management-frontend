import { useState, useEffect, useMemo } from 'react';
import {
  Package, Plus, Pencil, Trash2, RotateCcw, Search, AlertTriangle,
  CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, FileText, BarChart3, Bell, History,
} from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface InventoryItemT {
  _id: string;
  sku: string;
  name: string;
  type: 'consumable' | 'equipment';
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  isLowStock?: boolean;
}

interface MaterialRequestT {
  _id: string;
  bookingId: {
    bookingRef: string;
    customerId: { name: string };
    scheduledDate: string;
    serviceType: string;
    usageFactor: string;
    usageFactorValue: string;
  };
  items: { itemType: string; itemId?: string; name: string; sku: string; requestedQty: number; inStock: number; sufficient: boolean }[];
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

interface CompletionReportT {
  _id: string;
  booking: { bookingRef: string; customerName: string };
  employee: { name: string };
  items: { itemType: string; itemId?: string; name: string; sku: string; usedQty: number }[];
  anomalyFlags: string[];
  status: 'pending_verification' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
}

interface AlertT {
  _id: string;
  item: { _id: string; name: string; sku: string; type: string; quantity: number; unit: string; lowStockThreshold: number };
  triggeredAt: string;
}

interface AlertHistoryT {
  _id: string;
  item: { name: string; sku: string; type: string; unit: string };
  resolvedAt: string;
  restockedTo: number;
}

interface MonthlyReportT {
  year: number;
  month: number;
  summary: { totalDeducted: number; totalReturned: number; netConsumed: number; totalRestocked: number };
  items: { name: string; sku: string; type: string; deducted: number; returned: number; netConsumed: number; restocked: number; transactionCount: number }[];
}

type Tab = 'inventory' | 'requests' | 'reports' | 'alerts' | 'monthly';

const TABS: { id: Tab; name: string; icon: any }[] = [
  { id: 'inventory', name: 'Inventory', icon: Package },
  { id: 'requests', name: 'Material Requests', icon: FileText },
  { id: 'reports', name: 'Completion Reports', icon: CheckCircle },
  { id: 'alerts', name: 'Alerts', icon: Bell },
  { id: 'monthly', name: 'Monthly Report', icon: BarChart3 },
];

// ─── Small shared bits ──────────────────────────────────────────────────────────
const TypeBadge = ({ type }: { type: string }) => (
  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
    type === 'equipment' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
  }`}>
    {type}
  </span>
);

const StockPill = ({ item }: { item: InventoryItemT }) => (
  <span className="inline-flex items-center gap-2">
    <span className="font-semibold">{item.quantity} {item.unit}</span>
    {item.isLowStock && (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase">Low</span>
    )}
  </span>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    pending_verification: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const label: Record<string, string> = { pending_verification: 'Pending Verification' };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {label[status] || status}
    </span>
  );
};

// ─── Stock Adjust Modal ─────────────────────────────────────────────────────────
function StockAdjustModal({ item, onClose, onSaved }: { item: InventoryItemT; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<'restock' | 'deduct' | 'return' | 'adjustment'>('restock');
  const [quantity, setQuantity] = useState(0);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    if (type === 'restock' || type === 'return') return item.quantity + quantity;
    if (type === 'deduct') return Math.max(0, item.quantity - quantity);
    return quantity; // adjustment sets absolute value
  }, [type, quantity, item.quantity]);

  const submit = async () => {
    setSaving(true);
    try {
      await fetchWithAuth(`/inventory/${item._id}/adjust`, {
        method: 'POST',
        body: JSON.stringify({ type, quantity, reference, notes }),
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Adjust Stock — {item.name}</h3>
        <p className="text-xs text-gray-400 mb-4">Current: {item.quantity} {item.unit}</p>

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Adjustment Type</label>
        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full mb-4 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
          <option value="restock">Restock (+)</option>
          <option value="deduct">Deduct (−)</option>
          <option value="return">Return (+)</option>
          <option value="adjustment">Set absolute quantity</option>
        </select>

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Quantity</label>
        <input
          type="number" min={0} value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          className="w-full mb-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
        />
        <p className="text-xs text-gray-400 mb-4">New quantity will be: <span className="font-bold text-purple-600">{preview} {item.unit}</span></p>

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Reference</label>
        <input value={reference} onChange={e => setReference(e.target.value)} placeholder="e.g. PO-1029 or Booking ID" className="w-full mb-4 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900" />

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full mb-6 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900" />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
          <button disabled={saving} onClick={submit} className="px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add / Edit Item Modal ──────────────────────────────────────────────────────
function ItemFormModal({ item, onClose, onSaved }: { item: InventoryItemT | null; onClose: () => void; onSaved: () => void }) {
  const [sku, setSku] = useState(item?.sku || '');
  const [name, setName] = useState(item?.name || '');
  const [type, setType] = useState<'consumable' | 'equipment'>(item?.type || 'consumable');
  const [quantity, setQuantity] = useState(item?.quantity ?? 0);
  const [unit, setUnit] = useState(item?.unit || 'units');
  const [threshold, setThreshold] = useState(item?.lowStockThreshold ?? 10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      if (item) {
        const res = await fetchWithAuth(`/inventory/${item._id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, type, unit, lowStockThreshold: threshold }),
        });
        if (res?.error) { setError(res.error); return; }
      } else {
        const res = await fetchWithAuth('/inventory', {
          method: 'POST',
          body: JSON.stringify({ sku, name, type, quantity, unit, lowStockThreshold: threshold }),
        });
        if (res?.error) { setError(res.error); return; }
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold mb-4 dark:text-white">{item ? 'Edit Item' : 'Add Inventory Item'}</h3>
        {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs mb-3">{error}</div>}

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">SKU</label>
        <input value={sku} disabled={!!item} onChange={e => setSku(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 disabled:opacity-60" />

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Name</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900" />

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Type</label>
        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full mb-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
          <option value="consumable">Consumable</option>
          <option value="equipment">Equipment</option>
        </select>

        {!item && (
          <>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Initial Quantity</label>
            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full mb-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900" />
          </>
        )}

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Unit</label>
        <input value={unit} onChange={e => setUnit(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900" />

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Low Stock Threshold</label>
        <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-full mb-6 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900" />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
          <button disabled={saving || !name || (!item && !sku)} onClick={submit} className="px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inventory tab ───────────────────────────────────────────────────────────
function InventoryTab() {
  const [items, setItems] = useState<InventoryItemT[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [adjustItem, setAdjustItem] = useState<InventoryItemT | null>(null);
  const [formItem, setFormItem] = useState<InventoryItemT | null | 'new'>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetchWithAuth(`/inventory?${params.toString()}`);
      setItems(Array.isArray(res?.items) ? res.items : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id: string) => {
    await fetchWithAuth(`/inventory/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm w-64" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold">
            <option value="">All types</option>
            <option value="consumable">Consumables</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>
        <button onClick={() => setFormItem('new')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 uppercase text-xs font-bold">
              <tr>
                <th className="text-left px-6 py-3">SKU</th>
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3">Type</th>
                <th className="text-left px-6 py-3">Stock</th>
                <th className="text-left px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No inventory items found</td></tr>}
              {!loading && items.map(item => (
                <tr key={item._id}>
                  <td className="px-6 py-3 font-mono text-xs text-gray-500">{item.sku}</td>
                  <td className="px-6 py-3 font-semibold dark:text-gray-200">{item.name}</td>
                  <td className="px-6 py-3"><TypeBadge type={item.type} /></td>
                  <td className="px-6 py-3"><StockPill item={item} /></td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setAdjustItem(item)} title="Adjust stock" className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><RotateCcw className="w-4 h-4" /></button>
                      <button onClick={() => setFormItem(item)} title="Edit" className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><Pencil className="w-4 h-4" /></button>
                      {confirmDelete === item._id ? (
                        <button onClick={() => remove(item._id)} className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">Confirm?</button>
                      ) : (
                        <button onClick={() => setConfirmDelete(item._id)} title="Delete" className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {adjustItem && <StockAdjustModal item={adjustItem} onClose={() => setAdjustItem(null)} onSaved={load} />}
      {formItem && <ItemFormModal item={formItem === 'new' ? null : formItem} onClose={() => setFormItem(null)} onSaved={load} />}
    </div>
  );
}

// ─── Material Requests tab ───────────────────────────────────────────────────
function RequestCard({ request, onChanged }: { request: MaterialRequestT; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [busy, setBusy] = useState(false);

  const consumables = request.items.filter(i => i.itemType === 'consumable');
  const equipment = request.items.filter(i => i.itemType === 'equipment');

  const approve = async () => {
    setBusy(true);
    try { await fetchWithAuth(`/material-requests/${request._id}/approve`, { method: 'POST', body: '{}' }); onChanged(); }
    finally { setBusy(false); }
  };
  const reject = async () => {
    setBusy(true);
    try {
      await fetchWithAuth(`/material-requests/${request._id}/reject`, { method: 'POST', body: JSON.stringify({ reason: rejectReason }) });
      onChanged();
    } finally { setBusy(false); setShowReject(false); }
  };

  const b = request.bookingId;
  const itemTable = (title: string, rows: MaterialRequestT['items']) => rows.length > 0 && (
    <div className="mt-3">
      <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2">{title}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 text-xs">
            <th className="pb-1">Item</th><th className="pb-1">SKU</th><th className="pb-1">Requested</th><th className="pb-1">In Stock</th><th className="pb-1">Sufficient?</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-gray-50 dark:border-gray-700">
              <td className="py-2">{r.name}</td>
              <td className="py-2 font-mono text-xs text-gray-500">{r.sku}</td>
              <td className="py-2">{r.requestedQty}</td>
              <td className="py-2">{r.inStock}</td>
              <td className="py-2">{r.sufficient ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-purple-600">{b?.bookingRef || 'Unknown Booking'}</span>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">{b?.customerId?.name} &middot; {b?.serviceType} &middot; {b?.scheduledDate}</p>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-gray-50 dark:border-gray-700 pt-4">
          {itemTable('Consumables', consumables)}
          {itemTable('Equipment', equipment)}

          {request.status === 'pending' && (
            <div className="mt-6 flex items-center gap-3">
              <button disabled={busy} onClick={approve} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">Approve</button>
              {!showReject ? (
                <button onClick={() => setShowReject(true)} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100">Reject</button>
              ) : (
                <div className="flex gap-2 items-center">
                  <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason..." className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm" />
                  <button disabled={busy} onClick={reject} className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm font-bold">Confirm</button>
                </div>
              )}
            </div>
          )}
          {request.status === 'rejected' && request.rejectionReason && (
            <p className="mt-4 text-sm text-red-600">Rejection reason: {request.rejectionReason}</p>
          )}
        </div>
      )}
    </div>
  );
}

function RequestsTab() {
  const [requests, setRequests] = useState<MaterialRequestT[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/material-requests${status ? `?status=${status}` : ''}`);
      setRequests(Array.isArray(res?.requests) ? res.requests : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${status === s ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>
      {loading && <p className="text-center py-8 text-gray-400">Loading...</p>}
      {!loading && requests.length === 0 && <p className="text-center py-8 text-gray-400">No material requests found</p>}
      <div className="space-y-3">
        {requests.map(r => <RequestCard key={r._id} request={r} onChanged={load} />)}
      </div>
    </div>
  );
}

// ─── Completion Reports tab ───────────────────────────────────────────────────
function ReportCard({ report, onChanged }: { report: CompletionReportT; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [busy, setBusy] = useState(false);

  const verify = async (verdict: 'approved' | 'rejected') => {
    setBusy(true);
    try {
      await fetchWithAuth(`/completion-reports/${report._id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ status: verdict, rejectionReason: verdict === 'rejected' ? rejectReason : undefined }),
      });
      onChanged();
    } finally { setBusy(false); setShowReject(false); }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-purple-600">{report.booking?.bookingRef || 'Unknown Booking'}</span>
            <StatusBadge status={report.status} />
            {report.anomalyFlags?.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" /> Anomaly
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{report.booking?.customerName} &middot; submitted by {report.employee?.name || 'staff'}</p>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-gray-50 dark:border-gray-700 pt-4">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 text-xs"><th className="pb-1">Item</th><th className="pb-1">SKU</th><th className="pb-1">Used Qty</th></tr></thead>
            <tbody>
              {report.items.map((it, i) => (
                <tr key={i} className="border-t border-gray-50 dark:border-gray-700">
                  <td className="py-2">{it.name}</td>
                  <td className="py-2 font-mono text-xs text-gray-500">{it.sku}</td>
                  <td className="py-2">{it.usedQty}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {report.status === 'pending_verification' && (
            <div className="mt-6 flex items-center gap-3">
              <button disabled={busy} onClick={() => verify('approved')} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">Approve &amp; Deduct Stock</button>
              {!showReject ? (
                <button onClick={() => setShowReject(true)} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100">Reject</button>
              ) : (
                <div className="flex gap-2 items-center">
                  <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason..." className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm" />
                  <button disabled={busy} onClick={() => verify('rejected')} className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm font-bold">Confirm</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState<CompletionReportT[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/completion-reports${status ? `?status=${status}` : ''}`);
      setReports(Array.isArray(res?.reports) ? res.reports : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['', 'pending_verification', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${status === s ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}>
            {s === 'pending_verification' ? 'Pending' : (s || 'All')}
          </button>
        ))}
      </div>
      {loading && <p className="text-center py-8 text-gray-400">Loading...</p>}
      {!loading && reports.length === 0 && <p className="text-center py-8 text-gray-400">No completion reports found</p>}
      <div className="space-y-3">
        {reports.map(r => <ReportCard key={r._id} report={r} onChanged={load} />)}
      </div>
    </div>
  );
}

// ─── Alerts tab ────────────────────────────────────────────────────────────────
function AlertsTab() {
  const [active, setActive] = useState<AlertT[]>([]);
  const [history, setHistory] = useState<AlertHistoryT[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'active' | 'history'>('active');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [act, hist] = await Promise.all([fetchWithAuth('/alerts'), fetchWithAuth('/alerts/history')]);
        setActive(Array.isArray(act) ? act : []);
        setHistory(Array.isArray(hist) ? hist : []);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setView('active')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 ${view === 'active' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}>
          <Bell className="w-3 h-3" /> Active ({active.length})
        </button>
        <button onClick={() => setView('history')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 ${view === 'history' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}>
          <History className="w-3 h-3" /> History ({history.length})
        </button>
      </div>

      {loading && <p className="text-center py-8 text-gray-400">Loading...</p>}

      {!loading && view === 'active' && (
        active.length === 0 ? <p className="text-center py-8 text-gray-400">No active low-stock alerts</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map(a => (
              <div key={a._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 p-5 flex items-center gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                <div className="flex-1">
                  <p className="font-bold dark:text-white">{a.item.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{a.item.sku}</p>
                  <p className="text-sm text-red-600 font-semibold mt-1">{a.item.quantity} {a.item.unit} left (threshold {a.item.lowStockThreshold})</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {!loading && view === 'history' && (
        history.length === 0 ? <p className="text-center py-8 text-gray-400">No resolved alerts yet</p> : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 uppercase text-xs font-bold">
                <tr><th className="text-left px-6 py-3">Item</th><th className="text-left px-6 py-3">Restocked To</th><th className="text-left px-6 py-3">Resolved</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {history.map(h => (
                  <tr key={h._id}>
                    <td className="px-6 py-3 font-semibold dark:text-gray-200">{h.item.name} <span className="text-gray-400 font-mono text-xs">({h.item.sku})</span></td>
                    <td className="px-6 py-3">{h.restockedTo} {h.item.unit}</td>
                    <td className="px-6 py-3 text-gray-500">{new Date(h.resolvedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

// ─── Monthly Report tab ─────────────────────────────────────────────────────────
function MonthlyTab() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<MonthlyReportT | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/reports/monthly?year=${year}&month=${month}`);
        setReport(res);
      } finally { setLoading(false); }
    })();
  }, [year, month]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <input
          type="month"
          value={`${year}-${String(month).padStart(2, '0')}`}
          onChange={e => { const [y, m] = e.target.value.split('-'); setYear(Number(y)); setMonth(Number(m)); }}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold"
        />
      </div>

      {loading && <p className="text-center py-8 text-gray-400">Loading...</p>}

      {!loading && report && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Deducted</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{report.summary.totalDeducted}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Returned</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{report.summary.totalReturned}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Net Consumed</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{report.summary.netConsumed}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Restocked</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{report.summary.totalRestocked}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 uppercase text-xs font-bold">
                <tr>
                  <th className="text-left px-6 py-3">Item</th><th className="text-left px-6 py-3">Type</th>
                  <th className="text-left px-6 py-3">Deducted</th><th className="text-left px-6 py-3">Returned</th>
                  <th className="text-left px-6 py-3">Net</th><th className="text-left px-6 py-3">Restocked</th><th className="text-left px-6 py-3">Txns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {report.items.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">No inventory movement this month</td></tr>}
                {report.items.map((it, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3 font-semibold dark:text-gray-200">{it.name} <span className="text-gray-400 font-mono text-xs">({it.sku})</span></td>
                    <td className="px-6 py-3"><TypeBadge type={it.type} /></td>
                    <td className="px-6 py-3">{it.deducted}</td>
                    <td className="px-6 py-3">{it.returned}</td>
                    <td className="px-6 py-3 font-bold">{it.netConsumed}</td>
                    <td className="px-6 py-3">{it.restocked}</td>
                    <td className="px-6 py-3 text-gray-400">{it.transactionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
export function InventoryManagement() {
  const [tab, setTab] = useState<Tab>('inventory');

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap flex items-center gap-2 ${
              tab === t.id ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.name}
          </button>
        ))}
      </div>

      {tab === 'inventory' && <InventoryTab />}
      {tab === 'requests' && <RequestsTab />}
      {tab === 'reports' && <ReportsTab />}
      {tab === 'alerts' && <AlertsTab />}
      {tab === 'monthly' && <MonthlyTab />}
    </div>
  );
}

export default InventoryManagement;
