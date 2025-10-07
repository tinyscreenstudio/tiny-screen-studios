import type {
  DevicePreset,
  PresetConfig,
  ValidationResult,
  Dimensions,
} from './types.js';

/**
 * Device preset configurations for supported displays
 * Each preset defines the physical characteristics and default settings
 */
export const DEVICE_PRESETS: Record<DevicePreset, PresetConfig> = {
  SSD1306_128x32: {
    width: 128,
    height: 32,
    pageHeight: 8,
    bitOrder: 'lsb-top',
    pageOrder: 'top-down',
    columnOrder: 'left-right',
  },
  SSD1306_128x64: {
    width: 128,
    height: 64,
    pageHeight: 8,
    bitOrder: 'lsb-top',
    pageOrder: 'top-down',
    columnOrder: 'left-right',
  },
  SH1106_132x64: {
    width: 132, // Physical width
    height: 64,
    pageHeight: 8,
    bitOrder: 'lsb-top',
    pageOrder: 'top-down',
    columnOrder: 'left-right',
    viewportOffset: 2, // Show columns 2-129 (128 visible pixels)
  },
};

/**
 * Get configuration for a specific device preset
 * @param preset - The device preset identifier
 * @returns The preset configuration
 * @throws Error if preset is not found
 */
export function getPresetConfig(preset: DevicePreset): PresetConfig {
  const config = DEVICE_PRESETS[preset];
  if (!config) {
    throw new Error(`Unknown device preset: ${preset}`);
  }
  return { ...config }; // Return a copy to prevent mutation
}

/**
 * Validate if a preset exists and is supported
 * @param preset - The preset to validate
 * @returns Validation result
 */
export function validatePreset(preset: string): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  if (!preset) {
    errors.push({
      type: 'invalid_parameters' as const,
      message: 'Device preset is required',
      context: { preset },
    });
  } else if (!(preset in DEVICE_PRESETS)) {
    errors.push({
      type: 'invalid_parameters' as const,
      message: `Unsupported device preset: ${preset}. Supported presets: ${Object.keys(DEVICE_PRESETS).join(', ')}`,
      context: { preset, supportedPresets: Object.keys(DEVICE_PRESETS) },
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get the expected dimensions for a device preset
 * @param preset - The device preset
 * @returns The expected dimensions
 */
export function getPresetDimensions(preset: DevicePreset): Dimensions {
  const config = getPresetConfig(preset);
  return {
    width: config.width,
    height: config.height,
  };
}

/**
 * Get the visible dimensions for a device preset (accounts for viewport offset)
 * @param preset - The device preset
 * @returns The visible dimensions
 */
export function getVisibleDimensions(preset: DevicePreset): Dimensions {
  const config = getPresetConfig(preset);

  // For SH1106, only 128 pixels are visible despite 132 physical width
  if (preset === 'SH1106_132x64') {
    return {
      width: 128, // Visible width
      height: config.height,
    };
  }

  return {
    width: config.width,
    height: config.height,
  };
}

/**
 * Calculate expected byte count for a device preset
 * @param preset - The device preset
 * @returns Expected number of bytes per frame
 */
export function getExpectedByteCount(preset: DevicePreset): number {
  const config = getPresetConfig(preset);
  const pages = config.height / config.pageHeight;
  return config.width * pages;
}

/**
 * Get all available device presets
 * @returns Array of all supported device preset identifiers
 */
export function getAvailablePresets(): DevicePreset[] {
  return Object.keys(DEVICE_PRESETS) as DevicePreset[];
}

/**
 * Check if dimensions match the expected dimensions for a preset
 * @param dimensions - The dimensions to check
 * @param preset - The device preset to check against
 * @returns Validation result with dimension comparison
 */
export function validateDimensions(
  dimensions: Dimensions,
  preset: DevicePreset
): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];
  const expected = getPresetDimensions(preset);

  if (
    dimensions.width !== expected.width ||
    dimensions.height !== expected.height
  ) {
    errors.push({
      type: 'dimension_mismatch' as const,
      message: `Dimension mismatch for ${preset}. Expected ${expected.width}×${expected.height}, got ${dimensions.width}×${dimensions.height}`,
      context: {
        expected,
        actual: dimensions,
        preset,
      },
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
