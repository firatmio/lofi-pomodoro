import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { Settings } from "../lib/types";

export function SettingsModal({ settings, onChange, onClose }: {
  settings: Settings;
  onChange: (p: Partial<Settings>) => void;
  onClose: () => void;
}) {
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
