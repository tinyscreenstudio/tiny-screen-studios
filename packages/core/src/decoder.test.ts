import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DefaultImageDecoder,
  decodeImageFiles,
  decodeAndValidateFiles,
} from './decoder.js';
import type { FrameRGBA, Dimensions } from './types.js';

// Mock createImageBitmap and OffscreenCanvas for testing
const mockCreateImageBitmap = vi.fn();
const mockOffscreenCanvas = vi.fn();
const mockGetContext = vi.fn();
const mockDrawImage = vi.fn();
const mockGetImageData = vi.fn();
const mockClose = vi.fn();

// Setup global mocks
global.createImageBitmap = mockCreateImageBitmap;
global.OffscreenCanvas = mockOffscreenCanvas;

describe('DefaultImageDecoder', () => {
  let decoder: DefaultImageDecoder;

  beforeEach(() => {
    decoder = new DefaultImageDecoder();
    vi.clearAllMocks();
  });

  describe('decodeImageFiles', () => {
    it('should throw error when no files provided', async () => {
      await expect(decoder.decodeImageFiles([])).rejects.toThrow(
        'No files provided for decoding'
      );
    });

    it('should decode a single PNG file successfully', async () => {
      // Mock file
      const mockFile = new File(['fake-png-data'], 'test.png', {
        type: 'image/png',
      });

      // Mock bitmap
      const mockBitmap = {
        width: 128,
        height: 32,
        close: mockClose,
      };

      // Mock canvas context and image data
      const mockImageData = {
        data: new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]), // 2 pixels: red, green
      };

      const mockContext = {
        drawImage: mockDrawImage,
        getImageData: mockGetImageData,
      };

      // Setup mocks
      mockCreateImageBitmap.mockResolvedValue(mockBitmap);
      mockOffscreenCanvas.mockReturnValue({
        getContext: mockGetContext,
      });
      mockGetContext.mockReturnValue(mockContext);
      mockGetImageData.mockReturnValue(mockImageData);

      const result = await decoder.decodeImageFiles([mockFile]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pixels: mockImageData.data,
        dims: { width: 128, height: 32 },
        delayMs: undefined,
      });

      expect(mockCreateImageBitmap).toHaveBeenCalledWith(mockFile);
      expect(mockDrawImage).toHaveBeenCalledWith(mockBitmap, 0, 0);
      expect(mockGetImageData).toHaveBeenCalledWith(0, 0, 128, 32);
      expect(mockClose).toHaveBeenCalled();
    });

    it('should extract delay from filename', async () => {
      const mockFile = new File(['fake-png-data'], 'frame_001_100ms.png', {
        type: 'image/png',
      });

      const mockBitmap = {
        width: 128,
        height: 32,
        close: mockClose,
      };

      const mockImageData = {
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      const mockContext = {
        drawImage: mockDrawImage,
        getImageData: mockGetImageData,
      };

      mockCreateImageBitmap.mockResolvedValue(mockBitmap);
      mockOffscreenCanvas.mockReturnValue({
        getContext: mockGetContext,
      });
      mockGetContext.mockReturnValue(mockContext);
      mockGetImageData.mockReturnValue(mockImageData);

      const result = await decoder.decodeImageFiles([mockFile]);

      expect(result[0].delayMs).toBe(100);
    });

    it('should reject unsupported file types', async () => {
      const mockFile = new File(['fake-data'], 'test.jpg', {
        type: 'image/jpeg',
      });

      await expect(decoder.decodeImageFiles([mockFile])).rejects.toThrow(
        'Failed to decode 1 of 1 files'
      );
    });

    it('should handle corrupt files gracefully', async () => {
      const mockFile = new File(['fake-png-data'], 'test.png', {
        type: 'image/png',
      });

      mockCreateImageBitmap.mockRejectedValue(new Error('Invalid image data'));

      await expect(decoder.decodeImageFiles([mockFile])).rejects.toThrow(
        'Failed to decode 1 of 1 files'
      );
    });

    it('should handle canvas context creation failure', async () => {
      const mockFile = new File(['fake-png-data'], 'test.png', {
        type: 'image/png',
      });

      const mockBitmap = {
        width: 128,
        height: 32,
        close: mockClose,
      };

      mockCreateImageBitmap.mockResolvedValue(mockBitmap);
      mockOffscreenCanvas.mockReturnValue({
        getContext: mockGetContext,
      });
      mockGetContext.mockReturnValue(null); // Simulate context creation failure

      await expect(decoder.decodeImageFiles([mockFile])).rejects.toThrow(
        'Failed to decode 1 of 1 files'
      );
    });

    it('should detect PNG files by extension when MIME type is missing', async () => {
      const mockFile = new File(['fake-png-data'], 'test.png', { type: '' });

      const mockBitmap = {
        width: 128,
        height: 32,
        close: mockClose,
      };

      const mockImageData = {
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      const mockContext = {
        drawImage: mockDrawImage,
        getImageData: mockGetImageData,
      };

      mockCreateImageBitmap.mockResolvedValue(mockBitmap);
      mockOffscreenCanvas.mockReturnValue({
        getContext: mockGetContext,
      });
      mockGetContext.mockReturnValue(mockContext);
      mockGetImageData.mockReturnValue(mockImageData);

      const result = await decoder.decodeImageFiles([mockFile]);

      expect(result).toHaveLength(1);
    });
  });

  describe('validateDimensions', () => {
    it('should validate frames with correct dimensions', () => {
      const frames: FrameRGBA[] = [
        {
          pixels: new Uint8ClampedArray([255, 0, 0, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([0, 255, 0, 255]),
          dims: { width: 128, height: 32 },
        },
      ];

      const expected: Dimensions = { width: 128, height: 32 };
      const result = decoder.validateDimensions(frames, expected);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect dimension mismatch', () => {
      const frames: FrameRGBA[] = [
        {
          pixels: new Uint8ClampedArray([255, 0, 0, 255]),
          dims: { width: 64, height: 32 }, // Wrong width
        },
      ];

      const expected: Dimensions = { width: 128, height: 32 };
      const result = decoder.validateDimensions(frames, expected);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('dimension_mismatch');
      expect(result.errors[0].message).toContain('Expected 128×32, got 64×32');
    });

    it('should detect inconsistent dimensions across frames', () => {
      const frames: FrameRGBA[] = [
        {
          pixels: new Uint8ClampedArray([255, 0, 0, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([0, 255, 0, 255]),
          dims: { width: 128, height: 64 }, // Different height
        },
      ];

      const expected: Dimensions = { width: 128, height: 32 };
      const result = decoder.validateDimensions(frames, expected);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2); // One for dimension mismatch, one for inconsistency
    });

    it('should handle empty frames array', () => {
      const result = decoder.validateDimensions([], { width: 128, height: 32 });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('invalid_parameters');
    });

    it('should handle frames with missing dimensions', () => {
      const frames = [
        {
          pixels: new Uint8ClampedArray([255, 0, 0, 255]),
          // Missing dims property
        },
      ] as FrameRGBA[];

      const result = decoder.validateDimensions(frames, {
        width: 128,
        height: 32,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain(
        'missing dimension information'
      );
    });
  });

  describe('orderFramesByFilename', () => {
    it('should order frames by numeric suffix', () => {
      const frames: FrameRGBA[] = [
        {
          pixels: new Uint8ClampedArray([255, 0, 0, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([0, 255, 0, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([0, 0, 255, 255]),
          dims: { width: 128, height: 32 },
        },
      ];

      const files = [
        new File([''], 'frame_003.png'),
        new File([''], 'frame_001.png'),
        new File([''], 'frame_002.png'),
      ];

      const result = decoder.orderFramesByFilename(frames, files);

      // Should be reordered: frame_001, frame_002, frame_003
      expect(result[0]).toBe(frames[1]); // frame_001 (originally index 1)
      expect(result[1]).toBe(frames[2]); // frame_002 (originally index 2)
      expect(result[2]).toBe(frames[0]); // frame_003 (originally index 0)
    });

    it('should handle different numeric patterns', () => {
      const frames: FrameRGBA[] = [
        {
          pixels: new Uint8ClampedArray([255, 0, 0, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([0, 255, 0, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([0, 0, 255, 255]),
          dims: { width: 128, height: 32 },
        },
      ];

      const files = [
        new File([''], 'sprite-10.png'),
        new File([''], 'sprite-5.png'),
        new File([''], 'sprite-7.png'),
      ];

      const result = decoder.orderFramesByFilename(frames, files);

      // Should be ordered: 5, 7, 10
      expect(result[0]).toBe(frames[1]); // sprite-5
      expect(result[1]).toBe(frames[2]); // sprite-7
      expect(result[2]).toBe(frames[0]); // sprite-10
    });

    it('should maintain original order for non-numeric filenames', () => {
      const frames: FrameRGBA[] = [
        {
          pixels: new Uint8ClampedArray([255, 0, 0, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([0, 255, 0, 255]),
          dims: { width: 128, height: 32 },
        },
      ];

      const files = [new File([''], 'first.png'), new File([''], 'second.png')];

      const result = decoder.orderFramesByFilename(frames, files);

      expect(result[0]).toBe(frames[0]);
      expect(result[1]).toBe(frames[1]);
    });

    it('should handle mixed numeric and non-numeric filenames', () => {
      const frames: FrameRGBA[] = [
        {
          pixels: new Uint8ClampedArray([255, 0, 0, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([0, 255, 0, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([0, 0, 255, 255]),
          dims: { width: 128, height: 32 },
        },
      ];

      const files = [
        new File([''], 'background.png'),
        new File([''], 'frame_001.png'),
        new File([''], 'frame_002.png'),
      ];

      const result = decoder.orderFramesByFilename(frames, files);

      // Numeric files should come first, then non-numeric in original order
      expect(result[0]).toBe(frames[1]); // frame_001
      expect(result[1]).toBe(frames[2]); // frame_002
      expect(result[2]).toBe(frames[0]); // background
    });

    it('should handle single frame', () => {
      const frames: FrameRGBA[] = [
        {
          pixels: new Uint8ClampedArray([255, 0, 0, 255]),
          dims: { width: 128, height: 32 },
        },
      ];

      const files = [new File([''], 'single.png')];

      const result = decoder.orderFramesByFilename(frames, files);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(frames[0]);
    });

    it('should throw error when frame and file counts mismatch', () => {
      const frames: FrameRGBA[] = [
        {
          pixels: new Uint8ClampedArray([255, 0, 0, 255]),
          dims: { width: 128, height: 32 },
        },
      ];

      const files = [
        new File([''], 'frame1.png'),
        new File([''], 'frame2.png'),
      ];

      expect(() => decoder.orderFramesByFilename(frames, files)).toThrow(
        'Frame count (1) does not match file count (2)'
      );
    });
  });

  describe('extractNumericIndex (private method testing via orderFramesByFilename)', () => {
    it('should extract numeric indices from various filename patterns', () => {
      const frames: FrameRGBA[] = [
        {
          pixels: new Uint8ClampedArray([255, 0, 0, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([0, 255, 0, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([0, 0, 255, 255]),
          dims: { width: 128, height: 32 },
        },
        {
          pixels: new Uint8ClampedArray([255, 255, 0, 255]),
          dims: { width: 128, height: 32 },
        },
      ];

      const files = [
        new File([''], 'image42.png'), // Ends with digits
        new File([''], 'frame_001.png'), // Underscore + digits
        new File([''], 'sprite-05.png'), // Dash + digits
        new File([''], 'test.007.png'), // Dot + digits
      ];

      const result = decoder.orderFramesByFilename(frames, files);

      // Should be ordered: 1, 5, 7, 42
      expect(result[0]).toBe(frames[1]); // frame_001 (index 1)
      expect(result[1]).toBe(frames[2]); // sprite-05 (index 5)
      expect(result[2]).toBe(frames[3]); // test.007 (index 7)
      expect(result[3]).toBe(frames[0]); // image42 (index 42)
    });
  });

  describe('extractDelayFromFilename (private method testing via decodeImageFiles)', () => {
    it('should extract delay from filename with ms suffix', async () => {
      const mockFile = new File(['fake-png-data'], 'animation_001_250ms.png', {
        type: 'image/png',
      });

      const mockBitmap = {
        width: 128,
        height: 32,
        close: mockClose,
      };

      const mockImageData = {
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      const mockContext = {
        drawImage: mockDrawImage,
        getImageData: mockGetImageData,
      };

      mockCreateImageBitmap.mockResolvedValue(mockBitmap);
      mockOffscreenCanvas.mockReturnValue({
        getContext: mockGetContext,
      });
      mockGetContext.mockReturnValue(mockContext);
      mockGetImageData.mockReturnValue(mockImageData);

      const result = await decoder.decodeImageFiles([mockFile]);

      expect(result[0].delayMs).toBe(250);
    });
  });
});

describe('convenience functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('decodeImageFiles', () => {
    it('should create decoder instance and decode files', async () => {
      const mockFile = new File(['fake-png-data'], 'test.png', {
        type: 'image/png',
      });

      const mockBitmap = {
        width: 128,
        height: 32,
        close: mockClose,
      };

      const mockImageData = {
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      const mockContext = {
        drawImage: mockDrawImage,
        getImageData: mockGetImageData,
      };

      mockCreateImageBitmap.mockResolvedValue(mockBitmap);
      mockOffscreenCanvas.mockReturnValue({
        getContext: mockGetContext,
      });
      mockGetContext.mockReturnValue(mockContext);
      mockGetImageData.mockReturnValue(mockImageData);

      const result = await decodeImageFiles([mockFile]);

      expect(result).toHaveLength(1);
      expect(result[0].dims).toEqual({ width: 128, height: 32 });
    });
  });

  describe('decodeAndValidateFiles', () => {
    it('should decode, order, and validate files against preset', async () => {
      const mockFiles = [
        new File(['fake-png-data'], 'frame_002.png', { type: 'image/png' }),
        new File(['fake-png-data'], 'frame_001.png', { type: 'image/png' }),
      ];

      const mockBitmap = {
        width: 128,
        height: 32,
        close: mockClose,
      };

      const mockImageData = {
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      const mockContext = {
        drawImage: mockDrawImage,
        getImageData: mockGetImageData,
      };

      mockCreateImageBitmap.mockResolvedValue(mockBitmap);
      mockOffscreenCanvas.mockReturnValue({
        getContext: mockGetContext,
      });
      mockGetContext.mockReturnValue(mockContext);
      mockGetImageData.mockReturnValue(mockImageData);

      const result = await decodeAndValidateFiles(mockFiles, 'SSD1306_128x32');

      expect(result.frames).toHaveLength(2);
      expect(result.validation.isValid).toBe(true);

      // Frames should be ordered by filename (frame_001 first, then frame_002)
      // We can't directly test the ordering without more complex mocking,
      // but we can verify the function completes successfully
    });

    it('should return validation errors for wrong dimensions', async () => {
      const mockFile = new File(['fake-png-data'], 'test.png', {
        type: 'image/png',
      });

      const mockBitmap = {
        width: 64, // Wrong width for SSD1306_128x32
        height: 32,
        close: mockClose,
      };

      const mockImageData = {
        data: new Uint8ClampedArray([255, 0, 0, 255]),
      };

      const mockContext = {
        drawImage: mockDrawImage,
        getImageData: mockGetImageData,
      };

      mockCreateImageBitmap.mockResolvedValue(mockBitmap);
      mockOffscreenCanvas.mockReturnValue({
        getContext: mockGetContext,
      });
      mockGetContext.mockReturnValue(mockContext);
      mockGetImageData.mockReturnValue(mockImageData);

      const result = await decodeAndValidateFiles([mockFile], 'SSD1306_128x32');

      expect(result.frames).toHaveLength(1);
      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors).toHaveLength(1);
      expect(result.validation.errors[0].type).toBe('dimension_mismatch');
    });
  });
});
