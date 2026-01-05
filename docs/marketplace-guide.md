# 1-bit Art Marketplace Guide

Welcome to TinyScreen.Studios - the premier marketplace for 1-bit monochrome art designed specifically for tiny embedded displays.

## What is 1-bit Art?

1-bit art, also known as monochrome pixel art, uses only two colors: black and white. This art form is perfect for:

- **OLED Displays**: SSD1306, SH1106, SH1107
- **E-ink Displays**: Various resolutions
- **LED Matrix Displays**: Dot matrix and custom displays
- **Embedded Projects**: Arduino, Raspberry Pi, ESP32
- **Retro Gaming**: Handheld consoles and arcade projects

## Supported Resolutions

Our marketplace focuses on the most popular tiny display resolutions:

### 128x64 pixels
- **SSD1306**: Most common OLED display
- **SH1106**: Similar to SSD1306 with slight differences
- Perfect for: Status displays, simple graphics, text

### 128x32 pixels
- **SSD1306**: Smaller variant
- Perfect for: Status bars, simple icons, text displays

### 132x64 pixels
- **SH1107**: Larger variant with extra columns
- Perfect for: More detailed graphics, wider text

## For Buyers

### What You Get
- **High-quality 1-bit art** optimized for your display
- **Ready-to-use C/C++ code** with byte arrays
- **Multiple export formats** (binary, JSON, Arduino sketches)
- **Display-specific optimizations** for your hardware
- **Commercial usage rights** for purchased art

### How to Use
1. **Browse** our curated collection
2. **Preview** art on virtual displays
3. **Purchase** and download instantly
4. **Copy** the code into your project
5. **Deploy** to your embedded device

### Code Example
```cpp
#include "cyberpunk_cityscape.h"

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.drawBitmap(0, 0, cyberpunk_cityscape, 128, 64, WHITE);
  display.display();
}
```

## For Artists

### Why Sell Here?
- **70% revenue share** - Keep most of your earnings
- **Global reach** - 50,000+ developers worldwide
- **Professional tools** - Convert and optimize your art
- **Marketing support** - Get featured and promoted
- **Quality curation** - Join a premium marketplace

### Getting Started
1. **Create your art** using any graphics software
2. **Upload to our platform** using the creator tools
3. **Convert and optimize** for different displays
4. **Set your price** and publish
5. **Start earning** from every download

### Art Requirements
- **1-bit monochrome** (black and white only)
- **Supported resolutions**: 128x64, 128x32, 132x64
- **PNG format** with clean pixels (no anti-aliasing)
- **Original artwork** (no copyrighted content)
- **Professional quality** with attention to detail

## Popular Categories

### Gaming Sprites
- Character sprites and animations
- UI elements and icons
- Enemy designs and effects
- Retro arcade-style graphics

### Icons & Symbols
- Weather and status icons
- System and interface symbols
- Navigation and control icons
- Custom brand symbols

### Portraits & Characters
- Dithered portrait techniques
- Character faces and expressions
- Stylized human figures
- Animal and creature designs

### Patterns & Textures
- Abstract geometric patterns
- Decorative backgrounds
- Texture fills and borders
- Repeating design elements

## Technical Details

### Display Compatibility
Our conversion tools ensure your art works perfectly across different display controllers:

- **SSD1306**: Standard I2C/SPI OLED
- **SH1106**: Similar to SSD1306 with page addressing
- **SH1107**: Larger format with 132 columns
- **Custom**: Define your own display parameters

### Export Formats
Every art piece comes with multiple export options:

- **C/C++ Arrays**: Ready for Arduino and embedded C
- **Binary Files**: Raw bitmap data
- **JSON Data**: Structured format for web/mobile
- **Arduino Sketches**: Complete example code

### Optimization Features
- **Byte packing**: Efficient memory usage
- **Display-specific formatting**: Optimized for your hardware
- **Compression options**: Reduce memory footprint
- **Validation tools**: Ensure compatibility

## Community & Support

### Join Our Community
- **Discord Server**: Chat with other creators and developers
- **GitHub**: Contribute to open-source tools
- **Newsletter**: Stay updated on new releases
- **Social Media**: Follow us for inspiration

### Getting Help
- **Documentation**: Comprehensive guides and tutorials
- **Video Tutorials**: Step-by-step walkthroughs
- **Community Forum**: Ask questions and share tips
- **Direct Support**: Contact our team for help

## Pricing Guide

### For Buyers
- **Simple Icons**: $0.99 - $2.99
- **Character Sprites**: $2.99 - $4.99
- **Complex Scenes**: $4.99 - $9.99
- **Animation Sets**: $7.99 - $14.99
- **Complete UI Kits**: $9.99 - $19.99

### For Artists
- **Keep 70%** of every sale
- **No upfront costs** or monthly fees
- **Instant payouts** via PayPal or Stripe
- **Transparent analytics** and reporting
- **Volume bonuses** for top sellers

## Future Roadmap

### Coming Soon
- **Animation support**: Frame-based animations
- **Custom display sizes**: Any resolution support
- **Collaboration tools**: Team projects and sharing
- **API access**: Programmatic marketplace integration
- **Mobile app**: Browse and buy on the go

### Long-term Vision
- **AI-assisted creation**: Smart conversion tools
- **3D to 1-bit conversion**: Advanced processing
- **Hardware partnerships**: Direct device integration
- **Educational content**: Courses and workshops
- **Global expansion**: Multi-language support

---

Ready to start creating or buying 1-bit art? [Visit our marketplace](/) and join the community of embedded display enthusiasts!