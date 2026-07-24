import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { MotionSource, ProcessedMotion } from '../../motion/types'
import { getDirection, isNeutral, normalizeInput, vectorMagnitude, type MotionDirection, type SpatialInput } from './direction'

export type TrailPoint = SpatialInput
export function useMotionVisualization(fieldRef: RefObject<HTMLElement | null>, motion: ProcessedMotion, source: MotionSource, autoDemo: boolean, disableAutoDemo: () => void, resetSharedMotion: () => void) {
  const targetInputRef = useRef<SpatialInput>({ horizontal: 0, vertical: 0 }); const displayedInputRef = useRef<SpatialInput>({ horizontal: 0, vertical: 0 }); const trailRef = useRef<TrailPoint[]>([]); const localPointer = useRef<SpatialInput | null>(null); const heldKeys = useRef(new Set<string>()); const manualInput = useRef(false); const previousMagnitude = useRef(0); const lastUiUpdate = useRef(0); const motionRef = useRef(motion); const sourceRef = useRef(source); const autoDemoRef = useRef(autoDemo)
  const [metrics, setMetrics] = useState({ direction: 'neutral' as MotionDirection, intensity: 0, horizontal: 0, vertical: 0, returning: false })
  const reset = useCallback(() => { targetInputRef.current = { horizontal: 0, vertical: 0 }; displayedInputRef.current = { horizontal: 0, vertical: 0 }; localPointer.current = null; manualInput.current = true; trailRef.current = []; resetSharedMotion() }, [resetSharedMotion])
  motionRef.current = motion
  sourceRef.current = source
  useEffect(() => { autoDemoRef.current = autoDemo }, [autoDemo])
  useEffect(() => {
    const field = fieldRef.current; if (!field) return
    const manual = () => { manualInput.current = true; if (autoDemoRef.current) disableAutoDemo() }
    const onPointerMove = (event: PointerEvent) => { const bounds = field.getBoundingClientRect(); if (!bounds.width || !bounds.height) return; localPointer.current = normalizeInput({ horizontal: ((event.clientX - bounds.left) / bounds.width) * 2 - 1, vertical: ((event.clientY - bounds.top) / bounds.height) * 2 - 1 }); manual() }
    const onPointerLeave = () => { localPointer.current = { horizontal: 0, vertical: 0 } }
    const controlKeys = new Set(['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's'])
    const onKeyDown = (event: KeyboardEvent) => { const key = event.key.toLowerCase(); if (controlKeys.has(key) || key === 'r' || event.code === 'Space') event.preventDefault(); if (key === 'r') { reset(); return } if (event.code === 'Space') return; if (controlKeys.has(key)) { heldKeys.current.add(key); manual() } }
    const onKeyUp = (event: KeyboardEvent) => heldKeys.current.delete(event.key.toLowerCase())
    field.addEventListener('pointermove', onPointerMove); field.addEventListener('pointerleave', onPointerLeave); addEventListener('keydown', onKeyDown); addEventListener('keyup', onKeyUp)
    return () => { field.removeEventListener('pointermove', onPointerMove); field.removeEventListener('pointerleave', onPointerLeave); removeEventListener('keydown', onKeyDown); removeEventListener('keyup', onKeyUp) }
  }, [fieldRef, disableAutoDemo, reset])
  useEffect(() => {
    let frame = 0
    const animate = (now: number) => {
      const keys = heldKeys.current; const keyboardInput = { horizontal: (keys.has('arrowright') || keys.has('d') ? 1 : 0) - (keys.has('arrowleft') || keys.has('a') ? 1 : 0), vertical: (keys.has('arrowdown') || keys.has('s') ? 1 : 0) - (keys.has('arrowup') || keys.has('w') ? 1 : 0) }
      const hasKeyboardInput = keyboardInput.horizontal !== 0 || keyboardInput.vertical !== 0
      const providerInput = normalizeInput({ horizontal: motionRef.current.normalizedRoll, vertical: motionRef.current.normalizedPitch })
      const desired = sourceRef.current === 'oura' || autoDemoRef.current ? providerInput : hasKeyboardInput ? keyboardInput : localPointer.current ?? (manualInput.current ? { horizontal: 0, vertical: 0 } : providerInput)
      targetInputRef.current = normalizeInput(desired)
      const displayed = displayedInputRef.current; displayed.horizontal += (targetInputRef.current.horizontal - displayed.horizontal) * .11; displayed.vertical += (targetInputRef.current.vertical - displayed.vertical) * .11
      if (Math.abs(displayed.horizontal) < .002) displayed.horizontal = 0; if (Math.abs(displayed.vertical) < .002) displayed.vertical = 0
      const magnitude = vectorMagnitude(displayed); if (magnitude > .006 || trailRef.current.length) { trailRef.current.push({ ...displayed }); if (trailRef.current.length > 26) trailRef.current.shift() }
      if (now - lastUiUpdate.current > 110) { lastUiUpdate.current = now; const direction = getDirection(displayed); const returning = isNeutral(targetInputRef.current) && !isNeutral(displayed) && previousMagnitude.current > magnitude; setMetrics({ direction, intensity: isNeutral(displayed) ? 0 : magnitude, horizontal: displayed.horizontal, vertical: displayed.vertical, returning }); previousMagnitude.current = magnitude }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate); return () => cancelAnimationFrame(frame)
  }, [])
  return { displayedInputRef, trailRef, metrics, reset }
}
