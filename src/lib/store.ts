import { Store } from "@tauri-apps/plugin-store";

let storePromise: Promise<Store> | null = null;

export function getStore() {
  if (!storePromise) {
    storePromise = Store.load("settings.json");
  }
  return storePromise;
}

export async function read<T>(key: string): Promise<T | null> {
  const s = await getStore();
  return (await s.get<T>(key)) ?? null;
}

export async function write<T>(key: string, value: T) {
  const s = await getStore();
  await s.set(key, value as any);
  await s.save();
}
