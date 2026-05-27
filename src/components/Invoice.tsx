import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader } from 'lucide-react';
import type { User } from '../types';
import { useEffect, useState, useRef } from 'react';
import InvoiceGenerator, { InvoiceData } from './InvoiceGenerator';
import DemoTopBar from './DemoTopBar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';



interface InvoiceProps {
  user: User;
}

export default function Invoice({ user }: InvoiceProps) {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookingId) {
      navigate('/dashboard');
      return;
    }
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        // Attempt to fetch from the backend first
        const response = await fetch(`http://localhost:4000/api/invoices/booking/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setInvoice(data);
        } else {
          // Fallback to localStorage if not found or on error
          const storedInvoices = JSON.parse(localStorage.getItem('userInvoices') || '[]');
          const foundInvoice = storedInvoices.find((inv: InvoiceData) => inv.bookingId === bookingId);
          if (foundInvoice) {
            setInvoice(foundInvoice);
          } else {
            throw new Error('Invoice not found');
          }
        }
      } catch (error) {
        console.error('Failed to fetch invoice:', error);
        navigate('/dashboard'); // Redirect if invoice cannot be found
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [bookingId, navigate]);

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const widthInPdf = pdfWidth;
      const heightInPdf = widthInPdf / ratio;

      let position = 0;
      let heightLeft = heightInPdf;

      pdf.addImage(imgData, 'PNG', 0, position, widthInPdf, heightInPdf);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - heightInPdf;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, widthInPdf, heightInPdf);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Invoice-${invoice?.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-purple-600" size={40} />
        <p className="ml-4 text-xl text-gray-600">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4 text-gray-600">Invoice not found.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)} // Go back to the previous page
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-white text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300"
          >
            {isDownloading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>

        {/* We wrap the InvoiceGenerator in a div with a ref to target it for PDF generation */}
        <div ref={invoiceRef}>
          <InvoiceGenerator invoice={invoice} />
        </div>
      </div>
    </div>
  );
}