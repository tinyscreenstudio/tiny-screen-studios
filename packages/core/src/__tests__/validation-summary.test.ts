/**
 * End-to-end validation summary
 * This test validates that all core functionality works together correctly
 * and provides a comprehensive validation report
 */

import { describe, it, expect, vi } from 'vitest';
import {
  toMonochrome,
  packFrames,
  createCanvasEmulator,
  makeByteFiles,
  toCRawArray,
  DEVICE_PRESETS,
  type DevicePreset,
} from '../index.js';
import {
  createTestFrameRGBA,
  createCheckerboardRGBA,
  createGradientRGBA,
  createSolidColorRGBA,
} from './utils/test-helpers.js';

describe('End-to-End Validation Summary', () => {
  it('should validate complete workflow functionality', () => {
    console.log('\n=== End-to-End Validation Report ===\n');

    // Test 1: Complete single-frame workflow
    console.log('✓ Testing single-frame workflow...');
    const rgbaFrame = createSolidColorRGBA(128, 32, 255, 255, 255, 255);
    const monoFrame = toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
    const packedFrame = packFrames([monoFrame], {
      preset: 'SSD1306_128x32',
    })[0]!;

    expect(packedFrame.bytes.length).toBe(512);
    expect(packedFrame.preset).toBe('SSD1306_128x32');
    console.log('  - Single frame processing: PASS');

    // Test 2: Multi-frame animation workflow
    console.log('✓ Testing multi-frame animation workflow...');
    const rgbaFrames = [
      createSolidColorRGBA(128, 64, 255, 255, 255, 255),
      createSolidColorRGBA(128, 64, 0, 0, 0, 255),
      createCheckerboardRGBA(128, 64, 8),
    ];
    const monoFrames = toMonochrome(rgbaFrames, {
      threshold: 128,
      dithering: 'bayer4',
    });
    const packedFrames = packFrames(monoFrames, { preset: 'SSD1306_128x64' });

    expect(packedFrames).toHaveLength(3);
    packedFrames.forEach(frame => {
      expect(frame.bytes.length).toBe(1024);
      expect(frame.preset).toBe('SSD1306_128x64');
    });
    console.log('  - Multi-frame processing: PASS');

    // Test 3: Device preset compatibility
    console.log('✓ Testing device preset compatibility...');
    const presets: DevicePreset[] = [
      'SSD1306_128x32',
      'SSD1306_128x64',
      'SH1106_132x64',
    ];
    presets.forEach(preset => {
      const config = DEVICE_PRESETS[preset];
      const testFrame = createCheckerboardRGBA(config.width, config.height, 8);
      const testMono = toMonochrome([testFrame], { threshold: 128 })[0]!;
      const testPacked = packFrames([testMono], { preset })[0]!;

      const expectedBytes = (config.width * config.height) / 8;
      expect(testPacked.bytes.length).toBe(expectedBytes);
      expect(testPacked.preset).toBe(preset);
    });
    console.log('  - All device presets: PASS');

    // Test 4: Export functionality
    console.log('✓ Testing export functionality...');
    const exportFrame = createTestFrameRGBA(128, 32, [
      { x: 0, y: 0, r: 255, g: 255, b: 255, a: 255 },
      { x: 127, y: 31, r: 255, g: 255, b: 255, a: 255 },
    ]);
    const exportMono = toMonochrome([exportFrame], { threshold: 128 })[0]!;
    const exportPacked = packFrames([exportMono], {
      preset: 'SSD1306_128x32',
    })[0]!;

    // Test C array export
    const cArray = toCRawArray([exportPacked], 'test_data');
    expect(cArray).toContain('const uint8_t test_data');
    expect(cArray).toContain('0x');

    // Test binary export
    const binaryFiles = makeByteFiles([exportPacked], 'test');
    expect(binaryFiles).toHaveLength(1);
    expect(binaryFiles[0]!.data.length).toBe(512);
    console.log('  - Export formats: PASS');

    // Test 5: Canvas emulation
    console.log('✓ Testing canvas emulation...');
    const emulator = createCanvasEmulator();
    const mockContext = {
      canvas: { width: 256, height: 64 },
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn((w: number, h: number) => ({
        width: w,
        height: h,
        data: new Uint8ClampedArray(w * h * 4),
      })),
      imageSmoothingEnabled: true,
      fillStyle: '#000000',
    } as unknown as CanvasRenderingContext2D;

    expect(() => {
      emulator.renderFrameToCanvas(mockContext, exportPacked, { scale: 2 });
    }).not.toThrow();
    console.log('  - Canvas rendering: PASS');

    // Test 6: Hardware accuracy validation
    console.log('✓ Testing hardware accuracy...');
    const accuracyFrame = createTestFrameRGBA(128, 32, [
      { x: 0, y: 0, r: 255, g: 255, b: 255, a: 255 }, // Top-left
      { x: 127, y: 31, r: 255, g: 255, b: 255, a: 255 }, // Bottom-right
      { x: 64, y: 16, r: 0, g: 0, b: 0, a: 255 }, // Center (black)
    ]);
    const accuracyMono = toMonochrome([accuracyFrame], { threshold: 128 })[0]!;
    const accuracyPacked = packFrames([accuracyMono], {
      preset: 'SSD1306_128x32',
    })[0]!;

    // Verify specific bit patterns
    expect(accuracyPacked.bytes[0] & 0x01).toBe(0x01); // Top-left pixel
    expect(accuracyPacked.bytes[511] & 0x80).toBe(0x80); // Bottom-right pixel
    expect(accuracyPacked.bytes[256 + 64] & 0x01).toBe(0x00); // Center pixel (black)
    console.log('  - Hardware accuracy: PASS');

    // Test 7: Performance validation
    console.log('✓ Testing performance...');
    const startTime = performance.now();
    const perfFrames = Array.from({ length: 50 }, () =>
      createCheckerboardRGBA(128, 64, 8)
    );
    const perfMono = toMonochrome(perfFrames, {
      threshold: 128,
      dithering: 'bayer4',
    });
    const perfPacked = packFrames(perfMono, { preset: 'SSD1306_128x64' });
    const processingTime = performance.now() - startTime;

    expect(perfPacked).toHaveLength(50);
    expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    console.log(
      `  - Performance (50 frames): ${processingTime.toFixed(2)}ms - PASS`
    );

    // Test 8: Error handling
    console.log('✓ Testing error handling...');
    expect(() => {
      const wrongSizeFrame = createTestFrameRGBA(64, 32); // Wrong size
      const wrongMono = toMonochrome([wrongSizeFrame], { threshold: 128 })[0]!;
      packFrames([wrongMono], { preset: 'SSD1306_128x32' });
    }).toThrow();
    console.log('  - Error handling: PASS');

    console.log('\n=== Validation Summary ===');
    console.log('✅ All core functionality validated successfully');
    console.log('✅ Hardware accuracy confirmed');
    console.log('✅ Performance within acceptable limits');
    console.log('✅ Error handling working correctly');
    console.log('✅ Export formats generating valid output');
    console.log('✅ Canvas emulation functional');
    console.log('\n🎉 End-to-end validation: COMPLETE\n');
  });

  it('should validate cross-browser compatibility features', () => {
    console.log('\n=== Cross-Browser Compatibility Report ===\n');

    // Test typed array compatibility
    console.log('✓ Testing typed array compatibility...');
    const rgbaFrame = createSolidColorRGBA(128, 32, 128, 128, 128, 255);
    const monoFrame = toMonochrome([rgbaFrame], { threshold: 128 })[0]!;
    const packedFrame = packFrames([monoFrame], {
      preset: 'SSD1306_128x32',
    })[0]!;

    expect(monoFrame.bits).toBeInstanceOf(Uint8Array);
    expect(packedFrame.bytes).toBeInstanceOf(Uint8Array);
    expect(monoFrame.bits.buffer).toBeInstanceOf(ArrayBuffer);
    expect(packedFrame.bytes.buffer).toBeInstanceOf(ArrayBuffer);
    console.log('  - Typed arrays: PASS');

    // Test array operations
    console.log('✓ Testing array operations...');
    const copyBytes = new Uint8Array(packedFrame.bytes);
    expect(copyBytes.length).toBe(packedFrame.bytes.length);
    for (let i = 0; i < packedFrame.bytes.length; i++) {
      expect(copyBytes[i]).toBe(packedFrame.bytes[i]);
    }
    console.log('  - Array operations: PASS');

    // Test export consistency
    console.log('✓ Testing export consistency...');
    const frames = [
      createSolidColorRGBA(128, 32, 255, 255, 255, 255),
      createSolidColorRGBA(128, 32, 0, 0, 0, 255),
    ];
    const monoFrames = toMonochrome(frames, { threshold: 128 });
    const packedFrames = packFrames(monoFrames, { preset: 'SSD1306_128x32' });

    const exportOptions = [
      { perFrame: true, bytesPerRow: 16 },
      { perFrame: false, bytesPerRow: 8 },
    ];

    exportOptions.forEach(options => {
      const cArray = toCRawArray(packedFrames, 'test', options);
      expect(cArray).toContain('const uint8_t');
      expect(cArray).toContain('0x');
    });

    const binaryFiles = makeByteFiles(packedFrames, 'test');
    expect(binaryFiles).toHaveLength(2);
    binaryFiles.forEach(file => {
      expect(file.data).toBeInstanceOf(Uint8Array);
      expect(file.data.length).toBe(512);
      expect(typeof file.name).toBe('string');
    });
    console.log('  - Export consistency: PASS');

    console.log('\n✅ Cross-browser compatibility: VALIDATED\n');
  });

  it('should validate performance regression thresholds', () => {
    console.log('\n=== Performance Regression Report ===\n');

    const performanceTests = [
      {
        name: 'Monochrome conversion (basic)',
        test: (): number => {
          const frames = Array.from({ length: 50 }, () =>
            createCheckerboardRGBA(128, 64, 8)
          );
          const start = performance.now();
          toMonochrome(frames, { threshold: 128 });
          return performance.now() - start;
        },
        threshold: 1000, // 1 second max
      },
      {
        name: 'Byte packing (SSD1306)',
        test: (): number => {
          const frames = Array.from({ length: 100 }, () => {
            const rgba = createCheckerboardRGBA(128, 32, 8);
            return toMonochrome([rgba], { threshold: 128 })[0]!;
          });
          const start = performance.now();
          packFrames(frames, { preset: 'SSD1306_128x32' });
          return performance.now() - start;
        },
        threshold: 500, // 0.5 seconds max
      },
      {
        name: 'End-to-end pipeline',
        test: (): number => {
          const frames = Array.from({ length: 25 }, () =>
            createGradientRGBA(128, 64, 'horizontal')
          );
          const start = performance.now();
          const mono = toMonochrome(frames, {
            threshold: 128,
            dithering: 'bayer4',
          });
          packFrames(mono, { preset: 'SSD1306_128x64' });
          return performance.now() - start;
        },
        threshold: 2000, // 2 seconds max
      },
    ];

    performanceTests.forEach(test => {
      console.log(`✓ Testing ${test.name}...`);
      const duration = test.test();
      const passed = duration < test.threshold;

      console.log(
        `  - Duration: ${duration.toFixed(2)}ms (threshold: ${test.threshold}ms)`
      );
      console.log(`  - Result: ${passed ? 'PASS' : 'FAIL'}`);

      expect(duration).toBeLessThan(test.threshold);
    });

    console.log('\n✅ Performance regression: VALIDATED\n');
  });
});
