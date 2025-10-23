# Getting Started

Welcome to Tiny Screen Studios! This professional toolkit helps you convert pixel art and animations into formats optimized for tiny embedded displays.

## Quick Start

### Web Application

Access the web interface directly in your browser - no installation required. The application provides an intuitive drag-and-drop interface for converting images and animations.

1. Open [OLED Studio](/oled-studio)
2. Select your display type (SSD1306, SH1106, or custom)
3. Upload your PNG files
4. Adjust conversion settings
5. Preview and export

### Development Setup

For developers working on the project:

#### Prerequisites

- Node.js 18+
- pnpm 8+ (recommended) or npm

#### Installation

```bash
# Clone the repository
git clone https://github.com/tinyscreenstudio/tiny-screen-studios.git
cd tiny-screen-studios

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Architecture

This is a monorepo containing two main packages:

### Core Library (`@tiny-screen-studios/core`)

Headless TypeScript library providing:
- Image decoding and processing
- Monochrome conversion algorithms
- Display-specific byte packing
- Export functionality
- Validation and error handling

### Web Interface (`@tiny-screen-studios/ui`)

Web-based user interface for image conversion and display configuration:
- Built with React and TypeScript
- Utilizes the core library for processing and exporting
- Supports drag-and-drop image upload and display configuration

## Supported Displays

| Display | Resolution     | Notes                                      |
| ------- | -------------- | ------------------------------------------ |
| SSD1306 | 128×64, 128×32 | Most common OLED display                   |
| SH1106  | 128×64         | Similar to SSD1306 with slight differences |
| Custom  | Any size       | Define your own display parameters         |

## Next Steps

- [Convert your first image](getting-started/first-image) - Step-by-step tutorial
- [Arduino integration](getting-started/arduino) - Using generated code in Arduino projects
- [Display types](/docs/displays) - Learn about different display configurations
- [Export formats](/docs/export) - Understanding output options