import type { CSSProperties } from "react";

export type EnvironmentAtmosphere = {
  pageBackground: string;
  panelBackground: string;
  ambientGradient: string;
  accent: string;
  accentSoft: string;
  shadowColor: string;
  previewGlow: string;
  motionStrength: number;
};

const mixHex = (from: string, to: string, amount: number) => {
  const ratio = Math.max(0, Math.min(1, amount));
  const parse = (color: string) => [
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16),
  ];
  const [fromRed, fromGreen, fromBlue] = parse(from);
  const [toRed, toGreen, toBlue] = parse(to);
  const channel = (start: number, end: number) =>
    Math.round(start + (end - start) * ratio)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(fromRed, toRed)}${channel(fromGreen, toGreen)}${channel(fromBlue, toBlue)}`;
};

const lightingTone: Record<
  string,
  Omit<EnvironmentAtmosphere, "motionStrength">
> = {
  "Cool White": {
    pageBackground: "#f5faff",
    panelBackground: "#fbfdff",
    ambientGradient:
      "radial-gradient(circle at 70% 32%, #d9f0ff, transparent 36%)",
    accent: "#2f80ff",
    accentSoft: "#e5f3ff",
    shadowColor: "#8ebde0",
    previewGlow: "#a5dcff",
  },
  Daylight: {
    pageBackground: "#f8fcff",
    panelBackground: "#ffffff",
    ambientGradient:
      "radial-gradient(circle at 72% 28%, #dff8ff, transparent 35%)",
    accent: "#13aeca",
    accentSoft: "#e3fbff",
    shadowColor: "#8dc9d6",
    previewGlow: "#b2eff7",
  },
  "Soft Neutral": {
    pageBackground: "#fcfbff",
    panelBackground: "#ffffff",
    ambientGradient:
      "radial-gradient(circle at 72% 28%, #eee8ff, transparent 36%)",
    accent: "#7b3cff",
    accentSoft: "#f0ebff",
    shadowColor: "#b5a5dc",
    previewGlow: "#d9c9ff",
  },
  "Golden Hour": {
    pageBackground: "#fffaf3",
    panelBackground: "#fffdf9",
    ambientGradient:
      "radial-gradient(circle at 72% 30%, #ffe0ab, transparent 38%)",
    accent: "#d88b2e",
    accentSoft: "#fff0d7",
    shadowColor: "#e1ae6b",
    previewGlow: "#ffd495",
  },
  "Warm Sunset": {
    pageBackground: "#fff8f5",
    panelBackground: "#fffdfc",
    ambientGradient:
      "radial-gradient(circle at 72% 30%, #ffd2c2, transparent 38%)",
    accent: "#e26879",
    accentSoft: "#ffe8e6",
    shadowColor: "#e3a09d",
    previewGlow: "#ffc0a9",
  },
  Candlelight: {
    pageBackground: "#fffaf0",
    panelBackground: "#fffdf8",
    ambientGradient:
      "radial-gradient(circle at 72% 30%, #ffdf9e, transparent 38%)",
    accent: "#c87b25",
    accentSoft: "#fff0d5",
    shadowColor: "#d7ab70",
    previewGlow: "#ffd18c",
  },
  Midnight: {
    pageBackground: "#f4f4fb",
    panelBackground: "#fafaff",
    ambientGradient:
      "radial-gradient(circle at 72% 30%, #d7d6f4, transparent 38%)",
    accent: "#5550b6",
    accentSoft: "#e8e7ff",
    shadowColor: "#9895c8",
    previewGlow: "#aaa8df",
  },
};

export function createAtmosphere(
  temperature: number,
  lighting: string,
  airflow: string,
): EnvironmentAtmosphere {
  const base = lightingTone[lighting] ?? lightingTone["Soft Neutral"];
  const safeTemperature = Math.max(
    16,
    Math.min(28, Number.isFinite(temperature) ? temperature : 21),
  );
  const cool = safeTemperature < 21;
  const temperatureColor = cool ? "#a8e6ff" : "#ff9d64";
  const temperatureSoft = cool ? "#e0f6ff" : "#ffe0c7";
  const temperatureStrength = Math.min(
    0.78,
    (Math.abs(safeTemperature - 21) / 5) * 0.78,
  );
  const previewGlow = mixHex(
    base.previewGlow,
    temperatureColor,
    Math.min(1, temperatureStrength * 1.25),
  );
  const strength =
    (
      {
        Still: 0.05,
        Gentle: 0.18,
        Balanced: 0.36,
        Fresh: 0.58,
        Strong: 0.8,
      } as Record<string, number>
    )[airflow] ?? 0.18;
  const pageBackground = mixHex(
    base.pageBackground,
    temperatureSoft,
    temperatureStrength,
  );
  const panelBackground = mixHex(
    base.panelBackground,
    temperatureSoft,
    temperatureStrength * 0.55,
  );
  const accent = mixHex(
    base.accent,
    temperatureColor,
    temperatureStrength * 0.65,
  );
  const accentSoft = mixHex(
    base.accentSoft,
    temperatureSoft,
    temperatureStrength,
  );
  const shadowColor = mixHex(
    base.shadowColor,
    temperatureColor,
    temperatureStrength * 0.72,
  );
  const ambientGradient = `radial-gradient(circle at 72% 28%, ${previewGlow}, transparent ${34 + temperatureStrength * 11}%)`;
  return {
    pageBackground,
    panelBackground,
    ambientGradient,
    accent,
    accentSoft,
    shadowColor,
    previewGlow,
    motionStrength: strength,
  };
}

export function atmosphereStyle(atmosphere: EnvironmentAtmosphere) {
  return {
    "--environment-bg": atmosphere.pageBackground,
    "--environment-panel": atmosphere.panelBackground,
    "--environment-ambient": atmosphere.ambientGradient,
    "--environment-accent": atmosphere.accent,
    "--environment-accent-soft": atmosphere.accentSoft,
    "--environment-shadow": atmosphere.shadowColor,
    "--environment-glow": atmosphere.previewGlow,
    "--environment-motion": String(atmosphere.motionStrength),
  } as CSSProperties;
}
