/**
 * Golden fixture utilities for regression testing
 */

import type {
  DevicePreset,
  PackingOptions,
  MonochromeOptions,
  FrameMono,
  PackedFrame,
} from '../../types/index.js';

export interface GoldenFixture {
  name: string;
  description: string;
  input: {
    dimensions: { width: number; height: number };
    preset: DevicePreset;
    packingOptions?: Partial<PackingOptions>;
    monochromeOptions?: Partial<MonochromeOptions>;
    rgbaData?: Uint8ClampedArray;
    monoData?: Uint8Array;
  };
  expected: {
    packedBytes: Uint8Array;
    metadata?: {
      byteCount: number;
      pageCount: number;
      checksum?: string;
    };
  };
}

/**
 * Golden fixtures for SSD1306 128x32 display
 */
export const SSD1306_128x32_FIXTURES: GoldenFixture[] = [
  {
    name: 'single_pixel_top_left',
    description: 'Single pixel at (0,0) - top-left corner',
    input: {
      dimensions: { width: 128, height: 32 },
      preset: 'SSD1306_128x32',
    },
    expected: {
      packedBytes: (() => {
        const bytes = new Uint8Array(512);
        bytes[0] = 0x01; // First byte, LSB set
        return bytes;
      })(),
      metadata: {
        byteCount: 512,
        pageCount: 4,
      },
    },
  },
  {
    name: 'single_pixel_bottom_right',
    description: 'Single pixel at (127,31) - bottom-right corner',
    input: {
      dimensions: { width: 128, height: 32 },
      preset: 'SSD1306_128x32',
    },
    expected: {
      packedBytes: (() => {
        const bytes = new Uint8Array(512);
        bytes[511] = 0x80; // Last byte, MSB set (bottom of page 3)
        return bytes;
      })(),
      metadata: {
        byteCount: 512,
        pageCount: 4,
      },
    },
  },
  {
    name: 'top_page_fill',
    description: 'Fill entire top page (y=0 to y=7)',
    input: {
      dimensions: { width: 128, height: 32 },
      preset: 'SSD1306_128x32',
    },
    expected: {
      packedBytes: (() => {
        const bytes = new Uint8Array(512);
        // Fill first 128 bytes (page 0) with 0xFF
        for (let i = 0; i < 128; i++) {
          bytes[i] = 0xff;
        }
        return bytes;
      })(),
      metadata: {
        byteCount: 512,
        pageCount: 4,
      },
    },
  },
  {
    name: 'left_column_fill',
    description: 'Fill entire left column (x=0)',
    input: {
      dimensions: { width: 128, height: 32 },
      preset: 'SSD1306_128x32',
    },
    expected: {
      packedBytes: (() => {
        const bytes = new Uint8Array(512);
        // Fill first byte of each page
        for (let page = 0; page < 4; page++) {
          bytes[page * 128] = 0xff;
        }
        return bytes;
      })(),
      metadata: {
        byteCount: 512,
        pageCount: 4,
      },
    },
  },
  {
    name: 'checkerboard_8x8',
    description: '8x8 checkerboard pattern',
    input: {
      dimensions: { width: 128, height: 32 },
      preset: 'SSD1306_128x32',
    },
    expected: {
      packedBytes: (() => {
        const bytes = new Uint8Array(512);
        // Generate checkerboard pattern
        for (let page = 0; page < 4; page++) {
          for (let col = 0; col < 128; col++) {
            let byte = 0;
            for (let bit = 0; bit < 8; bit++) {
              const y = page * 8 + bit;
              const x = col;
              const squareX = Math.floor(x / 8);
              const squareY = Math.floor(y / 8);
              const isWhite = (squareX + squareY) % 2 === 0;
              if (isWhite) {
                byte |= 1 << bit;
              }
            }
            bytes[page * 128 + col] = byte;
          }
        }
        return bytes;
      })(),
      metadata: {
        byteCount: 512,
        pageCount: 4,
      },
    },
  },
]; /**
 * Go
lden fixtures for SSD1306 128x64 display
 */
export const SSD1306_128x64_FIXTURES: GoldenFixture[] = [
  {
    name: 'single_pixel_top_left',
    description: 'Single pixel at (0,0) - top-left corner',
    input: {
      dimensions: { width: 128, height: 64 },
      preset: 'SSD1306_128x64',
    },
    expected: {
      packedBytes: (() => {
        const bytes = new Uint8Array(1024);
        bytes[0] = 0x01; // First byte, LSB set
        return bytes;
      })(),
      metadata: {
        byteCount: 1024,
        pageCount: 8,
      },
    },
  },
  {
    name: 'single_pixel_center',
    description: 'Single pixel at (64,32) - center of display',
    input: {
      dimensions: { width: 128, height: 64 },
      preset: 'SSD1306_128x64',
    },
    expected: {
      packedBytes: (() => {
        const bytes = new Uint8Array(1024);
        // Page 4 (32/8), column 64, bit 0 (32%8)
        bytes[4 * 128 + 64] = 0x01;
        return bytes;
      })(),
      metadata: {
        byteCount: 1024,
        pageCount: 8,
      },
    },
  },
  {
    name: 'horizontal_line_middle',
    description: 'Horizontal line across middle (y=32)',
    input: {
      dimensions: { width: 128, height: 64 },
      preset: 'SSD1306_128x64',
    },
    expected: {
      packedBytes: (() => {
        const bytes = new Uint8Array(1024);
        // Page 4, all columns, bit 0
        for (let col = 0; col < 128; col++) {
          bytes[4 * 128 + col] = 0x01;
        }
        return bytes;
      })(),
      metadata: {
        byteCount: 1024,
        pageCount: 8,
      },
    },
  },
];

/**
 * Golden fixtures for SH1106 132x64 display
 */
export const SH1106_132x64_FIXTURES: GoldenFixture[] = [
  {
    name: 'single_pixel_viewport_start',
    description: 'Single pixel at (2,0) - start of viewport',
    input: {
      dimensions: { width: 132, height: 64 },
      preset: 'SH1106_132x64',
    },
    expected: {
      packedBytes: (() => {
        const bytes = new Uint8Array(1056);
        bytes[2] = 0x01; // Column 2, LSB set
        return bytes;
      })(),
      metadata: {
        byteCount: 1056,
        pageCount: 8,
      },
    },
  },
  {
    name: 'single_pixel_viewport_end',
    description: 'Single pixel at (129,0) - end of viewport',
    input: {
      dimensions: { width: 132, height: 64 },
      preset: 'SH1106_132x64',
    },
    expected: {
      packedBytes: (() => {
        const bytes = new Uint8Array(1056);
        bytes[129] = 0x01; // Column 129, LSB set
        return bytes;
      })(),
      metadata: {
        byteCount: 1056,
        pageCount: 8,
      },
    },
  },
  {
    name: 'viewport_line',
    description: 'Horizontal line across viewport (columns 2-129, y=0)',
    input: {
      dimensions: { width: 132, height: 64 },
      preset: 'SH1106_132x64',
    },
    expected: {
      packedBytes: (() => {
        const bytes = new Uint8Array(1056);
        // Fill viewport columns (2-129) with bit 0 set
        for (let col = 2; col <= 129; col++) {
          bytes[col] = 0x01;
        }
        return bytes;
      })(),
      metadata: {
        byteCount: 1056,
        pageCount: 8,
      },
    },
  },
];

/**
 * Get all golden fixtures for a specific preset
 */
export function getFixturesForPreset(preset: DevicePreset): GoldenFixture[] {
  switch (preset) {
    case 'SSD1306_128x32':
      return SSD1306_128x32_FIXTURES;
    case 'SSD1306_128x64':
      return SSD1306_128x64_FIXTURES;
    case 'SH1106_132x64':
      return SH1106_132x64_FIXTURES;
    default:
      return [];
  }
}

/**
 * Get all golden fixtures
 */
export function getAllGoldenFixtures(): GoldenFixture[] {
  return [
    ...SSD1306_128x32_FIXTURES,
    ...SSD1306_128x64_FIXTURES,
    ...SH1106_132x64_FIXTURES,
  ];
}

/**
 * Validate a packed frame against a golden fixture
 */
export function validateAgainstGoldenFixture(
  fixture: GoldenFixture,
  actualFrame: PackedFrame
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check dimensions
  if (
    actualFrame.dims.width !== fixture.input.dimensions.width ||
    actualFrame.dims.height !== fixture.input.dimensions.height
  ) {
    errors.push(
      `Dimension mismatch: expected ${fixture.input.dimensions.width}x${fixture.input.dimensions.height}, ` +
        `got ${actualFrame.dims.width}x${actualFrame.dims.height}`
    );
  }

  // Check preset
  if (actualFrame.preset !== fixture.input.preset) {
    errors.push(
      `Preset mismatch: expected ${fixture.input.preset}, got ${actualFrame.preset}`
    );
  }

  // Check byte count
  if (actualFrame.bytes.length !== fixture.expected.packedBytes.length) {
    errors.push(
      `Byte count mismatch: expected ${fixture.expected.packedBytes.length}, ` +
        `got ${actualFrame.bytes.length}`
    );
  }

  // Check byte content
  if (actualFrame.bytes.length === fixture.expected.packedBytes.length) {
    const differences: number[] = [];
    for (let i = 0; i < actualFrame.bytes.length; i++) {
      if (actualFrame.bytes[i] !== fixture.expected.packedBytes[i]) {
        differences.push(i);
      }
    }

    if (differences.length > 0) {
      if (differences.length <= 10) {
        // Show specific differences for small counts
        for (const index of differences) {
          errors.push(
            `Byte ${index}: expected 0x${fixture.expected.packedBytes[index]!.toString(16).padStart(2, '0')}, ` +
              `got 0x${actualFrame.bytes[index]!.toString(16).padStart(2, '0')}`
          );
        }
      } else {
        // Summarize for large counts
        errors.push(
          `${differences.length} byte differences found. First few: ${differences.slice(0, 5).join(', ')}`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create a monochrome frame from a golden fixture pattern
 */
export function createFrameFromGoldenFixture(
  fixture: GoldenFixture
): FrameMono {
  const { width, height } = fixture.input.dimensions;
  const totalPixels = width * height;
  const byteCount = Math.ceil(totalPixels / 8);
  const bits = new Uint8Array(byteCount);

  // Convert packed bytes back to monochrome frame for testing
  // This is a reverse operation to help create test data
  const packedBytes = fixture.expected.packedBytes;
  const pageHeight = 8;
  const pageCount = Math.ceil(height / pageHeight);

  for (let page = 0; page < pageCount; page++) {
    for (let col = 0; col < width; col++) {
      const packedByteIndex = page * width + col;
      if (packedByteIndex < packedBytes.length) {
        const packedByte = packedBytes[packedByteIndex]!;

        for (let bit = 0; bit < 8; bit++) {
          const y = page * 8 + bit;
          if (y < height) {
            const isSet = (packedByte & (1 << bit)) !== 0;
            if (isSet) {
              const pixelIndex = y * width + col;
              const byteIndex = Math.floor(pixelIndex / 8);
              const bitPosition = pixelIndex % 8;
              if (byteIndex < bits.length && bits[byteIndex] !== undefined) {
                bits[byteIndex] |= 1 << bitPosition;
              }
            }
          }
        }
      }
    }
  }

  return {
    bits,
    dims: { width, height },
  };
}
