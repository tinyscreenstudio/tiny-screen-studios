import { describe, it, expect } from 'vitest';
import {
  makeByteFiles,
  makeConcatenatedByteFile,
  validateBinaryExportParams,
} from './binary.js';
import type { PackedFrame } from '../types/index.js';

// Helper function to create test frames
function createTestFrame(
  bytes: number[],
  preset:
    | 'SSD1306_128x32'
    | 'SSD1306_128x64'
    | 'SH1106_132x64' = 'SSD1306_128x32',
  delayMs?: number
): PackedFrame {
  const dims = {
    SSD1306_128x32: { width: 128, height: 32 },
    SSD1306_128x64: { width: 128, height: 64 },
    SH1106_132x64: { width: 132, height: 64 },
  };

  return {
    bytes: new Uint8Array(bytes),
    dims: dims[preset],
    preset,
    delayMs,
  };
}

describe('Binary Exporter', () => {
  describe('makeByteFiles', () => {
    it('should export single frame with correct filename', () => {
      const frame = createTestFrame([0x01, 0x02, 0x03, 0x04]);
      const files = makeByteFiles([frame], 'test_image');

      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('test_image.bin');
      expect(files[0].data).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
      expect(files[0].mimeType).toBe('application/octet-stream');
    });

    it('should export multiple frames with indexed filenames', () => {
      const frames = [
        createTestFrame([0x01, 0x02]),
        createTestFrame([0x03, 0x04]),
        createTestFrame([0x05, 0x06]),
      ];
      const files = makeByteFiles(frames, 'animation');

      expect(files).toHaveLength(3);
      expect(files[0].name).toBe('animation_frame_000.bin');
      expect(files[1].name).toBe('animation_frame_001.bin');
      expect(files[2].name).toBe('animation_frame_002.bin');

      expect(files[0].data).toEqual(new Uint8Array([0x01, 0x02]));
      expect(files[1].data).toEqual(new Uint8Array([0x03, 0x04]));
      expect(files[2].data).toEqual(new Uint8Array([0x05, 0x06]));
    });

    it('should sanitize basename by removing extension', () => {
      const frame = createTestFrame([0x01, 0x02]);
      const files = makeByteFiles([frame], 'test.png');

      expect(files[0].name).toBe('test.bin');
    });

    it('should sanitize basename by replacing invalid characters', () => {
      const frame = createTestFrame([0x01, 0x02]);
      const files = makeByteFiles([frame], 'test file/name*with?chars');

      expect(files[0].name).toBe('test_file_name_with_chars.bin');
    });

    it('should create independent copies of byte data', () => {
      const originalBytes = new Uint8Array([0x01, 0x02, 0x03]);
      const frame = createTestFrame(Array.from(originalBytes));
      const files = makeByteFiles([frame], 'test');

      // Modify original frame data
      frame.bytes[0] = 0xff;

      // Exported data should be unchanged
      expect(files[0].data[0]).toBe(0x01);
    });

    it('should handle frames with different byte lengths', () => {
      const frames = [
        createTestFrame([0x01, 0x02]),
        createTestFrame([0x03, 0x04, 0x05, 0x06]),
        createTestFrame([0x07]),
      ];
      const files = makeByteFiles(frames, 'mixed_sizes');

      expect(files[0].data).toHaveLength(2);
      expect(files[1].data).toHaveLength(4);
      expect(files[2].data).toHaveLength(1);
    });

    it('should throw error for empty frames array', () => {
      expect(() => makeByteFiles([], 'test')).toThrow(
        'No frames provided for binary export'
      );
    });

    it('should throw error for null/undefined frames', () => {
      expect(() =>
        makeByteFiles(null as unknown as PackedFrame[], 'test')
      ).toThrow('No frames provided for binary export');
      expect(() =>
        makeByteFiles(undefined as unknown as PackedFrame[], 'test')
      ).toThrow('No frames provided for binary export');
    });

    it('should throw error for empty basename', () => {
      const frame = createTestFrame([0x01, 0x02]);
      expect(() => makeByteFiles([frame], '')).toThrow(
        'Basename is required for binary export'
      );
      expect(() => makeByteFiles([frame], '   ')).toThrow(
        'Basename is required for binary export'
      );
    });

    it('should throw error for frame with no byte data', () => {
      const frame = createTestFrame([]);
      expect(() => makeByteFiles([frame], 'test')).toThrow(
        'Frame 0 has no byte data'
      );
    });

    it('should handle SSD1306 128x32 frame correctly', () => {
      // 128x32 = 4 pages * 128 bytes = 512 bytes total
      const bytes = new Array(512).fill(0).map((_, i) => i % 256);
      const frame = createTestFrame(bytes, 'SSD1306_128x32');
      const files = makeByteFiles([frame], 'ssd1306_32');

      expect(files[0].data).toHaveLength(512);
      expect(files[0].name).toBe('ssd1306_32.bin');
    });

    it('should handle SSD1306 128x64 frame correctly', () => {
      // 128x64 = 8 pages * 128 bytes = 1024 bytes total
      const bytes = new Array(1024).fill(0).map((_, i) => i % 256);
      const frame = createTestFrame(bytes, 'SSD1306_128x64');
      const files = makeByteFiles([frame], 'ssd1306_64');

      expect(files[0].data).toHaveLength(1024);
      expect(files[0].name).toBe('ssd1306_64.bin');
    });

    it('should handle SH1106 132x64 frame correctly', () => {
      // 132x64 = 8 pages * 132 bytes = 1056 bytes total
      const bytes = new Array(1056).fill(0).map((_, i) => i % 256);
      const frame = createTestFrame(bytes, 'SH1106_132x64');
      const files = makeByteFiles([frame], 'sh1106');

      expect(files[0].data).toHaveLength(1056);
      expect(files[0].name).toBe('sh1106.bin');
    });
  });

  describe('makeConcatenatedByteFile', () => {
    it('should concatenate multiple frames into single file', () => {
      const frames = [
        createTestFrame([0x01, 0x02]),
        createTestFrame([0x03, 0x04]),
        createTestFrame([0x05, 0x06]),
      ];
      const file = makeConcatenatedByteFile(frames, 'animation');

      expect(file.name).toBe('animation_all_frames.bin');
      expect(file.data).toEqual(
        new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06])
      );
      expect(file.mimeType).toBe('application/octet-stream');
    });

    it('should handle single frame correctly', () => {
      const frame = createTestFrame([0x01, 0x02, 0x03, 0x04]);
      const file = makeConcatenatedByteFile([frame], 'single');

      expect(file.name).toBe('single_all_frames.bin');
      expect(file.data).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
    });

    it('should handle frames with different sizes', () => {
      const frames = [
        createTestFrame([0x01]),
        createTestFrame([0x02, 0x03, 0x04]),
        createTestFrame([0x05, 0x06]),
      ];
      const file = makeConcatenatedByteFile(frames, 'mixed');

      expect(file.data).toEqual(
        new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06])
      );
      expect(file.data).toHaveLength(6);
    });

    it('should sanitize basename correctly', () => {
      const frame = createTestFrame([0x01, 0x02]);
      const file = makeConcatenatedByteFile([frame], 'test file.png');

      expect(file.name).toBe('test_file_all_frames.bin');
    });

    it('should throw error for empty frames array', () => {
      expect(() => makeConcatenatedByteFile([], 'test')).toThrow(
        'No frames provided for concatenated binary export'
      );
    });

    it('should throw error for empty basename', () => {
      const frame = createTestFrame([0x01, 0x02]);
      expect(() => makeConcatenatedByteFile([frame], '')).toThrow(
        'Basename is required for concatenated binary export'
      );
    });

    it('should throw error for frame with no byte data', () => {
      const frame = createTestFrame([]);
      expect(() => makeConcatenatedByteFile([frame], 'test')).toThrow(
        'Frame has no byte data'
      );
    });

    it('should handle large concatenated data correctly', () => {
      // Create frames with realistic SSD1306 data sizes
      const frames = [
        createTestFrame(new Array(512).fill(0x55), 'SSD1306_128x32'), // 512 bytes
        createTestFrame(new Array(512).fill(0xaa), 'SSD1306_128x32'), // 512 bytes
        createTestFrame(new Array(512).fill(0xff), 'SSD1306_128x32'), // 512 bytes
      ];
      const file = makeConcatenatedByteFile(frames, 'large_animation');

      expect(file.data).toHaveLength(1536); // 3 * 512

      // Verify data integrity
      expect(file.data.slice(0, 512)).toEqual(new Uint8Array(512).fill(0x55));
      expect(file.data.slice(512, 1024)).toEqual(
        new Uint8Array(512).fill(0xaa)
      );
      expect(file.data.slice(1024, 1536)).toEqual(
        new Uint8Array(512).fill(0xff)
      );
    });
  });

  describe('validateBinaryExportParams', () => {
    it('should return true for valid parameters', () => {
      const frames = [createTestFrame([0x01, 0x02])];
      expect(validateBinaryExportParams(frames, 'test')).toBe(true);
    });

    it('should return false for empty frames array', () => {
      expect(validateBinaryExportParams([], 'test')).toBe(false);
    });

    it('should return false for null/undefined frames', () => {
      expect(
        validateBinaryExportParams(null as unknown as PackedFrame[], 'test')
      ).toBe(false);
      expect(
        validateBinaryExportParams(
          undefined as unknown as PackedFrame[],
          'test'
        )
      ).toBe(false);
    });

    it('should return false for empty basename', () => {
      const frames = [createTestFrame([0x01, 0x02])];
      expect(validateBinaryExportParams(frames, '')).toBe(false);
      expect(validateBinaryExportParams(frames, '   ')).toBe(false);
    });

    it('should return false for frames with no byte data', () => {
      const frames = [
        createTestFrame([0x01, 0x02]),
        createTestFrame([]), // Empty bytes
        createTestFrame([0x03, 0x04]),
      ];
      expect(validateBinaryExportParams(frames, 'test')).toBe(false);
    });

    it('should return true for multiple valid frames', () => {
      const frames = [
        createTestFrame([0x01, 0x02]),
        createTestFrame([0x03, 0x04, 0x05]),
        createTestFrame([0x06]),
      ];
      expect(validateBinaryExportParams(frames, 'test')).toBe(true);
    });
  });

  describe('Integration with different device presets', () => {
    it('should export SSD1306 128x32 data correctly', () => {
      // Create realistic frame data for 128x32 display (512 bytes)
      const frameData = new Array(512).fill(0);
      // Set some test pattern - first page all on, second page alternating
      for (let i = 0; i < 128; i++) {
        frameData[i] = 0xff; // First page (top 8 pixels)
        frameData[i + 128] = 0x55; // Second page (alternating pattern)
      }

      const frame = createTestFrame(frameData, 'SSD1306_128x32');
      const files = makeByteFiles([frame], 'ssd1306_test');

      expect(files[0].data).toHaveLength(512);
      expect(files[0].data[0]).toBe(0xff); // First byte of first page
      expect(files[0].data[128]).toBe(0x55); // First byte of second page
    });

    it('should export SH1106 132x64 data correctly', () => {
      // Create realistic frame data for 132x64 display (1056 bytes)
      const frameData = new Array(1056).fill(0);
      // Set viewport area (columns 2-129) with test pattern
      for (let page = 0; page < 8; page++) {
        for (let col = 2; col < 130; col++) {
          // Visible columns
          frameData[page * 132 + col] = 0xaa;
        }
      }

      const frame = createTestFrame(frameData, 'SH1106_132x64');
      const files = makeByteFiles([frame], 'sh1106_test');

      expect(files[0].data).toHaveLength(1056);
      expect(files[0].data[2]).toBe(0xaa); // First visible column
      expect(files[0].data[129]).toBe(0xaa); // Last visible column
      expect(files[0].data[0]).toBe(0x00); // Outside viewport
      expect(files[0].data[130]).toBe(0x00); // Outside viewport
    });
  });
});
