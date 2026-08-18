import { useRef, useEffect, useState } from 'react';
import { Download, FileText, Calendar, User, MapPin, Phone, Mail, Loader } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logoImage            from '../assets/logo.png';
import homeCleaningImage    from '../assets/home-cleaning.jpg';
import curtainCleaningImage from '../assets/curtain-cleaning.jpg';
import laundryCleaningImage from '../assets/laundry-cleaning.jpg';
import shampooVacumImage    from '../assets/Shampoo-Vacum.jpg';
import commonServiceImage   from '../assets/common-service.jpg';

export type InvoiceType = 'ADVANCE' | 'FINAL' | 'FULL' | 'COD' | 'REFUND' | 'CANCELLATION';

export interface InvoiceData {
  invoiceNumber: string;
  mainCategories?: string[];
  invoiceType: InvoiceType;
  date: string;
  time: string;
  bookingId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  service: {
    name: string;
    date: string;
    time: string;
    items: Array<{ name: string; price: number; quantity?: number; unit?: string; description?: string }>;
  };
  pricing: {
    subtotal: number;
    discount?: number;
    couponCode?: string;
    taxRate?: number;
    tax?: number;
    transportCharge?: number;
    total: number;
    paidAmount: number;
    balanceAmount: number;
  };
  paymentMethod: string;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'REFUNDED' | 'CANCELLED' | 'SENT' | 'DRAFT';
}

interface InvoiceGeneratorProps {
  invoice: InvoiceData;
  onDownload?: () => void;
  isStaff?: boolean;
}

const getRuntimeEnv = () => {
  const windowEnv = typeof window !== 'undefined' ? (window as Window & { __APP_ENV__?: Record<string, string | undefined> }).__APP_ENV__ : undefined;
  const processEnv = typeof process !== 'undefined' ? (process as typeof process & { env?: Record<string, string | undefined> }).env : undefined;
  return windowEnv || processEnv || {};
};

const getEnvVar = (key: string): string | undefined => getRuntimeEnv()[key];

// ── QR code pre-fetched as base64 so it renders in PDF ───────────────────────
function QRCodeSVG({ value, size = 96 }: { value: string; size?: number }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (typeof fetch === 'undefined') return;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`;
    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => setQrDataUrl(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(() => setQrDataUrl(''));
  }, [value]);

  if (!qrDataUrl) {
    return (
      <div style={{ width: size, height: size, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        className="rounded text-xs text-gray-400">QR</div>
    );
  }
  return <img src={qrDataUrl} alt="Invoice QR Code" style={{ width: size, height: size }} />;
}

// ── FIX: Convert oklch() to rgb() for html2canvas 1.4.1 compatibility ────────
// Tailwind v4 defines its ENTIRE color system as CSS custom properties using
// oklch() (e.g. --color-purple-600: oklch(...)). This applies regardless of
// which class names are used — overriding specific classes isn't enough
// because html2canvas reads the resolved CSS variable value, which is still
// oklch(). The only reliable fix is to walk every element, read its BROWSER
// COMPUTED color (the browser already converts oklch → rgb internally for
// getComputedStyle), and write that resolved rgb() value as an inline style.
// html2canvas then reads the inline style directly and never touches oklch.
function convertOklchToRgb(root: HTMLElement): { el: HTMLElement; prop: string; original: string }[] {
  const overrides: { el: HTMLElement; prop: string; original: string }[] = [];
  const allElements = [root, ...Array.from(root.querySelectorAll('*'))] as HTMLElement[];

  const props: (keyof CSSStyleDeclaration & string)[] = [
    'color', 'backgroundColor', 'borderTopColor', 'borderBottomColor',
    'borderLeftColor', 'borderRightColor', 'backgroundImage',
  ];

  allElements.forEach(el => {
    const computed = window.getComputedStyle(el);
    props.forEach(prop => {
      const value = computed.getPropertyValue(
        prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase())
      );
      if (value && value.includes('oklch')) {
        // getComputedStyle on backgroundImage with a gradient still returns
        // the oklch() form in some browsers — skip gradients, handle below.
        if (prop === 'backgroundImage') return;
        overrides.push({ el, prop, original: el.style.getPropertyValue(prop) });
        // Re-read via the resolved color through a throwaway canvas trick:
        // the browser's getComputedStyle already gives us a usable value for
        // color/backgroundColor/borderColor as rgb() in all evergreen browsers
        // EXCEPT when the property itself is defined via oklch() and the
        // browser echoes it back as oklch() (Chromium 111+ does this for
        // newer color spaces). To force an rgb() string, paint it via a
        // detached canvas 1x1 pixel and read back the resulting pixel color.
        const rgb = oklchStringToRgb(value);
        if (rgb) (el.style as any)[prop] = rgb;
      }
    });

    // Handle gradients separately (backgroundImage: linear-gradient(oklch...))
    const bgImage = computed.backgroundImage;
    if (bgImage && bgImage.includes('oklch')) {
      overrides.push({ el, prop: 'backgroundImage', original: el.style.backgroundImage });
      // Fallback to a solid background colour instead of trying to parse the gradient
      overrides.push({ el, prop: 'background', original: el.style.background });
      el.style.backgroundImage = 'none';
      el.style.background = '#7c3aed'; // purple-600 fallback — matches the header gradient midpoint
    }
  });

  return overrides;
}

// Paints a CSS color string onto a 1x1 canvas and reads back the resolved
// RGBA pixel value. This works for ANY valid CSS color the browser accepts,
// including oklch(), and always returns a plain rgba() string that
// html2canvas can parse.
function oklchStringToRgb(cssColor: string): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
  } catch {
    return null;
  }
}

function restoreOklchOverrides(overrides: { el: HTMLElement; prop: string; original: string }[]) {
  overrides.forEach(({ el, prop, original }) => {
    if (original) {
      (el.style as any)[prop] = original;
    } else {
      el.style.removeProperty(prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase()));
    }
  });
}

export default function InvoiceGenerator({ invoice, onDownload, isStaff = false }: InvoiceGeneratorProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const getInvoiceTitle = (type: InvoiceType): string => ({
    ADVANCE: 'ADVANCE PAYMENT INVOICE', FINAL: 'FINAL INVOICE', FULL: 'INVOICE',
    COD: 'CASH ON DELIVERY INVOICE', REFUND: 'REFUND INVOICE / CREDIT NOTE',
    CANCELLATION: 'CANCELLATION INVOICE',
  }[type] || 'INVOICE');

  const getStatusColor = (status: string): string => ({
    PAID: 'bg-green-100 text-green-700', PARTIAL: 'bg-yellow-100 text-yellow-700',
    PENDING: 'bg-orange-100 text-orange-700', SENT: 'bg-blue-100 text-blue-700',
    DRAFT: 'bg-gray-100 text-gray-700', REFUNDED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }[status as string] || 'bg-gray-100 text-gray-700');

  const getServiceFooterMessage = (categories: string[]): string => {
    if (!categories?.length) return '-- Excellence In Every Clean --';
    if (categories.length > 1) return '-- Comprehensive Care for Your Home --';
    return ({ SVC: '-- Your Upholstery Deserves The Best --', CUR: '-- Fresh Curtains, Fresh Home --',
              LND: '-- Clean Clothes, Happy You --', HOC: '-- Excellence In Every Clean --' }[categories[0]] || '-- Excellence In Every Clean --');
  };

  const getServiceTerms = (categories: string[]): string[] => {
    const common = [
      'Cancellations must be made 24 hours in advance for full refund',
      'Quality guarantee — 100% satisfaction or free re-service',
      'For queries, contact us at info@cloudlaundry.lk or +94 11 234 5678',
    ];
    if (!categories?.length) return common;
    const termsMap: Record<string, string[]> = {
      SVC: ['Deep steam cleaning with eco-friendly detergents', 'Drying time: 4–6 hours depending on weather'],
      CUR: ['Pickup and delivery service included', 'Dry cleaning for delicate fabrics', 'Ironing and rehanging service available'],
      LND: ['Garments processed according to care label instructions', 'Stain removal attempted but not guaranteed for old stains'],
      HOC: ['Payment due upon completion unless advance paid', 'Our staff are fully vetted and insured'],
    };
    const specific = [...new Set(categories.flatMap(c => termsMap[c] || []))];
    return [...specific, ...common];
  };

  const getServiceImage = (categories: string[]): string => {
    // No categories means invoice was created without recognised service items
    // (e.g. GEN prefix) — no service badge shown
    if (!categories?.length) return '';

    // 2+ different service types → common service image
    if (categories.length > 1) return commonServiceImage;

    // Single service type → specific image
    return ({
      HOC: homeCleaningImage,
      CUR: curtainCleaningImage,
      LND: laundryCleaningImage,
      SVC: shampooVacumImage,
    }[categories[0]] || ''); // unrecognised single category → no image
  };

  const showBankDetails = (): boolean => {
    const method = invoice.paymentMethod?.toLowerCase() || '';
    return method.includes('bank') || method.includes('transfer') ||
      ((invoice.pricing?.balanceAmount || 0) > 0 && invoice.status === 'PARTIAL');
  };

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    if (onDownload) onDownload();
    setIsDownloading(true);

    let overrides: { el: HTMLElement; prop: string; original: string }[] = [];

    try {
      // Wait for all images to load
      const images = Array.from(invoiceRef.current.querySelectorAll('img'));
      await Promise.all(images.map(img =>
        img.complete ? Promise.resolve() : new Promise<void>(res => { img.onload = () => res(); img.onerror = () => res(); })
      ));

      // FIX: Convert every oklch() color on the invoice to an inline rgb()
      // style BEFORE html2canvas runs. This is necessary because Tailwind v4
      // defines its entire palette via oklch() CSS variables — overriding a
      // few class names is not enough, every element needs its resolved
      // color baked in as a plain rgb() inline style.
      overrides = convertOklchToRgb(invoiceRef.current);

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // The cloned document is a fresh DOM copy — re-apply the same
          // conversion there too, since inline styles on the original
          // element ARE copied during cloning, but to be extra safe in case
          // any computed style differs in the clone, run it again.
          const clonedEl = clonedDoc.querySelector('.invoice-printable') as HTMLElement;
          if (clonedEl) {
            convertOklchToRgb(clonedEl);
            (clonedEl.style as any).webkitPrintColorAdjust = 'exact';
            (clonedEl.style as any).printColorAdjust = 'exact';
          }
        },
      });

      const pdf       = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidthMm  = pdfWidth;
      const imgHeightMm = (canvas.height / canvas.width) * imgWidthMm;

      // FIX: Single-page invoices were sometimes producing a near-empty
      // second page. This happens because the invoice div has
      // minHeight: 297mm, but html2canvas can capture a few extra pixels
      // of rounding/sub-pixel content beyond exactly one A4 page — pushing
      // imgHeightMm just barely over pdfHeight and triggering a second
      // "page" with only a sliver of content (or nothing) on it.
      // Fix: if the overflow is small (under 5mm — effectively just
      // rounding noise), treat it as a single page and clip the excess
      // rather than creating a near-blank trailing page.
      const ROUNDING_TOLERANCE_MM = 5;
      const effectiveHeightMm = (imgHeightMm - pdfHeight <= ROUNDING_TOLERANCE_MM)
        ? Math.min(imgHeightMm, pdfHeight)
        : imgHeightMm;

      let yOffset = 0;
      let remaining = effectiveHeightMm;

      while (remaining > 0.5) { // stop once remaining is negligible, not just > 0
        const srcYPx      = (yOffset / imgHeightMm) * canvas.height;
        const pageHMm     = Math.min(remaining, pdfHeight);
        const pageHPx     = (pageHMm / imgHeightMm) * canvas.height;
        const pageCanvas  = document.createElement('canvas');
        pageCanvas.width  = canvas.width;
        pageCanvas.height = Math.ceil(pageHPx);
        const ctx = pageCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, srcYPx, canvas.width, pageHPx, 0, 0, canvas.width, pageHPx);
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidthMm, pageHMm);
        yOffset   += pdfHeight;
        remaining -= pdfHeight;
      }

      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      // Always restore the original inline styles so the on-screen invoice
      // looks exactly as it did before the PDF capture.
      restoreOklchOverrides(overrides);
      setIsDownloading(false);
    }
  };

  // Dynamic QR code:
  // Staff → staff invoice page (scan to manage booking on-site)
  // Customer PAID → re-book page
  // Customer everything else → WhatsApp support
  const frontendUrl = getEnvVar('VITE_FRONTEND_URL') || 'http://localhost:3000';
  const qrValue = isStaff
    ? `${frontendUrl}/job-complete/${invoice.bookingId}`
    : invoice.status === 'PAID'
      ? `${frontendUrl}/booking?service=${invoice.mainCategories?.[0] || ''}&customer=${encodeURIComponent(invoice.customer.name)}&address=${encodeURIComponent(invoice.customer.address)}&phone=${encodeURIComponent(invoice.customer.phone)}`
      : `https://wa.me/94112345678?text=${encodeURIComponent(`Hi Cloud Laundry.lk, I have a query about my invoice ${invoice.invoiceNumber} for booking ${invoice.bookingId}.`)}`;

  return (
    <div className="space-y-4">
      <div ref={invoiceRef} className="invoice-printable mx-auto rounded-xl shadow-lg overflow-hidden bg-white"
        style={{ width: '210mm', minHeight: '297mm', maxWidth: '100%', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <img src={logoImage} alt="Cloud Laundry Logo" className="w-20 h-20 object-contain bg-white rounded-lg p-2" />
              <div>
                <h1 className="text-4xl mb-2">CLOUD LAUNDRY.LK</h1>
                <p className="text-purple-100">Professional Cleaning Services</p>
                <div className="mt-4 space-y-1 text-sm text-purple-100">
                  <p>Colombo, Sri Lanka</p><p>+94 11 234 5678</p><p>info@cloudlaundry.lk</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white text-purple-600 px-4 py-2 rounded-lg mb-3">
                <FileText className="w-8 h-8 mx-auto mb-1" /><div className="text-xs">INVOICE</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                {invoice.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg mb-4">{getInvoiceTitle(invoice.invoiceType)}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2"><span className="text-gray-600">Invoice Number:</span><span className="font-mono">{invoice.invoiceNumber}</span></div>
                <div className="flex gap-2"><span className="text-gray-600">Booking ID:</span><span className="font-mono">{invoice.bookingId}</span></div>
                <div className="flex gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span>{invoice.date} at {invoice.time}</span></div>
              </div>
            </div>
            <div>
              <h3 className="text-lg mb-4">Customer Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2"><User className="w-4 h-4 text-gray-400" /><span>{invoice.customer.name}</span></div>
                <div className="flex gap-2"><Mail className="w-4 h-4 text-gray-400" /><span>{invoice.customer.email}</span></div>
                <div className="flex gap-2"><Phone className="w-4 h-4 text-gray-400" /><span>{invoice.customer.phone}</span></div>
                <div className="flex gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-xs">{invoice.customer.address}</span></div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-600 text-white text-sm">
                    <th className="px-4 py-2 text-left border-r border-purple-500">Service Description</th>
                    <th className="px-4 py-2 text-right border-r border-purple-500">Price</th>
                    <th className="px-4 py-2 text-center border-r border-purple-500">Qty / Unit</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {invoice.service?.items?.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{item.name}</div>
                        {item.description && <div className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{item.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-right">{item.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">{item.quantity || 1}{item.unit ? ` ${item.unit}` : ''}</td>
                      <td className="px-4 py-3 text-right">{((item.quantity || 1) * item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                  {(invoice.pricing?.transportCharge || 0) > 0 && (
                    <tr className="border-b"><td className="px-4 py-3">Transport / Pickup & Delivery</td><td colSpan={2}></td><td className="px-4 py-3 text-right">{(invoice.pricing?.transportCharge || 0).toLocaleString()}</td></tr>
                  )}
                  {(invoice.pricing?.discount || 0) > 0 && (
                    <tr className="border-b bg-green-50">
                      <td className="px-4 py-3 text-green-700">Discount {invoice.pricing?.couponCode ? `(${invoice.pricing.couponCode})` : ''}</td>
                      <td colSpan={2}></td>
                      <td className="px-4 py-3 text-right text-green-700">- Rs. {(invoice.pricing?.discount || 0).toLocaleString()}</td>
                    </tr>
                  )}
                  {(invoice.pricing?.tax || 0) > 0 && (
                    <tr className="border-b"><td className="px-4 py-3 text-gray-600">Tax {invoice.pricing?.taxRate ? `(${invoice.pricing.taxRate}%)` : ''}</td><td colSpan={2}></td><td className="px-4 py-3 text-right">{(invoice.pricing?.tax || 0).toLocaleString()}</td></tr>
                  )}
                  <tr className="border-t-2 border-gray-300 font-semibold bg-purple-50">
                    <td className="px-4 py-3 text-purple-800">Total Amount</td><td colSpan={2}></td>
                    <td className="px-4 py-3 text-right text-purple-800">Rs. {(invoice.pricing?.total || 0).toLocaleString()}</td>
                  </tr>
                  <tr className="border-b bg-green-50">
                    <td className="px-4 py-3 text-green-700 font-semibold">Paid Amount</td><td colSpan={2}></td>
                    <td className="px-4 py-3 text-right text-green-700 font-semibold">Rs. {(invoice.pricing?.paidAmount || 0).toLocaleString()}</td>
                  </tr>
                  {(invoice.pricing?.balanceAmount || 0) > 0 && (
                    <tr className="border-b bg-orange-50">
                      <td className="px-4 py-3 text-orange-700 font-semibold">Balance Due</td><td colSpan={2}></td>
                      <td className="px-4 py-3 text-right text-orange-700 font-semibold">Rs. {(invoice.pricing?.balanceAmount || 0).toLocaleString()}</td>
                    </tr>
                  )}
                  <tr className="border-b bg-purple-50">
                    <td className="px-4 py-3 text-purple-700 font-semibold">Payment Method</td><td colSpan={2}></td>
                    <td className="px-4 py-3 text-right text-purple-700 font-semibold">{invoice.paymentMethod}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 text-sm bg-gray-50 text-gray-600">
              Scheduled: {invoice.service?.date || 'N/A'} at {invoice.service?.time || 'N/A'}
            </div>
          </div>

          {showBankDetails() && (
            <div className="mt-6 rounded-lg p-6 bg-blue-50 border-2 border-blue-200">
              <h4 className="text-sm font-semibold mb-3 text-blue-900">Bank Transfer Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-600 mb-1">Bank Name:</p><p className="font-semibold">Commercial Bank</p></div>
                <div><p className="text-gray-600 mb-1">Account Name:</p><p className="font-semibold">CLOUD LAUNDRY.LK AND CLEANERS (PVT) LTD.</p></div>
                <div><p className="text-gray-600 mb-1">Account Number:</p><p className="font-semibold font-mono">1000906392</p></div>
                <div><p className="text-gray-600 mb-1">Branch:</p><p className="font-semibold">Malabe</p></div>
              </div>
              {(invoice.pricing?.balanceAmount || 0) > 0 && (
                <p className="mt-4 text-xs text-orange-600 font-semibold">
                  * Please transfer the balance of Rs. {(invoice.pricing?.balanceAmount || 0).toLocaleString()} and send confirmation to info@cloudlaundry.lk
                </p>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm text-gray-600 mb-2 font-semibold">Terms & Conditions:</h4>
              <ul className="text-xs text-gray-500 space-y-1">
                {getServiceTerms(invoice.mainCategories || []).map((term, idx) => <li key={idx}>• {term}</li>)}
              </ul>
            </div>
            <div className="flex justify-center items-center">
              {getServiceImage(invoice.mainCategories || []) && (
                <div className="relative">
                  <img src={getServiceImage(invoice.mainCategories || [])} alt="Service Badge"
                    className="w-24 h-24 object-cover rounded-full border-4 border-purple-50 shadow-sm" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold uppercase tracking-wider">
                    {(invoice.mainCategories?.length || 0) > 1 ? 'MULTI' : (invoice.mainCategories?.[0] || 'SERVICE')}
                  </div>
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="p-3 rounded-lg bg-gray-100 inline-block">
                <QRCodeSVG value={qrValue} size={96} />
                <p className="text-xs text-gray-500 mt-2">
                  {isStaff ? 'Scan to manage' : invoice.status === 'PAID' ? 'Scan to re-book' : 'Scan for support'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p className="font-semibold">Thank you for choosing Cloud Laundry.LK</p>
            <p className="text-xs mt-1">This is a computer-generated invoice and does not require a signature</p>
            <p className="text-xs mt-1">{getServiceFooterMessage(invoice.mainCategories || [])}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center invoice-download-btn">
        <button onClick={handleDownload} disabled={isDownloading}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300">
          {isDownloading
            ? <><Loader className="w-5 h-5 animate-spin" /> Generating PDF...</>
            : <><Download className="w-5 h-5" /> Download Invoice (PDF)</>}
        </button>
      </div>
    </div>
  );
}
