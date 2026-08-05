import type { RawMotion } from "./types";

export const clamp = (value: number, min = -1, max = 1) =>
  Math.min(max, Math.max(min, value));
export const calculateRoll = ({ y, z }: RawMotion) => Math.atan2(y, z);
export const calculatePitch = ({ x, y, z }: RawMotion) =>
  Math.atan2(-x, Math.sqrt(y * y + z * z));
export const deadZone = (value: number, threshold = 0.035) =>
  Math.abs(value) < threshold ? 0 : value;
export const smooth = (previous: number, current: number, amount = 0.82) =>
  previous * amount + current * (1 - amount);
