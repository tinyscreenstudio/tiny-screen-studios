import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasEmulator } from './canvas.js';
import { packFrames } from '../packers/ssd1306.js';
import type { FrameMono } from '../types/index.js';

// Mock DOM APIs for testing
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(),
};

const mockContext = {
  imageSmoothingEnabled: true,
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  canvas: mockCanvas,
};

global.document = {
  createElement: vi.fn(() => mockCanvas),
} as unknown as Document;

mockCanvas.getContext.mockReturnValue(mockContext);

describe('SH1106 Viewport Emulation', () => {
  let emulator: CanvasEmulator;

  beforeEach(() => {
    emulator = new CanvasEmulator();
    vi.clearAllMocks();

    // Reset mock context state
    mockContext.imageSmoothingEnabled = true;
    mockContext.fillStyle = '';
    mockContext.strokeStyle = '';
    mockContext.lineWidth = 1;
    mockContext.globalAlpha = 1;
    mockCanvas.width = 0;
    mockCanvas.height = 0;
  });

  describe('Hardware-accurate viewport behavior', () => {
    it('should emulate SH1106 132x64 display with 128-pixel viewport window', () => {
      // Create a monochrome frame with full 132-pixel width
      const monoFrame: FrameMono = {
        bits: new Uint8Array((132 * 64) / 8),
        dims: { width: 132, height: 64 },
      };

      // Create a test pattern: vertical lines at specific columns
      // This will help us verify which columns are visible
      const testColumns = [0, 1, 2, 3, 128, 129, 130, 131];

      testColumns.forEach(col => {
        // Set pixels in the top row for each test column
        const pixelIndex = col; // Top row, specific column
        const byteIndex = Math.floor(pixelIndex / 8);
        const bitIndex = pixelIndex % 8;
        monoFrame.bits[byteIndex] |= 1 << bitIndex;
      });

      // Pack the frame using SH1106 preset
      const packedFrames = packFrames([monoFrame], { preset: 'SH1106_132x64' });
      expect(packedFrames).toHaveLength(1);

      const packedFrame = packedFrames[0];
      expect(packedFrame.preset).toBe('SH1106_132x64');
      expect(packedFrame.bytes).toHaveLength(1056); // 132 * 8 pages
      expect(packedFrame.dims).toEqual({ width: 132, height: 64 });

      // Render the frame
      emulator.renderFrameToCanvas(
        mockContext as unknown as CanvasRenderingContext2D,
        packedFrame
      );

      // Verify canvas shows only the 128-pixel viewport
      expect(mockCanvas.width).toBe(128);
      expect(mockCanvas.height).toBe(64);

      // Analyze the fillRect calls to verify viewport behavior
      const fillRectCalls = (
        mockContext.fillRect as unknown as {
          mock: { calls: [number, number, number, number][] };
        }
      ).mock.calls;

      // Filter out the background fill call
      const pixelCalls = fillRectCalls.filter(
        (call: [number, number, number, number]) =>
          !(call[0] === 0 && call[1] === 0 && call[2] === 128 && call[3] === 64)
      );

      // Should render exactly 6 pixels (columns 2, 3, 128, 129 are visible)
      // Columns 0, 1, 130, 131 should be hidden by viewport
      expect(pixelCalls).toHaveLength(4);

      // Verify pixel positions match viewport mapping:
      // Physical column 2 -> Canvas x=0
      // Physical column 3 -> Canvas x=1
      // Physical column 128 -> Canvas x=126
      // Physical column 129 -> Canvas x=127
      expect(pixelCalls).toContainEqual([0, 0, 1, 1]); // Column 2 -> x=0
      expect(pixelCalls).toContainEqual([1, 0, 1, 1]); // Column 3 -> x=1
      expect(pixelCalls).toContainEqual([126, 0, 1, 1]); // Column 128 -> x=126
      expect(pixelCalls).toContainEqual([127, 0, 1, 1]); // Column 129 -> x=127
    });

    it('should handle SH1106 viewport with full-width patterns', () => {
      // Create a frame with alternating columns filled
      const monoFrame: FrameMono = {
        bits: new Uint8Array((132 * 64) / 8),
        dims: { width: 132, height: 64 },
      };

      // Fill every other column across the full 132-pixel width
      for (let col = 0; col < 132; col += 2) {
        // Fill entire column (all 64 pixels)
        for (let row = 0; row < 64; row++) {
          const pixelIndex = row * 132 + col;
          const byteIndex = Math.floor(pixelIndex / 8);
          const bitIndex = pixelIndex % 8;
          monoFrame.bits[byteIndex] |= 1 << bitIndex;
        }
      }

      // Pack and render
      const packedFrames = packFrames([monoFrame], { preset: 'SH1106_132x64' });
      const packedFrame = packedFrames[0];

      emulator.renderFrameToCanvas(
        mockContext as unknown as CanvasRenderingContext2D,
        packedFrame
      );

      // Should render 128x64 canvas
      expect(mockCanvas.width).toBe(128);
      expect(mockCanvas.height).toBe(64);

      // Count pixel calls (excluding background)
      const fillRectCalls = (
        mockContext.fillRect as unknown as {
          mock: { calls: [number, number, number, number][] };
        }
      ).mock.calls;
      const pixelCalls = fillRectCalls.filter(
        (call: [number, number, number, number]) =>
          !(call[0] === 0 && call[1] === 0 && call[2] === 128 && call[3] === 64)
      );

      // Should render pixels for visible columns only
      // Visible columns: 2, 4, 6, 8, ..., 128 (even columns from 2 to 128)
      // That's (128-2)/2 + 1 = 64 columns, each with 64 pixels = 4096 pixels
      expect(pixelCalls).toHaveLength(64 * 64);
    });

    it('should maintain viewport offset with different rendering options', () => {
      // Create simple test frame
      const monoFrame: FrameMono = {
        bits: new Uint8Array((132 * 64) / 8),
        dims: { width: 132, height: 64 },
      };

      // Set pixel at physical column 2, row 0 (should be visible at canvas x=0, y=0)
      const pixelIndex = 2; // Column 2, row 0
      const byteIndex = Math.floor(pixelIndex / 8);
      const bitIndex = pixelIndex % 8;
      monoFrame.bits[byteIndex] |= 1 << bitIndex;

      const packedFrames = packFrames([monoFrame], { preset: 'SH1106_132x64' });
      const packedFrame = packedFrames[0];

      // Test with scaling
      emulator.renderFrameToCanvas(
        mockContext as unknown as CanvasRenderingContext2D,
        packedFrame,
        { scale: 4 }
      );

      expect(mockCanvas.width).toBe(512); // 128 * 4
      expect(mockCanvas.height).toBe(256); // 64 * 4

      // Check that we have background fill + pixel fill
      const fillRectCalls = (
        mockContext.fillRect as unknown as {
          mock: { calls: [number, number, number, number][] };
        }
      ).mock.calls;
      const pixelCalls = fillRectCalls.filter(
        (call: [number, number, number, number]) =>
          !(
            call[0] === 0 &&
            call[1] === 0 &&
            call[2] === 512 &&
            call[3] === 256
          )
      );

      // Should have exactly one pixel rendered
      expect(pixelCalls).toHaveLength(1);
      // Pixel should be at canvas x=0 (column 2 maps to x=0), y=0, scaled to 4x4
      expect(pixelCalls[0]).toEqual([0, 0, 4, 4]);
    });

    it('should handle edge cases in viewport mapping', () => {
      const monoFrame: FrameMono = {
        bits: new Uint8Array((132 * 64) / 8),
        dims: { width: 132, height: 64 },
      };

      // Test boundary pixels
      const boundaryColumns = [1, 2, 129, 130]; // Last hidden, first visible, last visible, first hidden
      boundaryColumns.forEach(col => {
        const pixelIndex = col; // Top row
        const byteIndex = Math.floor(pixelIndex / 8);
        const bitIndex = pixelIndex % 8;
        monoFrame.bits[byteIndex] |= 1 << bitIndex;
      });

      const packedFrames = packFrames([monoFrame], { preset: 'SH1106_132x64' });
      const packedFrame = packedFrames[0];

      emulator.renderFrameToCanvas(
        mockContext as unknown as CanvasRenderingContext2D,
        packedFrame
      );

      const fillRectCalls = (
        mockContext.fillRect as unknown as {
          mock: { calls: [number, number, number, number][] };
        }
      ).mock.calls;
      const pixelCalls = fillRectCalls.filter(
        (call: [number, number, number, number]) =>
          !(call[0] === 0 && call[1] === 0 && call[2] === 128 && call[3] === 64)
      );

      // Should only render columns 2 and 129 (the visible ones)
      expect(pixelCalls).toHaveLength(2);
      expect(pixelCalls).toContainEqual([0, 0, 1, 1]); // Column 2 -> x=0
      expect(pixelCalls).toContainEqual([127, 0, 1, 1]); // Column 129 -> x=127
    });
  });

  describe('Viewport consistency with hardware', () => {
    it('should match expected hardware viewport behavior', () => {
      // This test verifies that our viewport implementation matches
      // the actual SH1106 hardware behavior where:
      // - Physical display has 132 columns (0-131)
      // - Only columns 2-129 are visible (128 pixels)
      // - Column 2 appears at the leftmost position
      // - Column 129 appears at the rightmost position

      const monoFrame: FrameMono = {
        bits: new Uint8Array((132 * 64) / 8),
        dims: { width: 132, height: 64 },
      };

      // Create a recognizable pattern: set pixels at columns 0, 2, 129, 131
      [0, 2, 129, 131].forEach(col => {
        const pixelIndex = col;
        const byteIndex = Math.floor(pixelIndex / 8);
        const bitIndex = pixelIndex % 8;
        monoFrame.bits[byteIndex] |= 1 << bitIndex;
      });

      const packedFrames = packFrames([monoFrame], { preset: 'SH1106_132x64' });
      const packedFrame = packedFrames[0];

      emulator.renderFrameToCanvas(
        mockContext as unknown as CanvasRenderingContext2D,
        packedFrame
      );

      // Verify that only the middle 128 pixels are shown
      expect(mockCanvas.width).toBe(128);
      expect(mockCanvas.height).toBe(64);

      const fillRectCalls = (
        mockContext.fillRect as unknown as {
          mock: { calls: [number, number, number, number][] };
        }
      ).mock.calls;
      const pixelCalls = fillRectCalls.filter(
        (call: [number, number, number, number]) =>
          !(call[0] === 0 && call[1] === 0 && call[2] === 128 && call[3] === 64)
      );

      // Only columns 2 and 129 should be visible
      expect(pixelCalls).toHaveLength(2);

      // Column 2 (physical) should map to canvas x=0
      expect(pixelCalls).toContainEqual([0, 0, 1, 1]);

      // Column 129 (physical) should map to canvas x=127
      expect(pixelCalls).toContainEqual([127, 0, 1, 1]);

      // Columns 0 and 131 should NOT be rendered (outside viewport)
      const xPositions = pixelCalls.map(
        (call: [number, number, number, number]) => call[0]
      );
      expect(xPositions).not.toContain(-2); // Column 0 would be at x=-2 if rendered
      expect(xPositions).not.toContain(129); // Column 131 would be at x=129 if rendered
    });
  });
});
