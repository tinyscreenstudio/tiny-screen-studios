# Tiny Screen Studios

> 1-bit art marketplace for tiny displays

Tiny Screen Studios is the premier marketplace for discovering, buying, and selling 1-bit monochrome art designed specifically for tiny embedded displays. Perfect for SSD1306, SH1106, and SH1107 OLED screens used in Arduino projects, IoT devices, and embedded systems.

## What We Offer

- **Curated 1-bit Art** - High-quality monochrome pixel art from talented creators
- **Multiple Resolutions** - Optimized for 128x32, 128x64, and 132x64 displays
- **Ready-to-Use Code** - C/C++ arrays and code snippets included with every purchase
- **Creator Tools** - Professional conversion and preview tools for artists
- **Community Driven** - Support independent pixel artists and developers
- **Instant Downloads** - Get your art and code immediately after purchase

## Popular Categories

- **Gaming Sprites** - Characters, enemies, and UI elements for retro games
- **Icons & Symbols** - Weather, system status, and interface icons
- **Portraits & Characters** - Dithered faces and character art
- **Patterns & Textures** - Abstract designs and decorative elements
- **Animations** - Frame sequences for dynamic displays
- **Typography** - Custom bitmap fonts and text effects

## For Developers

### Supported Displays

| Display | Resolution     | Notes                                      |
| ------- | -------------- | ------------------------------------------ |
| SSD1306 | 128×64, 128×32 | Most common OLED display                   |
| SH1106  | 128×64         | Similar to SSD1306 with slight differences |
| SH1107  | 132×64         | Larger variant with extra columns          |
| Custom  | Any size       | Define your own display parameters         |

### Integration

Every art piece comes with:
- Optimized C/C++ byte arrays
- Arduino-compatible code examples
- Multiple export formats (binary, JSON)
- Display-specific configurations
- Usage documentation

```cpp
// Example: Display purchased art
#include "cyberpunk_cityscape.h"

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.drawBitmap(0, 0, cyberpunk_cityscape, 128, 64, WHITE);
  display.display();
}
```

## For Artists

### Sell Your 1-bit Art

Join our community of creators and monetize your pixel art skills:

- **Easy Upload** - Professional conversion tools handle the technical details
- **Fair Revenue Share** - Keep 70% of every sale
- **Global Reach** - Access to thousands of developers worldwide
- **Creator Support** - Marketing and promotion assistance
- **Quality Standards** - Curated marketplace ensures high-quality content

### Creator Tools

- **1-bit Converter** - Transform your artwork into display-ready formats
- **Preview Engine** - See exactly how your art looks on real displays
- **Batch Processing** - Convert multiple pieces efficiently
- **Format Validation** - Ensure compatibility across different displays

## Getting Started

### Browse & Buy
1. Visit [tinyscreen.studio](https://tinyscreen.studio)
2. Search for art by category, resolution, or style
3. Preview artwork on virtual displays
4. Purchase and download instantly

### Start Selling
1. Create your artist account
2. Upload your pixel art
3. Use our tools to convert and optimize
4. Set your price and publish

## Development Setup

For contributors working on the platform:

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

This is a monorepo containing:

### Core Library (`@tiny-screen-studios/core`)
- Image processing and conversion algorithms
- Display-specific optimizations
- Export functionality for multiple formats

### Web Interface (`@tiny-screen-studios/ui`)
- Marketplace frontend built with React
- Artist tools and creator dashboard
- Purchase and download system

## Community

- **2,500+** Active artists
- **15,000+** Art pieces available
- **50,000+** Developers using daily
- **$180,000+** Paid to creators

## License

This project is proprietary software. All rights reserved.

## Support

- [Documentation](docs/)
- [Artist Guidelines](docs/artist-guidelines.md)
- [Developer API](docs/api.md)
- Website: [tinyscreen.studio](https://tinyscreen.studio)
