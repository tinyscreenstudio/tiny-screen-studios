# Export Configuration

Understanding different export formats and display configurations to get the best results for your OLED display projects.

## Display Presets

Choose the correct preset for your display to ensure proper formatting:

### SSD1306 128×32

- **Resolution:** 128×32 pixels
- **Pages:** 4 (8 pixels each)
- **Memory:** 512 bytes
- **Common uses:** Status displays, small info screens

### SSD1306 128×64

- **Resolution:** 128×64 pixels
- **Pages:** 8 (8 pixels each)
- **Memory:** 1024 bytes
- **Common uses:** Main displays, graphics, animations

> **💡 SH1106 Note**
> 
> SH1106 displays are 132×64 but only show 128 pixels (columns 2-129). The tool automatically handles this offset for you.

## Export Formats

### C Array (.h files)

The most common format for Arduino and embedded projects. Generates a C array that can be directly included in your code.

```cpp
// Generated C array
const uint8_t my_bitmap[] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  // ... rest of bitmap data
};

// Usage in Arduino
display.drawBitmap(0, 0, my_bitmap, 128, 64, WHITE);
```

### Binary Files (.bin)

Raw binary data files that can be loaded directly into display memory or stored in external memory for larger projects.

## Conversion Settings

### Threshold

Controls which pixels become black or white. Pixels with brightness above the threshold become white, below become black.

- **Low threshold (50-100):** More white pixels, good for dark images
- **Medium threshold (120-140):** Balanced conversion, good default
- **High threshold (180-220):** More black pixels, good for bright images

### Dithering

Adds a noise pattern to simulate gray levels on monochrome displays.

- **None:** Clean, sharp edges. Best for line art and pixel art
- **Bayer 4×4:** Adds texture to simulate gradients. Best for photos

#### Without Dithering
Sharp transitions, good for graphics and text

#### With Dithering
Textured appearance, better for photos and gradients

## Advanced Options

### Bit Order

Controls how pixels are packed within each byte:

- **LSB Top (default):** Least significant bit = top pixel
- **MSB Top:** Most significant bit = top pixel

### Invert

Flips all pixel values. Use this if your display shows inverted colors (white background instead of black).

## Troubleshooting Export Issues

### Image appears corrupted on display

1. Verify you selected the correct display preset
2. Check image dimensions match your display
3. Try different bit order setting
4. Test with inverted polarity

### Arduino compilation errors

1. Ensure the array name is valid (no spaces or special characters)
2. Check that you have the required libraries installed
3. Verify the array size matches your display dimensions

### Display shows nothing

1. Test with a simple pattern first
2. Check display wiring and I2C address
3. Verify display initialization code
4. Try the inverted export option

> **🔧 Pro Tips**
> 
> - Start with high-contrast images for best results
> - Use the preview to verify conversion before exporting
> - Test with simple patterns before complex images
> - Keep a backup of your original images