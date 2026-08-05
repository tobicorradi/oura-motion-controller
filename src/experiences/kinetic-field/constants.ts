import type { FieldFormation, FieldMode, FieldQuality } from "./types";

export const FIELD_WIDTH = 3.25;
export const FIELD_HEIGHT = 2.2;
export const FIELD_DEPTH = 1.8;
export const FIELD_MAX_RADIUS = 4.5;
export const BURST_THRESHOLD = 0.17;
export const BURST_COOLDOWN_MS = 700;
export const BURST_DECAY = 1.7;
export const STABLE_DELAY_MS = 900;

export const qualityLabels: Record<FieldQuality, string> = {
  high: "High",
  balanced: "Balanced",
  low: "Low",
};

export const modeLabels: Record<FieldMode, string> = {
  repel: "Repel",
  flow: "Flow",
};

export const formationLabels: Record<FieldFormation, string> = {
  ring: "Ring",
  sphere: "Sphere",
  wave: "Wave",
};

export const modeKeys: FieldMode[] = ["repel", "flow"];
export const formationKeys: FieldFormation[] = ["ring", "sphere", "wave"];
export const qualityKeys: FieldQuality[] = ["high", "balanced", "low"];
