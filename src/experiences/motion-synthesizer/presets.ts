import type { SynthPreset } from './music'

export type PresetDefinition = { label: string; oscillatorA: OscillatorType; oscillatorB: OscillatorType; detune: number; baseGain: number; smoothing: number; lfoRate: number; lfoDepth: number; delayTime: number; feedback: number; color: string }

export const presets: Record<SynthPreset, PresetDefinition> = {
  ambient: { label: 'Ambient', oscillatorA: 'sine', oscillatorB: 'triangle', detune: 7, baseGain: .052, smoothing: .14, lfoRate: .12, lfoDepth: .1, delayTime: .38, feedback: .26, color: '#d5bea0' },
  pulse: { label: 'Pulse', oscillatorA: 'sawtooth', oscillatorB: 'sine', detune: 0, baseGain: .058, smoothing: .045, lfoRate: 3.1, lfoDepth: .3, delayTime: .16, feedback: .13, color: '#bcbdc6' },
  cosmic: { label: 'Cosmic', oscillatorA: 'triangle', oscillatorB: 'sine', detune: 16, baseGain: .05, smoothing: .1, lfoRate: .32, lfoDepth: .18, delayTime: .52, feedback: .32, color: '#c3a5d2' },
}
