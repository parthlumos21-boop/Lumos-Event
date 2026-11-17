/**
 * Universal device-aware map navigation router for Lumos.
 * Automatically opens the optimal native navigation application based on visitor device.
 */
export const openSmartDirections = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
  const lat = 23.0315;
  const lng = 72.4725;
  const exactAddress = '13th floor, Shaligram Arcade Ambali Junction, Ring Road, nr. Satyamev Elite, South Bopal, Ahmedabad, Gujarat 380058';
  const addressQuery = encodeURIComponent(exactAddress);
  const placeLabel = encodeURIComponent('Lumos Building Automation Pvt. Ltd.');

  // Apple iOS Devices (iPhone, iPad, iPod, Mac Safari)
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  if (isIOS) {
    window.location.href = `maps://maps.apple.com/?daddr=${addressQuery}&q=${placeLabel}&dirflg=d`;
    return;
  }

  // Android Mobile Devices
  const isAndroid = /android/i.test(userAgent);
  if (isAndroid) {
    const fallbackTimer = setTimeout(() => {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${addressQuery}`,
        '_blank'
      );
    }, 600);

    window.location.href = `google.navigation:q=${addressQuery}&mode=d`;
    window.addEventListener(
      'pagehide',
      () => clearTimeout(fallbackTimer),
      { once: true }
    );
    return;
  }

  // Desktop & Other Web Browsers
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${addressQuery}`,
    '_blank',
    'noopener,noreferrer'
  );
};
