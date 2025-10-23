# Export & Integration Guide

Tiny Screen Studios exports your processed pixel art and animations into **firmware-ready** formats.

This guide explains each export option, where to use it, and how to extend it (CircuitPython, Rust, QMK, etc.).

---

## 1. Overview

### Export Controls

* **Symbol Name** – Identifier used in generated code (e.g., `display_data`)
* **Bytes per Row** – Formatting width for hex output (cosmetic only)
* **Separate Arrays** – One array per frame instead of a combined array
* **Include Metadata** – Adds comments describing preset, bytes per frame, FPS, and bit layout

### Available Formats

| Format                  | Output                        | Typical Use                             |
| ----------------------- | ----------------------------- | --------------------------------------- |
| **C Array (.c)**        | Single `.c` file with arrays  | QMK, Arduino, Adafruit-GFX, LVGL        |
| **C Files (.c + .h)**   | Header + implementation       | Modular firmware projects               |
| **Raw Binary (.bin)**   | One `.bin` per frame          | CircuitPython, Rust, MicroPython        |
| **Concatenated (.bin)** | Single binary with all frames | Streaming or `include_bytes!` workflows |

> All exports are **device-packed** (SSD1306 page/column order, LSB-top bits). No repacking required for typical SSD1306/SH1106 displays.

---

## 2. Bit Layout

**Example metadata badge**

Preset: SSD1306 128×32
Layout: Pages Top→Down · Columns Left→Right · Bits LSB-Top · ON=1
Bytes per Frame: 512

**Terminology**

* **Pages** – Groups of 8 vertical pixels (each byte = one column in a page)
* **Columns** – Left-to-right byte order within each page
* **Bits** – bit0 = top pixel (LSB-Top layout)
* **Polarity** – 1 = pixel ON (white)

If your display driver expects a different format (e.g., HLSB), you'll be able to normalize layout in a future update.

---

## 3. Choosing the Right Export

| Target Environment            | Recommended Export           |
| ----------------------------- | ---------------------------- |
| QMK / ZMK firmware            | C Array or C Files (.c + .h) |
| Arduino + Adafruit-GFX / U8g2 | C Array / C Files            |
| CircuitPython / MicroPython   | Raw Binary (.bin)            |
| Rust (embedded-graphics)      | Concatenated `.bin`          |
| Desktop Tools                 | Raw or Concatenated `.bin`   |

---

## 4. Usage Examples

Below are example integrations for common environments.

Replace values such as `WIDTH`, `HEIGHT`, `FRAME_BYTES`, and symbol names with those from your export header.

### 4.1 QMK (C Arrays)

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

### 4.2 Arduino (Adafruit-GFX)

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

### 4.3 CircuitPython

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

### 4.4 MicroPython

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

### 4.5 Rust (embedded-graphics + ssd1306)

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

---

## 5. Zip Export (Recommended)

Each export can optionally include a **Zip package** containing:

```
/display_data.c
/display_data.h
/frames/
    frame_000.bin ... frame_NNN.bin
/preview.gif
manifest.json
README_TARGET.md
```

### Example manifest.json

```json
{
  "name": "typing_cat",
  "preset": "SSD1306_128x32",
  "frames": 6,
  "bytes_per_frame": 512,
  "fps": 12,
  "packing": {
    "page": "top-down",
    "column": "left-right",
    "bit": "lsb-top",
    "polarity": "on=1"
  }
}
```

---

## 6. Target Presets (Planned Enhancement)

A **Target Environment** selector will automatically format code and include a sample snippet for:

* QMK (AVR / ARM)
* Arduino / Adafruit-GFX / U8g2
* CircuitPython / MicroPython
* Rust (embedded-graphics)
* LVGL (planned)

---

## 7. Quality & Safety Features

* Valid identifier checks for symbol names
* Clean header guards, `extern "C"` for C++
* Layout badge in UI and export comments
* Included preview GIF for quick validation
* Consistent zero-padded filenames (`frame_000.bin`)

---

## 8. Roadmap

* **Packing normalization** – Convert to target-expected bit order
* **Sprite sheet export** (WxH × N) with JSON atlas
* **Compression** options (RLE / LZ4)
* **Code template tabs** in UI for quick copy
* **Marketplace manifest** support for community sharing

---

## 9. Troubleshooting

| Issue                  | Likely Cause                                                    |
| ---------------------- | --------------------------------------------------------------- |
| Image appears inverted | Enable *Invert Output* or flip polarity in code                 |
| Garbled display        | Bit-layout mismatch (check MONO_VLSB vs row-major)              |
| Nothing shows          | Verify I²C/SPI address, init sequence, contrast, and frame size |