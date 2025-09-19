import { FiPause, FiPlay, FiSkipForward } from "react-icons/fi";

export function TimerDisplay({
  secondsLeft,
  running,
  onToggle,
  onNext,
}: {
  secondsLeft: number;
  running: boolean;
  onToggle: () => void;
  onNext: () => void;
}) {
  const fontSize = "calc(100vh / 5)";
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const s = String(secondsLeft % 60).padStart(2, "0");
  return (
    <div className="center">
      <div className="timer" style={{ fontSize }}>{m}:{s}</div>
      <div className="buttons">
        <button className="btn" onClick={onToggle} aria-label={running ? "Duraklat" : "Başlat"}>
          {running ? <FiPause size={24} /> : <FiPlay size={24} />}
        </button>
        <button className="btn" onClick={onNext} aria-label="Sonraki">
          <FiSkipForward size={24} />
        </button>
      </div>
    </div>
  );
}
