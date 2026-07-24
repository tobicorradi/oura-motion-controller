export type SpatialInput = { horizontal: number; vertical: number }
export type MotionDirection = 'neutral' | 'left' | 'right' | 'up' | 'down' | 'up-left' | 'up-right' | 'down-left' | 'down-right'
export const DEAD_ZONE = .12
export const clampMotionValue = (value: number) => Number.isFinite(value) ? Math.min(1, Math.max(-1, value)) : 0
export const normalizeInput = ({ horizontal, vertical }: SpatialInput): SpatialInput => ({ horizontal: clampMotionValue(horizontal), vertical: clampMotionValue(vertical) })
export const vectorMagnitude = ({ horizontal, vertical }: SpatialInput) => Math.min(1, Math.hypot(clampMotionValue(horizontal), clampMotionValue(vertical)))
export const isNeutral = (input: SpatialInput, deadZone = DEAD_ZONE) => vectorMagnitude(input) < deadZone
export function getDirection(input: SpatialInput): MotionDirection {
  const clean = normalizeInput(input); if (isNeutral(clean)) return 'neutral'
  const sector = Math.round(Math.atan2(clean.vertical, clean.horizontal) / (Math.PI / 4))
  return ['right', 'down-right', 'down', 'down-left', 'left', 'up-left', 'up', 'up-right'][(sector + 8) % 8] as MotionDirection
}
export const directionLabel = (direction: MotionDirection) => direction === 'neutral' ? 'Neutral' : `Moving ${direction}`
