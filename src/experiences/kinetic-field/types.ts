export type FieldMode = "repel" | "flow";
export type FieldFormation = "ring" | "sphere" | "wave";
export type FieldQuality = "high" | "balanced" | "low";

export type FieldMotion = {
  horizontal: number;
  vertical: number;
  energy: number;
  isStill: boolean;
};

export type ForceCenter = {
  x: number;
  y: number;
  z: number;
};
