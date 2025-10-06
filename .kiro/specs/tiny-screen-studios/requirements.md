# Requirements Document

## Introduction

The Tiny Screen Studios Web MVP is a pure TypeScript, browser-only tool designed to help developers and makers convert pixel art and animations into firmware-ready formats for tiny monochrome displays like SSD1306 and SH1106. The tool provides an end-to-end workflow: Upload → Convert → Preview → Export, all running in the browser without requiring a backend server. The solution will be deployed on GitHub Pages and built as a monorepo with separate core library and UI packages.

## Requirements

### Requirement 1: File Input and Decoding

**User Story:** As a developer working with tiny displays, I want to upload PNG files or sequences so that I can convert my pixel art into display-ready formats.

#### Acceptance Criteria

1. WHEN a user uploads PNG files THEN the system SHALL decode them into RGBA frame data
2. WHEN multiple PNG files are uploaded THEN the system SHALL order them numerically by filename suffix
3. WHEN files don't match expected dimensions THEN the system SHALL display a clear error message showing expected vs actual dimensions
4. WHEN corrupt or empty files are uploaded THEN the system SHALL provide friendly error messages without crashing
5. IF PNG files have gaps in numeric sequence THEN the system SHALL warn the user about missing frames

### Requirement 2: Monochrome Conversion

**User Story:** As a user converting color images, I want to convert RGBA images to 1-bit monochrome so that they work with monochrome displays.

#### Acceptance Criteria

1. WHEN RGBA frames are processed THEN the system SHALL convert them to 1-bit monochrome using luminance threshold
2. WHEN no threshold is specified THEN the system SHALL use a default threshold of 128
3. WHEN the user enables invert option THEN the system SHALL invert the monochrome output
4. WHEN the user selects Bayer 4x4 dithering THEN the system SHALL apply ordered dithering to the conversion
5. IF conversion parameters are invalid THEN the system SHALL provide clear validation errors

### Requirement 3: Device-Specific Packing

**User Story:** As a firmware developer, I want monochrome frames packed according to specific display formats so that I can directly use the output in my embedded code.

#### Acceptance Criteria

1. WHEN frames are packed for SSD1306_128x32 THEN the system SHALL organize bytes in pages top-to-bottom, columns left-to-right
2. WHEN frames are packed for SSD1306_128x64 THEN the system SHALL use the same organization as 128x32 but with double the pages
3. WHEN frames are packed for SH1106_132x64 THEN the system SHALL pack 132 columns but preview only 128 pixels with offset
4. WHEN packing options specify bit order THEN the system SHALL respect LSB-top or MSB-top ordering
5. WHEN polarity is set THEN the system SHALL ensure bit value 1 represents lit pixels
6. IF byte count doesn't match expected format THEN the system SHALL show expected vs actual count with frame index

### Requirement 4: Real-time Preview and Emulation

**User Story:** As a user preparing display content, I want to see a pixel-exact preview of how my content will look on the actual display so that I can verify the output before exporting.

#### Acceptance Criteria

1. WHEN packed frames are rendered THEN the system SHALL display them pixel-exactly on HTML5 Canvas
2. WHEN rendering static frames THEN the system SHALL support scaling options and grid overlay
3. WHEN rendering animations THEN the system SHALL support configurable FPS, loop modes, and scrubbing
4. WHEN preview options change THEN the system SHALL update the display in real-time
5. WHEN emulating SH1106 THEN the system SHALL show only the 128-pixel visible window with proper offset

### Requirement 5: Multiple Export Formats

**User Story:** As a firmware developer, I want to export processed data in multiple formats so that I can integrate it into different development workflows.

#### Acceptance Criteria

1. WHEN exporting raw bytes THEN the system SHALL provide .bin files per frame or concatenated
2. WHEN exporting C arrays THEN the system SHALL generate properly formatted C code with configurable symbol names
3. WHEN exporting C arrays THEN the system SHALL support configurable bytes per row formatting
4. WHEN exporting multiple frames THEN the system SHALL provide both per-frame and batch export options
5. IF export fails THEN the system SHALL provide clear error messages about the failure cause

### Requirement 6: Performance and Responsiveness

**User Story:** As a user working with large animations, I want the tool to remain responsive during processing so that I can work efficiently with complex content.

#### Acceptance Criteria

1. WHEN processing large files THEN the system SHALL use createImageBitmap for optimal decode performance
2. WHEN handling animations over 100 frames THEN the system SHALL optionally use Web Workers to prevent UI blocking
3. WHEN rendering to canvas THEN the system SHALL disable image smoothing for pixel-perfect display
4. WHEN processing multiple operations THEN the system SHALL preallocate typed arrays to avoid garbage collection
5. WHEN batch operations run THEN the system SHALL maintain UI responsiveness

### Requirement 7: Architecture and Code Organization

**User Story:** As a developer maintaining this tool, I want clean separation between core logic and UI so that the core can be reused in other contexts.

#### Acceptance Criteria

1. WHEN the system is built THEN the core package SHALL be completely headless with no DOM dependencies
2. WHEN the UI package is built THEN it SHALL be a thin wrapper that consumes the core package
3. WHEN building for distribution THEN the core SHALL provide both ESM and UMD bundles
4. WHEN the monorepo is structured THEN packages SHALL be clearly separated with proper dependency management
5. WHEN using TypeScript THEN the system SHALL enforce strict type checking throughout

### Requirement 8: Testing and Quality Assurance

**User Story:** As a developer ensuring firmware compatibility, I want comprehensive tests that verify byte-accurate output so that I can trust the tool's output in production.

#### Acceptance Criteria

1. WHEN core functionality is tested THEN the system SHALL include golden fixture tests for known inputs/outputs
2. WHEN testing pixel operations THEN the system SHALL verify single pixel, page fills, and column operations
3. WHEN testing animations THEN the system SHALL verify frame ordering and timing accuracy
4. WHEN testing device formats THEN the system SHALL verify bit order, page order, and polarity for each preset
5. WHEN tests run THEN they SHALL validate byte-accurate output matching firmware expectations

### Requirement 9: Deployment and Distribution

**User Story:** As a user wanting to access the tool, I want it available as a web application so that I can use it without installation.

#### Acceptance Criteria

1. WHEN the application is deployed THEN it SHALL be available on GitHub Pages
2. WHEN users access the tool THEN it SHALL work entirely in the browser without backend dependencies
3. WHEN the build process runs THEN it SHALL generate optimized static assets for web deployment
4. WHEN updates are made THEN the deployment SHALL update automatically via GitHub Actions
5. WHEN accessing the tool THEN users SHALL be able to bookmark and share the URL

### Requirement 10: User Interface and Experience

**User Story:** As a user of the tool, I want an intuitive interface that guides me through the conversion process so that I can efficiently create display-ready content.

#### Acceptance Criteria

1. WHEN using the interface THEN users SHALL have clear file input for PNG uploads
2. WHEN configuring conversion THEN users SHALL have preset selection, threshold slider, and invert toggle
3. WHEN previewing content THEN users SHALL have FPS control, play/stop, and frame scrubbing
4. WHEN viewing output THEN users SHALL have scaling and grid overlay options
5. WHEN exporting THEN users SHALL have clear download buttons for different format options
