# Tiny Screen Studios Documentation

Welcome to the comprehensive documentation for Tiny Screen Studios - a powerful toolkit for converting pixel art and animations into formats optimized for tiny embedded displays.

## 📚 Documentation Overview

### Getting Started
- **[Main README](../README.md)** - Project overview, quick start, and basic usage
- **[Installation Guide](../README.md#quick-start)** - Setup instructions for web and development use
- **[Basic Usage Examples](examples/basic-usage.md)** - Step-by-step examples for common tasks

### API Reference
- **[API Documentation](API.md)** - Complete API reference with types and functions
- **[Core Types](API.md#core-types)** - TypeScript type definitions and interfaces
- **[Function Reference](API.md#core-functions)** - Detailed function documentation

### Examples and Tutorials
- **[Basic Usage](examples/basic-usage.md)** - Common use cases and integration patterns
- **[Advanced Usage](examples/advanced-usage.md)** - Complex scenarios and performance optimization
- **[Arduino Integration](examples/basic-usage.md#arduino-integration)** - Using generated code in Arduino projects
- **[Web Integration](examples/basic-usage.md#web-integration)** - Building web applications
- **[Node.js Integration](examples/basic-usage.md#nodejs-integration)** - Command-line tools and automation

### Troubleshooting and Support
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Solutions for common issues
- **[FAQ](FAQ.md)** - Frequently asked questions and answers
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute to the project

## 🚀 Quick Navigation

### I want to...

**Convert a single image for Arduino**
→ [Basic Image Conversion](examples/basic-usage.md#basic-image-conversion)

**Process an animation sequence**
→ [Animation Processing](examples/basic-usage.md#animation-processing)

**Integrate into my web app**
→ [Web Integration](examples/basic-usage.md#web-integration)

**Use in a Node.js project**
→ [Node.js Integration](examples/basic-usage.md#nodejs-integration)

**Optimize for large files**
→ [Performance Optimization](examples/advanced-usage.md#performance-optimization)

**Add support for a custom display**
→ [Custom Display Support](examples/advanced-usage.md#custom-display-support)

**Troubleshoot an issue**
→ [Troubleshooting Guide](TROUBLESHOOTING.md)

## 📖 Core Concepts

### Processing Pipeline

Tiny Screen Studios follows a clear processing pipeline:

```
PNG Files → RGBA Frames → Monochrome Frames → Packed Bytes → Export
```

1. **Image Decoding** - Convert PNG files to RGBA pixel data
2. **Monochrome Conversion** - Apply threshold and dithering to create 1-bit images
3. **Byte Packing** - Organize pixels according to display controller requirements
4. **Export** - Generate C arrays, binary files, or other formats

### Supported Displays

| Display | Resolution | Notes |
|---------|------------|-------|
| SSD1306 | 128×32, 128×64 | Most common OLED displays |
| SH1106 | 132×64 | 128-pixel visible window |
| Custom | Any size | Define your own configurations |

### Key Features

- **Browser-based** - No installation required for basic use
- **Pixel-perfect preview** - See exactly how images will appear
- **Animation support** - Process PNG sequences with timing
- **Multiple export formats** - C arrays, binary files, JSON
- **Performance optimized** - Web Workers for large batches
- **Extensible** - Add custom displays and export formats

## 🛠️ Development Setup

For contributors and advanced users who want to modify or extend the library:

```bash
# Clone the repository
git clone https://github.com/yourusername/tiny-screen-studios.git
cd tiny-screen-studios

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

### Project Structure

```
tiny-screen-studios/
├── packages/
│   ├── core/                 # Core TypeScript library
│   │   ├── src/
│   │   │   ├── converters/   # Image processing
│   │   │   ├── packers/      # Display-specific packing
│   │   │   ├── emulator/     # Canvas rendering
│   │   │   ├── exporters/    # Output generation
│   │   │   └── types/        # Type definitions
│   │   └── dist/             # Built library
│   └── ui/                   # Web interface
│       ├── src/
│       └── dist/             # Built web app
├── docs/                     # Documentation (this directory)
└── examples/                 # Usage examples
```

## 🤝 Community and Support

### Getting Help

1. **Check the documentation** - Most questions are answered here
2. **Search existing issues** - Someone might have had the same problem
3. **Ask in discussions** - Community Q&A and feature requests
4. **Report bugs** - Help us improve the project

### Contributing

We welcome contributions of all kinds:

- **Bug reports** - Help us identify and fix issues
- **Feature requests** - Suggest new capabilities
- **Documentation** - Improve guides and examples
- **Code contributions** - Add features or fix bugs
- **Testing** - Help verify functionality across different environments

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

### Links

- **🌐 Web App**: [tiny-screen-studios.github.io](https://yourusername.github.io/tiny-screen-studios)
- **📦 npm Package**: [@tiny-screen-studios/core](https://www.npmjs.com/package/@tiny-screen-studios/core)
- **🐛 Issues**: [GitHub Issues](https://github.com/yourusername/tiny-screen-studios/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/yourusername/tiny-screen-studios/discussions)
- **📧 Email**: support@tiny-screen-studios.com

## 📄 License

Tiny Screen Studios is released under the [MIT License](../LICENSE). You're free to use it in personal, commercial, or educational projects.

---

**Ready to get started?** Try the [web interface](https://yourusername.github.io/tiny-screen-studios) or check out the [basic usage examples](examples/basic-usage.md)!