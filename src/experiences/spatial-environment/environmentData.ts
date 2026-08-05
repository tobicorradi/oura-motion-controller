export const categories = ["temperature", "lighting", "airflow"] as const;
export type EnvironmentCategory = (typeof categories)[number];

export const environmentValues = {
  temperature: Array.from({ length: 13 }, (_, index) => 16 + index),
  lighting: [
    "Cool White",
    "Daylight",
    "Soft Neutral",
    "Golden Hour",
    "Warm Sunset",
    "Candlelight",
    "Midnight",
  ],
  airflow: ["Still", "Gentle", "Balanced", "Fresh", "Strong"],
} as const;

export type EnvironmentSelection = Record<EnvironmentCategory, number>;

export const defaultSelection: EnvironmentSelection = {
  temperature: 5,
  lighting: 2,
  airflow: 1,
};

export const categoryLabels: Record<EnvironmentCategory, string> = {
  temperature: "Temperature",
  lighting: "Lighting",
  airflow: "Airflow",
};

export const categoryIcons: Record<EnvironmentCategory, string> = {
  temperature: "♨",
  lighting: "☼",
  airflow: "≈",
};

export function categoryValue(
  category: EnvironmentCategory,
  selection: EnvironmentSelection,
) {
  return environmentValues[category][selection[category]];
}
