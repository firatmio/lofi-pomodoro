<div align="center">
	<img alt="app screenshot" width="840" src="https://svg-banners.vercel.app/api?type=glitch&text1=Lofi%20Pomodoro&width=840&height=200" />
	<br />
	<sub>Temsili banner – uygulama içinde minimal sayaç ve lofi arka plan bulunur.</sub>
</div>

<div align="center">

#

Minimal, lofi esintili ve hafif bir Pomodoro masaüstü uygulaması. Tauri (Rust) + React ile hızlı, düşük bellek tüketimli ve platformlar arası.

<!-- Badges -->

[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri-24C8DB?logo=tauri&logoColor=white)](https://tauri.app)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=0b1e2b)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-1.75+-000?logo=rust&logoColor=white)](https://www.rust-lang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)
[![Platform](https://img.shields.io/badge/Platforms-Windows%20%7C%20macOS%20%7C%20Linux-444)](#kurulum)

</div>

## Özellikler

- Pomodoro akışı: Odak, Kısa Mola, Uzun Mola; otomatik sıradaki moda geçiş seçeneği
- Ayarlar: süreler, uzun mola aralığı, otomatik başlat, sesli uyarı (ayarlar kalıcıdır)
- İstatistikler: tamamlanan odak, toplam süre, günlük seri takibi
- Bildirim: seans bitiminde sistem bildirimi
- Focus modu: tek tuşla tam ekran; özel frameless title bar ile temiz görünüm
- Lofi arka plan: grain, blob ve dalga efektleriyle düşük dikkat dağıtımı

## Ekran Görüntüsü

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/197bc6ac-407c-41a6-bead-b440d7f736b4" />

## Kurulum

Önkoşullar:

- Node.js 18+ ve npm
- Rust toolchain (cargo) ve Tauri bağımlılıkları (platforma göre ek kütüphaneler gerekebilir)

Depoyu kopyalayın ve bağımlılıkları kurun:

```bash
npm install
```

Geliştirme modunda çalıştırın:

```bash
npm run tauri dev
```

Prod derleme alın:

```bash
npm run tauri build
```

## Kullanım

- Başlat/Duraklat: orta alttaki kontrol butonları
- Sonraki moda atla: ileri butonu
- Focus modu: sağ üstteki simge, klavyeden F11 veya F
- Ayarlar: sol alttaki dişli ikon

## Mimari Kısa Özet

- Arayüz: React + Vite
- Masaüstü katmanı: Tauri v2
- Kalıcılık: tauri-plugin-store (ayarlar ve istatistikler)
- Bildirim: tauri-plugin-notification
- Özel başlık çubuğu: frameless pencere + Tauri window API izinleri

Kaynak dosyalar:

- `src/App.tsx` – uygulama kabuğu, fokus modu kontrolü
- `src/components/TimerDisplay.tsx` – sayaç UI’si
- `src/components/SettingsModal.tsx` – ayarlar penceresi
- `src/components/AlarmOverlay.tsx` – seans sonu animasyon/uyarı
- `src/components/TitleBar.tsx` – özel title bar ve pencere kontrolleri
- `src-tauri/tauri.conf.json` – Tauri ayarları (frameless vb.)
- `src-tauri/capabilities/default.json` – izinler (fullscreen, minimize, maximize, close, drag)

## Kısayollar

- F veya F11: focus (fullscreen) modunu aç/kapat
- ESC: fullscreen’den çık

## Sorun Giderme

- Windows’ta dev oturumunu kapatırken Chromium sınıfı unregister logları görebilirsiniz; zararsızdır.
- Fullscreen geçişlerinde sorun yaşarsanız, pencereyi restore edip tekrar deneyin.

## Yol Haritası

- Gelişmiş istatistik paneli ve grafikler
- Kısayol özelleştirme
- Tema varyasyonları (daha açık/daha koyu lofi tonları)

## Katkı

PR’ler memnuniyetle karşılanır. Büyük değişiklikler için önce tartışma açmanız önerilir.

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır. Ayrıntılar için [LICENSE](./LICENSE) dosyasına bakın.
