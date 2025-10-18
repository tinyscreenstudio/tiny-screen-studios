# Frequently Asked Questions (FAQ)

## General Questions

### What is Tiny Screen Studios?

Tiny Screen Studios is a browser-based toolkit for converting pixel art and animations into formats optimized for tiny embedded displays like SSD1306 and SH1106 OLED screens. It provides both a web interface for interactive use and a TypeScript library for programmatic integration.

### Do I need to install anything to use it?

No! You can use the web interface directly in your browser at [tinyscreen.studio](https://tinyscreen.studio). For development or integration into your own projects, you can install the npm package.

### Is it free to use?

Yes, Tiny Screen Studios is completely free and open source under the MIT license. You can use it for personal, commercial, or educational projects without any restrictions.

### Does it work offline?

Yes, once the web interface is loaded, it works completely offline. All processing happens in your browser - no server communication is required.

## Supported Formats and Displays

### What image formats are supported?

Currently, only PNG files are supported. This ensures consistent color handling and transparency support. We recommend PNG because:
- Lossless compression preserves pixel-perfect images
- Supports transparency
- Widely supported format
- No compression artifacts that could affect conversion

### What display types are supported?

Built-in support includes:
- **SSD1306 128×32** - Common small OLED display
- **SSD1306 128×64** - Popular medium OLED display  
- **SH1106 132×64** - Alternative controller with 128-pixel visible window

You can also define custom display configurations for other monochrome displays.

### Can I add support for other displays?

Yes! The library is designed to be extensible. You can define custom display presets by creating a `PresetConfig` object with your display's specifications:

```typescript
const customDisplay = {
  width: 96,
  height: 16,
  pageHeight: 8,
  bitOrder: 'lsb-top',
  pageOrder: 'top-down',
  columnOrder: 'left-right'
};
```

### What about color displays?

Tiny Screen Studios is specifically designed for monochrome (1-bit) displays. For color displays, you would need different conversion algorithms and packing formats.

## Image Processing

### Why do my images look different after conversion?

Monochrome conversion involves several factors:
- **Threshold**: Pixels above the threshold become white, below become black
- **Dithering**: Adds noise patterns to simulate gray levels
- **Luminance calculation**: Colors are converted to grayscale first using standard formula

Try adjusting the threshold or enabling dithering for better results.

### What is dithering and when should I use it?

Dithering adds a noise pattern to simulate intermediate gray levels on monochrome displays. Use it when:
- Your image has gradients or subtle shading
- You want smoother transitions between light and dark areas
- The image has important details that get lost with simple thresholding

Disable dithering for:
- Simple line art or pixel art
- Images that are already black and white
- When you want crisp, clean edges

### How do I get the best conversion results?

1. **Start with high contrast images** - Clear distinction between light and dark areas
2. **Use appropriate dimensions** - Create images at the exact display resolution
3. **Adjust threshold** - Experiment with values between 100-150
4. **Try dithering** - Enable for photos, disable for line art
5. **Preview before exporting** - Use the canvas preview to verify results

### Can I process animations?

Yes! Upload PNG files with numeric suffixes (frame_001.png, frame_002.png, etc.) and the tool will automatically:
- Order frames by filename
- Detect missing frames in sequence
- Preserve timing information
- Generate frame-by-frame or concatenated output

## Technical Questions

### How does the byte packing work?

Different display controllers organize pixel data differently:

**SSD1306**: Pixels are packed in 8-pixel vertical "pages"
- Each byte represents 8 vertical pixels
- LSB = top pixel, MSB = bottom pixel (by default)
- Pages are ordered top-to-bottom
- Columns are ordered left-to-right

**SH1106**: Similar to SSD1306 but with viewport offset
- 132 columns total, but only 128 visible (columns 2-129)
- Same vertical packing as SSD1306

### What's the difference between SSD1306 and SH1106?

- **SSD1306**: 128 columns exactly, all visible
- **SH1106**: 132 columns total, 128 visible with 2-pixel offset on each side
- **Compatibility**: SH1106 can often use SSD1306 code with minor adjustments

The library handles these differences automatically when you select the correct preset.

### Can I customize the bit order?

Yes! The packing options allow you to configure:
- **Bit order**: LSB-top (default) or MSB-top
- **Page order**: Top-down (default) or bottom-up  
- **Column order**: Left-right (default) or right-left
- **Polarity**: Normal or inverted

This accommodates different firmware implementations and display orientations.

### How accurate is the preview?

The canvas preview is pixel-perfect and matches exactly what will appear on the physical display. It includes:
- Correct bit ordering and packing
- Proper polarity handling
- SH1106 viewport offset
- Scaling and grid overlay options

## Integration and Usage

### How do I use the generated C code in Arduino?

Copy the generated array into your Arduino sketch:

```cpp
#include <Adafruit_SSD1306.h>

// Paste generated code here
const uint8_t my_bitmap[] = {
  0x00, 0x00, 0x00, 0x00, // ... rest of data
};

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.drawBitmap(0, 0, my_bitmap, 128, 64, WHITE);
  display.display();
}
```

### Can I use this in Node.js projects?

Yes! Install the core package and use it programmatically:

```bash
npm install @tiny-screen-studios/core
```

```typescript
import { processFiles } from '@tiny-screen-studios/core';

const result = await processFiles(files, 'SSD1306_128x64');
```

### How do I integrate with build systems?

The library can be integrated with Webpack, Vite, and other build tools. See the [advanced usage examples](examples/advanced-usage.md) for plugin implementations.

### Can I use this in React/Vue/Angular apps?

Yes! The core library works with any JavaScript framework. Import the functions you need and use them in your components.

## Performance and Limitations

### How many frames can I process at once?

The limit depends on your browser's memory and the image dimensions:
- **Small images (32×32)**: Hundreds of frames
- **Medium images (128×64)**: 50-100 frames  
- **Large batches**: Use Web Workers or process in smaller chunks

The tool will warn you about performance implications and suggest optimizations.

### Why is processing slow?

Several factors affect processing speed:
- **Image size**: Larger images take more time
- **Number of frames**: More frames = more processing
- **Dithering**: Adds computational overhead
- **Browser**: Some browsers are faster than others

For large batches, enable Web Worker processing or reduce image sizes.

### What are the memory requirements?

Approximate memory usage per frame:
- **128×64 image**: ~32KB RGBA + ~1KB monochrome + ~1KB packed
- **Animation (30 frames)**: ~1MB total
- **Large batch (100 frames)**: ~3-4MB

The tool manages memory efficiently and provides warnings for large operations.

## Troubleshooting

### My images have the wrong dimensions

**Error**: "Dimension mismatch - expected 128×64, got 256×128"

**Solution**: Resize your images to match the display preset:
- Use image editing software
- Create images at the correct size from the start
- Check the preset you've selected

### Files aren't recognized as PNG

**Error**: "Unsupported file format"

**Solution**: 
- Ensure files are actual PNG format (not renamed JPG)
- Re-save images as PNG in image editor
- Check for file corruption

### Animation frames are out of order

**Problem**: Frames play in wrong sequence

**Solution**: Use proper naming convention:
```
frame_001.png  ✓ Correct
frame_002.png  ✓ Correct
frame_003.png  ✓ Correct

frame_1.png    ✗ Wrong (inconsistent padding)
frame_10.png   ✗ Wrong (will sort before frame_2.png)
```

### Generated code doesn't work on hardware

**Checklist**:
1. Verify display wiring and I2C address
2. Check display initialization code
3. Ensure bitmap dimensions match display
4. Try different packing options (bit order, polarity)
5. Test with simple pattern first

### Canvas preview is blurry

**Solution**: The library automatically disables image smoothing, but ensure:
- Use integer scaling factors (2x, 4x, 8x)
- Canvas size matches scaled dimensions
- Browser supports pixel-perfect rendering

## Development and Contributing

### How can I contribute?

We welcome contributions! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines:
- Report bugs and suggest features
- Improve documentation
- Add support for new displays
- Optimize performance
- Write tests

### Can I use this code in my own project?

Yes! The MIT license allows you to:
- Use in commercial projects
- Modify the code
- Distribute modified versions
- Include in proprietary software

Just include the license notice in your distribution.

### How do I report bugs?

1. Check existing issues on GitHub
2. Create a minimal reproduction case
3. Include environment details (browser, Node.js version, etc.)
4. Provide sample files if possible (and safe to share)

### Where can I get help?

- **Documentation**: [docs/](.)
- **GitHub Issues**: [Report bugs and request features](https://github.com/tinyscreenstudio/tiny-screen-studios/issues)
- **Discussions**: [Community discussions](https://github.com/tinyscreenstudio/tiny-screen-studios/discussions)
- **Examples**: [Usage examples](examples/)

## Advanced Usage

### Can I process images programmatically?

Yes! The core library provides full programmatic access:

```typescript
import { 
  decodeImageFiles, 
  toMonochrome, 
  packFrames, 
  toCRawArray 
} from '@tiny-screen-studios/core';

// Full control over the conversion pipeline
const rgbaFrames = await decodeImageFiles(files);
const monoFrames = toMonochrome(rgbaFrames, { threshold: 120 });
const packedFrames = packFrames(monoFrames, { preset: 'SSD1306_128x64' });
const cCode = toCRawArray(packedFrames, 'my_bitmap');
```

### Can I extend the export formats?

Yes! You can create custom export functions:

```typescript
function toCustomFormat(frames: PackedFrame[]): string {
  // Implement your custom format
  return customFormattedData;
}
```

### How do I optimize for large-scale processing?

- Use Web Workers for heavy processing
- Process files in batches
- Implement streaming processing for memory efficiency
- Use typed arrays for better performance
- See [advanced usage examples](examples/advanced-usage.md) for details

### Can I integrate with CI/CD pipelines?

Yes! Use the Node.js API in build scripts:

```bash
# Install as dev dependency
npm install -D @tiny-screen-studios/core

# Use in build script
node scripts/generate-bitmaps.js
```

This allows automatic generation of display assets during your build process.

---

**Still have questions?** Check our [documentation](.) or [open an issue](https://github.com/tinyscreenstudio/tiny-screen-studios/issues) on GitHub!