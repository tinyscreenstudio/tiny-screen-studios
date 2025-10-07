import { describe, it, expect } from 'vitest';
import {
  DEVICE_PRESETS,
  getPresetConfig,
  validatePreset,
  getPresetDimensions,
  getVisibleDimensions,
  getExpectedByteCount,
  getAvailablePresets,
  validateDimensions,
} from './presets.js';
import type { DevicePreset } from '../types/index.js';

describe('Device Presets', () => {
  describe('DEVICE_PRESETS constant', () => {
    it('should contain all required presets', () => {
      expect(DEVICE_PRESETS).toHaveProperty('SSD1306_128x32');
      expect(DEVICE_PRESETS).toHaveProperty('SSD1306_128x64');
      expect(DEVICE_PRESETS).toHaveProperty('SH1106_132x64');
    });

    it('should have correct SSD1306_128x32 configuration', () => {
      const config = DEVICE_PRESETS.SSD1306_128x32;
      expect(config).toEqual({
        width: 128,
        height: 32,
        pageHeight: 8,
        bitOrder: 'lsb-top',
        pageOrder: 'top-down',
        columnOrder: 'left-right',
      });
    });

    it('should have correct SSD1306_128x64 configuration', () => {
      const config = DEVICE_PRESETS.SSD1306_128x64;
      expect(config).toEqual({
        width: 128,
        height: 64,
        pageHeight: 8,
        bitOrder: 'lsb-top',
        pageOrder: 'top-down',
        columnOrder: 'left-right',
      });
    });

    it('should have correct SH1106_132x64 configuration', () => {
      const config = DEVICE_PRESETS.SH1106_132x64;
      expect(config).toEqual({
        width: 132,
        height: 64,
        pageHeight: 8,
        bitOrder: 'lsb-top',
        pageOrder: 'top-down',
        columnOrder: 'left-right',
        viewportOffset: 2,
      });
    });

    it('should have pageHeight of 8 for all presets', () => {
      Object.values(DEVICE_PRESETS).forEach(config => {
        expect(config.pageHeight).toBe(8);
      });
    });
  });

  describe('getPresetConfig', () => {
    it('should return correct config for valid presets', () => {
      const config = getPresetConfig('SSD1306_128x32');
      expect(config).toEqual(DEVICE_PRESETS.SSD1306_128x32);
    });

    it('should return a copy of the config to prevent mutation', () => {
      const config1 = getPresetConfig('SSD1306_128x32');
      const config2 = getPresetConfig('SSD1306_128x32');

      config1.width = 999;
      expect(config2.width).toBe(128);
      expect(DEVICE_PRESETS.SSD1306_128x32.width).toBe(128);
    });

    it('should throw error for invalid preset', () => {
      expect(() => getPresetConfig('INVALID_PRESET' as DevicePreset)).toThrow(
        'Unknown device preset: INVALID_PRESET'
      );
    });
  });

  describe('validatePreset', () => {
    it('should validate correct presets', () => {
      const result = validatePreset('SSD1306_128x32');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid presets', () => {
      const result = validatePreset('INVALID_PRESET');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_parameters');
      expect(result.errors[0].message).toContain('Unsupported device preset');
    });

    it('should reject empty preset', () => {
      const result = validatePreset('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_parameters');
      expect(result.errors[0].message).toBe('Device preset is required');
    });

    it('should include supported presets in error message', () => {
      const result = validatePreset('INVALID');
      expect(result.errors[0].message).toContain('SSD1306_128x32');
      expect(result.errors[0].message).toContain('SSD1306_128x64');
      expect(result.errors[0].message).toContain('SH1106_132x64');
    });
  });

  describe('getPresetDimensions', () => {
    it('should return correct dimensions for SSD1306_128x32', () => {
      const dims = getPresetDimensions('SSD1306_128x32');
      expect(dims).toEqual({ width: 128, height: 32 });
    });

    it('should return correct dimensions for SSD1306_128x64', () => {
      const dims = getPresetDimensions('SSD1306_128x64');
      expect(dims).toEqual({ width: 128, height: 64 });
    });

    it('should return correct dimensions for SH1106_132x64', () => {
      const dims = getPresetDimensions('SH1106_132x64');
      expect(dims).toEqual({ width: 132, height: 64 });
    });
  });

  describe('getVisibleDimensions', () => {
    it('should return same as preset dimensions for SSD1306 displays', () => {
      const dims128x32 = getVisibleDimensions('SSD1306_128x32');
      expect(dims128x32).toEqual({ width: 128, height: 32 });

      const dims128x64 = getVisibleDimensions('SSD1306_128x64');
      expect(dims128x64).toEqual({ width: 128, height: 64 });
    });

    it('should return 128 width for SH1106_132x64 (viewport)', () => {
      const dims = getVisibleDimensions('SH1106_132x64');
      expect(dims).toEqual({ width: 128, height: 64 });
    });
  });

  describe('getExpectedByteCount', () => {
    it('should calculate correct byte count for SSD1306_128x32', () => {
      const byteCount = getExpectedByteCount('SSD1306_128x32');
      // 128 columns × 4 pages (32÷8) = 512 bytes
      expect(byteCount).toBe(512);
    });

    it('should calculate correct byte count for SSD1306_128x64', () => {
      const byteCount = getExpectedByteCount('SSD1306_128x64');
      // 128 columns × 8 pages (64÷8) = 1024 bytes
      expect(byteCount).toBe(1024);
    });

    it('should calculate correct byte count for SH1106_132x64', () => {
      const byteCount = getExpectedByteCount('SH1106_132x64');
      // 132 columns × 8 pages (64÷8) = 1056 bytes
      expect(byteCount).toBe(1056);
    });
  });

  describe('getAvailablePresets', () => {
    it('should return all available presets', () => {
      const presets = getAvailablePresets();
      expect(presets).toContain('SSD1306_128x32');
      expect(presets).toContain('SSD1306_128x64');
      expect(presets).toContain('SH1106_132x64');
      expect(presets).toHaveLength(3);
    });

    it('should return array of strings', () => {
      const presets = getAvailablePresets();
      presets.forEach(preset => {
        expect(typeof preset).toBe('string');
      });
    });
  });

  describe('validateDimensions', () => {
    it('should validate correct dimensions for SSD1306_128x32', () => {
      const result = validateDimensions(
        { width: 128, height: 32 },
        'SSD1306_128x32'
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct dimensions for SSD1306_128x64', () => {
      const result = validateDimensions(
        { width: 128, height: 64 },
        'SSD1306_128x64'
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct dimensions for SH1106_132x64', () => {
      const result = validateDimensions(
        { width: 132, height: 64 },
        'SH1106_132x64'
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject incorrect width', () => {
      const result = validateDimensions(
        { width: 64, height: 32 },
        'SSD1306_128x32'
      );
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('dimension_mismatch');
      expect(result.errors[0].message).toContain('Expected 128×32, got 64×32');
    });

    it('should reject incorrect height', () => {
      const result = validateDimensions(
        { width: 128, height: 64 },
        'SSD1306_128x32'
      );
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('dimension_mismatch');
      expect(result.errors[0].message).toContain('Expected 128×32, got 128×64');
    });

    it('should reject both incorrect width and height', () => {
      const result = validateDimensions(
        { width: 256, height: 128 },
        'SSD1306_128x32'
      );
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain(
        'Expected 128×32, got 256×128'
      );
    });

    it('should include context in error', () => {
      const result = validateDimensions(
        { width: 64, height: 32 },
        'SSD1306_128x32'
      );
      expect(result.errors[0].context).toEqual({
        expected: { width: 128, height: 32 },
        actual: { width: 64, height: 32 },
        preset: 'SSD1306_128x32',
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle all preset types correctly', () => {
      const presets: DevicePreset[] = [
        'SSD1306_128x32',
        'SSD1306_128x64',
        'SH1106_132x64',
      ];

      presets.forEach(preset => {
        expect(() => getPresetConfig(preset)).not.toThrow();
        expect(validatePreset(preset).isValid).toBe(true);
        expect(getPresetDimensions(preset)).toBeDefined();
        expect(getVisibleDimensions(preset)).toBeDefined();
        expect(getExpectedByteCount(preset)).toBeGreaterThan(0);
      });
    });

    it('should maintain immutability of DEVICE_PRESETS', () => {
      const originalConfig = { ...DEVICE_PRESETS.SSD1306_128x32 };

      // Try to modify the returned config
      const config = getPresetConfig('SSD1306_128x32');
      config.width = 999;

      // Original should be unchanged
      expect(DEVICE_PRESETS.SSD1306_128x32).toEqual(originalConfig);
    });
  });
});
