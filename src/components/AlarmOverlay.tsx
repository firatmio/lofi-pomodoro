export function AlarmOverlay({
  rows,
  cols,
  onMute,
}: {
  rows: number;
  cols: number;
  onMute: () => void;
}) {
  return (
    <div className="droplets-overlay" onClick={onMute}>
      <div
        className="droplets-grid"
        style={{ "--cols": String(cols), "--cell": "12px" } as React.CSSProperties}
      >
        {Array.from({ length: rows }).map((_, r) => (
          <>
            {Array.from({ length: cols }).map((__, c) => (
              <span key={`d-${r}-${c}`} className="dot" style={{ "--col": String(c), "--row": String(r) } as React.CSSProperties} />
            ))}
          </>
        ))}
      </div>
      <button className="mute" onClick={onMute}>Sustur</button>
    </div>
  );
}
