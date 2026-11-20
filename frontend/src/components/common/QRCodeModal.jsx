import React, { useState, useEffect } from 'react';
import { X, Download, Printer, QrCode } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { downloadBrandedQRCard } from '../../utils/qrCardGenerator';

const QRCodeModal = ({ isOpen, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchQRCode();
    }
  }, [isOpen]);

  const fetchQRCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get('/qr/permanent');
      if (res.data?.success && res.data?.qr) {
        setQrData(res.data.qr);
      } else {
        setError('Failed to load QR code data.');
      }
    } catch (err) {
      console.error('Error fetching permanent QR code:', err);
      setError(err.response?.data?.message || 'Could not fetch permanent QR code.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleDownload = async (format = 'png') => {
    if (!qrData?.qrDataUrl) return;
    try {
      setDownloading(true);
      await downloadBrandedQRCard(qrData.qrDataUrl, format);
    } catch (err) {
      console.error('Failed to download branded QR card:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!qrData?.qrDataUrl) {
      window.print();
      return;
    }

    // Create an isolated hidden iframe for clean 1-page printing
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lumos Event QR Desk Card</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            html, body {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffffff;
              overflow: hidden;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .card-wrapper {
              width: 100%;
              max-width: 440px;
              padding: 36px 28px;
              border: 2px solid #e2e8f0;
              border-radius: 28px;
              text-align: center;
              background: #ffffff;
              page-break-inside: avoid;
              break-inside: avoid;
              page-break-after: avoid;
              break-after: avoid;
            }
            .logo {
              height: 48px;
              object-fit: contain;
              margin-bottom: 12px;
            }
            .title {
              font-size: 19px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 6px;
            }
            .subtitle {
              font-size: 13px;
              color: #64748b;
              margin-bottom: 22px;
            }
            .qr-frame {
              display: inline-block;
              padding: 18px;
              border: 1px solid #cbd5e1;
              border-radius: 20px;
              background: #ffffff;
              margin-bottom: 14px;
            }
            .qr-image {
              width: 220px;
              height: 220px;
              display: block;
              object-fit: contain;
            }
            .badge {
              font-size: 12px;
              font-weight: 600;
              color: #007788;
            }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            <img src="/lumos logo-title.png" alt="Lumos Logo" class="logo" />
            <h1 class="title">Office Opening & Event Registration</h1>
            <p class="subtitle">Scan with your phone camera to check-in</p>
            <div class="qr-frame">
              <img src="${qrData.qrDataUrl}" alt="Lumos Event Form QR" class="qr-image" />
            </div>
            <p class="badge">Official Lumos Event Registration</p>
          </div>
        </body>
      </html>
    `);
    frameDoc.close();
    printFrame.contentWindow.focus();
    setTimeout(() => {
      try {
        printFrame.contentWindow.print();
      } catch (err) {
        console.error('Print frame error, falling back to window.print():', err);
        window.print();
      }
      setTimeout(() => {
        try {
          document.body.removeChild(printFrame);
        } catch (_) {}
      }, 1000);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 font-sans relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#31747d]/10 text-[#31747d] flex items-center justify-center">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Permanent QR Code</h3>
              <p className="text-[11px] text-gray-500">Scan to open public registration form</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-500">
            <div className="w-8 h-8 border-2 border-[#31747d] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading permanent QR code from MongoDB...
          </div>
        ) : error ? (
          <div className="py-10 text-center text-xs text-red-500">
            {error}
          </div>
        ) : (
          <div>
            {/* Branded Card Preview strictly matching reference design */}
            <div id="printable-qr-card" className="my-5 p-6 bg-white border border-gray-200 rounded-2xl flex flex-col items-center text-center shadow-xs">
              <img src="/lumos logo-title.png" alt="Lumos Logo" className="h-10 object-contain mb-3" />
              <h4 className="text-base font-bold text-slate-800 mb-1">Office Opening & Event Registration</h4>
              <p className="text-xs text-slate-500 mb-5">Scan with your phone camera to check-in</p>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs mb-1">
                <img
                  src={qrData?.qrDataUrl}
                  alt="Lumos Event Form QR"
                  className="w-52 h-52 object-contain"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={downloading}
                  onClick={() => handleDownload('png')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-[#31747d]/10 text-gray-800 hover:text-[#31747d] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download size={13} />
                  <span>{downloading ? 'Downloading...' : 'Download PNG'}</span>
                </button>

                <button
                  type="button"
                  disabled={downloading}
                  onClick={() => handleDownload('jpeg')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-[#31747d]/10 text-gray-800 hover:text-[#31747d] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download size={13} />
                  <span>{downloading ? 'Downloading...' : 'Download JPEG'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#31747d] hover:bg-[#255b62] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                <Printer size={14} />
                <span>Print QR Flyer / Table Card</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          html, body {
            height: 100vh !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-qr-card, #printable-qr-card * {
            visibility: visible;
          }
          #printable-qr-card {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 85% !important;
            max-width: 440px !important;
            border: 2px solid #e5e7eb !important;
            padding: 32px !important;
            box-shadow: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default QRCodeModal;
