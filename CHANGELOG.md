# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Support for unlisted Vimeo videos with hash parameters
- Responsive video player with 16:9 aspect ratio
- Error handling for video loading states
- Loading spinner for video initialization

### Changed
- Updated video player styling with rounded corners and shadow
- Improved video container layout and responsiveness
- Simplified Vimeo URL parsing logic
- Enhanced error messages for video loading failures

### Fixed
- Video display issues with incorrect sizing
- Unlisted video access with proper hash handling
- Content Security Policy conflicts with Vimeo player
- Video aspect ratio consistency across screen sizes

### Removed
- Unnecessary Content Security Policy restrictions
- Unused video player initialization code
- Legacy video embedding approach

## [0.1.0] - 2024-12-24

### Added
- Initial release with basic lesson viewing functionality
- Vimeo video integration
- Lesson details page with description and instructions
- Basic error handling for video playback

[Unreleased]: https://github.com/yourusername/faceyoga-progress-tracker-app/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/faceyoga-progress-tracker-app/releases/tag/v0.1.0
