# 🖥️ Tiny Screen Studios

> Convert pixel art and animations to tiny display formats for embedded devices

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Tiny Screen Studios is a powerful toolkit for converting pixel art and animations into formats optimized for tiny embedded displays like SSD1306 and SH1106 OLED screens. Perfect for Arduino projects, IoT devices, and retro gaming displays.

## ✨ Features

- 🎨 **Pixel Art Conversion** - Transform images into monochrome bitmap formats
- 🎬 **Animation Support** - Convert GIFs and sprite sheets to display-ready sequences
- 📱 **Multiple Display Types** - Support for SSD1306, SH1106, and other monochrome displays
- 🔧 **Headless Library** - Use programmatically in your own projects
- 🌐 **Web Interface** - User-friendly browser-based tool
- ⚡ **Fast Processing** - Optimized algorithms for quick conversion
- 📦 **Multiple Formats** - Export as C arrays, binary data, or JSON

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+ (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tiny-screen-studios.git
cd tiny-screen-studios

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The web interface will be available at `http://localhost:3000`

## 📦 Packages

This is a monorepo containing two main packages:

### `@tiny-screen-studios/core`

Headless TypeScript library for programmatic use:

```typescript
import { convertImage, DisplayType } from '@tiny-screen-studios/core';

const bitmap = await convertImage('path/to/image.png', {
  displayType: DisplayType.SSD1306,
  width: 128,
  height: 64,
  threshold: 128,
});
```

### `@tiny-screen-studios/ui`

Web-based interface for interactive conversion:

- Drag & drop image upload
- Real-time preview
- Adjustable conversion settings
- Multiple export formats
- Animation timeline editor

## 🛠️ Development

### Setup

```bash
# Install dependencies
pnpm install

# Start development mode (both packages)
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint and format code
pnpm lint
pnpm format
```

### Package-Specific Commands

#### Core Library

```bash
# Build the library
pnpm --filter core build

# Run tests with coverage
pnpm --filter core test

# Watch mode for development
pnpm --filter core dev

# Type checking
pnpm --filter core type-check
```

#### Web Interface

```bash
# Start dev server (http://localhost:3000)
pnpm --filter ui dev

# Build for production
pnpm --filter ui build

# Preview production build
pnpm --filter ui preview
```

### Project Structure

```
tiny-screen-studios/
├── packages/
│   ├── core/                 # Headless TypeScript library
│   │   ├── src/
│   │   │   ├── converters/   # Image conversion algorithms
│   │   │   ├── displays/     # Display-specific configurations
│   │   │   ├── types/        # TypeScript definitions
│   │   │   └── utils/        # Utility functions
│   │   └── dist/             # Built library files
│   └── ui/                   # Web interface
│       ├── src/
│       │   ├── components/   # Vue/React components
│       │   ├── stores/       # State management
│       │   └── utils/        # UI utilities
│       └── dist/             # Built web app
├── docs/                     # Documentation
└── examples/                 # Usage examples
```

## 🎯 Supported Display Types

| Display | Resolution     | Notes                                      |
| ------- | -------------- | ------------------------------------------ |
| SSD1306 | 128×64, 128×32 | Most common OLED display                   |
| SH1106  | 128×64         | Similar to SSD1306 with slight differences |
| Custom  | Any size       | Define your own display parameters         |

## 📖 Usage Examples

### Converting a Single Image

```typescript
import { convertImage, DisplayType } from '@tiny-screen-studios/core';

const result = await convertImage('logo.png', {
  displayType: DisplayType.SSD1306,
  width: 128,
  height: 64,
  threshold: 128,
  invert: false,
});

// Export as C array for Arduino
console.log(result.toCArray());
```

### Processing an Animation

```typescript
import { convertAnimation } from '@tiny-screen-studios/core';

const frames = await convertAnimation('animation.gif', {
  displayType: DisplayType.SSD1306,
  width: 128,
  height: 64,
  maxFrames: 30,
  frameDelay: 100,
});

// Export as frame sequence
frames.forEach((frame, index) => {
  console.log(`Frame ${index}:`, frame.toCArray());
});
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

This project uses:

- **TypeScript** with strict mode enabled
- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the embedded development community
- Built with modern web technologies
- Special thanks to all contributors

## 📞 Support

- 📚 [Documentation](https://github.com/yourusername/tiny-screen-studios/wiki)
- 🐛 [Issue Tracker](https://github.com/yourusername/tiny-screen-studios/issues)
- 💬 [Discussions](https://github.com/yourusername/tiny-screen-studios/discussions)

---

<p align="center">
  Made with ❤️ for the maker community
</p>
