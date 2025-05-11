import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

export function setStrokeWidthByType(strokeType: string, width: number) {
  const key = `${strokeType}-width`;
  storage.set(key, width);
}

export function getStrokeWidthByType(strokeType: string): number | undefined {
  const key = `${strokeType}-width`;
  return storage.getNumber(key);
}

export function setStrokeColorByType(strokeType: string, color: string) {
  const key = `${strokeType}-color`;
  storage.set(key, color);
}

export function getStrokecolorByType(strokeType: string): string | undefined {
  const key = `${strokeType}-color`;
  return storage.getString(key);
}
