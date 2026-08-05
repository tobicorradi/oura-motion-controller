import type { SynthPreset } from "./music";

export type PresetDefinition = {
  label: string;
  oscillatorA: OscillatorType;
  oscillatorB: OscillatorType;
  detune: number;
  baseGain: number;
  smoothing: number;
  lfoRate: number;
  lfoDepth: number;
  delayTime: number;
  feedback: number;
  color: string;
};

export const presets: Record<SynthPreset, PresetDefinition> = {
  ambient: {
    label: "Ambient",
    oscillatorA: "sine",
    oscillatorB: "triangle",
    detune: 7,
    baseGain: 0.052,
    smoothing: 0.14,
    lfoRate: 0.12,
    lfoDepth: 0.1,
    delayTime: 0.38,
    feedback: 0.26,
    color: "#d5bea0",
  },
  pulse: {
    label: "Pulse",
    oscillatorA: "sawtooth",
    oscillatorB: "sine",
    detune: 0,
    baseGain: 0.058,
    smoothing: 0.045,
    lfoRate: 3.1,
    lfoDepth: 0.3,
    delayTime: 0.16,
    feedback: 0.13,
    color: "#bcbdc6",
  },
  cosmic: {
    label: "Cosmic",
    oscillatorA: "triangle",
    oscillatorB: "sine",
    detune: 16,
    baseGain: 0.05,
    smoothing: 0.1,
    lfoRate: 0.32,
    lfoDepth: 0.18,
    delayTime: 0.52,
    feedback: 0.32,
    color: "#c3a5d2",
  },
};
