/**
 * Golden fixture tests for regression testing
 * These tests ensure that the byte packer produces consistent, known-good outputs
 */

import { describe, it, expect } from 'vitest';
import { BytePackerImpl } from '../packers/ssd1306.js';
import {
  getAllGoldenFixtures,
  getFixturesForPreset,
  validateAgainstGoldenFixture,
  createFrameFromGoldenFixture,
} from './utils/golden-fixtures.js';
import { createTestFrameMono } from './utils/test-helpers.js';
import type { PackingOptions } from '../types/index.js';

describe('Golden Fixture Tests', () => {
  const packer = new BytePackerImpl();

  describe('All Golden Fixtures', () => {
    const allFixtures = getAllGoldenFixtures();

    it('should have golden fixtures defined', () => {
      expect(allFixtures.length).toBeGreaterThan(0);
      expect(allFixtures.every(f => f.name && f.description)).toBe(true);
    });

    allFixtures.forEach(fixture => {
      it(`should match golden fixture: ${fixture.name}`, () => {
        // Create a monochrome frame from the fixture pattern
        const monoFrame = createFrameFromGoldenFixture(fixture);

        // Pack the frame using the specified options
        const packingOptions: PackingOptions = {
          preset: fixture.input.preset,
          ...fixture.input.packingOptions,
        };

        const packedFrames = packer.packFrames([monoFrame], packingOptions);
        expect(packedFrames).toHaveLength(1);

        const packedFrame = packedFrames[0]!;

        // Validate against the golden fixture
        const validation = validateAgainstGoldenFixture(fixture, packedFrame);

        if (!validation.isValid) {
          console.error(
            `Golden fixture validation failed for ${fixture.name}:`
          );
          validation.errors.forEach(error => console.error(`  - ${error}`));
          validation.warnings.forEach(warning =>
            console.warn(`  - ${warning}`)
          );
        }

        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });
    });
  });

  describe('SSD1306 128x32 Golden Fixtures', () => {
    const fixtures = getFixturesForPreset('SSD1306_128x32');

    it('should have SSD1306_128x32 fixtures', () => {
      expect(fixtures.length).toBeGreaterThan(0);
    });

    it('should validate single pixel top-left', () => {
      const fixture = fixtures.find(f => f.name === 'single_pixel_top_left');
      expect(fixture).toBeDefined();

      if (fixture) {
        // Create frame with single pixel at (0,0)
        const frame = createTestFrameMono(128, 32, [{ x: 0, y: 0 }]);
        const packed = packer.packFrames([frame], { preset: 'SSD1306_128x32' });

        const validation = validateAgainstGoldenFixture(fixture, packed[0]!);
        expect(validation.isValid).toBe(true);
      }
    });

    it('should validate top page fill', () => {
      const fixture = fixtures.find(f => f.name === 'top_page_fill');
      expect(fixture).toBeDefined();

      if (fixture) {
        // Create frame with top page filled
        const setPixels: Array<{ x: number; y: number }> = [];
        for (let x = 0; x < 128; x++) {
          for (let y = 0; y < 8; y++) {
            setPixels.push({ x, y });
          }
        }

        const frame = createTestFrameMono(128, 32, setPixels);
        const packed = packer.packFrames([frame], { preset: 'SSD1306_128x32' });

        const validation = validateAgainstGoldenFixture(fixture, packed[0]!);
        expect(validation.isValid).toBe(true);
      }
    });
  });

  describe('SSD1306 128x64 Golden Fixtures', () => {
    const fixtures = getFixturesForPreset('SSD1306_128x64');

    it('should have SSD1306_128x64 fixtures', () => {
      expect(fixtures.length).toBeGreaterThan(0);
    });

    it('should validate center pixel', () => {
      const fixture = fixtures.find(f => f.name === 'single_pixel_center');
      expect(fixture).toBeDefined();

      if (fixture) {
        // Create frame with single pixel at center (64,32)
        const frame = createTestFrameMono(128, 64, [{ x: 64, y: 32 }]);
        const packed = packer.packFrames([frame], { preset: 'SSD1306_128x64' });

        const validation = validateAgainstGoldenFixture(fixture, packed[0]!);
        expect(validation.isValid).toBe(true);
      }
    });
  });

  describe('SH1106 132x64 Golden Fixtures', () => {
    const fixtures = getFixturesForPreset('SH1106_132x64');

    it('should have SH1106_132x64 fixtures', () => {
      expect(fixtures.length).toBeGreaterThan(0);
    });

    it('should validate viewport boundaries', () => {
      const startFixture = fixtures.find(
        f => f.name === 'single_pixel_viewport_start'
      );
      const endFixture = fixtures.find(
        f => f.name === 'single_pixel_viewport_end'
      );

      expect(startFixture).toBeDefined();
      expect(endFixture).toBeDefined();

      if (startFixture) {
        const frame = createTestFrameMono(132, 64, [{ x: 2, y: 0 }]);
        const packed = packer.packFrames([frame], { preset: 'SH1106_132x64' });
        const validation = validateAgainstGoldenFixture(
          startFixture,
          packed[0]!
        );
        expect(validation.isValid).toBe(true);
      }

      if (endFixture) {
        const frame = createTestFrameMono(132, 64, [{ x: 129, y: 0 }]);
        const packed = packer.packFrames([frame], { preset: 'SH1106_132x64' });
        const validation = validateAgainstGoldenFixture(endFixture, packed[0]!);
        expect(validation.isValid).toBe(true);
      }
    });
  });
});
