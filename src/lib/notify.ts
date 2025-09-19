import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";

export async function ensureNotificationPermission() {
  const granted = await isPermissionGranted();
  if (granted) return true;
  const p = await requestPermission();
  return p === "granted";
}

export async function notify(title: string, body?: string) {
  const ok = await ensureNotificationPermission();
  if (!ok) return;
  await sendNotification({ title, body });
}
