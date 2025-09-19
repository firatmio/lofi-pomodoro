<div align="center">
    <img alt="app screenshot" width="840" src="https://svg-banners.vercel.app/api?type=glitch&text1=Lofi%20Pomodoro&width=840&height=200" />
    <br />
    <sub>Representative banner – the app includes a minimal timer and a lofi background.</sub>
</div>

<div align="center">

#

A minimal, lofi-inspired, lightweight Pomodoro desktop app. Built with Tauri (Rust) + React for fast, low-memory, cross-platform performance.

<!-- Badges -->

[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri-24C8DB?logo=tauri&logoColor=white)](https://tauri.app)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=0b1e2b)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-1.75+-000?logo=rust&logoColor=white)](https://www.rust-lang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)
[![Platform](https://img.shields.io/badge/Platforms-Windows%20%7C%20macOS%20%7C%20Linux-444)](#installation)

</div>

## Features

- Pomodoro flow: Focus, Short Break, Long Break; optional auto-switch to the next mode
- Settings: durations, long break interval, auto start, sound alert (settings persist)
- Stats: completed focus sessions, total time, daily streak tracking
- Notification: system notification at session end
- Focus mode: one-key fullscreen; custom frameless title bar for a clean look
- Lofi background: grain, blob, and wave effects with low distraction

## Installation

Prerequisites:

- Node.js 18+ and npm
- Rust toolchain (cargo) and Tauri dependencies (additional platform-specific libraries may be required)

Clone the repository and install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run tauri dev
```

Create a production build:

```bash
npm run tauri build
```

## Usage

- Start/Pause: controls at the bottom center
- Skip to next mode: forward button
- Focus mode: icon at the top right, F11 or F on the keyboard
- Settings: gear icon at the bottom left

## Architecture Overview

- UI: React + Vite
- Desktop layer: Tauri v2
- Persistence: tauri-plugin-store (settings and stats)
- Notification: tauri-plugin-notification
- Custom title bar: frameless window + Tauri window API permissions

Key files:

- `src/App.tsx` – app shell, focus mode control
- `src/components/TimerDisplay.tsx` – timer UI
- `src/components/SettingsModal.tsx` – settings dialog
- `src/components/AlarmOverlay.tsx` – session-end animation/alert
- `src/components/TitleBar.tsx` – custom title bar and window controls
- `src-tauri/tauri.conf.json` – Tauri config (frameless, etc.)
- `src-tauri/capabilities/default.json` – permissions (fullscreen, minimize, maximize, close, drag)

## Shortcuts

- F or F11: toggle focus (fullscreen) mode
- ESC: exit fullscreen

## Troubleshooting

- On Windows, you may see Chromium class unregister logs when closing the dev session; they are harmless.
- If you experience issues toggling fullscreen, restore the window and try again.

## Roadmap

- Advanced stats panel and charts
- Shortcut customization
- Theme variations (lighter/darker lofi tones)

## Contributing

PRs are welcome. For major changes, please open a discussion first.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
