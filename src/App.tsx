import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { Store } from "@tauri-apps/plugin-store";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiPause, FiPlay, FiSettings, FiSkipForward, FiX } from "react-icons/fi";
import "./App.css";

type Mode = "work" | "shortBreak" | "longBreak";

type Settings = {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number; // kaç odak sonrası uzun mola
  autoStartNext: boolean;
  soundOn: boolean;
};

type Stats = {
  completedFocus: number;
  totalSeconds: number;
  streak: number;
  lastCompletedAt?: string; // ISO
};

const DEFAULT_SETTINGS: Settings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartNext: true,
  soundOn: false,
};

const ZERO_STATS: Stats = { completedFocus: 0, totalSeconds: 0, streak: 0 };

function secondsFor(mode: Mode, s: Settings) {
  switch (mode) {
    case "work":
      return s.workMinutes * 60;
    case "shortBreak":
      return s.shortBreakMinutes * 60;
    case "longBreak":
      return s.longBreakMinutes * 60;
  }
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

async function ensureNotificationPermission() {
  const granted = await isPermissionGranted();
  if (granted) return true;
  const p = await requestPermission();
  return p === "granted";
}

function App() {
  const store = useMemo(() => Store.load("settings.json"), []);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>(ZERO_STATS);
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState<number>(secondsFor("work", DEFAULT_SETTINGS));
  const [running, setRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0); // tamamlanan odak sayacı
  const [showSettings, setShowSettings] = useState(false);
  const [alarming, setAlarming] = useState(false);
  const alarmTimeoutRef = useRef<number | null>(null);
  const [grid, setGrid] = useState<{ cols: number; rows: number }>({ cols: 0, rows: 0 });
  const tickRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // load settings + stats
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await store;
        const savedSettings = (await s.get<Settings>("settings")) ?? DEFAULT_SETTINGS;
        const savedStats = (await s.get<Stats>("stats")) ?? ZERO_STATS;
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
  }, [store]);

  // persist settings and stats on change
  useEffect(() => {
    (async () => {
      const s = await store;
      await s.set("settings", settings);
      await s.save();
    })();
  }, [settings, store]);

  useEffect(() => {
    (async () => {
      const s = await store;
      await s.set("stats", stats);
      await s.save();
    })();
  }, [stats, store]);

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
    ensureNotificationPermission().then((granted) => {
      if (granted) {
        const nextLabel = nextMode(mode, cycleCount, settings) === "work" ? "Odak" : "Mola";
        sendNotification({
          title: "Zaman doldu",
          body: `${labelFor(mode)} tamamlandı. Sırada ${nextLabel}!`,
        });
      }
    });

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

  function nextMode(current: Mode, cycles: number, s: Settings): Mode {
    if (current === "work") {
      if ((cycles + 1) % s.longBreakInterval === 0) return "longBreak";
      return "shortBreak";
    }
    return "work";
  }

  function labelFor(m: Mode) {
    return m === "work" ? "Odak" : m === "shortBreak" ? "Kısa Mola" : "Uzun Mola";
  }

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

  return (
    <main className="container">
      {/* Alarm ses kaynağı */}
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" preload="auto" />

      {/* Minimal merkez */}
      <div className={`center ${alarming ? "alarming" : ""}`}>
        <div className="timer" style={{ fontSize: Math.max(48, Math.min(220, Math.floor(window.innerWidth * 0.15))) }}>
          {formatTime(secondsLeft)}
        </div>
        <div className="buttons">
          <button className="btn" onClick={handleStartPause} aria-label={running ? "Duraklat" : "Başlat"}>
            {running ? <FiPause size={24} /> : <FiPlay size={24} />}
          </button>
          <button className="btn" onClick={handleSkip} aria-label="Sonraki">
            <FiSkipForward size={24} />
          </button>
        </div>
      </div>

      {/* Sol alt ayarlar butonu */}
      <button className="settings-fab" onClick={() => setShowSettings(true)} aria-label="Ayarlar">
        <FiSettings size={18} />
      </button>

      {/* Alarm overlay damla efekti ve sustur */}
      {alarming && (
        <div className="droplets-overlay" onClick={silenceAlarm}>
          <div
            className="droplets-grid"
            style={{
              // Custom CSS variables for grid template
              "--cols": String(grid.cols),
              "--cell": "12px",
            } as React.CSSProperties}
          >
            {Array.from({ length: grid.rows }).map((_, r) => (
              <>
                {Array.from({ length: grid.cols }).map((__, c) => (
                  <span
                    key={`d-${r}-${c}`}
                    className="dot"
                    style={{ "--col": String(c), "--row": String(r) } as React.CSSProperties}
                  />
                ))}
              </>
            ))}
          </div>
          <button className="mute" onClick={silenceAlarm}><FiX /> Sustur</button>
        </div>
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
    </main>
  );
}

function isToday(iso?: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function SettingsModal({ settings, onChange, onClose }: { settings: Settings; onChange: (p: Partial<Settings>) => void; onClose: () => void }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>Ayarlar</h3>
          <button className="icon" onClick={onClose}><FiX /></button>
        </header>
        <div className="modal-body">
          <div className="form-grid">
            <label>Odak (dk)
              <input type="number" min={1} max={120} value={settings.workMinutes} onChange={(e) => onChange({ workMinutes: Number(e.target.value) })} />
            </label>
            <label>Kısa mola (dk)
              <input type="number" min={1} max={60} value={settings.shortBreakMinutes} onChange={(e) => onChange({ shortBreakMinutes: Number(e.target.value) })} />
            </label>
            <label>Uzun mola (dk)
              <input type="number" min={5} max={60} value={settings.longBreakMinutes} onChange={(e) => onChange({ longBreakMinutes: Number(e.target.value) })} />
            </label>
            <label>Uzun mola aralığı
              <input type="number" min={2} max={10} value={settings.longBreakInterval} onChange={(e) => onChange({ longBreakInterval: Number(e.target.value) })} />
            </label>
            <label className="row">
              <input type="checkbox" checked={settings.autoStartNext} onChange={(e) => onChange({ autoStartNext: e.target.checked })} />
              Otomatik sıradaki başlasın
            </label>
            <label className="row">
              <input type="checkbox" checked={settings.soundOn} onChange={(e) => onChange({ soundOn: e.target.checked })} />
              Sesli uyarı
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
