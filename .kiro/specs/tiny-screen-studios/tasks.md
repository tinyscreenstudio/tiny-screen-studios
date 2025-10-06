# Implementation Plan

- [x] 1. Set up monorepo structure and build configuration
  - Create pnpm workspace with packages/core and packages/ui directories
  - Configure TypeScript strict mode for both packages
  - Set up Vite build configuration for core (library mode) and ui (static site)
  - Configure ESLint, Prettier, and EditorConfig for code quality
  - _Requirements: 7.3, 7.4, 7.5_

- [ ] 2. Implement core type definitions and interfaces
  - Create base types (Dimensions, FrameRGBA, FrameMono, PackedFrame)
  - Define DevicePreset and configuration option types
  - Implement ValidationResult and error handling types
  - Create module interfaces for decoder, mono, packer, emulator, exporters
  - _Requirements: 7.1, 7.5, 6.1_

- [ ] 3. Create device preset configurations
  - Implement DEVICE_PRESETS constant with SSD1306_128x32, SSD1306_128x64, SH1106_132x64
  - Create preset validation and lookup functions
  - Write unit tests for preset configuration access
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 4. Implement image decoder module
  - Create decodeImageFiles function using createImageBitmap for PNG processing
  - Implement filename-based frame ordering with numeric suffix detection
  - Add dimension validation against device presets
  - Create error handling for corrupt files and unsupported formats
  - Write unit tests with sample PNG files
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1_

- [ ] 5. Implement monochrome conversion module
  - Create toMonochrome function with luminance calculation (0.299*R + 0.587*G + 0.114\*B)
  - Implement threshold-based conversion with default value 128
  - Add invert option for monochrome output
  - Implement Bayer 4x4 dithering matrix and application logic
  - Write unit tests for conversion accuracy and edge cases
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6. Implement SSD1306 byte packing
  - Create packSSD1306 function for 128x32 and 128x64 formats
  - Implement page-based byte organization (8-pixel vertical strips)
  - Handle bit ordering (LSB-top default) and page ordering (top-down)
  - Add column ordering support (left-right default)
  - Write unit tests for single pixel, page fills, and column operations
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 8.2, 8.4_

- [ ] 7. Implement SH1106 byte packing with viewport handling
  - Create packSH1106 function for 132x64 format with 128-pixel viewport
  - Implement viewport offset calculation (columns 2-129 visible)
  - Ensure compatibility with SSD1306 packing logic where applicable
  - Write unit tests for viewport offset and full-width packing
  - _Requirements: 3.3, 4.5_

- [ ] 8. Create byte packer orchestration
  - Implement packFrames function that routes to appropriate packer based on preset
  - Add packing options validation and error handling
  - Create byte count validation with expected vs actual reporting
  - Write integration tests for all device presets
  - _Requirements: 3.4, 3.5, 3.6, 6.2_

- [ ] 9. Implement canvas emulator for static rendering
  - Create renderFrameToCanvas function with pixel-exact rendering
  - Disable image smoothing and implement nearest-neighbor scaling
  - Add scaling factor and grid overlay options
  - Implement color inversion for preview
  - Write tests for rendering accuracy and options
  - _Requirements: 4.1, 4.2, 4.4, 6.3_

- [ ] 10. Implement animation playback system
  - Create playFramesOnCanvas function with FPS control
  - Implement loop modes (loop, pingpong) and frame scrubbing
  - Use requestAnimationFrame for smooth playback
  - Create AnimationController interface for playback control
  - Write tests for timing accuracy and control functions
  - _Requirements: 4.3, 4.4_

- [ ] 11. Implement SH1106 viewport emulation
  - Add viewport offset rendering for SH1106 displays
  - Ensure proper 128-pixel window display from 132-pixel data
  - Test viewport accuracy against expected hardware behavior
  - _Requirements: 4.5_

- [ ] 12. Create raw binary exporters
  - Implement makeByteFiles function for .bin export per frame
  - Add concatenated binary export option for multi-frame data
  - Create proper filename generation with frame indices
  - Write tests for binary output accuracy
  - _Requirements: 5.1, 5.4_

- [ ] 13. Implement C array exporters
  - Create toCRawArray function with configurable symbol names
  - Add bytes-per-row formatting for code readability
  - Implement per-frame vs batch export modes
  - Include metadata comments with dimensions and timing
  - Write tests for C code generation and compilation
  - _Requirements: 5.2, 5.3, 5.4_

- [ ] 14. Create orchestrator module for end-to-end workflows
  - Implement high-level functions that chain decoder → mono → packer → export
  - Add error aggregation and progress reporting
  - Create batch processing with memory management
  - Write integration tests for complete workflows
  - _Requirements: 6.4, 8.1_

- [ ] 15. Implement performance optimizations
  - Add Web Worker support for large batch processing (>100 frames)
  - Implement typed array preallocation and reuse
  - Add memory usage monitoring and cleanup
  - Create performance benchmarks and regression tests
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 16. Create comprehensive test suite with golden fixtures
  - Set up Vitest testing framework with coverage reporting
  - Create golden fixture tests with known PNG inputs and expected byte outputs
  - Implement test utilities for frame creation and comparison
  - Add performance benchmarks for processing speed
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 17. Build minimal UI package structure
  - Create index.html with file input, preset selection, and canvas preview
  - Implement main.ts that imports and uses core package functions
  - Add basic CSS styling for layout and controls
  - Set up Vite configuration for static site generation
  - _Requirements: 10.1, 10.2, 10.6, 9.1_

- [ ] 18. Implement file upload and validation UI
  - Create file input handler for PNG uploads with drag-and-drop
  - Add client-side validation with user-friendly error messages
  - Implement progress indication for file processing
  - Display validation results and warnings to user
  - _Requirements: 10.1, 1.3, 1.4, 1.5_

- [ ] 19. Create conversion controls UI
  - Implement device preset selector (128x32, 128x64)
  - Add threshold slider with real-time preview updates
  - Create invert toggle and dithering option controls
  - Wire controls to core conversion functions
  - _Requirements: 10.2, 2.2, 2.3, 2.4_

- [ ] 20. Implement canvas preview and animation controls
  - Create canvas element with proper sizing and scaling
  - Add FPS slider, play/stop button, and frame scrubber
  - Implement scale control and grid overlay toggle
  - Wire animation controls to emulator functions
  - _Requirements: 10.3, 4.2, 4.3, 4.4_

- [ ] 21. Create export functionality UI
  - Add download buttons for raw bytes and C array exports
  - Implement file download handling with proper MIME types
  - Create export options UI (symbol names, formatting)
  - Add batch export for multi-frame sequences
  - _Requirements: 10.4, 5.1, 5.2, 5.3_

- [ ] 22. Implement error handling and user feedback
  - Create error display system with clear, actionable messages
  - Add loading states and progress indicators
  - Implement graceful degradation for processing failures
  - Create help tooltips and usage guidance
  - _Requirements: 1.4, 1.5, 2.5, 3.6, 5.5_

- [ ] 23. Set up GitHub Pages deployment
  - Configure GitHub Actions workflow for automated deployment
  - Set up build process to generate static assets in packages/ui/dist
  - Configure GitHub Pages to serve from gh-pages branch
  - Test deployment pipeline and URL accessibility
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 24. Create comprehensive documentation
  - Write README with project overview, setup instructions, and usage guide
  - Document API interfaces and type definitions
  - Create examples for common use cases and integration
  - Add troubleshooting guide and FAQ section
  - _Requirements: 7.1, 9.5_

- [ ] 25. Perform end-to-end testing and validation
  - Test complete workflows from file upload to export
  - Validate output accuracy against hardware displays
  - Test performance with large files and animations
  - Verify cross-browser compatibility and responsiveness
  - _Requirements: 8.1, 8.2, 8.3, 6.4_
