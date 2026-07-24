import { useEffect, useRef } from 'react'
import type { ProcessedMotion } from '../../motion/types'
import type { SynthPreset } from './music'
import { presets } from './presets'

type Props = { analyser: AnalyserNode | null; motion: ProcessedMotion; preset: SynthPreset; pulse: number }
export function MotionVisualizer({ analyser, motion, preset, pulse }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null); const motionRef = useRef(motion); const propsRef = useRef({ analyser, preset, pulse })
  motionRef.current = motion; propsRef.current = { analyser, preset, pulse }
  useEffect(() => {
    const element = canvas.current; if (!element) return
    const context = element.getContext('2d'); if (!context) return
    let frame = 0
    const resize = () => { const rect = element.getBoundingClientRect(); const ratio = Math.min(devicePixelRatio, 2); element.width = rect.width * ratio; element.height = rect.height * ratio; context.setTransform(ratio, 0, 0, ratio, 0, 0) }
    resize(); const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(element)
    const data = new Uint8Array(64); const render = (time: number) => {
      const { analyser: activeAnalyser, preset: activePreset, pulse: activePulse } = propsRef.current; const currentMotion = motionRef.current; const width = element.clientWidth; const height = element.clientHeight; const cx = width / 2; const cy = height / 2
      if (activeAnalyser) activeAnalyser.getByteFrequencyData(data); else data.fill(0)
      const audio = data.reduce((sum, value) => sum + value, 0) / data.length / 255; const definition = presets[activePreset]; const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; const pulseEnergy = Math.max(0, 1 - (time - activePulse) / 650)
      context.clearRect(0, 0, width, height)
      const glow = context.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * .56); glow.addColorStop(0, `${definition.color}28`); glow.addColorStop(1, 'transparent'); context.fillStyle = glow; context.fillRect(0, 0, width, height)
      const base = Math.min(width, height) * (.155 + currentMotion.energy * .025 + audio * .035 + pulseEnergy * .028)
      context.save(); context.translate(cx, cy); context.rotate(currentMotion.normalizedRoll * .58); context.scale(1, 1 + -currentMotion.normalizedPitch * .22)
      for (let layer = 0; layer < 4; layer++) { context.beginPath(); for (let step = 0; step <= 120; step++) { const angle = step / 120 * Math.PI * 2; const spectrum = data[step % data.length] / 255; const wave = Math.sin(angle * (activePreset === 'pulse' ? 6 : 3) + time / (activePreset === 'pulse' ? 180 : 650)) * (10 + audio * 14); const radius = base + layer * 17 + wave + spectrum * 28 + (reduced ? 0 : Math.sin(time / 650 + step) * 2); const x = Math.cos(angle) * radius; const y = Math.sin(angle) * radius; if (step) context.lineTo(x, y); else context.moveTo(x, y) } context.closePath(); context.strokeStyle = layer === 0 ? `${definition.color}e8` : `${definition.color}${Math.round(55 - layer * 8).toString(16)}`; context.lineWidth = layer === 0 ? 1.5 : 1; context.stroke() }
      context.beginPath(); context.arc(0, 0, base * .62, 0, Math.PI * 2); context.fillStyle = `${definition.color}1c`; context.fill(); context.restore()
      if (activePreset === 'cosmic') for (let i = 0; i < 34; i++) { const angle = i * 2.4 + time / 2800; const distance = base + 80 + (i % 6) * 19; context.fillStyle = `${definition.color}${(45 + (i % 3) * 25).toString(16)}`; context.fillRect(cx + Math.cos(angle) * distance, cy + Math.sin(angle * 1.3) * distance, 2, 2) }
      frame = requestAnimationFrame(render)
    }; frame = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(frame); resizeObserver?.disconnect() }
  }, [])
  return <canvas ref={canvas} className="synth-canvas" aria-label="An abstract ring visualizer reacting to movement, selected sound, and audio intensity." role="img" />
}
