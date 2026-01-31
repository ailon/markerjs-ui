# marker.js UI Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-31

### Added

- auto-zoom (zoom to fit) support to the Editor
- auto-zoom (zoom to fit) to the Viewer

## [1.0.1] - 2025-09-11

### Fixed

- toolbar switches to select while creating freehand markers continuously
- stroke style icons not visible in some setups

## [1.0.0] - 2025-04-18

### Changed

- `AnnotationEditor.markerArea` and `AnnotationViewer.markerView` now are instantiated right away so you can always access them (eg. to add listeners for more detailed events)
- removed rounded corners from main containers - leave this for the consumer to decide
- updated dependencies

## [1.0.0-beta.1] - 2025-04-16

### Fixed

- buttons not visible in dark mode
- some doc comments and typos

## [1.0.0-beta.0] - 2025-04-15

### Added

- annotation editor settings to configure image rendering and other behavior

### Fixed

- typos, doc comments, and other minor issues

## [1.0.0-alpha.0] - 2025-04-10

### Added

- Initial public release.

[1.1.0]: https://github.com/ailon/markerjs3/releases/tag/v1.1.0
[1.0.1]: https://github.com/ailon/markerjs3/releases/tag/v1.0.1
[1.0.0]: https://github.com/ailon/markerjs3/releases/tag/v1.0.0
[1.0.0-beta.1]: https://github.com/ailon/markerjs3/releases/tag/v1.0.0-beta.1
[1.0.0-beta.0]: https://github.com/ailon/markerjs3/releases/tag/v1.0.0-beta.0
[1.0.0-alpha.0]: https://github.com/ailon/markerjs3/releases/tag/v1.0.0-alpha.0
