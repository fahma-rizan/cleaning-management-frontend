import { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  Trash2,
  Plus,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Tag,
  Edit,
  Percent,
  ChevronDown,
  ChevronRight,
  Save,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { settingsAPI } from "../../lib/api";
import { normalizePhoneNumber } from "../../lib/phone";
import { toast } from "sonner";

type SubTab = "general" | "business" | "pricing";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CATEGORY_LABELS: Record<string, string> = {
  home: "Home & Office Cleaning",
  laundry: "Laundry Services",
  shampoo: "Shampoo & Vacuum Cleaning",
  curtain: "Curtain Cleaning",
};

const CATEGORY_ORDER = ["home", "shampoo", "laundry", "curtain"];

export function SystemSettings() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("general");

  // General
  const [businessHours, setBusinessHours] = useState({
    start: "09:00",
    end: "18:00",
  });
  const [operatingDays, setOperatingDays] = useState([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);
  const [cancellationPolicy, setCancellationPolicy] = useState("2");
  const [durations, setDurations] = useState({
    home: 120,
    laundry: 60,
    sofa: 90,
  });
  const [holidays, setHolidays] = useState<{ date: string; name: string }[]>(
    [],
  );
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "" });

  // Business
  const [business, setBusiness] = useState({
    name: "Cloud Laundry.lk",
    address: "",
    email: "",
    phone: "",
  });

  // Pricing — loaded from DB
  const [priceLists, setPriceLists] = useState<any[]>([]);
  const [expandedSvc, setExpandedSvc] = useState<number | null>(null);
  const [editingPrices, setEditingPrices] = useState<Record<number, any>>({});

  // Offers
  const [offers, setOffers] = useState<any[]>([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [offerForm, setOfferForm] = useState<any>({
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    validFrom: "",
    validTo: "",
    applicableServices: ["all"],
    isActive: true,
    code: "",
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // ── Load all settings from API ───────────────────────────────────────────
  useEffect(() => {
    settingsAPI
      .get()
      .then((data) => {
        if (data.general) {
          setBusinessHours(data.general.businessHours || businessHours);
          setOperatingDays(data.general.operatingDays || operatingDays);
          setCancellationPolicy(data.general.cancellationPolicy || "2");
          setDurations(data.general.durations || durations);
          setHolidays(data.general.holidays || []);
        }
        if (data.business) setBusiness(data.business);
        if (data.priceLists) setPriceLists(data.priceLists);
      })
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // ── General save ─────────────────────────────────────────────────────────
  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      await settingsAPI.saveGeneral({
        businessHours,
        operatingDays,
        cancellationPolicy,
        durations,
        holidays,
      });
      toast.success("General settings saved");
      showMsg("General settings saved successfully");
    } catch (err: any) {
      toast.error(err.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Business save ────────────────────────────────────────────────────────
  const handleSaveBusiness = async () => {
    setSaving(true);
    try {
      await settingsAPI.saveBusiness({
        ...business,
        phone: normalizePhoneNumber(business.phone),
      });
      toast.success("Business info saved");
      showMsg("Business info saved successfully");
    } catch (err: any) {
      toast.error(err.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Price editing helpers ────────────────────────────────────────────────
  const startEditing = (svc: any) => {
    setExpandedSvc(svc.serviceId);
    setEditingPrices((prev) => ({
      ...prev,
      [svc.serviceId]: JSON.parse(JSON.stringify(svc.pricing)),
    }));
  };

  const updatePrice = (
    serviceId: number,
    path: (string | number)[],
    value: number,
  ) => {
    setEditingPrices((prev) => {
      const clone = JSON.parse(JSON.stringify(prev[serviceId]));
      let node: any = clone;
      for (let i = 0; i < path.length - 1; i++) node = node[path[i]];
      node[path[path.length - 1]] = value;
      return { ...prev, [serviceId]: clone };
    });
  };

  const handleSavePricing = async (serviceId: number) => {
    setSavingId(serviceId);
    try {
      const updated = await settingsAPI.savePricing(
        serviceId,
        editingPrices[serviceId],
      );
      setPriceLists((prev) =>
        prev.map((s) =>
          s.serviceId === serviceId ? { ...s, pricing: updated.pricing } : s,
        ),
      );
      toast.success("Prices updated successfully");
    } catch (err: any) {
      toast.error(err.error || "Failed to save prices");
    } finally {
      setSavingId(null);
    }
  };

  const handleCancelPricing = (serviceId: number) => {
    setEditingPrices((prev) => {
      const n = { ...prev };
      delete n[serviceId];
      return n;
    });
    setExpandedSvc(null);
  };

  // ── Pricing renderer based on pricingType ────────────────────────────────
  const renderPriceEditor = (svc: any) => {
    const p = editingPrices[svc.serviceId];
    if (!p) return null;

    switch (svc.pricingType) {
      // per-sqft: types array with pricePerSqft
      case "per-sqft":
        return (
          <div className="space-y-3">
            {p.types?.map((t: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl"
              >
                <span className="text-sm font-medium text-gray-700 flex-1">
                  {t.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rs/sqft</span>
                  <Input
                    type="number"
                    value={t.pricePerSqft}
                    onChange={(e) =>
                      updatePrice(
                        svc.serviceId,
                        ["types", i, "pricePerSqft"],
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-28 h-9 text-right rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      // per-seat: seats array with price
      case "per-seat":
        return (
          <div className="space-y-3">
            {p.seats?.map((s: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl"
              >
                <span className="text-sm font-medium text-gray-700">
                  {s.seats}-Seater Sofa
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rs</span>
                  <Input
                    type="number"
                    value={s.price}
                    onChange={(e) =>
                      updatePrice(
                        svc.serviceId,
                        ["seats", i, "price"],
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-28 h-9 text-right rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      // fixed: sizes array with options
      case "fixed":
        return (
          <div className="space-y-4">
            {p.sizes?.map((sz: any, si: number) => (
              <div key={si}>
                <p className="text-sm font-bold text-gray-700 mb-2">
                  {sz.label}
                </p>
                <div className="space-y-2 pl-3">
                  {sz.options?.map((opt: any, oi: number) => (
                    <div
                      key={oi}
                      className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-sm text-gray-600">{opt.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Rs</span>
                        <Input
                          type="number"
                          value={opt.price}
                          onChange={(e) =>
                            updatePrice(
                              svc.serviceId,
                              ["sizes", si, "options", oi, "price"],
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-28 h-9 text-right rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      // per-unit: curtains — types + addons
      case "per-unit":
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">
                Service Types
              </p>
              <div className="space-y-2">
                {p.types?.map((t: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {t.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Rs/curtain</span>
                      <Input
                        type="number"
                        value={t.pricePerCurtain}
                        onChange={(e) =>
                          updatePrice(
                            svc.serviceId,
                            ["types", i, "pricePerCurtain"],
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-28 h-9 text-right rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {p.addons && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Add-ons</p>
                <div className="space-y-2">
                  {p.addons.map((a: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {a.label}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {a.perUnit ? "per unit" : "fixed"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Rs</span>
                        <Input
                          type="number"
                          value={a.price}
                          onChange={(e) =>
                            updatePrice(
                              svc.serviceId,
                              ["addons", i, "price"],
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-28 h-9 text-right rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      // per-item: groups with items (dry cleaning, washing, pressing)
      case "per-item":
        return (
          <div className="space-y-6">
            {p.groups?.map((g: any, gi: number) => (
              <div key={gi}>
                <p className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                  {g.label}
                </p>
                <div className="space-y-2 pl-3">
                  {g.items?.map((item: any, ii: number) => (
                    <div
                      key={ii}
                      className="flex items-center justify-between gap-2 p-2.5 bg-gray-50 rounded-xl"
                    >
                      <span className="text-sm text-gray-700 flex-1">
                        {item.name}
                      </span>
                      {item.noFoldHang ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Rs</span>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              updatePrice(
                                svc.serviceId,
                                ["groups", gi, "items", ii, "price"],
                                parseFloat(e.target.value),
                              )
                            }
                            className="w-24 h-8 text-right rounded-lg text-sm"
                          />
                        </div>
                      ) : p.hasFoldHang ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400 w-10">
                              Fold
                            </span>
                            <Input
                              type="number"
                              value={item.foldPrice}
                              onChange={(e) =>
                                updatePrice(
                                  svc.serviceId,
                                  ["groups", gi, "items", ii, "foldPrice"],
                                  parseFloat(e.target.value),
                                )
                              }
                              className="w-20 h-8 text-right rounded-lg text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400 w-10">
                              Hang
                            </span>
                            <Input
                              type="number"
                              value={item.hangPrice}
                              onChange={(e) =>
                                updatePrice(
                                  svc.serviceId,
                                  ["groups", gi, "items", ii, "hangPrice"],
                                  parseFloat(e.target.value),
                                )
                              }
                              className="w-20 h-8 text-right rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Rs</span>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              updatePrice(
                                svc.serviceId,
                                ["groups", gi, "items", ii, "price"],
                                parseFloat(e.target.value),
                              )
                            }
                            className="w-24 h-8 text-right rounded-lg text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <p className="text-sm text-gray-500">
            Unknown pricing type: {svc.pricingType}
          </p>
        );
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-0 animate-in fade-in duration-500">
      {/* Success message */}
      {message && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold bg-green-50 text-green-700 border border-green-100">
          {message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-t-[2rem] border-b border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 font-medium mt-1">
          Manage business configuration, pricing, and offers
        </p>
      </div>

      <div className="bg-white rounded-b-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Sub-tabs */}
        <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100">
          {[
            { id: "general", name: "General", icon: Clock },
            { id: "business", name: "Business", icon: Building2 },
            { id: "pricing", name: "Pricing", icon: DollarSign },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeSubTab === tab.id
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* ── GENERAL TAB ──────────────────────────────────────────────── */}
          {activeSubTab === "general" && (
            <div className="space-y-8 w-full">
              {/* Business Hours */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" /> Business Hours
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Opening Time
                    </Label>
                    <Input
                      type="time"
                      value={businessHours.start}
                      onChange={(e) =>
                        setBusinessHours({
                          ...businessHours,
                          start: e.target.value,
                        })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Closing Time
                    </Label>
                    <Input
                      type="time"
                      value={businessHours.end}
                      onChange={(e) =>
                        setBusinessHours({
                          ...businessHours,
                          end: e.target.value,
                        })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Operating Days */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" /> Operating
                  Days
                </h3>
                <div className="flex items-center gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() =>
                        setOperatingDays((prev) =>
                          prev.includes(day)
                            ? prev.filter((d) => d !== day)
                            : [...prev, day],
                        )
                      }
                      className={`flex-1 min-w-0 text-center px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        operatingDays.includes(day)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Durations */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Default Service Durations
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: "home", label: "Home Cleaning (min)" },
                    { key: "laundry", label: "Laundry (min)" },
                    { key: "sofa", label: "Sofa Cleaning (min)" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label className="text-sm font-semibold text-gray-700 mb-1 block">
                        {label}
                      </Label>
                      <Input
                        type="number"
                        value={durations[key as keyof typeof durations]}
                        onChange={(e) =>
                          setDurations({
                            ...durations,
                            [key]: parseInt(e.target.value),
                          })
                        }
                        className="h-12 rounded-xl"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancellation Policy */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Cancellation Policy
                </h3>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    className="w-24 h-12 rounded-xl text-center"
                  />
                  <span className="text-gray-600 font-medium">
                    hours before booking
                  </span>
                </div>
              </div>

              {/* Holidays */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Public Holidays
                </h3>
                <div className="space-y-2 mb-4">
                  {holidays.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="w-36 shrink-0 text-sm font-sans text-purple-600 whitespace-nowrap">
  {h.date}
</span>
<span className="flex-1 min-w-0 text-sm font-bold text-gray-700 truncate">
  {h.name}
</span>
                      <button
                        onClick={() =>
                          setHolidays(holidays.filter((_, j) => j !== i))
                        }
                        className="shrink-0 p-1 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Input
                    type="date"
                    value={newHoliday.date}
                    onChange={(e) =>
                      setNewHoliday({ ...newHoliday, date: e.target.value })
                    }
                    className="h-11 rounded-xl w-40"
                  />
                  <Input
                    placeholder="Holiday name"
                    value={newHoliday.name}
                    onChange={(e) =>
                      setNewHoliday({ ...newHoliday, name: e.target.value })
                    }
                    className="h-11 rounded-xl flex-1 min-w-0 px-4"
                  />
                  <Button
                    onClick={() => {
                      if (newHoliday.date && newHoliday.name) {
                        setHolidays([...holidays, newHoliday]);
                        setNewHoliday({ date: "", name: "" });
                      }
                    }}
                    className="h-11 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSaveGeneral}
                disabled={saving}
                className="h-12 px-10 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
              >
                {saving ? "Saving..." : "Save General Settings"}
              </Button>
            </div>
          )}

          {/* ── BUSINESS TAB ─────────────────────────────────────────────── */}
          {activeSubTab === "business" && (
            <div className="space-y-6 w-full">
              <h3 className="text-lg font-bold text-gray-900">
                Business Information
              </h3>
              {[
                {
                  key: "name",
                  label: "Business Name",
                  icon: Building2,
                  type: "text",
                },
                {
                  key: "address",
                  label: "Address",
                  icon: MapPin,
                  type: "text",
                },
                { key: "email", label: "Email", icon: Mail, type: "email" },
                { key: "phone", label: "Phone", icon: Phone, type: "tel" },
              ].map(({ key, label, icon: Icon, type }) => (
                <div key={key}>
                  <Label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" /> {label}
                  </Label>
                  <Input
                    type={type}
                    value={business[key as keyof typeof business]}
                    onChange={(e) =>
                      setBusiness({ ...business, [key]: e.target.value })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>
              ))}
              <Button
                onClick={handleSaveBusiness}
                disabled={saving}
                className="h-12 px-10 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
              >
                {saving ? "Saving..." : "Save Business Info"}
              </Button>
            </div>
          )}

          {/* ── PRICING TAB ──────────────────────────────────────────────── */}
          {activeSubTab === "pricing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Service Pricing
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Click on a service to expand and edit its prices. Changes
                    update the customer-facing price list immediately.
                  </p>
                </div>
              </div>

              {priceLists.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                  <p className="text-amber-700 font-semibold">
                    No price lists found in database.
                  </p>
                  <p className="text-amber-600 text-sm mt-1">
                    Run the price list seed script to populate pricing data.
                  </p>
                </div>
              ) : (
                CATEGORY_ORDER.map((category) => {
                  const services = priceLists.filter(
                    (s) => s.category === category,
                  );
                  if (services.length === 0) return null;

                  return (
                    <div key={category}>
                      <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-400 inline-block" />
                        {CATEGORY_LABELS[category]}
                      </h4>

                      <div className="space-y-3">
                        {services.map((svc) => {
                          const isExpanded = expandedSvc === svc.serviceId;
                          const isEditing = !!editingPrices[svc.serviceId];

                          return (
                            <div
                              key={svc.serviceId}
                              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
                            >
                              {/* Service header row */}
                              <div
                                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() =>
                                  isEditing
                                    ? setExpandedSvc(
                                        isExpanded ? null : svc.serviceId,
                                      )
                                    : startEditing(svc)
                                }
                              >
                                <div className="flex items-center gap-3">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                  <div>
                                    <p className="font-bold text-gray-900">
                                      {svc.serviceName}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5 capitalize">
                                      {svc.pricingType.replace("-", " ")}{" "}
                                      pricing
                                    </p>
                                  </div>
                                </div>
                                {!isEditing && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditing(svc);
                                      setExpandedSvc(svc.serviceId);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                    Edit Prices
                                  </button>
                                )}
                              </div>

                              {/* Expanded price editor */}
                              {isExpanded && isEditing && (
                                <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                                  {renderPriceEditor(svc)}

                                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                                    <Button
                                      onClick={() =>
                                        handleSavePricing(svc.serviceId)
                                      }
                                      disabled={savingId === svc.serviceId}
                                      className="flex items-center gap-2 h-10 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                    >
                                      <Save className="w-4 h-4" />
                                      {savingId === svc.serviceId
                                        ? "Saving..."
                                        : "Save Prices"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        handleCancelPricing(svc.serviceId)
                                      }
                                      className="h-10 px-6 rounded-xl border-gray-200 font-semibold"
                                    >
                                      Cancel
                                    </Button>
                                    <span className="text-xs text-gray-400 ml-2">
                                      Changes affect customer-facing price list
                                      immediately
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Offers section */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Offers & Discounts
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Manage promotional offers and discount codes
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingOffer(null);
                      setOfferForm({
                        title: "",
                        description: "",
                        discountType: "percentage",
                        discountValue: 0,
                        validFrom: "",
                        validTo: "",
                        applicableServices: ["all"],
                        isActive: true,
                        code: "",
                      });
                      setShowOfferModal(true);
                    }}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    <Plus className="w-4 h-4" /> Add Offer
                  </Button>
                </div>

                <div className="space-y-3">
                  {offers.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
                      No offers created yet
                    </div>
                  ) : (
                    offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${offer.isActive ? "bg-green-50" : "bg-gray-50"}`}
                          >
                            <Percent
                              className={`w-5 h-5 ${offer.isActive ? "text-green-600" : "text-gray-400"}`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900">
                                {offer.title}
                              </p>
                              {offer.code && (
                                <span className="text-xs font-mono bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                                  {offer.code}
                                </span>
                              )}
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${offer.isActive ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}
                              >
                                {offer.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {offer.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {offer.validFrom} → {offer.validTo}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-purple-600">
                            {offer.discountType === "percentage"
                              ? `${offer.discountValue}%`
                              : `Rs.${offer.discountValue}`}
                          </span>
                          <button
                            onClick={() => {
                              setEditingOffer(offer);
                              setOfferForm(offer);
                              setShowOfferModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() =>
                              setOffers(offers.filter((o) => o.id !== offer.id))
                            }
                            className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingOffer ? "Edit Offer" : "Create New Offer"}
                </h2>
              </div>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <Plus className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-1 block">
                  Offer Title *
                </Label>
                <Input
                  value={offerForm.title}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, title: e.target.value })
                  }
                  placeholder="e.g., New Customer Discount"
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-1 block">
                  Description *
                </Label>
                <textarea
                  value={offerForm.description}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe the offer..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-1 block">
                    Promo Code
                  </Label>
                  <Input
                    value={offerForm.code}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., WELCOME15"
                    className="h-12 rounded-xl uppercase"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-1 block">
                    Discount Type *
                  </Label>
                  <select
                    value={offerForm.discountType}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        discountType: e.target.value,
                      })
                    }
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-1 block">
                    Discount Value *
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={offerForm.discountValue}
                      onChange={(e) =>
                        setOfferForm({
                          ...offerForm,
                          discountValue: parseFloat(e.target.value),
                        })
                      }
                      className="h-12 rounded-xl pr-12"
                    />
                    <span className="absolute right-4 top-3 text-gray-400 font-bold">
                      {offerForm.discountType === "percentage" ? "%" : "Rs."}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-1 block">
                    Applicable Services
                  </Label>
                  <select
                    value={offerForm.applicableServices[0]}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        applicableServices: [e.target.value],
                      })
                    }
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none"
                  >
                    <option value="all">All Services</option>
                    <option value="home">Home Cleaning</option>
                    <option value="laundry">Laundry Services</option>
                    <option value="shampoo">Shampoo Cleaning</option>
                    <option value="curtain">Curtain Cleaning</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-1 block">
                    Valid From *
                  </Label>
                  <Input
                    type="date"
                    value={offerForm.validFrom}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, validFrom: e.target.value })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-1 block">
                    Valid To *
                  </Label>
                  <Input
                    type="date"
                    value={offerForm.validTo}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, validTo: e.target.value })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Checkbox
                  id="isActive"
                  checked={offerForm.isActive}
                  onCheckedChange={(checked) =>
                    setOfferForm({ ...offerForm, isActive: checked as boolean })
                  }
                />
                <Label
                  htmlFor="isActive"
                  className="font-semibold cursor-pointer"
                >
                  Activate this offer immediately
                </Label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowOfferModal(false)}
                className="h-12 px-8 rounded-xl font-bold border-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (
                    !offerForm.title ||
                    !offerForm.description ||
                    !offerForm.validFrom ||
                    !offerForm.validTo
                  ) {
                    alert("Please fill all required fields");
                    return;
                  }
                  if (editingOffer) {
                    setOffers(
                      offers.map((o) =>
                        o.id === editingOffer.id
                          ? { ...offerForm, id: editingOffer.id }
                          : o,
                      ),
                    );
                  } else {
                    setOffers([
                      ...offers,
                      { ...offerForm, id: Date.now().toString() },
                    ]);
                  }
                  setShowOfferModal(false);
                }}
                className="h-12 px-10 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white"
              >
                {editingOffer ? "Update Offer" : "Create Offer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
