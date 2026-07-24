export type SynthPreset = 'ambient' | 'pulse' | 'cosmic'

export const clampSynth = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const scales = {
  ambient: [
    { name: 'C3', frequency: 130.81 }, { name: 'D3', frequency: 146.83 }, { name: 'E3', frequency: 164.81 }, { name: 'G3', frequency: 196 },
    { name: 'A3', frequency: 220 }, { name: 'C4', frequency: 261.63 }, { name: 'D4', frequency: 293.66 }, { name: 'E4', frequency: 329.63 },
  ],
  pulse: [
    { name: 'D3', frequency: 146.83 }, { name: 'E3', frequency: 164.81 }, { name: 'G3', frequency: 196 }, { name: 'A3', frequency: 220 },
    { name: 'B3', frequency: 246.94 }, { name: 'D4', frequency: 293.66 }, { name: 'E4', frequency: 329.63 }, { name: 'G4', frequency: 392 },
  ],
  cosmic: [
    { name: 'C3', frequency: 130.81 }, { name: 'D#3', frequency: 155.56 }, { name: 'G3', frequency: 196 }, { name: 'A#3', frequency: 233.08 },
    { name: 'C4', frequency: 261.63 }, { name: 'D#4', frequency: 311.13 }, { name: 'G4', frequency: 392 }, { name: 'A#4', frequency: 466.16 },
  ],
} as const

export function motionToNote(roll: number, preset: SynthPreset = 'ambient') {
  const scale = scales[preset]
  const position = (clampSynth(roll, -1, 1) + 1) / 2
  return scale[Math.min(scale.length - 1, Math.floor(position * scale.length))]
}

export function pitchToFilter(pitch: number) {
  const normalized = (clampSynth(pitch, -1, 1) + 1) / 2
  return clampSynth(200 * Math.pow(40, normalized), 200, 8000)
}

export function clampEnergy(energy: number) { return clampSynth(energy, 0, 1) }
