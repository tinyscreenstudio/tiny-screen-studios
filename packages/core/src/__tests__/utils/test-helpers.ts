/**
 * Test utilities for frame creation and comparison
 */

import type {
  FrameRGBA,
  FrameMono,
  PackedFrame,
  DevicePreset,
} from '../../types/index.js';

/**
 * Create a test RGBA frame with specific pixels set
 */
export function createTestFrameRGBA(
  width: number,
  height: number,
  setPixels: Array<{
    x: number;
    y: number;
    r?: number;
    g?: number;
    b?: number;
    a?: number;
  }> = [],
  delayMs?: number
): FrameRGBA {
  const pixels = new Uint8ClampedArray(width * height * 4);

  // Fill with transparent black by default
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 0; // R
    pixels[i + 1] = 0; // G
    pixels[i + 2] = 0; // B
    pixels[i + 3] = 0; // A
  }

  // Set specified pixels
  for (const pixel of setPixels) {
    const pixelIndex = (pixel.y * width + pixel.x) * 4;
    pixels[pixelIndex] = pixel.r ?? 255; // R
    pixels[pixelIndex + 1] = pixel.g ?? 255; // G
    pixels[pixelIndex + 2] = pixel.b ?? 255; // B
    pixels[pixelIndex + 3] = pixel.a ?? 255; // A
  }

  const frame: FrameRGBA = {
    pixels,
    dims: { width, height },
  };

  if (delayMs !== undefined) {
    frame.delayMs = delayMs;
  }

  return frame;
}

/**
 * Create a test monochrome frame with specific pixels set
 */
export function createTestFrameMono(
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
    if (byteIndex < bits.length && bits[byteIndex] !== undefined) {
      bits[byteIndex] |= 1 << bitPosition;
    }
  }

  return {
    bits,
    dims: { width, height },
  };
}

/**
 * Create a test packed frame
 */
export function createTestPackedFrame(
  preset: DevicePreset,
  bytes: Uint8Array,
  delayMs?: number
): PackedFrame {
  const presetConfigs = {
    SSD1306_128x32: { width: 128, height: 32 },
    SSD1306_128x64: { width: 128, height: 64 },
    SH1106_132x64: { width: 132, height: 64 },
  };

  const config = presetConfigs[preset];

  const frame: PackedFrame = {
    bytes,
    dims: config,
    preset,
  };

  if (delayMs !== undefined) {
    frame.delayMs = delayMs;
  }

  return frame;
}

/**
 * Generate a checkerboard pattern for testing
 */
export function createCheckerboardRGBA(
  width: number,
  height: number,
  squareSize: number = 8
): FrameRGBA {
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4;
      const squareX = Math.floor(x / squareSize);
      const squareY = Math.floor(y / squareSize);
      const isWhite = (squareX + squareY) % 2 === 0;

      const value = isWhite ? 255 : 0;
      pixels[pixelIndex] = value; // R
      pixels[pixelIndex + 1] = value; // G
      pixels[pixelIndex + 2] = value; // B
      pixels[pixelIndex + 3] = 255; // A
    }
  }

  return {
    pixels,
    dims: { width, height },
  };
}

/**
 * Generate a gradient pattern for testing
 */
export function createGradientRGBA(
  width: number,
  height: number,
  direction: 'horizontal' | 'vertical' = 'horizontal'
): FrameRGBA {
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4;

      let value: number;
      if (direction === 'horizontal') {
        value = Math.floor((x / (width - 1)) * 255);
      } else {
        value = Math.floor((y / (height - 1)) * 255);
      }

      pixels[pixelIndex] = value; // R
      pixels[pixelIndex + 1] = value; // G
      pixels[pixelIndex + 2] = value; // B
      pixels[pixelIndex + 3] = 255; // A
    }
  }

  return {
    pixels,
    dims: { width, height },
  };
}

/**
 * Create a solid color frame
 */
export function createSolidColorRGBA(
  width: number,
  height: number,
  r: number = 255,
  g: number = 255,
  b: number = 255,
  a: number = 255
): FrameRGBA {
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = r; // R
    pixels[i + 1] = g; // G
    pixels[i + 2] = b; // B
    pixels[i + 3] = a; // A
  }

  return {
    pixels,
    dims: { width, height },
  };
}

/**
 * Compare two byte arrays with detailed error reporting
 */
export function compareBytes(
  actual: Uint8Array,
  expected: Uint8Array,
  context: string = ''
): {
  isEqual: boolean;
  differences: Array<{ index: number; actual: number; expected: number }>;
} {
  const differences: Array<{
    index: number;
    actual: number;
    expected: number;
  }> = [];

  if (actual.length !== expected.length) {
    throw new Error(
      `${context} Length mismatch: actual ${actual.length}, expected ${expected.length}`
    );
  }

  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      differences.push({
        index: i,
        actual: actual[i]!,
        expected: expected[i]!,
      });
    }
  }

  return {
    isEqual: differences.length === 0,
    differences,
  };
} /**

 * Create a File object for testing (simulates browser File API)
 */
export function createTestFile(
  name: string,
  content: Uint8Array,
  type: string = 'image/png'
): File {
  const blob = new Blob([new Uint8Array(content)], { type });
  return new File([blob], name, { type });
}

/**
 * Generate test PNG data (minimal valid PNG)
 */
export function createMinimalPNG(width: number, height: number): Uint8Array {
  // This creates a minimal valid PNG with transparent pixels
  // In a real implementation, you'd use a proper PNG encoder
  // For testing, we'll create a simple pattern that can be recognized

  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = createPNGChunk(
    'IHDR',
    new Uint8Array([
      // Width (4 bytes, big-endian)
      (width >> 24) & 0xff,
      (width >> 16) & 0xff,
      (width >> 8) & 0xff,
      width & 0xff,
      // Height (4 bytes, big-endian)
      (height >> 24) & 0xff,
      (height >> 16) & 0xff,
      (height >> 8) & 0xff,
      height & 0xff,
      // Bit depth, color type, compression, filter, interlace
      8,
      6,
      0,
      0,
      0,
    ])
  );

  // Minimal IDAT chunk (compressed image data)
  const idat = createPNGChunk(
    'IDAT',
    new Uint8Array([120, 156, 99, 96, 0, 0, 0, 2, 0, 1])
  );

  const iend = createPNGChunk('IEND', new Uint8Array([]));

  const totalLength =
    signature.length + ihdr.length + idat.length + iend.length;
  const result = new Uint8Array(totalLength);

  let offset = 0;
  result.set(signature, offset);
  offset += signature.length;
  result.set(ihdr, offset);
  offset += ihdr.length;
  result.set(idat, offset);
  offset += idat.length;
  result.set(iend, offset);

  return result;
}

function createPNGChunk(type: string, data: Uint8Array): Uint8Array {
  const length = data.length;
  const chunk = new Uint8Array(12 + length);

  // Length (4 bytes, big-endian)
  chunk[0] = (length >> 24) & 0xff;
  chunk[1] = (length >> 16) & 0xff;
  chunk[2] = (length >> 8) & 0xff;
  chunk[3] = length & 0xff;

  // Type (4 bytes)
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }

  // Data
  chunk.set(data, 8);

  // CRC (4 bytes) - simplified for testing
  const crc = calculateCRC32(chunk.slice(4, 8 + length));
  chunk[8 + length] = (crc >> 24) & 0xff;
  chunk[9 + length] = (crc >> 16) & 0xff;
  chunk[10 + length] = (crc >> 8) & 0xff;
  chunk[11 + length] = crc & 0xff;

  return chunk;
}

function calculateCRC32(data: Uint8Array): number {
  // Simplified CRC32 for testing - in real implementation use proper CRC32
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]!;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return ~crc >>> 0;
}
