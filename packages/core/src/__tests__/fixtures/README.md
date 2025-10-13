# Test Fixtures

This directory contains golden fixture files for testing the Tiny Screen Studios core library.

## Structure

- `images/` - Sample PNG files for testing image decoding
- `expected/` - Expected byte outputs for various device presets and configurations
- `golden/` - Golden reference files for regression testing

## Golden Fixtures

Golden fixtures are reference files that contain known-good outputs for specific inputs. These are used to ensure that changes to the codebase don't break existing functionality.

Each golden fixture includes:
- Input parameters (dimensions, preset, options)
- Expected byte output
- Metadata about the test case

## Usage

Test utilities in `../utils/` provide helper functions for:
- Loading fixture data
- Comparing outputs against golden references
- Creating new test frames
- Generating benchmark data