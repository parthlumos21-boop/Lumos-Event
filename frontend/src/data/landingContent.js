/**
 * Centralized Landing Page Content Store for Lumos Building Automation.
 * Reusable, customizable data structure.
 */

export const landingContent = {
  brand: {
    name: 'LUMOS',
    tagline: 'Building Automation Pvt. Ltd.',
    slogan: 'Intelligent Living. Beautifully Connected.',
    logo: '/lumos logo-title.png'
  },

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Location', href: '#location' }
  ],

  hero: {
    h1Line1: 'Intelligent',
    h1Line2: 'living',
    subheadline: 'Beautifully connected. A premium architectural and technology experience.',
    getStartedText: 'Get Started',
    qrButtonText: 'Qr Code',
    photoAsset: '/lumos_lighting.jpg', // Architectural hero photo
    backgroundText: 'Easy control',
    chips: [
      {
        id: 'climate',
        label: 'Climate\ncontrol',
        icon: 'Thermometer',
        // Desktop absolute coordinates around phone (in % or px)
        desktopClass: 'top-[12%] -left-[14%]'
      },
      {
        id: 'lighting',
        label: 'Smart\nlighting',
        icon: 'Sun',
        desktopClass: 'top-[12%] -right-[14%]'
      },
      {
        id: 'security',
        label: 'Security\nsystem',
        icon: 'ShieldCheck',
        desktopClass: 'bottom-[22%] -left-[18%]'
      },
      {
        id: 'smoke',
        label: 'Smoke\ndetector',
        icon: 'Flame',
        desktopClass: 'bottom-[22%] -right-[18%]'
      }
    ]
  },

  howItWorks: {
    heading: 'How it works',
    description: 'Transforming traditional spaces into responsive, intelligent architectural ecosystems.',
    steps: [
      {
        step: '01',
        title: 'Survey',
        desc: 'Comprehensive on-site load evaluation, lighting architecture study, and space consultation.'
      },
      {
        step: '02',
        title: 'Install',
        desc: 'Seamless flush-mount installation of glass touch consoles, sensors, and circadian drivers.'
      },
      {
        step: '03',
        title: 'Control',
        desc: 'Effortless centralized control of climate, scenes, acoustics, and perimeter security.'
      }
    ]
  },

  stats: {
    heading: 'Engineered for uncompromising luxury and reliability',
    subheading: 'Delivering microsecond responsiveness and sustainable energy management across high-end residences and commercial spaces.',
    metrics: [
      { value: '99.8%', label: 'System Uptime Across Deployments' },
      { value: '< 15ms', label: 'Ultra-Low Command Response Latency' },
      { value: '40%+', label: 'Energy Optimization via Circadian Dimming' },
      { value: '24 / 7', label: 'Continuous Perimeter Monitoring & Protection' }
    ]
  },

  devices: {
    heading: 'Our Services',
    subheading: 'Tailored automation modules engineered to integrate harmoniously into modern architecture.',
    items: [
      {
        id: 'lighting',
        name: 'Smart lighting',
        desc: 'Tunable circadian white dimming with scene presets.',
        icon: 'Sun'
      },
      {
        id: 'climate',
        name: 'Climate control',
        desc: 'Multi-zone HVAC sync with thermal predictive logic.',
        icon: 'Thermometer'
      },
      {
        id: 'lock',
        name: 'Smart door lock',
        desc: 'Encrypted biometric verification and guest credentials.',
        icon: 'Lock'
      },
      {
        id: 'qr',
        name: 'Permanent QR access',
        desc: 'Camera-scannable check-in for guests and event visitors.',
        icon: 'QrCode'
      },
      {
        id: 'camera',
        name: 'Security camera',
        desc: 'Ultra-HD optical coverage with smart perimeter alerts.',
        icon: 'Camera'
      },
      {
        id: 'access',
        name: 'Access Control',
        desc: 'Encrypted biometric verification, automated barriers, and credentials.',
        icon: 'Lock'
      },
      {
        id: 'audio',
        name: 'Music speaker',
        desc: 'Architectural flush-mount multi-room acoustic zones.',
        icon: 'Volume2'
      },
      {
        id: 'wifi',
        name: 'Wi-Fi network',
        desc: 'Enterprise-grade mesh roaming with zero dead zones.',
        icon: 'Wifi'
      }
    ]
  },

  appCard: {
    heading: 'Get the LUMOS app',
    subheading: 'Complete spatial intelligence in your pocket. Control lighting scenes, monitor energy consumption, and manage guest check-ins from anywhere.',
    buttonText: 'Get Started'
  },

  company: {
    name: 'Lumos Building Automation Pvt. Ltd.',
    address: '13th floor, Shaligram Arcade Ambali Junction, Ring Road, nr. Satyamev Elite, South Bopal, Ahmedabad, Gujarat 380058',
    phone: '+91 89798878578',
    email: 'contact@lumos.co.in',
    copyright: '© 2026 Lumos Building Automation Pvt. Ltd. All rights reserved.'
  }
};
