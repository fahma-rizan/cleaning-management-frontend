import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Camera, 
  CheckCircle2, 
  Save, 
  X,
  Package,
  Calendar as CalendarIcon,
  Info,
  UploadCloud,
  AlertTriangle,
  Wrench,
  Droplets
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  defaultQty: number;
  stock: number;
  selected: boolean;
  lowStock?: boolean;
  type: 'equipment' | 'material';
}

const SERVICE_CONFIGS: Record<string, { equipment: string[], materials: string[] }> = {
  "House Deep Cleaning": {
    equipment: ["Vacuum Cleaner", "Steam Cleaning Machine", "Floor Scrubber / Polishing Machine", "High-Pressure Washer", "Mop & Bucket Set", "Scrub Brushes", "Microfiber Cloths", "Step Ladder", "Wet Floor Warning Sign"],
    materials: ["Multi-purpose Cleaner", "Disinfectant Solution", "Floor Cleaner", "Glass Cleaner", "Toilet Cleaner", "Degreaser", "Garbage Bags", "Disposable Gloves", "Face Masks"]
  },
  "General Cleaning": {
    equipment: ["Vacuum Cleaner", "Mop & Bucket Set", "Broom & Dustpan", "Microfiber Cloths", "Cleaning Cart"],
    materials: ["Multi-purpose Cleaner", "Floor Cleaner", "Glass Cleaner", "Disinfectant Solution", "Garbage Bags", "Disposable Gloves"]
  },
  "Commercial Cleaning": {
    equipment: ["Vacuum Cleaner", "Floor Scrubber / Polishing Machine", "Mop & Bucket Set", "Cleaning Cart", "Wet Floor Warning Sign"],
    materials: ["Multi-purpose Cleaner", "Disinfectant Solution", "Floor Cleaner", "Glass Cleaner", "Toilet Cleaner", "Air Freshener", "Garbage Bags", "Disposable Gloves", "Face Masks"]
  },
  "Floor Cleaning": {
    equipment: ["Floor Scrubber / Polishing Machine", "Mop & Bucket Set", "Scrub Brushes", "Wet Floor Warning Sign"],
    materials: ["Floor Cleaner", "Disinfectant Solution"]
  },
  "Floor – Cut and Polish": {
    equipment: ["Floor Scrubber / Polishing Machine", "High-Pressure Washer", "Mop & Bucket Set", "Wet Floor Warning Sign"],
    materials: ["Floor Cleaner", "Disinfectant Solution"]
  },
  "Sofa Cleaning": {
    equipment: ["Vacuum Cleaner", "Steam Cleaning Machine", "Carpet Shampoo Machine", "Microfiber Cloths"],
    materials: ["Carpet / Upholstery Shampoo", "Stain Remover", "Deodorizer", "Disposable Gloves"]
  },
  "Mattress Cleaning with Steam": {
    equipment: ["Vacuum Cleaner", "Steam Cleaning Machine", "Microfiber Cloths"],
    materials: ["Disinfectant Solution", "Stain Remover", "Deodorizer", "Disposable Gloves", "Face Masks"]
  },
  "Carpet Cleaning": {
    equipment: ["Vacuum Cleaner", "Carpet Shampoo Machine", "Steam Cleaning Machine", "Wet Floor Warning Sign"],
    materials: ["Carpet / Upholstery Shampoo", "Stain Remover", "Deodorizer", "Disposable Gloves"]
  },
  "Curtain Cleaning": {
    equipment: ["Steam Cleaning Machine", "Vacuum Cleaner", "Step Ladder", "Microfiber Cloths"],
    materials: ["Carpet / Upholstery Shampoo", "Stain Remover", "Deodorizer", "Disposable Gloves"]
  }
};

const getInitialItems = (serviceType: string): MaterialItem[] => {
  const config = SERVICE_CONFIGS[serviceType] || SERVICE_CONFIGS["General Cleaning"];
  
  const equipmentItems = config.equipment.map((name, index) => ({
    id: `eq-${index}-${Date.now()}`,
    name,
    quantity: 1,
    unit: 'pieces',
    defaultQty: 1,
    stock: Math.floor(Math.random() * 20) + 5,
    selected: true,
    type: 'equipment' as const
  }));

  const materialItems = config.materials.map((name, index) => ({
    id: `mat-${index}-${Date.now()}`,
    name,
    quantity: name.includes('Cleaner') || name.includes('Solution') ? 1 : 2,
    unit: name.includes('Cleaner') || name.includes('Solution') || name.includes('Shampoo') ? 'liters' : 'pieces',
    defaultQty: 1,
    stock: Math.floor(Math.random() * 30) + 2,
    selected: true,
    lowStock: Math.random() < 0.2, // Randomly set some as low stock for demo
    type: 'material' as const
  }));

  return [...equipmentItems, ...materialItems];
};

export default function CompleteServiceForm() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  
  const [serviceId] = useState(bookingId || `CL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [clientName] = useState('John Doe'); 
  const [serviceType, setServiceType] = useState('House Deep Cleaning');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setItems(getInitialItems(serviceType));
  }, [serviceType]);

  const handleItemChange = (id: string, field: keyof MaterialItem, value: any) => {
    setItems(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };

  const addItem = (type: 'equipment' | 'material') => {
    const newId = Date.now().toString();
    setItems([
      ...items, 
      { 
        id: newId, 
        name: '', 
        quantity: 0, 
        unit: type === 'material' ? 'liters' : 'pieces', 
        defaultQty: 0, 
        stock: 0, 
        selected: true,
        type
      }
    ]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = (status: 'submitted' | 'draft') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (status === 'submitted') {
        navigate('/staff/submission-success', { 
          state: { 
            id: serviceId.replace('CL-', '#SUB-'),
            serviceType: serviceType,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          } 
        });
      } else {
        alert('Draft saved successfully!');
        navigate('/staff');
      }
    }, 1000);
  };

  const equipment = items.filter(i => i.type === 'equipment');
  const materials = items.filter(i => i.type === 'material');

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
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 px-3 py-1 font-semibold rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Completed
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Complete Service</h1>
          <p className="text-slate-500 mt-2 text-lg">Record inventory and equipment used for the final service report.</p>
        </div>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden">
            <div className="h-2 bg-purple-600 w-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Service Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Service ID</Label>
                  <Input value={serviceId} readOnly className="bg-slate-50 border-slate-200 font-mono text-purple-700 font-bold h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Client Name</Label>
                  <Input value={clientName} readOnly className="bg-slate-50 border-slate-200 font-semibold h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Service Type</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="border-slate-200 h-12 bg-white hover:border-purple-300">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(SERVICE_CONFIGS).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completion Date</Label>
                  <div className="relative">
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border-slate-200 h-12 bg-white pl-11" />
                    <CalendarIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Equipment Used</h2>
                  <p className="text-slate-500 text-sm">Verify all tools and machinery used</p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => addItem('equipment')} className="border-blue-200 text-blue-700 hover:bg-blue-50 h-10 px-4 rounded-xl shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Add Equipment
              </Button>
            </div>
            <div className="space-y-3">
              {equipment.map((item) => (
                <ItemCard key={item.id} item={item} onToggle={() => toggleItem(item.id)} onChange={handleItemChange} onRemove={() => removeItem(item.id)} />
              ))}
            </div>
          </div>

          {/* Materials Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Consumables & Materials</h2>
                  <p className="text-slate-500 text-sm">Quantities used will be deducted from inventory</p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => addItem('material')} className="border-purple-200 text-purple-700 hover:bg-purple-50 h-10 px-4 rounded-xl shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Add Material
              </Button>
            </div>
            <div className="space-y-3">
              {materials.map((item) => (
                <ItemCard key={item.id} item={item} onToggle={() => toggleItem(item.id)} onChange={handleItemChange} onRemove={() => removeItem(item.id)} />
              ))}
            </div>
          </div>

          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xl text-slate-800">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">Service Notes</Label>
                <Textarea placeholder="Add any specific details about the service performed or materials used..." className="min-h-[140px] border-slate-200 rounded-xl" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">Photo Evidence</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer group bg-slate-50/50">
                  <UploadCloud className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                  <p className="text-base font-bold text-slate-700 mb-1">Upload Completion Photos</p>
                  <p className="text-sm text-slate-400">Drag and drop or click to browse (Max 5 photos)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-10">
            <button type="button" onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 font-bold text-sm uppercase tracking-widest px-6 py-3">Cancel</button>
            <Button variant="outline" onClick={() => handleSubmit('draft')} className="w-full sm:w-auto border-slate-200 text-slate-600 h-14 px-8 rounded-2xl" disabled={isSubmitting}>
              <Save className="w-5 h-5 mr-2.5" /> Save as Draft
            </Button>
            <Button onClick={() => handleSubmit('submitted')} className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-14 px-10 rounded-2xl shadow-[0_10px_30px_rgb(37,99,235,0.3)] text-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ItemCard({ item, onToggle, onChange, onRemove }: { 
  item: MaterialItem, 
  onToggle: () => void, 
  onChange: (id: string, field: keyof MaterialItem, value: any) => void,
  onRemove: () => void
}) {
  return (
    <Card className={`border-none shadow-sm transition-all duration-200 overflow-hidden ${item.selected ? 'bg-white ring-1 ring-slate-100' : 'bg-slate-50 grayscale opacity-60'}`}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row md:items-center p-4 gap-5">
          <div className="flex items-center gap-4 flex-1">
            <Checkbox checked={item.selected} onCheckedChange={onToggle} className="w-5 h-5 rounded-md" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Input 
                  value={item.name} 
                  onChange={(e) => onChange(item.id, 'name', e.target.value)}
                  className="border-none bg-transparent font-bold text-slate-800 text-lg p-0 h-auto focus-visible:ring-0 w-full"
                  disabled={!item.selected}
                  placeholder="Enter name..."
                />
                {item.lowStock && <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-400">Default: {item.defaultQty} {item.unit}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${item.lowStock ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-500'}`}>
                  Stock: {item.stock} {item.unit}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1">
              <Input 
                type="number" 
                value={item.quantity} 
                onChange={(e) => onChange(item.id, 'quantity', parseFloat(e.target.value))}
                className="w-20 text-center border-none bg-transparent font-bold text-slate-800 h-10 focus-visible:ring-0"
                disabled={!item.selected}
                step="0.1"
              />
              <div className="h-6 w-px bg-slate-200 mx-1" />
              <Select value={item.unit} onValueChange={(val) => onChange(item.id, 'unit', val)} disabled={!item.selected}>
                <SelectTrigger className="w-28 border-none bg-transparent font-medium text-slate-600 h-10 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="liters">liters</SelectItem>
                  <SelectItem value="pieces">pieces</SelectItem>
                  <SelectItem value="pairs">pairs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" onClick={onRemove} className="text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
