# Export & Integration Guide

Tiny Screen Studios exports your processed pixel art and animations into **firmware-ready** formats for embedded displays.

This guide will help you understand how the export system works and how to integrate your graphics into various platforms.


## What Gets Exported

When you export your pixel art or animation, Tiny Screen Studios converts it into a format that's ready to use on SSD1306/SH1106 OLED displays. The data is already **device-packed** in the exact memory layout these displays expect.

### Understanding the Data Format

Your graphics are exported in **SSD1306 page/column format**:

- **Pages** – Groups of 8 vertical pixels (each byte = one column in a page)
- **Columns** – Left-to-right byte order within each page
- **Bits** – bit0 = top pixel (LSB-Top layout)
- **Polarity** – 1 = pixel ON (white)

This means you can send the exported data directly to your display without any conversion or repacking.

### Example Metadata

Each export includes metadata describing the format:

```
Preset: SSD1306 128×32
Layout: Pages Top→Down · Columns Left→Right · Bits LSB-Top · ON=1
Bytes per Frame: 512
```

> **Note:** If your display driver expects a different format (e.g., HLSB), you'll be able to normalize the layout in a future update.


## Export Configuration Options

Before exporting, you can configure several options to match your project needs:

### Symbol Name

The identifier used in generated C code (e.g., `display_data`, `my_animation`). This becomes the variable name in your firmware.

### Bytes per Row

Controls how many bytes appear per line in hex output. This is purely cosmetic and doesn't affect functionality—use it to make the generated code more readable.

### Separate Arrays

- **Enabled**: Creates one array per frame (`frame_0[]`, `frame_1[]`, etc.)
- **Disabled**: Combines all frames into a single array

Choose based on whether you want to access frames individually or iterate through a combined buffer.

### Include Metadata

Adds helpful comments to the generated code describing:
- Display preset (e.g., SSD1306 128×32)
- Bytes per frame
- Frame rate (FPS)
- Bit layout details

Recommended for documentation and future reference.


## Available Export Formats

Choose the format that best matches your development environment:

| Format                  | Output                        | Best For                                |
| ----------------------- | ----------------------------- | --------------------------------------- |
| **C Array (.c)**        | Single `.c` file with arrays  | QMK, Arduino, Adafruit-GFX, LVGL        |
| **C Files (.c + .h)**   | Header + implementation       | Modular firmware projects               |
| **Raw Binary (.bin)**   | One `.bin` per frame          | CircuitPython, Rust, MicroPython        |
| **Concatenated (.bin)** | Single binary with all frames | Streaming or `include_bytes!` workflows |

### C Array (.c)

A single C file containing all frame data as arrays. Quick and simple for small projects.

### C Files (.c + .h)

Separate header and implementation files. Better for larger projects where you want clean separation and can include the header in multiple source files.

### Raw Binary (.bin)

Individual binary files for each frame. Perfect for dynamic languages like Python where you can read files at runtime.

### Concatenated (.bin)

All frames in a single binary file. Ideal for Rust's `include_bytes!` macro or when you want to stream frame data sequentially.


## Choosing the Right Format

Pick your export format based on what you're building:

| What You're Building              | Recommended Format           | Why                                                    |
| --------------------------------- | ---------------------------- | ------------------------------------------------------ |
| QMK / ZMK keyboard firmware       | C Array or C Files (.c + .h) | Integrates directly with OLED driver APIs              |
| Arduino + Adafruit-GFX / U8g2     | C Array or C Files           | Works with `drawBitmap()` and similar functions        |
| CircuitPython / MicroPython       | Raw Binary (.bin)            | Easy to load with `open()` and `framebuf`              |
| Rust embedded (embedded-graphics) | Concatenated (.bin)          | Use with `include_bytes!` macro for zero-cost includes |
| Desktop tools / testing           | Raw or Concatenated (.bin)   | Universal format, easy to parse                        |


## Integration Examples

Here's how to use your exported graphics in different environments.

> **Note:** Replace `WIDTH`, `HEIGHT`, `FRAME_BYTES`, and symbol names with values from your export.

### QMK Keyboard Firmware

```c
#include "quantum.h"
#include "oled_driver.h"
#include "display_data.h"

#define FRAME_BYTES 512

static uint8_t frame = 0;
static uint32_t last_ms = 0;

bool oled_task_user(void) {
    if (timer_elapsed32(last_ms) > 100) { // ~10 FPS
        last_ms = timer_read32();
        frame = (frame + 1) % DISPLAY_DATA_FRAME_COUNT;
        oled_write_raw_P(display_data_frames[frame], FRAME_BYTES);
    }
    return false;
}
```

### Arduino with Adafruit-GFX

```cpp
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "display_data.h"

Adafruit_SSD1306 display(128, 32, &Wire);

void setup() {
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();
    display.drawBitmap(0, 0, display_data_frame_0, 128, 32, 1);
    display.display();
}

void loop() {}
```

### CircuitPython

```python
import board, busio
from adafruit_ssd1306 import SSD1306_I2C
import framebuf

WIDTH, HEIGHT = 128, 32

with open("/frame_000.bin", "rb") as f:
    buf = bytearray(f.read())

i2c = busio.I2C(board.SCL, board.SDA)
display = SSD1306_I2C(WIDTH, HEIGHT, i2c)

fb = framebuf.FrameBuffer(buf, WIDTH, HEIGHT, framebuf.MONO_VLSB)
display.fill(0)
display.blit(fb, 0, 0)
display.show()
```

### MicroPython

```python
from machine import I2C, Pin
import ssd1306, framebuf

i2c = I2C(0, scl=Pin(5), sda=Pin(4))
oled = ssd1306.SSD1306_I2C(128, 32, i2c)

with open("frame_000.bin", "rb") as f:
    buf = bytearray(f.read())

fb = framebuf.FrameBuffer(buf, 128, 32, framebuf.MONO_VLSB)
oled.fill(0)
oled.blit(fb, 0, 0)
oled.show()
```

### Rust with embedded-graphics

```rust
use embedded_graphics::image::{Image, ImageRaw};
use embedded_graphics::pixelcolor::BinaryColor;
use embedded_graphics::prelude::*;
use ssd1306::{prelude::*, Ssd1306};

const BYTES: &[u8] = include_bytes!("display_data.bin");

fn draw<D>(display: &mut Ssd1306<D, DisplaySize128x32, BufferedGraphicsMode<DisplaySize128x32>>)
where
    D: WriteOnlyDataCommand,
{
    let raw = ImageRaw::<BinaryColor>::new_mono(BYTES, 128);
    let image = Image::new(&raw, Point::new(0, 0));
    image.draw(display).ok();
    display.flush().ok();
}
```

## Troubleshooting

| Issue                  | Likely Cause                                                    | Solution                                                      |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| Image appears inverted | Polarity mismatch                                               | Enable *Invert Output* in export settings or flip in code     |
| Garbled display        | Bit-layout mismatch                                             | Verify driver expects MONO_VLSB format (not row-major)        |
| Nothing shows          | Display not initialized or wrong address                        | Check I²C/SPI address, init sequence, contrast, and frame size |
| Partial image          | Buffer size mismatch                                            | Verify `FRAME_BYTES` matches your display dimensions          |


## Quality & Safety Features

Tiny Screen Studios ensures your exports are production-ready:

- Valid identifier checks for symbol names
- Clean header guards and `extern "C"` for C++ compatibility
- Layout badge in UI and export comments
- Preview GIF included for quick validation
- Consistent zero-padded filenames (`frame_000.bin`)


## Coming Soon

Future enhancements to the export system:

- **Zip Package Export** – Download all formats, frames, preview GIF, and manifest in one package
- **Target Environment Presets** – Auto-generate code snippets for QMK, Arduino, CircuitPython, Rust, and LVGL
- **Packing Normalization** – Convert to different bit orders (HLSB, row-major, etc.)
- **Sprite Sheet Export** – Generate texture atlases with JSON metadata
- **Compression Options** – RLE and LZ4 compression for larger animations
- **Code Template Tabs** – Copy-paste ready snippets directly in the UI
- **Marketplace Support** – Share and download community graphics
