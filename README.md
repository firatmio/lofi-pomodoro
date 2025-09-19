# Lofi Pomodoro (Tauri + React)

Basit, kalıcı ayarlar ve istatistiklerle lofi temalı Pomodoro uygulaması.

Özellikler:

- Pomodoro akışı: Odak, Kısa Mola, Uzun Mola
- Ayarlar: süreler, uzun mola aralığı, otomatik başlat, sesli uyarı
- Kalıcılık: Tauri Store ile `settings.json` dosyasında saklanır
- Bildirim: Seans bitiminde sistem bildirimi
- Lofi arka plan ve minimal UI

Geliştirme:

```bash
npm install
npm run tauri dev
```

Build:

```bash
npm run tauri build
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
