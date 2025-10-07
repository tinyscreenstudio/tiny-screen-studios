// Unit tests for byte packer module

import { describe, it, expect } from 'vitest';
import { BytePackerImpl } from './ssd1306.js';
import type {
  FrameMono,
  PackingOptions,
  DevicePreset,
} from '../types/index.js';

/**
 * Create a test monochrome frame with specific pixels set
 */
function createTestFrameMono(
  width: number,
  height: number,
  setPixels: Array<{ x: number; y: number }> = []
): FrameMono {
  const totalPixels = width * height;
  const byteCount = Math.ceil(totalPixels / 8);
  const bits = new Uint8Array(byteCount);

  // Set specified pixels
  for (const pixel of setPixels) {
    const pixelIndex = pixel.y * width + pixel.x;
    const byteIndex = Math.floor(pixelIndex / 8);
    const bitPosition = pixelIndex % 8;
    bits[byteIndex] |= 1 << bitPosition;
  }

  return {
    bits,
    dims: { width, height },
  };
}

describe('BytePackerImpl', () => {
  const packer = new BytePackerImpl();

  describe('SSD1306_128x32', () => {
    const preset = 'SSD1306_128x32' as const;
    const width = 128;
    const height = 32;

    it('should pack single pixel at (0,0) to first byte bit 0', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 0 }]);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      expect(packed).toHaveLength(1);
      expect(packed[0].bytes[0]).toBe(0x01); // LSB set (bit 0 = top pixel)
      expect(packed[0].preset).toBe(preset);
      expect(packed[0].dims).toEqual({ width, height });
    });

    it('should pack single pixel at (0,7) to first byte bit 7', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 7 }]);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      expect(packed[0].bytes[0]).toBe(0x80); // MSB set (bit 7 = bottom of first page)
    });

    it('should pack single pixel at (1,0) to second byte bit 0', () => {
      const frame = createTestFrameMono(width, height, [{ x: 1, y: 0 }]);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      expect(packed[0].bytes[1]).toBe(0x01); // Second column, first bit
    });

    it('should pack single pixel at (0,8) to page 1 first byte bit 0', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 8 }]);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // Page 1 starts at byte index 128 (width * page)
      expect(packed[0].bytes[128]).toBe(0x01);
    });

    it('should pack top page fill correctly', () => {
      // Fill entire top page (y=0 to y=7, all columns)
      const setPixels: Array<{ x: number; y: number }> = [];
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < 8; y++) {
          setPixels.push({ x, y });
        }
      }

      const frame = createTestFrameMono(width, height, setPixels);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // First 128 bytes should all be 0xFF (all 8 bits set)
      for (let i = 0; i < 128; i++) {
        expect(packed[0].bytes[i]).toBe(0xff);
      }

      // Remaining bytes should be 0
      for (let i = 128; i < packed[0].bytes.length; i++) {
        expect(packed[0].bytes[i]).toBe(0x00);
      }
    });

    it('should pack bottom page fill correctly', () => {
      // Fill entire bottom page (y=24 to y=31, all columns)
      const setPixels: Array<{ x: number; y: number }> = [];
      for (let x = 0; x < width; x++) {
        for (let y = 24; y < 32; y++) {
          setPixels.push({ x, y });
        }
      }

      const frame = createTestFrameMono(width, height, setPixels);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // First 3 pages (384 bytes) should be 0
      for (let i = 0; i < 384; i++) {
        expect(packed[0].bytes[i]).toBe(0x00);
      }

      // Last page (bytes 384-511) should all be 0xFF
      for (let i = 384; i < 512; i++) {
        expect(packed[0].bytes[i]).toBe(0xff);
      }
    });

    it('should pack left column correctly', () => {
      // Fill entire left column (x=0, all y)
      const setPixels: Array<{ x: number; y: number }> = [];
      for (let y = 0; y < height; y++) {
        setPixels.push({ x: 0, y });
      }

      const frame = createTestFrameMono(width, height, setPixels);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // Check each page's first byte (column 0)
      for (let page = 0; page < 4; page++) {
        const byteIndex = page * width; // First byte of each page
        expect(packed[0].bytes[byteIndex]).toBe(0xff);
      }

      // All other bytes should be 0
      for (let page = 0; page < 4; page++) {
        for (let col = 1; col < width; col++) {
          const byteIndex = page * width + col;
          expect(packed[0].bytes[byteIndex]).toBe(0x00);
        }
      }
    });

    it('should pack right column correctly', () => {
      // Fill entire right column (x=127, all y)
      const setPixels: Array<{ x: number; y: number }> = [];
      for (let y = 0; y < height; y++) {
        setPixels.push({ x: 127, y });
      }

      const frame = createTestFrameMono(width, height, setPixels);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // Check each page's last byte (column 127)
      for (let page = 0; page < 4; page++) {
        const byteIndex = page * width + 127; // Last byte of each page
        expect(packed[0].bytes[byteIndex]).toBe(0xff);
      }

      // All other bytes should be 0
      for (let page = 0; page < 4; page++) {
        for (let col = 0; col < 127; col++) {
          const byteIndex = page * width + col;
          expect(packed[0].bytes[byteIndex]).toBe(0x00);
        }
      }
    });

    it('should handle MSB-top bit order', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 0 }]);
      const options: PackingOptions = {
        preset,
        bitOrder: 'msb-top',
      };

      const packed = packer.packFrames([frame], options);

      expect(packed[0].bytes[0]).toBe(0x80); // MSB set (bit 7 = top pixel)
    });

    it('should handle bottom-up page order', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 0 }]);
      const options: PackingOptions = {
        preset,
        pageOrder: 'bottom-up',
      };

      const packed = packer.packFrames([frame], options);

      // With bottom-up page order, top pixel should be in the last page
      expect(packed[0].bytes[384]).toBe(0x01); // Page 3 (bottom-up), first byte
    });

    it('should handle right-left column order', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 0 }]);
      const options: PackingOptions = {
        preset,
        columnOrder: 'right-left',
      };

      const packed = packer.packFrames([frame], options);

      // With right-left column order, leftmost pixel should be in the rightmost byte
      expect(packed[0].bytes[127]).toBe(0x01); // Last byte of first page
    });

    it('should handle invert option', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 0 }]);
      const options: PackingOptions = {
        preset,
        invert: true,
      };

      const packed = packer.packFrames([frame], options);

      // With invert, the set pixel should become unset, and all others should be set
      expect(packed[0].bytes[0]).toBe(0xfe); // All bits set except bit 0

      // Check a few other bytes to ensure they're all 0xFF
      expect(packed[0].bytes[1]).toBe(0xff);
      expect(packed[0].bytes[127]).toBe(0xff);
    });

    it('should validate correct byte count', () => {
      const frame = createTestFrameMono(width, height);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // 128x32 = 4 pages * 128 columns = 512 bytes
      expect(packed[0].bytes.length).toBe(512);
    });

    it('should throw error for wrong dimensions', () => {
      const frame = createTestFrameMono(64, 32); // Wrong width
      const options: PackingOptions = { preset };

      expect(() => {
        packer.packFrames([frame], options);
      }).toThrow(
        "Frame dimensions 64×32 don't match preset requirements 128×32"
      );
    });
  });

  describe('SSD1306_128x64', () => {
    const preset = 'SSD1306_128x64' as const;
    const width = 128;
    const height = 64;

    it('should pack single pixel at (0,0) to first byte bit 0', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 0 }]);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      expect(packed[0].bytes[0]).toBe(0x01); // LSB set
    });

    it('should pack pixel at (0,32) to page 4 first byte bit 0', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 32 }]);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // Page 4 starts at byte index 512 (width * page)
      expect(packed[0].bytes[512]).toBe(0x01);
    });

    it('should validate correct byte count', () => {
      const frame = createTestFrameMono(width, height);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // 128x64 = 8 pages * 128 columns = 1024 bytes
      expect(packed[0].bytes.length).toBe(1024);
    });

    it('should pack full display correctly', () => {
      // Fill entire display
      const setPixels: Array<{ x: number; y: number }> = [];
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          setPixels.push({ x, y });
        }
      }

      const frame = createTestFrameMono(width, height, setPixels);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // All bytes should be 0xFF
      for (let i = 0; i < packed[0].bytes.length; i++) {
        expect(packed[0].bytes[i]).toBe(0xff);
      }
    });
  });

  describe('Multiple frames', () => {
    it('should pack multiple frames correctly', () => {
      const frame1 = createTestFrameMono(128, 32, [{ x: 0, y: 0 }]);
      const frame2 = createTestFrameMono(128, 32, [{ x: 1, y: 0 }]);
      const options: PackingOptions = { preset: 'SSD1306_128x32' };

      const packed = packer.packFrames([frame1, frame2], options);

      expect(packed).toHaveLength(2);
      expect(packed[0].bytes[0]).toBe(0x01); // First frame, first pixel
      expect(packed[1].bytes[1]).toBe(0x01); // Second frame, second pixel
    });
  });

  describe('Error handling', () => {
    it('should throw error for unsupported preset', () => {
      const frame = createTestFrameMono(128, 32);
      const options = { preset: 'UNKNOWN_PRESET' as DevicePreset };

      expect(() => {
        packer.packFrames([frame], options);
      }).toThrow('Unknown device preset: UNKNOWN_PRESET');
    });

    it('should throw error for wrong dimensions', () => {
      const frame = createTestFrameMono(128, 31); // Wrong height
      const options: PackingOptions = { preset: 'SSD1306_128x32' };

      expect(() => {
        packer.packFrames([frame], options);
      }).toThrow(
        "Frame dimensions 128×31 don't match preset requirements 128×32"
      );
    });
  });

  describe('SH1106_132x64', () => {
    const preset = 'SH1106_132x64' as const;
    const width = 132;
    const height = 64;

    it('should pack single pixel at (0,0) to first byte bit 0', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 0 }]);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      expect(packed).toHaveLength(1);
      expect(packed[0].bytes[0]).toBe(0x01); // LSB set (bit 0 = top pixel)
      expect(packed[0].preset).toBe(preset);
      expect(packed[0].dims).toEqual({ width, height });
    });

    it('should pack single pixel at (2,0) to third byte bit 0 (viewport start)', () => {
      const frame = createTestFrameMono(width, height, [{ x: 2, y: 0 }]);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      expect(packed[0].bytes[2]).toBe(0x01); // Third column (viewport start)
    });

    it('should pack single pixel at (129,0) to byte 129 bit 0 (viewport end)', () => {
      const frame = createTestFrameMono(width, height, [{ x: 129, y: 0 }]);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      expect(packed[0].bytes[129]).toBe(0x01); // Column 129 (viewport end)
    });

    it('should pack single pixel at (131,0) to last byte bit 0 (physical end)', () => {
      const frame = createTestFrameMono(width, height, [{ x: 131, y: 0 }]);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      expect(packed[0].bytes[131]).toBe(0x01); // Last physical column
    });

    it('should pack pixel at (0,32) to page 4 first byte bit 0', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 32 }]);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // Page 4 starts at byte index 528 (132 * 4)
      expect(packed[0].bytes[528]).toBe(0x01);
    });

    it('should pack full viewport width correctly (columns 2-129)', () => {
      // Fill viewport area (columns 2-129, top row)
      const setPixels: Array<{ x: number; y: number }> = [];
      for (let x = 2; x <= 129; x++) {
        setPixels.push({ x, y: 0 });
      }

      const frame = createTestFrameMono(width, height, setPixels);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // Columns 0-1 should be empty
      expect(packed[0].bytes[0]).toBe(0x00);
      expect(packed[0].bytes[1]).toBe(0x00);

      // Columns 2-129 should have bit 0 set
      for (let col = 2; col <= 129; col++) {
        expect(packed[0].bytes[col]).toBe(0x01);
      }

      // Columns 130-131 should be empty
      expect(packed[0].bytes[130]).toBe(0x00);
      expect(packed[0].bytes[131]).toBe(0x00);
    });

    it('should pack full physical width correctly (all 132 columns)', () => {
      // Fill entire physical width (columns 0-131, top row)
      const setPixels: Array<{ x: number; y: number }> = [];
      for (let x = 0; x < width; x++) {
        setPixels.push({ x, y: 0 });
      }

      const frame = createTestFrameMono(width, height, setPixels);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // All columns should have bit 0 set
      for (let col = 0; col < 132; col++) {
        expect(packed[0].bytes[col]).toBe(0x01);
      }
    });

    it('should pack top page fill correctly', () => {
      // Fill entire top page (y=0 to y=7, all columns)
      const setPixels: Array<{ x: number; y: number }> = [];
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < 8; y++) {
          setPixels.push({ x, y });
        }
      }

      const frame = createTestFrameMono(width, height, setPixels);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // First 132 bytes should all be 0xFF (all 8 bits set)
      for (let i = 0; i < 132; i++) {
        expect(packed[0].bytes[i]).toBe(0xff);
      }

      // Remaining bytes should be 0
      for (let i = 132; i < packed[0].bytes.length; i++) {
        expect(packed[0].bytes[i]).toBe(0x00);
      }
    });

    it('should pack left column correctly (column 0)', () => {
      // Fill entire left column (x=0, all y)
      const setPixels: Array<{ x: number; y: number }> = [];
      for (let y = 0; y < height; y++) {
        setPixels.push({ x: 0, y });
      }

      const frame = createTestFrameMono(width, height, setPixels);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // Check each page's first byte (column 0)
      for (let page = 0; page < 8; page++) {
        const byteIndex = page * width; // First byte of each page
        expect(packed[0].bytes[byteIndex]).toBe(0xff);
      }

      // All other bytes should be 0
      for (let page = 0; page < 8; page++) {
        for (let col = 1; col < width; col++) {
          const byteIndex = page * width + col;
          expect(packed[0].bytes[byteIndex]).toBe(0x00);
        }
      }
    });

    it('should pack right column correctly (column 131)', () => {
      // Fill entire right column (x=131, all y)
      const setPixels: Array<{ x: number; y: number }> = [];
      for (let y = 0; y < height; y++) {
        setPixels.push({ x: 131, y });
      }

      const frame = createTestFrameMono(width, height, setPixels);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // Check each page's last byte (column 131)
      for (let page = 0; page < 8; page++) {
        const byteIndex = page * width + 131; // Last byte of each page
        expect(packed[0].bytes[byteIndex]).toBe(0xff);
      }

      // All other bytes should be 0
      for (let page = 0; page < 8; page++) {
        for (let col = 0; col < 131; col++) {
          const byteIndex = page * width + col;
          expect(packed[0].bytes[byteIndex]).toBe(0x00);
        }
      }
    });

    it('should handle MSB-top bit order', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 0 }]);
      const options: PackingOptions = {
        preset,
        bitOrder: 'msb-top',
      };

      const packed = packer.packFrames([frame], options);

      expect(packed[0].bytes[0]).toBe(0x80); // MSB set (bit 7 = top pixel)
    });

    it('should handle bottom-up page order', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 0 }]);
      const options: PackingOptions = {
        preset,
        pageOrder: 'bottom-up',
      };

      const packed = packer.packFrames([frame], options);

      // With bottom-up page order, top pixel should be in the last page
      expect(packed[0].bytes[924]).toBe(0x01); // Page 7 (bottom-up), first byte (7 * 132)
    });

    it('should handle right-left column order', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 0 }]);
      const options: PackingOptions = {
        preset,
        columnOrder: 'right-left',
      };

      const packed = packer.packFrames([frame], options);

      // With right-left column order, leftmost pixel should be in the rightmost byte
      expect(packed[0].bytes[131]).toBe(0x01); // Last byte of first page
    });

    it('should handle invert option', () => {
      const frame = createTestFrameMono(width, height, [{ x: 0, y: 0 }]);
      const options: PackingOptions = {
        preset,
        invert: true,
      };

      const packed = packer.packFrames([frame], options);

      // With invert, the set pixel should become unset, and all others should be set
      expect(packed[0].bytes[0]).toBe(0xfe); // All bits set except bit 0

      // Check a few other bytes to ensure they're all 0xFF
      expect(packed[0].bytes[1]).toBe(0xff);
      expect(packed[0].bytes[131]).toBe(0xff);
    });

    it('should validate correct byte count', () => {
      const frame = createTestFrameMono(width, height);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // 132x64 = 8 pages * 132 columns = 1056 bytes
      expect(packed[0].bytes.length).toBe(1056);
    });

    it('should throw error for wrong dimensions', () => {
      const frame = createTestFrameMono(128, 64); // Wrong width (should be 132)
      const options: PackingOptions = { preset };

      expect(() => {
        packer.packFrames([frame], options);
      }).toThrow(
        "Frame dimensions 128×64 don't match preset requirements 132×64"
      );
    });

    it('should throw error for wrong height', () => {
      const frame = createTestFrameMono(132, 32); // Wrong height (should be 64)
      const options: PackingOptions = { preset };

      expect(() => {
        packer.packFrames([frame], options);
      }).toThrow(
        "Frame dimensions 132×32 don't match preset requirements 132×64"
      );
    });

    it('should pack viewport area correctly with mixed content', () => {
      // Create a pattern: columns 0-1 (off-screen left), 2-129 (viewport), 130-131 (off-screen right)
      const setPixels: Array<{ x: number; y: number }> = [];

      // Off-screen left (columns 0-1): set pixels
      setPixels.push({ x: 0, y: 0 }, { x: 1, y: 0 });

      // Viewport area (columns 2-129): set every other pixel
      for (let x = 2; x <= 129; x += 2) {
        setPixels.push({ x, y: 0 });
      }

      // Off-screen right (columns 130-131): set pixels
      setPixels.push({ x: 130, y: 0 }, { x: 131, y: 0 });

      const frame = createTestFrameMono(width, height, setPixels);
      const options: PackingOptions = { preset };

      const packed = packer.packFrames([frame], options);

      // Off-screen left should have pixels
      expect(packed[0].bytes[0]).toBe(0x01);
      expect(packed[0].bytes[1]).toBe(0x01);

      // Viewport area should have every other pixel
      for (let x = 2; x <= 129; x++) {
        const expected = x % 2 === 0 ? 0x01 : 0x00;
        expect(packed[0].bytes[x]).toBe(expected);
      }

      // Off-screen right should have pixels
      expect(packed[0].bytes[130]).toBe(0x01);
      expect(packed[0].bytes[131]).toBe(0x01);
    });
  });

  describe('Preset configuration', () => {
    it('should return correct config for SSD1306_128x32', () => {
      const config = packer.getPresetConfig('SSD1306_128x32');

      expect(config).toEqual({
        width: 128,
        height: 32,
        pageHeight: 8,
        bitOrder: 'lsb-top',
        pageOrder: 'top-down',
        columnOrder: 'left-right',
      });
    });

    it('should return correct config for SSD1306_128x64', () => {
      const config = packer.getPresetConfig('SSD1306_128x64');

      expect(config).toEqual({
        width: 128,
        height: 64,
        pageHeight: 8,
        bitOrder: 'lsb-top',
        pageOrder: 'top-down',
        columnOrder: 'left-right',
      });
    });

    it('should return correct config for SH1106_132x64', () => {
      const config = packer.getPresetConfig('SH1106_132x64');

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
  });
});
