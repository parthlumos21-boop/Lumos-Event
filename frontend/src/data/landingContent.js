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
        id: 'home-automation',
        name: 'Home Automation',
        desc: 'Integrated smart living and centralized ecosystem orchestration.',
        icon: 'Home'
      },
      {
        id: 'lighting',
        name: 'Smart Lighting Control',
        desc: 'Circadian dimming, scene presets and scheduled illumination.',
        icon: 'Sun'
      },
      {
        id: 'hvac',
        name: 'HVAC control',
        desc: 'Multi-zone intelligent temperature and air quality management.',
        icon: 'Thermometer'
      },
      {
        id: 'security',
        name: 'Security & Surveillance',
        desc: 'Perimeter monitoring, intrusion alerts and access protection.',
        icon: 'ShieldCheck'
      },
      {
        id: 'locks',
        name: 'Door locks',
        desc: 'Biometric smart deadbolts and encrypted keyless entry.',
        icon: 'Lock'
      },
      {
        id: 'cctv',
        name: 'CCTV',
        desc: 'Ultra-HD optical surveillance with 24/7 continuous coverage.',
        icon: 'Camera'
      },
      {
        id: 'audio-visuals',
        name: 'Audio & Visuals',
        desc: 'Architectural multi-room audio and high-fidelity video distribution.',
        icon: 'Volume2'
      },
      {
        id: 'home-theater',
        name: 'Home Theater',
        desc: 'Immersive cinematic acoustics, projection and lighting presets.',
        icon: 'Film'
      },
      {
        id: 'multipurpose-room',
        name: 'Multipurpose Room',
        desc: 'Adaptive motorized room modes, acoustic zoning and scene switching.',
        icon: 'Sliders'
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
