# Comprehensive Test Suite

This directory contains the comprehensive test suite for the Tiny Screen Studios core library, implementing task 16 from the implementation plan.

## Overview

The test suite provides:
- **Golden fixture tests** for regression testing with known-good outputs
- **Performance benchmarks** for measuring processing speed and memory usage
- **Integration tests** for end-to-end pipeline validation
- **Test utilities** for creating test data and comparing results

## Test Structure

### Golden Fixtures (`golden-fixtures.test.ts`)
Tests that validate byte packer output against known-good reference data:
- **SSD1306 128x32**: Single pixels, page fills, column fills, checkerboard patterns
- **SSD1306 128x64**: Center pixels, horizontal lines, full display patterns
- **SH1106 132x64**: Viewport boundaries, off-screen areas, mixed content

Each fixture includes:
- Input parameters (dimensions, preset, options)
- Expected byte output
- Validation against actual packer output

### Performance Benchmarks (`performance-benchmarks.test.ts`)
Comprehensive performance testing covering:

#### Monochrome Conversion Benchmarks
- Basic threshold conversion (target: >100 fps)
- Dithering conversion (target: >10 fps)
- Threshold consistency across different values

#### Byte Packing Benchmarks
- SSD1306 128x32 packing (target: >200 fps)
- SSD1306 128x64 packing (target: >100 fps)
- SH1106 132x64 packing (target: >90 fps)
- Performance scaling across presets

#### End-to-End Pipeline Benchmarks
- Complete RGBA → packed pipeline (target: >50 fps)
- Large batch processing (200+ frames, target: >30 fps)

#### Memory Usage Benchmarks
- Memory consumption during processing
- Memory leak detection
- Browser memory API integration

#### Regression Detection
- Performance regression detection (>20% slowdown)
- Performance improvement tracking
- Baseline comparison system

### Integration Tests (`integration.test.ts`)
End-to-end testing of the complete processing pipeline:

#### Complete Processing Pipeline
- RGBA → Monochrome → Packed → Export workflow
- Multi-device preset consistency
- SH1106 viewport handling

#### Error Handling Integration
- Dimension mismatch handling
- Empty frame array handling
- Invalid parameter validation

#### Data Consistency Integration
- Pixel accuracy through pipeline
- Monochrome option variations
- Cross-format consistency

#### Canvas Emulation Integration
- Pixel-exact rendering validation
- Mock canvas interaction testing

#### Export Format Integration
- C array and binary export consistency
- Multi-frame export handling
- Format-specific validation

## Test Utilities

### Test Helpers (`utils/test-helpers.ts`)
Utility functions for creating test data:
- `createTestFrameRGBA()` - Create RGBA frames with specific pixels
- `createTestFrameMono()` - Create monochrome frames with specific pixels
- `createCheckerboardRGBA()` - Generate checkerboard patterns
- `createGradientRGBA()` - Generate gradient patterns
- `createSolidColorRGBA()` - Generate solid color frames
- `compareBytes()` - Compare byte arrays with detailed error reporting
- `createTestFile()` - Create mock File objects for testing
- `createMinimalPNG()` - Generate minimal valid PNG data

### Golden Fixtures (`utils/golden-fixtures.ts`)
Reference data and validation utilities:
- Pre-defined golden fixtures for all device presets
- `validateAgainstGoldenFixture()` - Compare actual vs expected output
- `createFrameFromGoldenFixture()` - Generate test frames from fixtures
- `getFixturesForPreset()` - Get fixtures for specific device types

## Coverage Configuration

The test suite includes comprehensive coverage reporting:
- **Provider**: V8 coverage engine
- **Reporters**: Text, JSON, HTML
- **Thresholds**: 80% minimum for branches, functions, lines, statements
- **Exclusions**: Test files, benchmarks, type definitions

## Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test suites
pnpm test src/__tests__/golden-fixtures.test.ts
pnpm test src/__tests__/performance-benchmarks.test.ts
pnpm test src/__tests__/integration.test.ts

# Watch mode
pnpm test:watch
```

## Performance Expectations

The test suite validates these performance targets:
- **Monochrome conversion**: >100 fps for basic threshold, >10 fps for dithering
- **SSD1306 128x32 packing**: >200 fps
- **SSD1306 128x64 packing**: >100 fps
- **SH1106 132x64 packing**: >90 fps
- **End-to-end pipeline**: >50 fps
- **Large batch processing**: >30 fps for 200+ frames
- **Memory usage**: <50MB for 100 frames

## Golden Fixture Validation

Golden fixtures ensure byte-accurate output by testing:
- Single pixel placement accuracy
- Page and column organization
- Bit ordering (LSB-top vs MSB-top)
- Viewport handling for SH1106
- Pattern generation (checkerboards, gradients)
- Edge cases (corners, boundaries)

## Requirements Coverage

This test suite addresses the following requirements from the implementation plan:

### Requirement 8.1: Golden Fixture Tests
✅ Known PNG inputs with expected byte outputs
✅ Byte-accurate validation against hardware expectations
✅ Regression testing for consistent output

### Requirement 8.2: Pixel Operation Testing
✅ Single pixel placement validation
✅ Page fill operations
✅ Column operation testing
✅ Bit order and polarity verification

### Requirement 8.3: Animation Testing
✅ Frame ordering validation
✅ Timing accuracy verification
✅ Multi-frame consistency

### Requirement 8.4: Device Format Testing
✅ All device presets (SSD1306_128x32, SSD1306_128x64, SH1106_132x64)
✅ Bit order, page order, and polarity options
✅ Viewport handling for SH1106

The comprehensive test suite ensures reliable, performant, and accurate operation of the Tiny Screen Studios core library across all supported device formats and use cases.