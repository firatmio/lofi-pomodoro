import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback } from "react";
import { FiMinus, FiSquare, FiX } from "react-icons/fi";
import "./TitleBar.css";

export function TitleBar() {
  const minimize = useCallback(async () => {
    try { await getCurrentWindow().minimize(); } catch {}
  }, []);
  const toggleMax = useCallback(async () => {
    try { await getCurrentWindow().toggleMaximize(); } catch {}
  }, []);
  const close = useCallback(async () => {
    try { await getCurrentWindow().close(); } catch {}
  }, []);

  return (
    <div className="titlebar" onDoubleClick={toggleMax}>
      <div className="titlebar-left"><span className="titlebar-title">lofi pomodoro</span></div>
      <div className="titlebar-actions" onMouseDown={(e) => e.stopPropagation()}>
        <button className="tb-btn" onClick={(e) => { e.stopPropagation(); minimize(); }} title="Minimize" aria-label="Minimize"><FiMinus size={14} /></button>
        <button className="tb-btn" onClick={(e) => { e.stopPropagation(); toggleMax(); }} title="Maximize/Restore" aria-label="Maximize"><FiSquare size={12} /></button>
        <button className="tb-btn close" onClick={(e) => { e.stopPropagation(); close(); }} title="Close" aria-label="Close"><FiX size={14} /></button>
      </div>
    </div>
  );
}
