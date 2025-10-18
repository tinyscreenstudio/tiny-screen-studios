import { AppConfig } from '../appConfig';

/**
 * Example custom configuration
 * Copy this file and modify to create your own configuration
 */
export const customConfig: Partial<AppConfig> = {
  app: {
    name: 'My Custom TinyScreen Studio',
    version: '2.0.0',
    description: 'My Personalized Creative Lab',
  },

  header: {
    logo: {
      src: '/my-custom-logo.png',
      alt: 'My Custom Logo',
      width: 48,
      height: 48,
    },
    title: 'My Studio',
    subtitle: 'Custom Creative Lab',
    showStatusIndicators: true,
    showSupportedDevices: false, // Hide device badges
    supportedDevices: ['SSD1306'], // Only show SSD1306
  },

  navigation: [
    {
      id: 'home',
      label: 'Dashboard',
      path: '/',
      icon: 'HomeIcon',
      enabled: true,
      order: 1,
    },
    {
      id: 'oled-studio',
      label: 'Studio',
      path: '/oled-studio',
      icon: 'EyeIcon',
      enabled: true,
      order: 2,
    },
  ],

  device: {
    defaultPreset: 'SSD1306_128x32', // Default to smaller display
    availablePresets: ['SSD1306_128x32', 'SSD1306_128x64'], // Only SSD1306 variants
    defaultSettings: {
      threshold: 100, // Lower threshold for more black pixels
      invert: true, // Default to inverted
      dithering: true, // Enable dithering by default
    },
  },

  ui: {
    theme: {
      primaryColor: 'purple',
      accentColor: 'pink',
    },
    animations: {
      enabled: false, // Disable animations for performance
      fadeInDuration: '0ms',
    },
    layout: {
      maxWidth: '6xl', // Smaller max width
      containerPadding: '4',
    },
  },

  features: {
    showProcessingOverlay: true,
    enableFileValidation: true,
    enableExportControls: true,
    enableDevicePreview: true,
    enableProgressIndicator: false, // Disable progress indicator
    enableTooltips: false, // Disable tooltips for cleaner UI
    enableRecoveryActions: true,
  },

  processing: {
    showOverlay: true,
    overlayMessages: {
      title: 'Converting...',
      description: 'Please wait while we process your images.',
    },
    progressBar: {
      enabled: false, // Disable progress bar
      defaultProgress: 0,
    },
  },
};

/**
 * To use this configuration:
 *
 * 1. Import in your configManager or useAppConfig hook
 * 2. Merge with default config
 * 3. Apply the configuration
 *
 * Example:
 * ```tsx
 * import { customConfig } from './examples/custom-config.example'
 * import { configManager } from '../utils/configManager'
 *
 * // Apply custom config
 * configManager.updateConfig(customConfig)
 * ```
 */
