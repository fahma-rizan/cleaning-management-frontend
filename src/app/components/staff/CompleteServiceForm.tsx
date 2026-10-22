import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  Droplets,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { fetchWithAuth } from '../../utils/api';

// Consumables only — this form reports actual usage against exactly what
// was allocated (the confirmed MaterialRequest for this booking). There is
// no equipment section and no way to add arbitrary items: the allocated set
// is fixed, staff can only report how much of each was actually used.
interface AllocatedItem {
  sku: string;
  name: string;
  unit: string;
  qtyAllocated: number;
  qtyActualReported: number; // editable, defaults to qtyAllocated
}

interface BookingSummary {
  bookingRef: string;
  customerName: string;
  serviceType: string;
  scheduledDate: string;
}

export default function CompleteServiceForm() {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [items, setItems] = useState<AllocatedItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const res = await fetchWithAuth(`/completion-reports/booking/${bookingId}/allocation`);
        if (res?.error) {
          setLoadError(res.error);
          return;
        }
        setBooking(res.booking);
        setItems(
          (res.items || []).map((i: any) => ({
            sku: i.sku, name: i.name, unit: i.unit,
            qtyAllocated: i.qtyAllocated,
            qtyActualReported: i.qtyAllocated,
          }))
        );
      } catch (err) {
        console.error('Failed to load allocation:', err);
        setLoadError('Unable to load allocated materials. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const updateQty = (sku: string, value: number) => {
    setItems(prev => prev.map(i => i.sku === sku ? { ...i, qtyActualReported: Math.max(0, value) } : i));
  };

  const handleSubmit = async () => {
    if (!bookingId) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetchWithAuth(`/completion-reports/booking/${bookingId}`, {
        method: 'POST',
        body: JSON.stringify({ items: items.map(i => ({ sku: i.sku, qty: i.qtyActualReported })) }),
      });
      if (res?.error) {
        setSubmitError(res.error);
        return;
      }
      navigate('/staff/submission-success', {
        state: {
          id: booking?.bookingRef || bookingId,
          serviceType: booking?.serviceType || '',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        },
      });
    } catch (err) {
      console.error('Failed to submit completion report:', err);
      setSubmitError('Unable to submit material usage. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-600 hover:text-purple-600 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 px-3 py-1 font-semibold rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Completed
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Record Material Usage</h1>
          <p className="text-slate-500 mt-2 text-lg">Report how much of each allocated material was actually used.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading allocated materials...
          </div>
        )}

        {!loading && loadError && (
          <Card className="border-none shadow-sm bg-amber-50 rounded-2xl">
            <CardContent className="p-8 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800">{loadError}</p>
                <Button variant="outline" onClick={() => navigate('/staff')} className="mt-4">Back to Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !loadError && (
          <div className="space-y-8">
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden">
              <div className="h-2 bg-purple-600 w-full" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-slate-800">Service Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Booking Reference</Label>
                    <Input value={booking?.bookingRef || ''} readOnly className="bg-slate-50 border-slate-200 font-mono text-purple-700 font-bold h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Client Name</Label>
                    <Input value={booking?.customerName || ''} readOnly className="bg-slate-50 border-slate-200 font-semibold h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Service Type</Label>
                    <Input value={booking?.serviceType || ''} readOnly className="bg-slate-50 border-slate-200 font-semibold h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Scheduled Date</Label>
                    <Input value={booking?.scheduledDate || ''} readOnly className="bg-slate-50 border-slate-200 font-semibold h-12" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Materials Allocated</h2>
                  <p className="text-slate-500 text-sm">Adjust the quantity actually used — defaults to what was allocated</p>
                </div>
              </div>

              {items.length === 0 ? (
                <p className="text-slate-400 text-center py-10">No materials were allocated for this booking.</p>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <Card key={item.sku} className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row md:items-center p-4 gap-4">
                          <div className="flex-1">
                            <div className="font-bold text-slate-800 text-lg">{item.name}</div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-mono text-slate-400">{item.sku}</span>
                              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-500">
                                Allocated: {item.qtyAllocated} {item.unit}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1">
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.qtyActualReported}
                              onChange={(e) => updateQty(item.sku, parseFloat(e.target.value) || 0)}
                              className="w-24 text-center border-none bg-transparent font-bold text-slate-800 h-10 focus-visible:ring-0"
                            />
                            <span className="px-3 text-sm font-medium text-slate-500">{item.unit} used</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {submitError && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{submitError}</div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6">
              <button type="button" onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 font-bold text-sm uppercase tracking-widest px-6 py-3">Cancel</button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || items.length === 0}
                className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-14 px-10 rounded-2xl shadow-[0_10px_30px_rgb(37,99,235,0.3)] text-lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Material Usage'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
