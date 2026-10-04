# Changelog

All notable changes to this package are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [semantic versioning](https://semver.org/).

## [0.1.1] - 2026-10-04

### Documentation

- How to set up Jest: add the `@apolloscooters` scope to `transformIgnorePatterns`. No mock is needed.

## [0.1.0] - 2026-10-04

### Added

- `WheelPicker`: the platform wheel picker (`UIPickerView` on iOS, `NumberPicker` on Android) as a Fabric component.
- Props `items`, `selectedValue`, `onValueChange`, `textColor`, `fontSize`, `accessibilityLabel`, `style` and `testID`.
- A wheel on screen is never rebuilt: rows, colour and font are applied to a fresh wheel, the selection only moves from code while the wheel is idle, and the iOS view is never recycled.
