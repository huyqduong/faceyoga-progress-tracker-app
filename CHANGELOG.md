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
- Better authentication handling in stores

### Changed
- Updated video player styling with rounded corners and shadow
- Improved video container layout and responsiveness
- Simplified Vimeo URL parsing logic
- Enhanced error messages for video loading failures
- Removed duration field from lesson completion to match database schema
- Improved store authentication handling
- Simplified store interfaces

### Fixed
- Video display issues with incorrect sizing
- Unlisted video access with proper hash handling
- Content Security Policy conflicts with Vimeo player
- Video aspect ratio consistency across screen sizes
- Lesson completion functionality with proper store integration
- Missing toast notifications for lesson completion
- Database schema mismatch in lesson history
- User authentication issues in stores
- Undefined user ID errors
- Goal progress tracking errors

### Removed
- Unnecessary Content Security Policy restrictions
- Unused video player initialization code
- Legacy video embedding approach
- Duration field from lesson history records
- Redundant loading states from stores

## [1.2.0] - 2025-01-01

### Added
- Enhanced rewards system with automatic achievement tracking
- New achievement badges with custom SVG icons
- Automatic level progression based on points
- Streak tracking for consistent practice
- Database triggers for automatic achievement awards
- Documentation for rewards system

### Fixed
- Achievement display issues in user profile
- Points calculation from completed goals
- Streak tracking accuracy
- Multiple user rewards records handling

### Changed
- Updated achievement badge styling
- Improved rewards state management
- Enhanced achievement fetching with proper ordering

## [0.1.0] - 2024-12-24

### Added
- Initial release with basic lesson viewing functionality
- Vimeo video integration
- Lesson details page with description and instructions
- Basic error handling for video playback

[Unreleased]: https://github.com/huyqduong/faceyoga-progress-tracker-app/compare/v0.1.0...HEAD
[1.2.0]: https://github.com/huyqduong/faceyoga-progress-tracker-app/releases/tag/v1.2.0
[0.1.0]: https://github.com/huyqduong/faceyoga-progress-tracker-app/releases/tag/v0.1.0
