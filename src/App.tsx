import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef, useState } from "react";
import { FiMaximize2, FiMinimize2, FiSettings } from "react-icons/fi";
import "./App.css";
import { AlarmOverlay } from "./components/AlarmOverlay";
import { SettingsModal } from "./components/SettingsModal";
import { TimerDisplay } from "./components/TimerDisplay";
import { notify } from "./lib/notify";
import { read, write } from "./lib/store";
import { DEFAULT_SETTINGS, isToday, labelFor, nextMode, secondsFor, ZERO_STATS, type Mode, type Settings, type Stats } from "./lib/types";

function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>(ZERO_STATS);
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState<number>(secondsFor("work", DEFAULT_SETTINGS));
  const [running, setRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0); // tamamlanan odak sayacı
  const [showSettings, setShowSettings] = useState(false);
  const [alarming, setAlarming] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const alarmTimeoutRef = useRef<number | null>(null);
  const [grid, setGrid] = useState<{ cols: number; rows: number }>({ cols: 0, rows: 0 });
  const tickRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // load settings + stats
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const savedSettings = (await read<Settings>("settings")) ?? DEFAULT_SETTINGS;
  const savedStats = (await read<Stats>("stats")) ?? ZERO_STATS;
        if (!mounted) return;
        setSettings(savedSettings);
        setStats(savedStats);
        setSecondsLeft(secondsFor("work", savedSettings));
      } catch (e) {
        console.error("store load error", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // persist settings and stats on change
  useEffect(() => {
    write("settings", settings);
  }, [settings]);

  useEffect(() => {
    write("stats", stats);
  }, [stats]);

  // timer loop
  useEffect(() => {
    if (!running) {
      if (tickRef.current) {
        cancelAnimationFrame(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.floor((t - last) / 1000);
      if (dt >= 1) {
        setSecondsLeft((prev) => Math.max(0, prev - dt));
        last = t;
      }
      tickRef.current = requestAnimationFrame(loop);
    };
    tickRef.current = requestAnimationFrame(loop);
    return () => {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
    };
  }, [running]);

  // on complete
  useEffect(() => {
    if (secondsLeft !== 0) return;
    // alarm state
    setAlarming(true);
    if (settings.soundOn) {
      audioRef.current?.play().catch(() => {});
    }
    // auto silence after 5s
    if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
    alarmTimeoutRef.current = window.setTimeout(() => {
      silenceAlarm();
    }, 5000);
    // bildirim
    const nextLabel = nextMode(mode, cycleCount, settings) === "work" ? "Odak" : "Mola";
    notify("Zaman doldu", `${labelFor(mode)} tamamlandı. Sırada ${nextLabel}!`);

    if (mode === "work") {
      // istatistik güncelle
      setStats((st) => ({
        completedFocus: st.completedFocus + 1,
        totalSeconds: st.totalSeconds + secondsFor("work", settings),
        streak: st.lastCompletedAt && isToday(st.lastCompletedAt) ? st.streak + 1 : 1,
        lastCompletedAt: new Date().toISOString(),
      }));
      setCycleCount((c) => c + 1);
    }

    const nm = nextMode(mode, cycleCount, settings);
    setMode(nm);
    setSecondsLeft(secondsFor(nm, settings));
    setRunning(settings.autoStartNext);
  }, [secondsLeft]);

  // alarming başlarken grid boyutunu hesapla ve resize’da güncelle
  useEffect(() => {
    if (!alarming) return;
    const compute = () => {
      const cell = 12; // px
      const cols = Math.max(20, Math.ceil(window.innerWidth / cell));
      const rows = Math.max(12, Math.ceil(window.innerHeight / cell));
      setGrid({ cols, rows });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [alarming]);

  function silenceAlarm() {
    setAlarming(false);
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
  }

  // nextMode & labelFor lib/types üzerinden geliyor

  // eski sekmeli yapıdan kalan resetTo kaldırıldı

  function handleStartPause() {
    setRunning((r) => !r);
  }

  function handleSkip() {
    setSecondsLeft(0);
  }

  function handleSettingsChange(partial: Partial<Settings>) {
    const next = { ...settings, ...partial };
    setSettings(next);
    setSecondsLeft((prev) => Math.min(prev, secondsFor(mode, next)));
  }

  async function toggleFocusMode() {
    try {
      const win = getCurrentWindow();
      if (!focusMode) {
        await (await win).setFullscreen(true);
        setFocusMode(true);
      } else {
        await (await win).setFullscreen(false);
        setFocusMode(false);
      }
    } catch (e) {
      console.error("fullscreen error", e);
      setFocusMode((v) => !v);
    }
  }

  // Klavye kısayolları: F ile toggla, Escape ile çık
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'f') {
        e.preventDefault();
        toggleFocusMode();
      } else if (key === 'escape' && focusMode) {
        e.preventDefault();
        toggleFocusMode();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusMode]);

  return (
    <main className={`container ${focusMode ? "focus-on" : ""}`}>
      {/* Alarm ses kaynağı */}
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" preload="auto" />

      {/* Minimal merkez */}
      <div className={`center ${alarming ? "alarming" : ""}`}>
        <TimerDisplay secondsLeft={secondsLeft} running={running} onToggle={handleStartPause} onNext={handleSkip} />
      </div>

      {/* Sol alt ayarlar butonu */}
      <button className="settings-fab" onClick={() => setShowSettings(true)} aria-label="Ayarlar">
        <FiSettings size={18} />
      </button>

      {/* Sağ üst Focus (fullscreen) butonu */}
      <button className="focus-fab" onClick={toggleFocusMode} aria-label="Odak (Tam ekran)">
        {focusMode ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
      </button>

      {/* Alarm overlay damla efekti ve sustur */}
      {alarming && (
        <AlarmOverlay rows={grid.rows} cols={grid.cols} onMute={silenceAlarm} />
      )}

      {/* Ayarlar Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Arkaplan görseli (ses yok) */}
      <div className="lofi-bg"><div className="grain" /></div>

      {/* Ek blop katmanı (sadece focus modunda görünür) */}
      <div className="blobs">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="blob b4" />
      </div>
    </main>
  );
}

// yardımcılar ve bileşenler ilgili dosyalara taşındı

export default App;
