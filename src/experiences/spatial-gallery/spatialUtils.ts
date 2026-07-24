import type { GalleryCard } from './galleryData'

export type SpatialInput = { horizontal: number; vertical: number }
export type SpatialPosition = { x: number; y: number }
export const clampSpatial = (value: number, min = -1, max = 1) => Math.min(max, Math.max(min, value))
export const applySpatialDeadZone = (value: number, threshold = .12) => Math.abs(value) < threshold ? 0 : value
export const getTargetVelocity = ({ horizontal, vertical }: SpatialInput, maxSpeed = 360) => ({ x: applySpatialDeadZone(clampSpatial(horizontal)) * maxSpeed, y: applySpatialDeadZone(clampSpatial(vertical)) * maxSpeed })
export const clampPosition = ({ x, y }: SpatialPosition, limit = 430) => ({ x: clampSpatial(x, -limit, limit), y: clampSpatial(y, -limit, limit) })
export const nearestCard = (cards: GalleryCard[], position: SpatialPosition) => cards.reduce((closest, card) => {
  const distance = Math.hypot(card.x + position.x, card.y + position.y); const closestDistance = Math.hypot(closest.x + position.x, closest.y + position.y)
  return distance < closestDistance ? card : closest
})
