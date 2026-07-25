import { BURST_COOLDOWN_MS, BURST_THRESHOLD } from './constants'
import type { FieldFormation, FieldMotion, FieldQuality, ForceCenter } from './types'

const TAU = Math.PI * 2
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const clampEnergy = (value: number) => {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

export function clampInput(value: number) {
  if (!Number.isFinite(value)) return 0
  if (value < -1) return -1
  if (value > 1) return 1
  return value
}

export function sanitizeMotion(input: Partial<FieldMotion> | undefined): FieldMotion {
  return {
    horizontal: clampInput(input?.horizontal ?? 0),
    vertical: clampInput(input?.vertical ?? 0),
    energy: clampEnergy(input?.energy ?? 0),
    isStill: Boolean(input?.isStill ?? true),
  }
}

export function computeForceCenter(horizontal: number, vertical: number, width: number, height: number): ForceCenter {
  return {
    x: clampInput(horizontal) * width,
    y: -clampInput(vertical) * height,
    z: 0,
  }
}

export function computeForceFalloff(distance: number, radius: number) {
  if (!Number.isFinite(distance) || !Number.isFinite(radius) || radius <= 0) return 0
  const normalized = 1 - Math.min(1, Math.max(0, distance / radius))
  return normalized * normalized * (3 - 2 * normalized)
}

export function detectEnergySpike(
  currentEnergy: number,
  previousEnergy: number,
  now: number,
  lastTriggeredAt: number,
  threshold = BURST_THRESHOLD,
  cooldownMs = BURST_COOLDOWN_MS,
) {
  if (now - lastTriggeredAt < cooldownMs) return false
  return clampEnergy(currentEnergy) - clampEnergy(previousEnergy) >= threshold
}

export function particleCountForQuality(quality: FieldQuality, reducedMotion = false) {
  const counts: Record<FieldQuality, number> = { high: 7600, balanced: 6000, low: 3400 }
  const base = counts[quality]
  return reducedMotion ? Math.max(1200, Math.round(base * 0.58)) : base
}

export function createRingTargets(count: number, radius = 2.3, tube = 0.9) {
  const targets = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const u = (index / count) * TAU
    const v = (index * GOLDEN_ANGLE) % TAU
    const ring = radius + Math.cos(v) * tube
    const cursor = index * 3
    targets[cursor] = Math.cos(u) * ring
    targets[cursor + 1] = Math.sin(u) * ring
    targets[cursor + 2] = Math.sin(v) * tube * 0.92
  }
  return targets
}

export function createSphereTargets(count: number, radius = 1.7) {
  const targets = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const cursor = index * 3
    const t = index + 0.5
    const y = 1 - (t / count) * 2
    const circle = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = GOLDEN_ANGLE * index
    targets[cursor] = Math.cos(theta) * circle * radius
    targets[cursor + 1] = y * radius
    targets[cursor + 2] = Math.sin(theta) * circle * radius
  }
  return targets
}

export function createWaveTargets(count: number, width = 3.2, depth = 3.2, amplitude = 0.28) {
  const targets = new Float32Array(count * 3)
  const columns = Math.max(1, Math.round(Math.sqrt(count * 1.15)))
  const rows = Math.max(1, Math.ceil(count / columns))
  for (let index = 0; index < count; index += 1) {
    const column = index % columns
    const row = Math.floor(index / columns)
    const cursor = index * 3
    const nx = columns === 1 ? 0 : column / (columns - 1) - 0.5
    const ny = rows === 1 ? 0 : row / (rows - 1) - 0.5
    targets[cursor] = nx * width
    targets[cursor + 1] = Math.sin(nx * Math.PI * 1.3) * amplitude + Math.cos(ny * Math.PI * 1.6) * amplitude * 0.55
    targets[cursor + 2] = ny * depth * 0.72
  }
  return targets
}

export function createFormationTargets(formation: FieldFormation, count: number, radius = 2.3) {
  if (formation === 'sphere') return createSphereTargets(count, radius)
  if (formation === 'wave') return createWaveTargets(count, radius * 1.45, radius * 1.45, radius * .12)
  return createRingTargets(count, radius, Math.min(.9, radius * .39))
}
