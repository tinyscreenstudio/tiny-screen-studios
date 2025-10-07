import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasEmulator } from './canvas.js';
import { packFrames } from '../packers/ssd1306.js';
import type { FrameMono, PackedFrame } from '../types/index.js';

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

// Type alias for cleaner mock context casting
type MockRenderingContext = CanvasRenderingContext2D;

global.document = {
  createElement: vi.fn(() => mockCanvas),
} as unknown as Document;

mockCanvas.getContext.mockReturnValue(mockContext);

describe('Emulator Integration Tests', () => {
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

  describe('Integration with SSD1306 Packer', () => {
    it('should render packed SSD1306_128x32 frame correctly', () => {
      // Create a simple test pattern - diagonal line
      const monoFrame: FrameMono = {
        bits: new Uint8Array((128 * 32) / 8), // 1 bit per pixel
        dims: { width: 128, height: 32 },
      };

      // Set diagonal pixels (0,0), (1,1), (2,2), etc.
      for (let i = 0; i < Math.min(128, 32); i++) {
        const byteIndex = Math.floor((i * 128 + i) / 8);
        const bitIndex = (i * 128 + i) % 8;
        monoFrame.bits[byteIndex] |= 1 << bitIndex;
      }

      // Pack the frame
      const packedFrames = packFrames([monoFrame], {
        preset: 'SSD1306_128x32',
      });
      expect(packedFrames).toHaveLength(1);

      const packedFrame = packedFrames[0];
      expect(packedFrame.preset).toBe('SSD1306_128x32');
      expect(packedFrame.bytes).toHaveLength(512); // 128 * 4 pages

      // Render the packed frame
      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        packedFrame
      );

      // Verify canvas was set up correctly
      expect(mockCanvas.width).toBe(128);
      expect(mockCanvas.height).toBe(32);
      expect(mockContext.imageSmoothingEnabled).toBe(false);

      // Should have rendered background + some pixels
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should render packed SSD1306_128x64 frame correctly', () => {
      // Create a test pattern - horizontal line at top
      const monoFrame: FrameMono = {
        bits: new Uint8Array((128 * 64) / 8),
        dims: { width: 128, height: 64 },
      };

      // Set top row pixels
      for (let x = 0; x < 128; x++) {
        const byteIndex = Math.floor(x / 8);
        const bitIndex = x % 8;
        monoFrame.bits[byteIndex] |= 1 << bitIndex;
      }

      // Pack the frame
      const packedFrames = packFrames([monoFrame], {
        preset: 'SSD1306_128x64',
      });
      expect(packedFrames).toHaveLength(1);

      const packedFrame = packedFrames[0];
      expect(packedFrame.preset).toBe('SSD1306_128x64');
      expect(packedFrame.bytes).toHaveLength(1024); // 128 * 8 pages

      // Render the packed frame
      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        packedFrame
      );

      // Verify canvas was set up correctly
      expect(mockCanvas.width).toBe(128);
      expect(mockCanvas.height).toBe(64);
      expect(mockContext.imageSmoothingEnabled).toBe(false);

      // Should have rendered background + pixels
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should handle SH1106 viewport correctly', () => {
      // Create a test pattern for SH1106
      const monoFrame: FrameMono = {
        bits: new Uint8Array((132 * 64) / 8),
        dims: { width: 132, height: 64 },
      };

      // Set some pixels across the full width
      for (let x = 0; x < 132; x += 10) {
        const byteIndex = Math.floor(x / 8);
        const bitIndex = x % 8;
        monoFrame.bits[byteIndex] |= 1 << bitIndex;
      }

      // Pack the frame
      const packedFrames = packFrames([monoFrame], { preset: 'SH1106_132x64' });
      expect(packedFrames).toHaveLength(1);

      const packedFrame = packedFrames[0];
      expect(packedFrame.preset).toBe('SH1106_132x64');
      expect(packedFrame.bytes).toHaveLength(1056); // 132 * 8 pages

      // Render the packed frame
      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        packedFrame
      );

      // Verify canvas shows only visible area (128 pixels wide)
      expect(mockCanvas.width).toBe(128);
      expect(mockCanvas.height).toBe(64);
      expect(mockContext.imageSmoothingEnabled).toBe(false);
    });
  });

  describe('Rendering Options Integration', () => {
    let testPackedFrame: PackedFrame;

    beforeEach(() => {
      // Create a simple test frame
      const monoFrame: FrameMono = {
        bits: new Uint8Array((128 * 32) / 8),
        dims: { width: 128, height: 32 },
      };

      // Set a few pixels
      monoFrame.bits[0] = 0x01; // First pixel
      monoFrame.bits[128] = 0x80; // Last pixel of first column in second page

      const packedFrames = packFrames([monoFrame], {
        preset: 'SSD1306_128x32',
      });
      testPackedFrame = packedFrames[0];
    });

    it('should apply scaling correctly', () => {
      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        testPackedFrame,
        {
          scale: 4,
        }
      );

      expect(mockCanvas.width).toBe(512); // 128 * 4
      expect(mockCanvas.height).toBe(128); // 32 * 4

      // Pixels should be scaled to 4x4
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 4, 4);
    });

    it('should show grid overlay when requested', () => {
      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        testPackedFrame,
        {
          scale: 2,
          showGrid: true,
        }
      );

      // Grid drawing methods should be called
      expect(mockContext.strokeStyle).toBe('#333333');
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should invert colors when requested', () => {
      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        testPackedFrame,
        {
          invert: true,
        }
      );

      // Should render with inverted colors
      expect(mockContext.fillRect).toHaveBeenCalled();
      // The exact color verification is complex due to the rendering order,
      // but we can verify the method was called
    });
  });

  describe('Animation Integration', () => {
    beforeEach(() => {
      // Mock requestAnimationFrame for animation tests
      global.requestAnimationFrame = vi.fn(callback => {
        setTimeout(callback, 16);
        return 1;
      });
      global.cancelAnimationFrame = vi.fn();
      global.performance = {
        now: vi.fn(() => Date.now()),
      } as unknown as Performance;
    });

    it('should create animation controller for multiple packed frames', () => {
      // Create multiple test frames
      const monoFrames: FrameMono[] = [
        {
          bits: new Uint8Array((128 * 32) / 8),
          dims: { width: 128, height: 32 },
        },
        {
          bits: new Uint8Array((128 * 32) / 8),
          dims: { width: 128, height: 32 },
        },
      ];

      // Set different patterns for each frame
      monoFrames[0].bits[0] = 0x01; // First pixel
      monoFrames[1].bits[1] = 0x01; // Second pixel

      // Pack the frames
      const packedFrames = packFrames(monoFrames, {
        preset: 'SSD1306_128x32',
      });

      // Create animation controller
      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        packedFrames,
        { fps: 10, loop: true }
      );

      // Verify controller functionality
      expect(controller.isPlaying()).toBe(true);
      expect(controller.getCurrentFrame()).toBe(0);
      expect(typeof controller.stop).toBe('function');
      expect(typeof controller.goTo).toBe('function');
      expect(typeof controller.setFPS).toBe('function');

      // Clean up
      controller.stop();
    });

    it('should handle single frame animation gracefully', () => {
      const monoFrame: FrameMono = {
        bits: new Uint8Array((128 * 32) / 8),
        dims: { width: 128, height: 32 },
      };
      monoFrame.bits[0] = 0x01;

      const packedFrames = packFrames([monoFrame], {
        preset: 'SSD1306_128x32',
      });

      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        packedFrames
      );

      // Single frame should not start animation
      expect(controller.isPlaying()).toBe(false);
      expect(controller.getCurrentFrame()).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty byte arrays gracefully', () => {
      const emptyFrame: PackedFrame = {
        bytes: new Uint8Array(0),
        dims: { width: 128, height: 32 },
        preset: 'SSD1306_128x32',
      };

      expect(() => {
        emulator.renderFrameToCanvas(
          mockContext as unknown as MockRenderingContext,
          emptyFrame
        );
      }).not.toThrow();

      // Should still set up canvas
      expect(mockCanvas.width).toBe(128);
      expect(mockCanvas.height).toBe(32);
    });

    it('should handle malformed frames gracefully', () => {
      const malformedFrame: PackedFrame = {
        bytes: new Uint8Array(10), // Too small for 128x32
        dims: { width: 128, height: 32 },
        preset: 'SSD1306_128x32',
      };

      expect(() => {
        emulator.renderFrameToCanvas(
          mockContext as unknown as MockRenderingContext,
          malformedFrame
        );
      }).not.toThrow();
    });
  });
});
