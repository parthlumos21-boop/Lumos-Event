import React, { useState, useEffect, useRef } from 'react';
import { lumosDarkMapStyles } from './lumosDarkMapStyles';
import { openSmartDirections } from '../../utils/mapRouting';

const LUMOS_COORDS = { lat: 23.0315, lng: 72.4725 };

const LumosInteractiveMap = ({ children }) => {
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(16);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // If no Google API key is provided, use the interactive fallback engine
    if (!apiKey) {
      setMapLoaded(true);
      return;
    }

    let isMounted = true;

    // Load Google Maps JavaScript API dynamically
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initGoogleMap();
        return;
      }

      const scriptId = 'lumos-google-maps-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isMounted) initGoogleMap();
        };
        script.onerror = () => {
          if (isMounted) {
            setMapError(true);
            setMapLoaded(true);
          }
        };
        document.head.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(interval);
            if (isMounted) initGoogleMap();
          }
        }, 100);
      }
    };

    const initGoogleMap = () => {
      if (!mapRef.current || !window.google) return;
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: LUMOS_COORDS,
          zoom: 16,
          styles: lumosDarkMapStyles,
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: 'greedy',
          backgroundColor: '#161d2d'
        });

        // Custom pulsing marker beacon
        new window.google.maps.Marker({
          position: LUMOS_COORDS,
          map,
          title: 'Lumos Building Automation Pvt. Ltd.',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#007788',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5
          }
        });

        setMapLoaded(true);
      } catch (err) {
        console.warn('Google Maps initialization fallback:', err);
        setMapError(true);
        setMapLoaded(true);
      }
    };

    loadGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 1, 19));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 1, 12));

  return (
    <div className="relative w-full h-[520px] md:h-[600px] bg-[#161d2d] rounded-3xl overflow-hidden border border-white/10 shadow-2xl font-sans">
      {/* Google Maps Canvas if API Key is configured and healthy */}
      {apiKey && !mapError ? (
        <div ref={mapRef} className="w-full h-full" />
      ) : (
        /* Zero-Config Interactive Dark Navigation Street Map Engine (Bottom clipped to hide 'Report a map error' bar) */
        <div className="relative w-full h-full overflow-hidden select-none">
          <iframe
            title="Lumos Location Map"
            src={`https://maps.google.com/maps?q=${LUMOS_COORDS.lat},${LUMOS_COORDS.lng}&z=${zoom}&output=embed&hl=en`}
            className="w-full h-[calc(100%+38px)] -mb-[38px] border-0 filter invert-[90%] hue-rotate-180 contrast-[120%] brightness-[85%] saturate-[80%]"
            loading="lazy"
            allowFullScreen
          />
          {/* Bottom clean edge shield */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#161d2d] to-transparent pointer-events-none z-10" />

          {/* Custom Pulsing Lumos Turquoise Radar Pin Beacon (Center Overlay) */}
          <div
            onClick={openSmartDirections}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer group"
            title="Click to open directions"
          >
            {/* Tooltip */}
            <div className="mb-2 px-3 py-1.5 bg-[#0c1322] border border-[#007788]/60 rounded-xl shadow-xl text-center whitespace-nowrap opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
              <p className="text-xs font-extrabold text-white">Lumos Building Automation</p>
              <p className="text-[10px] text-[#82c8cf] font-mono">13th Floor, Shaligram Arcade</p>
            </div>

            {/* Radar Pulsing Beacon */}
            <div className="relative flex items-center justify-center">
              <span className="absolute w-10 h-10 rounded-full bg-[#007788]/40 animate-ping pointer-events-none" />
              <span className="absolute w-6 h-6 rounded-full bg-[#007788]/60 animate-pulse pointer-events-none" />
              <div className="w-5 h-5 rounded-full bg-[#007788] border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Floating Children (Location Card) */}
      {children}

      {/* Sleek Minimalist Map Zoom Controls (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5 bg-[#0c1322]/85 backdrop-blur-md border border-white/15 rounded-2xl p-1 shadow-xl">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white hover:bg-white/10 hover:text-[#82c8cf] transition-colors cursor-pointer"
          title="Zoom In"
        >
          <i className="fa-solid fa-plus text-xs" />
        </button>
        <div className="w-5 h-px bg-white/15 mx-auto" />
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white hover:bg-white/10 hover:text-[#82c8cf] transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <i className="fa-solid fa-minus text-xs" />
        </button>
      </div>

      {/* Center Target Indicator Badge (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0c1322]/80 backdrop-blur-md border border-white/10 rounded-full text-[11px] font-mono text-gray-400">
        <span className="w-2 h-2 rounded-full bg-[#007788] animate-pulse" />
        <span>23.0315° N, 72.4725° E · South Bopal</span>
      </div>
    </div>
  );
};

export default LumosInteractiveMap;
