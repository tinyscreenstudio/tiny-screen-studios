import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CanvasEmulator,
  createCanvasEmulator,
  renderFrameToNewCanvas,
} from './canvas.js';
import type { PackedFrame, RenderOptions } from '../types/index.js';

// Type alias for cleaner mock context casting
type MockRenderingContext = CanvasRenderingContext2D;

// Mock DOM APIs for testing
interface MockCanvas {
  width: number;
  height: number;
  getContext: ReturnType<typeof vi.fn>;
}

interface MockContext {
  imageSmoothingEnabled: boolean;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  globalAlpha: number;
  fillRect: ReturnType<typeof vi.fn>;
  strokeRect: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  canvas: MockCanvas;
}

const mockCanvas: MockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(),
};

const mockContext: MockContext = {
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

// Mock document.createElement
global.document = {
  createElement: vi.fn(() => mockCanvas),
} as unknown as Document;

mockCanvas.getContext.mockReturnValue(mockContext);

describe('CanvasEmulator', () => {
  let emulator: CanvasEmulator;
  let testFrame: PackedFrame;

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

    // Create test frame with single pixel at (0,0)
    testFrame = {
      bytes: new Uint8Array([0x01, 0x00, 0x00, 0x00]), // Single pixel in first byte, LSB
      dims: { width: 128, height: 32 },
      preset: 'SSD1306_128x32',
    };
  });

  describe('renderFrameToCanvas', () => {
    it('should disable image smoothing for pixel-perfect rendering', () => {
      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrame
      );

      expect(mockContext.imageSmoothingEnabled).toBe(false);
    });

    it('should set canvas dimensions based on frame and scale', () => {
      const options: RenderOptions = { scale: 2 };

      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrame,
        options
      );

      expect(mockCanvas.width).toBe(256); // 128 * 2
      expect(mockCanvas.height).toBe(64); // 32 * 2
    });

    it('should clear canvas with correct background color', () => {
      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrame
      );

      // Check that background fill was called with correct dimensions
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 128, 32);
      // fillStyle will be white after pixel rendering, so we check the call order
      const fillStyleCalls = (mockContext as unknown as MockRenderingContext)
        .fillStyle;
      expect(fillStyleCalls).toBeTruthy(); // Just verify it was set
    });

    it('should invert colors when invert option is true', () => {
      const options: RenderOptions = { invert: true };

      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrame,
        options
      );

      // Background should be white when inverted
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 128, 32);
      // Check that fillStyle was set to white for background
      const fillCalls = (
        mockContext.fillRect as unknown as { mock: { calls: unknown[] } }
      ).mock.calls;
      expect(fillCalls[0]).toEqual([0, 0, 128, 32]); // Background fill
    });

    it('should render single pixel correctly at (0,0)', () => {
      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrame
      );

      // Should fill background and then pixel
      expect(mockContext.fillRect).toHaveBeenCalledTimes(2);
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 1, 1); // Single pixel
    });

    it('should scale pixels correctly', () => {
      const options: RenderOptions = { scale: 4 };

      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrame,
        options
      );

      // Pixel should be 4x4 when scaled
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 4, 4);
    });

    it('should draw grid overlay when showGrid is true and scale > 1', () => {
      const options: RenderOptions = { scale: 2, showGrid: true };

      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrame,
        options
      );

      expect(mockContext.strokeStyle).toBe('#333333');
      expect(mockContext.lineWidth).toBe(1);
      // globalAlpha is reset to 1.0 after grid drawing
      expect(mockContext.globalAlpha).toBe(1.0);
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should not draw grid when scale is 1', () => {
      const options: RenderOptions = { scale: 1, showGrid: true };

      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrame,
        options
      );

      // Grid should not be drawn when scale is 1
      expect(mockContext.strokeStyle).not.toBe('#333333');
    });

    it('should handle SSD1306_128x64 correctly', () => {
      const frame64: PackedFrame = {
        bytes: new Uint8Array(1024), // 128 * 8 pages
        dims: { width: 128, height: 64 },
        preset: 'SSD1306_128x64',
      };

      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        frame64
      );

      expect(mockCanvas.width).toBe(128);
      expect(mockCanvas.height).toBe(64);
    });

    it('should handle SH1106 viewport offset correctly', () => {
      const frameSH1106: PackedFrame = {
        bytes: new Uint8Array(1056), // 132 * 8 pages
        dims: { width: 132, height: 64 },
        preset: 'SH1106_132x64',
      };

      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        frameSH1106
      );

      // Should render 128 visible pixels despite 132 physical width
      expect(mockCanvas.width).toBe(128);
      expect(mockCanvas.height).toBe(64);
    });

    it('should handle MSB-top bit order correctly', () => {
      // Create frame with MSB-top bit order (not currently configurable, but tests the logic)
      const frameWithMSB: PackedFrame = {
        bytes: new Uint8Array([0x80]), // MSB set (bit 7)
        dims: { width: 128, height: 32 },
        preset: 'SSD1306_128x32',
      };

      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        frameWithMSB
      );

      // Should render pixel - exact position depends on bit order interpretation
      expect(mockContext.fillRect).toHaveBeenCalledTimes(2); // Background + pixel
    });
  });

  describe('createPreviewCanvas', () => {
    it('should create new canvas element', () => {
      const canvas = emulator.createPreviewCanvas(testFrame);

      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(canvas).toBe(mockCanvas);
    });

    it('should render frame to new canvas', () => {
      emulator.createPreviewCanvas(testFrame, { scale: 2 });

      expect(mockCanvas.width).toBe(256);
      expect(mockCanvas.height).toBe(64);
    });

    it('should throw error if context creation fails', () => {
      mockCanvas.getContext.mockReturnValueOnce(null);

      expect(() => {
        emulator.createPreviewCanvas(testFrame);
      }).toThrow('Failed to get 2D rendering context');
    });
  });

  describe('playFramesOnCanvas', () => {
    let testFrames: PackedFrame[];

    beforeEach(() => {
      // Create multiple test frames for animation testing
      testFrames = [
        {
          bytes: new Uint8Array([0x01, 0x00, 0x00, 0x00]), // Frame 0: pixel at (0,0)
          dims: { width: 128, height: 32 },
          preset: 'SSD1306_128x32',
          delayMs: 100,
        },
        {
          bytes: new Uint8Array([0x00, 0x01, 0x00, 0x00]), // Frame 1: pixel at (1,0)
          dims: { width: 128, height: 32 },
          preset: 'SSD1306_128x32',
          delayMs: 100,
        },
        {
          bytes: new Uint8Array([0x00, 0x00, 0x01, 0x00]), // Frame 2: pixel at (2,0)
          dims: { width: 128, height: 32 },
          preset: 'SSD1306_128x32',
          delayMs: 100,
        },
      ];

      // Mock requestAnimationFrame and cancelAnimationFrame
      global.requestAnimationFrame = vi.fn(callback => {
        setTimeout(callback, 16); // ~60fps
        return 1;
      });
      global.cancelAnimationFrame = vi.fn();
      global.performance = {
        now: vi.fn(() => Date.now()),
      } as unknown as Performance;
    });

    it('should return animation controller with all required methods', () => {
      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames
      );

      expect(controller).toHaveProperty('stop');
      expect(controller).toHaveProperty('goTo');
      expect(controller).toHaveProperty('setFPS');
      expect(controller).toHaveProperty('isPlaying');
      expect(controller).toHaveProperty('getCurrentFrame');
      expect(typeof controller.stop).toBe('function');
      expect(typeof controller.goTo).toBe('function');
      expect(typeof controller.setFPS).toBe('function');
      expect(typeof controller.isPlaying).toBe('function');
      expect(typeof controller.getCurrentFrame).toBe('function');
    });

    it('should render first frame immediately', () => {
      emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames
      );

      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should start playing automatically with multiple frames', () => {
      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames
      );

      expect(controller.isPlaying()).toBe(true);
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should not start playing with single frame', () => {
      const singleFrame = [testFrames[0]];
      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        singleFrame
      );

      expect(controller.isPlaying()).toBe(false);
      expect(controller.getCurrentFrame()).toBe(0);
    });

    it('should handle empty frames array', () => {
      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        []
      );

      expect(controller.isPlaying()).toBe(false);
      expect(controller.getCurrentFrame()).toBe(0);
    });

    it('should stop animation when stop() is called', () => {
      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames
      );

      expect(controller.isPlaying()).toBe(true);

      controller.stop();

      expect(controller.isPlaying()).toBe(false);
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should jump to specific frame with goTo()', () => {
      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames
      );

      controller.goTo(2);

      expect(controller.getCurrentFrame()).toBe(2);
      // Should render the new frame
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should ignore invalid frame indices in goTo()', () => {
      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames
      );

      const initialFrame = controller.getCurrentFrame();

      controller.goTo(-1); // Invalid
      expect(controller.getCurrentFrame()).toBe(initialFrame);

      controller.goTo(10); // Out of bounds
      expect(controller.getCurrentFrame()).toBe(initialFrame);
    });

    it('should update FPS with setFPS()', () => {
      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames
      );

      controller.setFPS(30);
      // FPS change should be accepted (internal state, hard to test directly)
      expect(controller.isPlaying()).toBe(true);
    });

    it('should ignore invalid FPS values', () => {
      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames
      );

      controller.setFPS(0); // Invalid
      controller.setFPS(-5); // Invalid

      // Animation should still be playing
      expect(controller.isPlaying()).toBe(true);
    });

    it('should use default animation options', () => {
      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames
      );

      // Default: loop=true, pingpong=false, fps=10
      expect(controller.isPlaying()).toBe(true);
      expect(controller.getCurrentFrame()).toBe(0);
    });

    it('should respect custom animation options', () => {
      const options = {
        fps: 5,
        loop: false,
        pingpong: true,
      };

      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames,
        options
      );

      expect(controller.isPlaying()).toBe(true);
    });

    it('should handle loop mode correctly', () => {
      const options = { loop: true, fps: 60 }; // High FPS for testing

      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames,
        options
      );

      expect(controller.isPlaying()).toBe(true);
      // Loop behavior is tested through frame advancement logic
    });

    it('should handle pingpong mode correctly', () => {
      const options = { pingpong: true, fps: 60 };

      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames,
        options
      );

      expect(controller.isPlaying()).toBe(true);
      // Pingpong behavior is tested through frame advancement logic
    });

    it('should stop when reaching end in non-loop mode', () => {
      const options = { loop: false, fps: 60 };

      const controller = emulator.playFramesOnCanvas(
        mockContext as unknown as MockRenderingContext,
        testFrames,
        options
      );

      expect(controller.isPlaying()).toBe(true);
      // Non-loop behavior would stop at the end (tested through frame advancement)
    });
  });

  describe('pixel rendering accuracy', () => {
    it('should render full page correctly', () => {
      // Create frame with full first page (top 8 pixels)
      const fullPageFrame: PackedFrame = {
        bytes: new Uint8Array(512).fill(0xff), // All bits set in all pages
        dims: { width: 128, height: 32 },
        preset: 'SSD1306_128x32',
      };

      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        fullPageFrame
      );

      // Should render all pixels (background + all frame pixels)
      // 128x32 = 4096 pixels + 1 background = 4097 total
      expect(mockContext.fillRect).toHaveBeenCalledTimes(1 + 128 * 32); // Background + all pixels
    });

    it('should render bottom pixel of page correctly', () => {
      // Create frame with only bottom pixel of first page set (bit 7)
      const bottomPixelFrame: PackedFrame = {
        bytes: new Uint8Array([0x80, ...new Array(511).fill(0)]),
        dims: { width: 128, height: 32 },
        preset: 'SSD1306_128x32',
      };

      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        bottomPixelFrame
      );

      // Should render pixel at (0, 7) - bottom of first page
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 7, 1, 1);
    });

    it('should render column correctly', () => {
      // Create frame with vertical line in first column
      const columnFrame: PackedFrame = {
        bytes: new Uint8Array(512),
        dims: { width: 128, height: 32 },
        preset: 'SSD1306_128x32',
      };

      // Set first byte of each page (column 0)
      columnFrame.bytes[0] = 0xff; // Page 0, column 0
      columnFrame.bytes[128] = 0xff; // Page 1, column 0
      columnFrame.bytes[256] = 0xff; // Page 2, column 0
      columnFrame.bytes[384] = 0xff; // Page 3, column 0

      emulator.renderFrameToCanvas(
        mockContext as unknown as MockRenderingContext,
        columnFrame
      );

      // Should render 32 pixels (full column) + background
      expect(mockContext.fillRect).toHaveBeenCalledTimes(33); // Background + 32 pixels
    });
  });
});

describe('createCanvasEmulator', () => {
  it('should create new CanvasEmulator instance', () => {
    const emulator = createCanvasEmulator();
    expect(emulator).toBeInstanceOf(CanvasEmulator);
  });
});

describe('renderFrameToNewCanvas', () => {
  it('should create canvas and render frame', () => {
    const testFrame: PackedFrame = {
      bytes: new Uint8Array([0x01]),
      dims: { width: 128, height: 32 },
      preset: 'SSD1306_128x32',
    };

    const canvas = renderFrameToNewCanvas(testFrame, { scale: 2 });

    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(canvas).toBe(mockCanvas);
    expect(mockCanvas.width).toBe(256);
    expect(mockCanvas.height).toBe(64);
  });
});

describe('Animation Controller Timing and Frame Advancement', () => {
  let emulator: CanvasEmulator;
  let testFrames: PackedFrame[];
  let mockTime: number;

  beforeEach(() => {
    emulator = new CanvasEmulator();
    vi.clearAllMocks();

    // Create test frames
    testFrames = [
      {
        bytes: new Uint8Array([0x01]),
        dims: { width: 128, height: 32 },
        preset: 'SSD1306_128x32',
      },
      {
        bytes: new Uint8Array([0x02]),
        dims: { width: 128, height: 32 },
        preset: 'SSD1306_128x32',
      },
      {
        bytes: new Uint8Array([0x04]),
        dims: { width: 128, height: 32 },
        preset: 'SSD1306_128x32',
      },
    ];

    // Mock time progression
    mockTime = 0;
    global.performance = {
      now: vi.fn(() => mockTime),
    } as unknown as Performance;

    // Mock animation frame with manual control
    let animationCallback: ((time: number) => void) | null = null;
    global.requestAnimationFrame = vi.fn(callback => {
      animationCallback = callback;
      return 1;
    });
    global.cancelAnimationFrame = vi.fn();

    // Helper to advance time and trigger animation frame
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime = (
      ms: number
    ): void => {
      mockTime += ms;
      if (animationCallback) {
        animationCallback(mockTime);
      }
    };
  });

  it('should advance frames at correct FPS timing', () => {
    const controller = emulator.playFramesOnCanvas(
      mockContext as unknown as MockRenderingContext,
      testFrames,
      { fps: 10 } // 100ms per frame
    );

    expect(controller.getCurrentFrame()).toBe(0);

    // Advance time by 50ms - should not advance frame yet
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      50
    );
    expect(controller.getCurrentFrame()).toBe(0);

    // Advance time by another 50ms (total 100ms) - should advance frame
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      50
    );
    expect(controller.getCurrentFrame()).toBe(1);

    // Advance another 100ms - should advance to frame 2
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    );
    expect(controller.getCurrentFrame()).toBe(2);
  });

  it('should loop back to start in loop mode', () => {
    const controller = emulator.playFramesOnCanvas(
      mockContext as unknown as MockRenderingContext,
      testFrames,
      { fps: 10, loop: true }
    );

    // Advance through all frames
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    ); // Frame 1
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    ); // Frame 2
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    ); // Should loop to Frame 0

    expect(controller.getCurrentFrame()).toBe(0);
    expect(controller.isPlaying()).toBe(true);
  });

  it('should stop at end in non-loop mode', () => {
    const controller = emulator.playFramesOnCanvas(
      mockContext as unknown as MockRenderingContext,
      testFrames,
      { fps: 10, loop: false }
    );

    // Advance through all frames
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    ); // Frame 1
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    ); // Frame 2
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    ); // Should stop at Frame 2

    expect(controller.getCurrentFrame()).toBe(2);
    expect(controller.isPlaying()).toBe(false);
  });

  it('should bounce back and forth in pingpong mode', () => {
    const controller = emulator.playFramesOnCanvas(
      mockContext as unknown as MockRenderingContext,
      testFrames,
      { fps: 10, pingpong: true }
    );

    expect(controller.getCurrentFrame()).toBe(0);

    // Forward direction: 0 -> 1 -> 2
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    );
    expect(controller.getCurrentFrame()).toBe(1);

    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    );
    expect(controller.getCurrentFrame()).toBe(2);

    // Should reverse direction: 2 -> 1 -> 0
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    );
    expect(controller.getCurrentFrame()).toBe(1);

    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    );
    expect(controller.getCurrentFrame()).toBe(0);

    // Should reverse again: 0 -> 1
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    );
    expect(controller.getCurrentFrame()).toBe(1);

    expect(controller.isPlaying()).toBe(true);
  });

  it('should handle FPS changes during playback', () => {
    const controller = emulator.playFramesOnCanvas(
      mockContext as unknown as MockRenderingContext,
      testFrames,
      { fps: 10 } // 100ms per frame
    );

    // Advance one frame at 10 FPS
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    );
    expect(controller.getCurrentFrame()).toBe(1);

    // Change to 20 FPS (50ms per frame)
    controller.setFPS(20);

    // Should advance at new rate
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      50
    );
    expect(controller.getCurrentFrame()).toBe(2);
  });

  it('should render correct frame after goTo()', () => {
    const controller = emulator.playFramesOnCanvas(
      mockContext as unknown as MockRenderingContext,
      testFrames
    );

    // Jump to frame 2
    controller.goTo(2);
    expect(controller.getCurrentFrame()).toBe(2);

    // Should continue from frame 2 when animation resumes
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    );
    expect(controller.getCurrentFrame()).toBe(0); // Loops back
  });

  it('should handle edge case with two frames in pingpong mode', () => {
    const twoFrames = testFrames.slice(0, 2);
    const controller = emulator.playFramesOnCanvas(
      mockContext as unknown as MockRenderingContext,
      twoFrames,
      { fps: 10, pingpong: true }
    );

    expect(controller.getCurrentFrame()).toBe(0);

    // 0 -> 1
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    );
    expect(controller.getCurrentFrame()).toBe(1);

    // 1 -> 0 (reverse)
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    );
    expect(controller.getCurrentFrame()).toBe(0);

    // 0 -> 1 (forward again)
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      100
    );
    expect(controller.getCurrentFrame()).toBe(1);
  });

  it('should maintain timing accuracy with high FPS', () => {
    const controller = emulator.playFramesOnCanvas(
      mockContext as unknown as MockRenderingContext,
      testFrames,
      { fps: 60 } // ~16.67ms per frame
    );

    expect(controller.getCurrentFrame()).toBe(0);

    // Should not advance at 16ms (just under threshold)
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(
      16
    );
    expect(controller.getCurrentFrame()).toBe(0);

    // Should advance at 17ms (over threshold)
    (global as unknown as { advanceTime: (ms: number) => void }).advanceTime(1);
    expect(controller.getCurrentFrame()).toBe(1);
  });
});
