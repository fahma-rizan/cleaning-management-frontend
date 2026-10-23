import { useState, useEffect, useMemo } from 'react';
import {
  Package, Plus, Pencil, Trash2, RotateCcw, Search, AlertTriangle,
  CheckCircle, Clock, ChevronDown, ChevronUp, FileText, BarChart3, Bell, Phone, Download,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchWithAuth } from '../../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface InventoryItemT {
  _id: string;
  sku: string;
  name: string;
  // The DB stores free-form category slugs (e.g. 'general_cleaner',
  // 'floor_chemical', 'consumable') rather than a fixed enum — the Admin
  // Inventory tab treats anything other than 'equipment' as a consumable.
  type: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  isLowStock?: boolean;
}

interface MaterialRequestT {
  _id: string;
  bookingId: {
    _id: string;
    bookingRef: string;
    customerName: string;
    scheduledDate: string;
    serviceType: string;
  };
  serviceId: number;
  // No itemType/equipment split anymore — a MaterialRequest is consumables only.
  items: { sku: string; name: string; qtyRequested: number; unit: string; lowStockWarning: boolean }[];
  // No 'rejected' — there is no reject flow, only confirm or cancel-via-booking.
  status: 'pending' | 'confirmed' | 'cancelled';
  cancelledAfterConfirmation: boolean;
  createdAt: string;
}

interface CompletionReportT {
  _id: string;
  bookingId: {
    _id: string;
    bookingRef: string;
    customerName: string;
    scheduledDate: string;
    serviceType: string;
  };
  materialRequestId: string;
  // Looked up server-side from the User collection at read time — never
  // duplicated onto the report document itself.
  submittedBy: { _id: string; name: string; phone: string };
  items: { sku: string; name: string; unit: string; qtyAllocated: number; qtyActualReported: number; qtyActualVerified: number }[];
  // No 'rejected' — admin edits qtyActualVerified directly, then verifies.
  status: 'submitted' | 'verified';
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

interface AlertT {
  _id: string;
  item: { _id: string; name: string; sku: string; type: string; quantity: number; unit: string; lowStockThreshold: number };
  triggeredAt: string;
}

// Backend source of truth: GET /api/reports/monthly?year&month
// (controllers/reportController.js) — the frontend never computes these itself.
interface MonthlyReportItemT {
  name: string;
  sku: string;
  type: string;
  netConsumed: number;
  restocked: number;
}
interface MonthlyReportT {
  year: number;
  month: number;
  items: MonthlyReportItemT[];
}

type Tab = 'inventory' | 'requests' | 'reports' | 'alerts' | 'monthly';

const TABS: { id: Tab; name: string; icon: any }[] = [
  { id: 'inventory', name: 'Consumables', icon: Package },
  { id: 'requests', name: 'Material Requests', icon: FileText },
  { id: 'reports', name: 'Completion Reports', icon: CheckCircle },
  { id: 'alerts', name: 'Alerts', icon: Bell },
  { id: 'monthly', name: 'Monthly Report', icon: BarChart3 },
];

// ─── Small shared bits ──────────────────────────────────────────────────────────
// Types come out of the DB as free-form slugs (e.g. 'general_cleaner') — this
// only reformats whatever value is actually there, it never hardcodes a list.
const formatTypeLabel = (type?: string) => {
  const trimmed = (type || '').trim();
  if (!trimmed) return 'Unknown';
  return trimmed
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

// Defensive display-side rounding — the backend now rounds every stock write
// too, but this keeps the UI clean even against any value it didn't touch.
const formatQty = (n: number) => Math.round(n * 100) / 100;

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
    type === 'equipment' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
  }`}>
    {formatTypeLabel(type)}
  </span>
);

// quantity <= 0 → Out of Stock; quantity <= lowStockThreshold → Low Stock
// (matches the backend's isLowStock virtual, refined with an Out-of-Stock tier).
const StockStatusBadge = ({ item }: { item: InventoryItemT }) => {
  const isLow = item.isLowStock ?? item.quantity <= item.lowStockThreshold;
  const status = item.quantity <= 0 ? 'out' : isLow ? 'low' : 'in';
  // "In Stock" is the default/expected state — only Low/Out of Stock are
  // worth flagging with a badge, so the healthy case shows no badge at all.
  if (status === 'in') return null;
  const config = {
    out: { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' },
    low: { label: 'Low Stock',    cls: 'bg-amber-100 text-amber-700' },
  }[status];
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${config.cls}`}>
      {config.label}
    </span>
  );
};

const StockPill = ({ item }: { item: InventoryItemT }) => (
  <span className="inline-flex items-center gap-2">
    <span className="font-semibold">{formatQty(item.quantity)} {item.unit}</span>
    <StockStatusBadge item={item} />
  </span>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    pending_verification: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-200 text-gray-600',
    submitted: 'bg-amber-100 text-amber-700',
    verified: 'bg-green-100 text-green-700',
  };
  const label: Record<string, string> = { pending_verification: 'Pending Verification' };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {label[status] || status}
    </span>
  );
};

// ─── Restock Modal ──────────────────────────────────────────────────────────────
// Manual stock adjustment from this tab is restock-only — deductions happen
// automatically via approved completion reports, not through admin input here.
function RestockModal({ item, onClose, onSaved }: { item: InventoryItemT; onClose: () => void; onSaved: () => void }) {
  const [quantity, setQuantity] = useState(0);
  const [saving, setSaving] = useState(false);

  const preview = formatQty(item.quantity + quantity);

  const submit = async () => {
    setSaving(true);
    try {
      await fetchWithAuth(`/inventory/${item._id}/adjust`, {
        method: 'POST',
        body: JSON.stringify({ type: 'restock', quantity }),
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
        <h3 className="text-lg font-bold mb-4 dark:text-white">Restock — {item.name}</h3>
        <p className="text-xs text-gray-400 mb-4">Current: {formatQty(item.quantity)} {item.unit}</p>

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Quantity to Add</label>
        <input
          type="number" min={0} value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          className="w-full mb-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
        />
        <p className="text-xs text-gray-400 mb-6">New quantity will be: <span className="font-bold text-purple-600">{preview} {item.unit}</span></p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
          <button disabled={saving || quantity <= 0} onClick={submit} className="px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add / Edit Item Modal ──────────────────────────────────────────────────────
const UNIT_OPTIONS = ['pcs', 'liters', 'kg'];

function ItemFormModal({ item, availableTypes, onClose, onSaved }: { item: InventoryItemT | null; availableTypes: string[]; onClose: () => void; onSaved: () => void }) {
  const [sku, setSku] = useState(item?.sku || '');
  const [name, setName] = useState(item?.name || '');
  const [type, setType] = useState(item?.type || availableTypes[0] || '');
  // Type is normally picked from existing material categories — this flag
  // swaps the dropdown for a text input when adding a genuinely new one.
  const [customType, setCustomType] = useState(!!item?.type && !availableTypes.includes(item.type));
  const [quantity, setQuantity] = useState(item?.quantity ?? 0);
  const [unit, setUnit] = useState(item?.unit || UNIT_OPTIONS[0]);
  const [threshold, setThreshold] = useState(item?.lowStockThreshold ?? 10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    // This tab manages consumables only — equipment is a separate concern.
    if (type.trim().toLowerCase() === 'equipment') {
      setError('Equipment is not managed from Consumables Inventory.');
      return;
    }
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

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Type</label>
        {!customType ? (
          <select
            value={type}
            onChange={e => {
              if (e.target.value === '__new__') { setCustomType(true); setType(''); }
              else setType(e.target.value);
            }}
            className="w-full mb-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="" disabled>Select a category</option>
            {availableTypes.map(t => <option key={t} value={t}>{formatTypeLabel(t)}</option>)}
            <option value="__new__">+ Add new category…</option>
          </select>
        ) : (
          <div className="flex gap-2 mb-3">
            <input
              autoFocus
              value={type}
              onChange={e => setType(e.target.value)}
              placeholder="e.g. floor_chemical"
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
            />
            <button
              type="button"
              onClick={() => { setCustomType(false); setType(availableTypes[0] || ''); }}
              className="px-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">SKU</label>
        <input value={sku} disabled={!!item} onChange={e => setSku(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 disabled:opacity-60" />

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Name</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900" />

        {!item && (
          <>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Initial Quantity</label>
            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full mb-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900" />
          </>
        )}

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Unit</label>
        <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
          {!UNIT_OPTIONS.includes(unit) && unit && <option value={unit}>{unit}</option>}
          {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Low Stock Threshold</label>
        <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-full mb-6 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900" />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
          <button disabled={saving || !type.trim() || !name || (!item && !sku)} onClick={submit} className="px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inventory tab (Consumables Inventory) ───────────────────────────────────
// Sourced from the `inventoryitems` collection via GET /api/inventory, which
// excludes equipment records server-side — this tab only ever deals with
// consumable supplies (cleaning chemicals, disposables, etc.).
function InventoryTab() {
  const [items, setItems] = useState<InventoryItemT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [adjustItem, setAdjustItem] = useState<InventoryItemT | null>(null);
  const [formItem, setFormItem] = useState<InventoryItemT | null | 'new'>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Fetch the full consumables list once — search/type filtering happen
  // client-side below so the type dropdown always reflects every type
  // actually present, not just whatever the current filter narrows to.
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth('/inventory');
      if (res?.error) {
        console.error('Failed to load inventory items:', res.error);
        setError('Unable to load inventory items. Please try again.');
        setItems([]);
        return;
      }
      setItems(Array.isArray(res?.items) ? res.items : []);
    } catch (err) {
      console.error('Failed to load inventory items:', err);
      setError('Unable to load inventory items. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Dynamic type filter — built from whatever type values are actually
  // present in the fetched consumable records, never hardcoded.
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => { if (i.type) set.add(i.type.trim().toLowerCase()); });
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(item => {
      const matchesSearch = !q
        || item.name.toLowerCase().includes(q)
        || item.sku.toLowerCase().includes(q);
      const matchesType = !typeFilter || item.type?.trim().toLowerCase() === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, search, typeFilter]);

  const remove = async (id: string) => {
    await fetchWithAuth(`/inventory/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 dark:text-white">Consumables Inventory</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm w-64" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold">
            <option value="">All Types</option>
            {availableTypes.map(t => <option key={t} value={t}>{formatTypeLabel(t)}</option>)}
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
                <th className="text-left px-6 py-3">Consumable Name</th>
                <th className="text-left px-6 py-3">Type</th>
                <th className="text-left px-6 py-3">Stock</th>
                <th className="text-left px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading inventory...</td></tr>}
              {!loading && error && <tr><td colSpan={5} className="text-center py-8 text-red-500">{error}</td></tr>}
              {!loading && !error && filteredItems.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No consumable inventory items found.</td></tr>
              )}
              {!loading && !error && filteredItems.map(item => (
                <tr key={item._id}>
                  <td className="px-6 py-3 font-mono text-xs text-gray-500">{item.sku}</td>
                  <td className="px-6 py-3 font-semibold dark:text-gray-200">{item.name}</td>
                  <td className="px-6 py-3"><TypeBadge type={item.type} /></td>
                  <td className="px-6 py-3"><StockPill item={item} /></td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setAdjustItem(item)} title="Restock" className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><RotateCcw className="w-4 h-4" /></button>
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

      {adjustItem && <RestockModal item={adjustItem} onClose={() => setAdjustItem(null)} onSaved={load} />}
      {formItem && <ItemFormModal item={formItem === 'new' ? null : formItem} availableTypes={availableTypes} onClose={() => setFormItem(null)} onSaved={load} />}
    </div>
  );
}

// ─── Material Requests tab ───────────────────────────────────────────────────
function RequestCard({ request, onChanged }: { request: MaterialRequestT; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [warnings, setWarnings] = useState<{ sku: string; name: string; available: number; requested: number }[] | null>(null);

  // No reject flow anywhere in this UI — low stock at confirm time is a
  // non-blocking warning banner, never a reason to withhold confirmation.
  const confirm = async () => {
    setBusy(true);
    try {
      const res = await fetchWithAuth(`/material-requests/${request._id}/confirm`, { method: 'POST', body: '{}' });
      if (Array.isArray(res?.warnings) && res.warnings.length > 0) setWarnings(res.warnings);
      onChanged();
    } finally { setBusy(false); }
  };

  const b = request.bookingId;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-purple-600">{b?.bookingRef || 'Unknown Booking'}</span>
            <StatusBadge status={request.status} />
            {request.cancelledAfterConfirmation && (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-orange-700">Stock restored</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{b?.customerName} &middot; {b?.serviceType} &middot; {b?.scheduledDate}</p>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-gray-50 dark:border-gray-700 pt-4">
          {warnings && (
            <div className="mb-4 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-xl text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold mb-1">Confirmed, but stock is short on {warnings.length} item{warnings.length > 1 ? 's' : ''}:</p>
                {warnings.map(w => (
                  <p key={w.sku}>{w.name}: requested {w.requested}, only {w.available} in stock — stock will go negative.</p>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs">
                  <th className="pb-1">Item</th><th className="pb-1">SKU</th><th className="pb-1">Requested</th><th className="pb-1">Unit</th><th className="pb-1">Stock</th>
                </tr>
              </thead>
              <tbody>
                {request.items.map((r, i) => (
                  <tr key={i} className="border-t border-gray-50 dark:border-gray-700">
                    <td className="py-2">{r.name}</td>
                    <td className="py-2 font-mono text-xs text-gray-500">{r.sku}</td>
                    <td className="py-2">{r.qtyRequested}</td>
                    <td className="py-2">{r.unit}</td>
                    <td className="py-2">
                      {r.lowStockWarning
                        ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700">Low</span>
                        : <CheckCircle className="w-4 h-4 text-green-500" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {request.status === 'pending' && (
            <div className="mt-6">
              <button disabled={busy} onClick={confirm} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">
                {busy ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RequestsTab() {
  const [requests, setRequests] = useState<MaterialRequestT[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/material-requests?status=${status}`);
      setRequests(Array.isArray(res?.requests) ? res.requests : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const TABS: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setStatus(t.id)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${status === t.id ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}>
            {t.label}
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
  const [busy, setBusy] = useState(false);
  const [verifiedQtys, setVerifiedQtys] = useState<Record<string, number>>(
    Object.fromEntries(report.items.map(i => [i.sku, i.qtyActualVerified]))
  );
  const [warnings, setWarnings] = useState<{ sku: string; name: string; allocated: number; actual: number }[] | null>(null);

  const b = report.bookingId;
  const isVerified = report.status === 'verified';

  // No reopen/reject action — this either verifies as-is (with any edited
  // quantities) or the admin closes the card and comes back later. Once
  // verified the report is final; later fixes are a manual stock adjustment.
  const verify = async () => {
    setBusy(true);
    try {
      const corrections = report.items
        .filter(i => verifiedQtys[i.sku] !== i.qtyActualReported)
        .map(i => ({ sku: i.sku, qtyActualVerified: verifiedQtys[i.sku] }));
      const res = await fetchWithAuth(`/completion-reports/${report._id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ corrections }),
      });
      if (Array.isArray(res?.warnings) && res.warnings.length > 0) setWarnings(res.warnings);
      onChanged();
    } finally { setBusy(false); }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-purple-600">{b?.bookingRef || 'Unknown Booking'}</span>
            <StatusBadge status={report.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">{b?.customerName} &middot; {b?.serviceType} &middot; submitted by {report.submittedBy?.name || 'staff'}</p>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-gray-50 dark:border-gray-700 pt-4">
          {/* Submitting staff contact — for when the numbers look wrong */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 mb-4">
            <div>
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Submitted By</p>
              <p className="font-semibold dark:text-gray-200">{report.submittedBy?.name || 'Unknown'}</p>
            </div>
            {report.submittedBy?.phone && (
              <a href={`tel:${report.submittedBy.phone}`} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 text-purple-600 text-sm font-bold hover:bg-purple-100">
                <Phone className="w-4 h-4" /> {report.submittedBy.phone}
              </a>
            )}
          </div>

          {warnings && (
            <div className="mb-4 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-xl text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold mb-1">Verified, but actual usage exceeded allocation on {warnings.length} item{warnings.length > 1 ? 's' : ''}:</p>
                {warnings.map(w => (
                  <p key={w.sku}>{w.name}: allocated {w.allocated}, actual {w.actual}.</p>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs">
                  <th className="pb-1">Item</th><th className="pb-1">SKU</th><th className="pb-1">Allocated</th><th className="pb-1">Reported</th><th className="pb-1">Verified Qty</th>
                </tr>
              </thead>
              <tbody>
                {report.items.map((it) => (
                  <tr key={it.sku} className="border-t border-gray-50 dark:border-gray-700">
                    <td className="py-2">{it.name}</td>
                    <td className="py-2 font-mono text-xs text-gray-500">{it.sku}</td>
                    <td className="py-2">{it.qtyAllocated} {it.unit}</td>
                    <td className="py-2">{it.qtyActualReported} {it.unit}</td>
                    <td className="py-2">
                      {isVerified ? (
                        <span>{it.qtyActualVerified} {it.unit}</span>
                      ) : (
                        <input
                          type="number" min={0} step="0.01"
                          value={verifiedQtys[it.sku]}
                          onChange={e => setVerifiedQtys(prev => ({ ...prev, [it.sku]: Number(e.target.value) }))}
                          className="w-24 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.status === 'submitted' && (
            <div className="mt-6">
              <button disabled={busy} onClick={verify} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">
                {busy ? 'Verifying...' : 'Verify & Reconcile Stock'}
              </button>
            </div>
          )}
          {isVerified && (
            <p className="mt-4 text-xs text-gray-400">
              Verified{report.verifiedBy ? ` by ${report.verifiedBy}` : ''}{report.verifiedAt ? ` on ${new Date(report.verifiedAt).toLocaleString()}` : ''} — final.
              Any later correction is a manual inventory adjustment, not a reopened report.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState<CompletionReportT[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/completion-reports?status=${status}`);
      setReports(Array.isArray(res?.reports) ? res.reports : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const TABS: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'verified', label: 'Verified' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setStatus(t.id)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${status === t.id ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}>
            {t.label}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const act = await fetchWithAuth('/alerts');
        setActive(Array.isArray(act) ? act : []);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-4">
      {loading && <p className="text-center py-8 text-gray-400">Loading...</p>}
      {!loading && active.length === 0 && <p className="text-center py-8 text-gray-400">No low-stock alerts</p>}
      {!loading && active.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {active.map(a => (
            <div key={a._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 p-5 flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
              <div className="flex-1">
                <p className="font-bold dark:text-white">{a.item.name}</p>
                <p className="text-xs text-gray-400 font-mono">{a.item.sku}</p>
                <p className="text-sm text-red-600 font-semibold mt-1">{formatQty(a.item.quantity)} {a.item.unit} left (threshold {a.item.lowStockThreshold})</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Monthly Report tab ─────────────────────────────────────────────────────────
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
// Fixed to 2026 for now, per spec — a real dropdown so it's trivial to add
// more years later without restructuring anything.
const YEARS = [2026];

function MonthlyTab() {
  const now = new Date();
  const [month, setMonth] = useState(now.getFullYear() === 2026 ? now.getMonth() + 1 : 1);
  const [year, setYear] = useState(2026);
  const [report, setReport] = useState<MonthlyReportT | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReport = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/reports/monthly?year=${year}&month=${month}`);
      if (res?.error) {
        setError(res.error);
        setReport(null);
        return;
      }
      setReport(res);
    } catch (err) {
      console.error('Failed to load monthly inventory report:', err);
      setError('Unable to load the report. Please try again.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Builds the PDF from the report already fetched from the backend — no
  // hardcoded/mock figures, no independent frontend calculation, and it can
  // never diverge from what's on screen since it reads the same `report` state.
  const downloadReport = () => {
    if (!report) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const monthLabel = `${MONTHS[report.month - 1]} ${report.year}`;

    doc.setFillColor(124, 58, 237); // purple-600, matching the app's branding
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CloudLaundry', 14, 11);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Online Cleaning Services Management System', 14, 19);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Inventory Report', pageWidth - 14, 11, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - 14, 19, { align: 'right' });

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Month: ${monthLabel}`, 14, 42);

    autoTable(doc, {
      startY: 50,
      head: [['Item', 'SKU', 'Type', 'Net Consumed', 'Restocked']],
      body: report.items.map(it => [it.name, it.sku, formatTypeLabel(it.type), String(it.netConsumed), String(it.restocked)]),
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold', halign: 'left' },
      alternateRowStyles: { fillColor: [248, 246, 255] },
      columnStyles: { 0: { fontStyle: 'bold' } },
      margin: { left: 14, right: 14 },
    });

    doc.save(`monthly-inventory-report-${report.year}-${String(report.month).padStart(2, '0')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Month</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold">
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Year</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold">
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={loadReport} disabled={loading} className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-50">
          {loading ? 'Loading...' : 'Load Report'}
        </button>
        <button
          onClick={downloadReport} disabled={!report}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}

      {!error && !loading && !report && (
        <p className="text-center py-8 text-gray-400">Select a month and click Load Report.</p>
      )}

      {!error && loading && <p className="text-center py-8 text-gray-400">Loading...</p>}

      {!error && !loading && report && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700">
            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">
              {MONTHS[report.month - 1]} {report.year} — Inventory Report
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 uppercase text-xs font-bold">
                <tr>
                  <th className="text-left px-6 py-3">Item</th>
                  <th className="text-left px-6 py-3">SKU</th>
                  <th className="text-left px-6 py-3">Type</th>
                  <th className="text-left px-6 py-3">Net Consumed</th>
                  <th className="text-left px-6 py-3">Restocked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {report.items.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No consumable inventory items found.</td></tr>
                )}
                {report.items.map(it => (
                  <tr key={it.sku}>
                    <td className="px-6 py-3 font-semibold dark:text-gray-200">{it.name}</td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{it.sku}</td>
                    <td className="px-6 py-3"><TypeBadge type={it.type} /></td>
                    <td className="px-6 py-3 font-bold">{it.netConsumed}</td>
                    <td className="px-6 py-3">{it.restocked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
