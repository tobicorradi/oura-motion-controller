import { categories, type EnvironmentCategory } from "./environmentData";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
export const applyWheelDeadZone = (value: number, threshold = 0.1) =>
  !Number.isFinite(value) || Math.abs(value) < threshold
    ? 0
    : clamp(value, -1, 1);
export const snapWheelIndex = (position: number, count: number) =>
  Math.round(clamp(position, 0, Math.max(0, count - 1)));
export const clampWheelPosition = (position: number, count: number) =>
  clamp(position, 0, Math.max(0, count - 1));

export function nextCategory(category: EnvironmentCategory, direction: -1 | 1) {
  const index = categories.indexOf(category);
  return categories[
    (index + direction + categories.length) % categories.length
  ];
}

export function shouldSwitchCategory(
  input: number,
  armed: boolean,
  now: number,
  lastTriggeredAt: number,
  threshold = 0.55,
  cooldown = 500,
) {
  if (
    !Number.isFinite(input) ||
    !armed ||
    Math.abs(input) < threshold ||
    now - lastTriggeredAt < cooldown
  )
    return false;
  return true;
}

export const releaseCategorySwitch = (input: number, releaseThreshold = 0.28) =>
  Math.abs(input) < releaseThreshold;
