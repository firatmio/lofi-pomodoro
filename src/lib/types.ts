export type Mode = "work" | "shortBreak" | "longBreak";

export type Settings = {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartNext: boolean;
  soundOn: boolean;
};

export type Stats = {
  completedFocus: number;
  totalSeconds: number;
  streak: number;
  lastCompletedAt?: string;
};

export const DEFAULT_SETTINGS: Settings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartNext: true,
  soundOn: false,
};

export const ZERO_STATS: Stats = { completedFocus: 0, totalSeconds: 0, streak: 0 };

export function secondsFor(mode: Mode, s: Settings) {
  switch (mode) {
    case "work":
      return s.workMinutes * 60;
    case "shortBreak":
      return s.shortBreakMinutes * 60;
    case "longBreak":
      return s.longBreakMinutes * 60;
  }
}

export function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function isToday(iso?: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function nextMode(current: Mode, cycles: number, s: Settings): Mode {
  if (current === "work") {
    if ((cycles + 1) % s.longBreakInterval === 0) return "longBreak";
    return "shortBreak";
  }
  return "work";
}

export function labelFor(m: Mode) {
  return m === "work" ? "Odak" : m === "shortBreak" ? "Kısa Mola" : "Uzun Mola";
}
