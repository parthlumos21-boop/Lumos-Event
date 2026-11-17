import React from 'react';
import { useNavigate } from 'react-router-dom';
import LumosButton from './ui/LumosButton';

export const AppDownloadCard = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white py-10 sm:py-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Dark Container Card matching Image-1 */}
        <div className="rounded-[36px] sm:rounded-[44px] bg-[#14161f] text-white p-8 sm:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-white/5">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.04em] text-white font-sans leading-tight">
              Be Part of the LUMOS Experience
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-sans font-light">
              Start controlling your space easily and comfortably.
            </p>
          </div>

          <div className="shrink-0">
            <LumosButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/form')}
              className="px-8 py-4 text-base"
            >
              Get Started
            </LumosButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadCard;
