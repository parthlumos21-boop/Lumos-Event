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
    window.print();
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
          body * {
            visibility: hidden;
          }
          #printable-qr-card, #printable-qr-card * {
            visibility: visible;
          }
          #printable-qr-card {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 80% !important;
            max-width: 500px !important;
            border: 2px solid #e5e7eb !important;
            padding: 40px !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default QRCodeModal;
