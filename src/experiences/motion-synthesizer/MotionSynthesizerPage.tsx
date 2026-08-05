import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConnectionStatus } from '../../components/ConnectionStatus'
import { AppShell } from '../../components/AppShell'
import { useMotion } from '../../motion/MotionProvider'
import { MotionVisualizer } from './MotionVisualizer'
import { type SynthPreset } from './music'
import { presets } from './presets'
import './synth.css'

const signed = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}`

export function MotionSynthesizerPage() {
  const { motion, source, calibrate } = useMotion()
  const [preset, setPreset] = useState<SynthPreset>('ambient')
  const [pulseAt, setPulseAt] = useState(0)
  const triggerPulse = () => setPulseAt(performance.now())

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space') { event.preventDefault(); triggerPulse() }
      if (event.key === '1') setPreset('ambient')
      if (event.key === '2') setPreset('pulse')
      if (event.key === '3') setPreset('cosmic')
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  const state = motion.energy > .42 ? 'Surging' : motion.energy > .08 ? 'Flowing' : 'Still'

  return <AppShell accent="cyan"><main className="synth-page wave-page">
    <header className="experience-header"><Link to="/" className="back">← Home</Link><ConnectionStatus /></header>
    <section className="synth-heading">
      <div><p className="eyebrow">Experience 03 / Motion waves</p><h1>Motion<br /><i>Waves</i></h1><p>Shape a visual current with the smallest movement. A silent study in gesture, energy and flow.</p></div>
      <div className="wave-status"><span><i />Visual mode</span><strong>Silent field</strong><small>Move the ring to bend the field.</small></div>
    </section>
    <section className="synth-stage wave-stage">
      <MotionVisualizer motion={motion} preset={preset} pulse={pulseAt} />
      <div className="wave-readout"><span>{state}</span><small>field state</small></div>
      <div className="preset-selector" role="group" aria-label="Visual wave preset">{(Object.keys(presets) as SynthPreset[]).map(key => <button key={key} onClick={() => setPreset(key)} className={preset === key ? 'active' : ''} aria-pressed={preset === key}>{presets[key].label}<kbd>{key === 'ambient' ? '1' : key === 'pulse' ? '2' : '3'}</kbd></button>)}</div>
      <p className="visual-description">Horizontal movement changes the current. Vertical movement bends the wave field.</p>
    </section>
    <section className="synth-hud" aria-label="Motion wave values">
      <div><span>Field state</span><strong>{state}</strong></div><div><span>Horizontal</span><strong>{signed(motion.normalizedRoll)}</strong></div><div><span>Vertical</span><strong>{signed(motion.normalizedPitch)}</strong></div><div><span>Energy</span><strong>{Math.round(motion.energy * 100)}%</strong></div><div><span>Source</span><strong>{source}</strong></div>
    </section>
    <footer className="synth-footer"><p>Move left / right to shift the current · Move up / down to bend the field · <kbd>Space</kbd> to send a visual pulse</p><div><button onClick={calibrate}>Calibrate</button><span><kbd>R</kbd> reset</span></div></footer>
  </main></AppShell>
}
