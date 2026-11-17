import React, { useState, useEffect } from 'react';
import HeroSection from './landing/HeroSection';
import DevicesSection from './landing/DevicesSection';
import AppDownloadCard from './landing/AppDownloadCard';
import DedicatedQRCard from './landing/DedicatedQRCard';
import LocationMapCard from './landing/LocationMapCard';
import LandingFooterCard from './landing/LandingFooterCard';
import QRCodeModal from './common/QRCodeModal';
import Loader from './Loader';
import axiosClient from '../api/axiosClient';

/**
 * Lumos Landing Page matching Image-1.
 * Pure white main background color (#ffffff) with seamless parent sections.
 * Primary brand color: Lumos Teal (#31747d).
 */
const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [qrRecord, setQrRecord] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    // Brief initial load check
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);

    // Fetch permanent QR code record from MongoDB
    axiosClient
      .get('/qr/permanent')
      .then((res) => {
        if (res.data?.success && res.data?.qr) {
          setQrRecord(res.data.qr);
        }
      })
      .catch((err) => {
        console.warn('Could not load permanent QR code:', err);
      });

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full min-h-screen bg-white font-sans text-[#1b1d26] overflow-x-hidden">
      {/* 1. Hero Section matching Image-1 with Image-2 embedded in phone */}
      <HeroSection onOpenQRModal={() => setQrModalOpen(true)} />

      {/* 2. Choose your devices Section matching Image-1 */}
      <DevicesSection />

      {/* 3. Be Part of the LUMOS Experience Dark Section matching Image-1 */}
      <AppDownloadCard />

      {/* 4. Permanent QR Code Check-In Station on White Container */}
      <DedicatedQRCard
        qrDataUrl={qrRecord?.qrDataUrl}
        onOpenModal={() => setQrModalOpen(true)}
      />

      {/* 5. Interactive Location Map Section pinned to Shaligram Arcade */}
      <LocationMapCard />

      {/* 6. Footer on White Container */}
      <LandingFooterCard />

      {/* Modal: Permanent QR Flyer Card */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
