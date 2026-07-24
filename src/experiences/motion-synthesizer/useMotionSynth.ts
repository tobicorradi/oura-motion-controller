import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProcessedMotion } from '../../motion/types'
import { motionToNote, pitchToFilter, type SynthPreset } from './music'
import { MotionSynthEngine } from './synthEngine'

export function useMotionSynth(motion: ProcessedMotion) {
  const engine = useRef<MotionSynthEngine | null>(null)
  const lastPulse = useRef(0)
  const lastMetricUpdate = useRef(0)
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preset, setPresetState] = useState<SynthPreset>('ambient')
  const [metrics, setMetrics] = useState(() => ({ note: motionToNote(0), filter: pitchToFilter(0), energy: 0 }))
  const enable = useCallback(async () => { try { const synth = engine.current ?? new MotionSynthEngine(); engine.current = synth; await synth.enable(); setEnabled(true); setError(null) } catch { setError('Audio could not be enabled. Your visual demo is still available.'); setEnabled(false) } }, [])
  const disable = useCallback(async () => { await engine.current?.disable(); setEnabled(false) }, [])
  const setPreset = useCallback((next: SynthPreset) => { setPresetState(next); engine.current?.setPreset(next) }, [])
  const triggerPulse = useCallback(() => { const now = performance.now(); if (now - lastPulse.current < 320) return; lastPulse.current = now; engine.current?.triggerPulse() }, [])
  useEffect(() => {
    const note = motionToNote(motion.normalizedRoll, preset); const filter = pitchToFilter(-motion.normalizedPitch)
    engine.current?.update({ frequency: note.frequency, filterFrequency: filter, energy: motion.energy, isStill: motion.isStill })
    if (performance.now() - lastMetricUpdate.current > 120) { lastMetricUpdate.current = performance.now(); setMetrics({ note, filter, energy: motion.energy }) }
  }, [motion, preset])
  useEffect(() => () => { void engine.current?.dispose() }, [])
  return { enabled, error, preset, setPreset, enable, disable, triggerPulse, analyser: engine.current?.getAnalyser() ?? null, metrics }
}
