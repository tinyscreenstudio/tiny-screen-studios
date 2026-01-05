import { DEVICE_PRESETS } from '@tiny-screen-studios/core';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  enabled: boolean;
  order: number;
}

export interface HeaderConfig {
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  title: string;
  subtitle: string;
  showStatusIndicators: boolean;
  showSupportedDevices: boolean;
  supportedDevices: string[];
}

export interface DeviceConfig {
  defaultPreset: keyof typeof DEVICE_PRESETS;
  availablePresets: (keyof typeof DEVICE_PRESETS)[];
  defaultSettings: {
    threshold: number;
    invert: boolean;
    dithering: boolean;
  };
}

export interface UIConfig {
  theme: {
    primaryColor: string;
    accentColor: string;
  };
  animations: {
    enabled: boolean;
    fadeInDuration: string;
  };
  layout: {
    maxWidth: string;
    containerPadding: string;
  };
}

export interface FeatureFlags {
  showProcessingOverlay: boolean;
  enableFileValidation: boolean;
  enableExportControls: boolean;
  enableDevicePreview: boolean;
  enableProgressIndicator: boolean;
  enableTooltips: boolean;
  enableRecoveryActions: boolean;
}

export interface AppConfig {
  app: {
    name: string;
    version: string;
    description: string;
  };
  navigation: NavigationItem[];
  header: HeaderConfig;
  device: DeviceConfig;
  ui: UIConfig;
  features: FeatureFlags;
  processing: {
    showOverlay: boolean;
    overlayMessages: {
      title: string;
      description: string;
    };
    progressBar: {
      enabled: boolean;
      defaultProgress: number;
    };
  };
}

export const defaultConfig: AppConfig = {
  app: {
    name: 'TinyScreen.Studios',
    version: '1.0.0',
    description: '1-bit Art Marketplace for Tiny Displays',
  },

  navigation: [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: 'HomeIcon',
      enabled: true,
      order: 1,
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      path: '/marketplace',
      icon: 'ShoppingBagIcon',
      enabled: true,
      order: 2,
    },
    {
      id: 'sell',
      label: 'Sell Art',
      path: '/sell',
      icon: 'PaintBrushIcon',
      enabled: false,
      order: 3,
    },
    {
      id: 'oled-studio',
      label: 'Studio (Preview)',
      path: '/oled-studio',
      icon: 'EyeIcon',
      enabled: true,
      order: 4,
    },
    {
      id: 'docs',
      label: 'Documentation',
      path: '/docs',
      icon: 'DocumentIcon',
      enabled: true,
      order: 5,
    },
  ],

  header: {
    logo: {
      src: '/logo.png',
      alt: 'TinyScreen.Studios Logo',
      width: 48,
      height: 48,
    },
    title: 'TinyScreen.Studios',
    subtitle: '1-bit Art Marketplace',
    showStatusIndicators: true,
    showSupportedDevices: true,
    supportedDevices: ['SSD1306', 'SH1106', 'SH1107'],
  },

  device: {
    defaultPreset: 'SSD1306_128x64',
    availablePresets: ['SSD1306_128x64', 'SSD1306_128x32', 'SH1106_132x64'],
    defaultSettings: {
      threshold: 128,
      invert: false,
      dithering: false,
    },
  },

  ui: {
    theme: {
      primaryColor: 'indigo',
      accentColor: 'emerald',
    },
    animations: {
      enabled: true,
      fadeInDuration: '300ms',
    },
    layout: {
      maxWidth: '7xl',
      containerPadding: '6',
    },
  },

  features: {
    showProcessingOverlay: true,
    enableFileValidation: true,
    enableExportControls: true,
    enableDevicePreview: true,
    enableProgressIndicator: true,
    enableTooltips: true,
    enableRecoveryActions: true,
  },

  processing: {
    showOverlay: true,
    overlayMessages: {
      title: 'Processing',
      description: 'Converting your pixel art for tiny screens...',
    },
    progressBar: {
      enabled: true,
      defaultProgress: 75,
    },
  },
};
