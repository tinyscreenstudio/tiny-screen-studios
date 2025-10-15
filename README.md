# 🖥️ Tiny Screen Studios

> Professional toolkit for converting pixel art and animations to embedded display formats

Tiny Screen Studios is a powerful web-based application for converting pixel art and animations into formats optimized for tiny embedded displays like SSD1306 and SH1106 OLED screens. Designed for professionals working with Arduino projects, IoT devices, and embedded systems.

## ✨ Features

- 🎨 **Professional Image Conversion** - Transform pixel art into optimized monochrome formats
- 🎬 **Animation Processing** - Handle PNG sequences with frame timing and ordering
- 📱 **Multi-Display Support** - Compatible with SSD1306, SH1106, and custom display configurations
- 🔧 **Developer Integration** - TypeScript library for programmatic use
- 🌐 **Web Application** - Intuitive browser-based interface
- ⚡ **High Performance** - Optimized processing for large files and batch operations
- 📦 **Flexible Export** - Multiple output formats including C arrays and binary files

## 🚀 Getting Started

### Web Application

Access the web interface directly in your browser - no installation required. The application provides an intuitive drag-and-drop interface for converting images and animations.

### Development Setup

For developers working on the project:

#### Prerequisites

- Node.js 18+
- pnpm 8+ (recommended) or npm

#### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tiny-screen-studios.git
cd tiny-screen-studios

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 📦 Architecture

This is a monorepo containing two main packages:

### Core Library (`@tiny-screen-studios/core`)

Headless TypeScript library providing:
- Image decoding and processing
- Monochrome conversion algorithms
- Display-specific byte packing
- Export functionality
- Validation and error handling

### Web Interface (`@tiny-screen-studios/ui`)

Browser-based application featuring:
- Drag & drop file upload
- Real-time preview with scaling
- Adjustable conversion parameters
- Animation playback controls
- Multiple export formats
- Batch processing capabilities

## 🛠️ Development

### Build Commands

```bash
# Install dependencies
pnpm install

# Start development mode
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Code quality
pnpm lint
pnpm format
```

## 🎯 Supported Displays

| Display | Resolution     | Notes                                      |
| ------- | -------------- | ------------------------------------------ |
| SSD1306 | 128×64, 128×32 | Most common OLED display                   |
| SH1106  | 128×64         | Similar to SSD1306 with slight differences |
| Custom  | Any size       | Define your own display parameters         |

## 🔧 Technical Specifications

### Input Formats
- PNG images (single or sequences)
- Automatic frame ordering and validation
- Support for transparency

### Processing Features
- Configurable luminance thresholds
- Bayer 4×4 dithering algorithm
- Pixel inversion options
- Real-time preview rendering

### Output Formats
- C array code generation
- Raw binary files
- JSON data structures
- Configurable formatting options

### Performance
- Web Worker support for large batches
- Memory-efficient processing
- Typed array optimizations
- Progress tracking and validation

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For technical support and inquiries:

- 📚 [Documentation](docs/)
- 📧 Email: support@tiny-screen-studios.com
- 🌐 Website: [tiny-screen-studios.com](https://tiny-screen-studios.com)
