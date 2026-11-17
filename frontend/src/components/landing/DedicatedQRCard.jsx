import React, { useState } from 'react';
import { QrCode, Download, Printer, Smartphone, CheckCircle } from 'lucide-react';
import Heading from './ui/Heading';
import { downloadBrandedQRCard } from '../../utils/qrCardGenerator';

export const DedicatedQRCard = ({ qrDataUrl, onOpenModal }) => {
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format = 'png') => {
    if (!qrDataUrl) return;

    try {
      setIsDownloading(true);
      await downloadBrandedQRCard(qrDataUrl, format);
      setDownloadSuccess(`${format.toUpperCase()} Card Downloaded`);
      setTimeout(() => setDownloadSuccess(''), 2500);
    } catch (err) {
      console.error('Failed to download QR card:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section id="qr-section" className="w-full bg-white py-16 sm:py-24 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 text-center">
        {/* Header */}
        <div className="space-y-3">
          <Heading level={2} size="section">
            Scan to Open Event Form
          </Heading>
          <p className="text-sm sm:text-base text-[#6b7078] max-w-xl mx-auto font-sans leading-relaxed">
            Point your smartphone camera at the permanent QR code below to access the guest registration form directly on your mobile device.
          </p>
        </div>

        {/* Card Showcase Container matching the reference design */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[#fafafa] border border-gray-200/80 flex flex-col md:flex-row items-center justify-between gap-8 max-w-2xl mx-auto shadow-sm">
          {/* Left: Framed QR Matrix Container */}
          <div className="flex flex-col items-center shrink-0">
            <div className="p-4 bg-white rounded-2xl border-2 border-[#2f767f]/30 shadow-md">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Lumos Event Form Permanent QR"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center text-gray-400 gap-2 font-mono text-xs">
                  <QrCode size={36} className="text-[#2f767f] animate-pulse" />
                  <span>Loading Permanent QR...</span>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#2f767f] font-medium">
              <CheckCircle size={14} />
              <span>Camera Compatible (iOS & Android)</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <h3 className="text-xl font-bold text-[#1b1d26] font-sans">
              Office Opening & Registration
            </h3>
            <p className="text-xs text-[#6b7078] leading-relaxed font-sans">
              Scan unlimited times without expiration. Download high-resolution print-ready cards for reception desks and flyer stands.
            </p>

            {/* Action Buttons: Row 1 for Downloads, Row 2 for Print Card on Laptop/Desktop */}
            <div className="pt-2 flex flex-col gap-2.5 items-center md:items-start w-full">
              <div className="flex flex-wrap items-center gap-2.5 justify-center md:justify-start">
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={() => handleDownload('png')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-gray-100 border border-gray-300 text-[#1b1d26] text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Download size={14} className="text-[#2f767f]" />
                  <span>{isDownloading ? 'Downloading...' : 'Download PNG'}</span>
                </button>

                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={() => handleDownload('jpeg')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-gray-100 border border-gray-300 text-[#1b1d26] text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Download size={14} className="text-[#2f767f]" />
                  <span>{isDownloading ? 'Downloading...' : 'Download JPEG'}</span>
                </button>
              </div>

              {onOpenModal && (
                <div className="flex justify-center md:justify-start">
                  <button
                    type="button"
                    onClick={onOpenModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2f767f] hover:bg-[#255f67] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    <Printer size={14} />
                    <span>Print Card</span>
                  </button>
                </div>
              )}
            </div>

            {downloadSuccess && (
              <p className="text-xs text-[#2f767f] font-semibold animate-fadeIn">
                ✓ {downloadSuccess} successfully!
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DedicatedQRCard;
