import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, Printer, ExternalLink, Smartphone, CheckCircle } from 'lucide-react';
import { downloadBrandedQRCard } from '../../utils/qrCardGenerator';

const DedicatedQRSection = ({ qrDataUrl, targetUrl, onOpenModal }) => {
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
    <section className="min-h-screen w-full flex flex-col justify-center items-center px-6 py-24 relative z-10 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full mx-auto"
      >
        {/* Section Header */}
        <div className="text-center mb-10 space-y-3">
          <span className="text-xs font-mono font-semibold text-[#4ecdc4] tracking-widest uppercase bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 px-3.5 py-1.5 rounded-full inline-flex items-center gap-2">
            <Smartphone size={13} />
            Permanent Mobile Check-In
          </span>
          <h2 className="font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight">
            Scan to Open Event Form
          </h2>
          <p className="text-base sm:text-lg text-gray-300 font-light max-w-xl mx-auto">
            Point your smartphone camera at the QR code below to access the guest registration form directly on your mobile device.
          </p>
        </div>

        {/* Large Dedicated QR Showcase Card */}
        <div className="bg-[#09111c]/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-[#040810]/80 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
          {/* Left: High-Contrast Prominent QR Matrix */}
          <div className="flex flex-col items-center shrink-0">
            <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-[#31747d]/30 transition-transform hover:scale-105 duration-300 group relative">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Lumos Event Form Permanent QR"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                />
              ) : (
                <div className="w-56 h-56 sm:w-64 sm:h-64 flex flex-col items-center justify-center text-gray-400 gap-2 font-mono text-xs">
                  <QrCode size={36} className="text-[#31747d] animate-pulse" />
                  <span>Loading Permanent QR...</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#4ecdc4] font-medium">
              <CheckCircle size={14} />
              <span>Camera-Compatible (iOS & Android)</span>
            </div>
          </div>

          {/* Right: Metadata, Features & Action Buttons */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-white mb-2">
                Production-Ready QR Code
              </h3>
              <p className="text-sm text-gray-300 font-light leading-relaxed">
                This permanent QR code is stored securely in MongoDB and points directly to the live event registration page. It remains active across unlimited scans with duplicate phone verification.
              </p>
            </div>

            {/* Target URL Pill */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs text-gray-400 font-mono">Target Destination:</span>
              <a
                href={targetUrl || '/form'}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono font-semibold text-[#4ecdc4] hover:underline flex items-center gap-1.5 break-all"
              >
                <span>{targetUrl || `${window.location.origin}/form`}</span>
                <ExternalLink size={12} className="shrink-0" />
              </a>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                disabled={isDownloading}
                onClick={() => handleDownload('png')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Download size={14} className="text-[#4ecdc4]" />
                <span>{isDownloading ? 'Downloading...' : 'Download PNG'}</span>
              </button>

              <button
                type="button"
                disabled={isDownloading}
                onClick={() => handleDownload('jpeg')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Download size={14} className="text-[#4ecdc4]" />
                <span>{isDownloading ? 'Downloading...' : 'Download JPEG'}</span>
              </button>

              {onOpenModal && (
                <button
                  type="button"
                  onClick={onOpenModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#31747d] hover:bg-[#3ba2af] text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Desk Card</span>
                </button>
              )}
            </div>

            {downloadSuccess && (
              <p className="text-xs text-[#4ecdc4] font-medium animate-fadeIn">
                ✓ {downloadSuccess} successfully!
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DedicatedQRSection;
