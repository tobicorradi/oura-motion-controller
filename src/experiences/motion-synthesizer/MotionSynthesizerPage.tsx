import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConnectionStatus } from '../../components/ConnectionStatus'
import { useMotion } from '../../motion/MotionProvider'
import { MotionVisualizer } from './MotionVisualizer'
import { type SynthPreset } from './music'
import { presets } from './presets'
import { useMotionSynth } from './useMotionSynth'
import './synth.css'

const formatFilter = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)} kHz` : `${Math.round(value)} Hz`
export function MotionSynthesizerPage() {
  const { motion, source, calibrate } = useMotion(); const synth = useMotionSynth(motion); const [pulseAt, setPulseAt] = useState(0)
  const triggerPulse = () => { synth.triggerPulse(); setPulseAt(performance.now()) }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space') { event.preventDefault(); triggerPulse() }
      if (event.key === '1') synth.setPreset('ambient')
      if (event.key === '2') synth.setPreset('pulse')
      if (event.key === '3') synth.setPreset('cosmic')
      if (event.key.toLowerCase() === 'm') void (synth.enabled ? synth.disable() : synth.enable())
    }
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey)
  })
  return <main className="synth-page"><header className="experience-header"><Link to="/" className="back">← Home</Link><ConnectionStatus /></header><section className="synth-heading"><div><p className="eyebrow">Experience 02 / Motion instrument</p><h1>Motion<br /><i>Synthesizer</i></h1><p>Move your hand to shape a calm, constrained soundscape.</p></div><div className="audio-control"><button className="audio-button" onClick={() => void (synth.enabled ? synth.disable() : synth.enable())} aria-pressed={synth.enabled}>{synth.enabled ? 'Disable Audio' : 'Enable Audio'} <span>{synth.enabled ? '●' : '→'}</span></button><small>{synth.enabled ? 'Audio active — use a moderate device volume.' : 'Browsers require an interaction before sound can begin.'}</small></div></section><section className="synth-stage"><MotionVisualizer analyser={synth.analyser} motion={motion} preset={synth.preset} pulse={pulseAt} /><div className="synth-orbit-label"><span>{synth.metrics.note.name}</span><small>current note</small></div><div className="preset-selector" role="group" aria-label="Sound preset">{(Object.keys(presets) as SynthPreset[]).map(key => <button key={key} onClick={() => synth.setPreset(key)} className={synth.preset === key ? 'active' : ''} aria-pressed={synth.preset === key}>{presets[key].label}<kbd>{key === 'ambient' ? '1' : key === 'pulse' ? '2' : '3'}</kbd></button>)}</div><p className="visual-description">An abstract ring field responds to your motion and selected sound character.</p></section><section className="synth-hud" aria-label="Motion and sound values"><div><span>Note</span><strong>{synth.metrics.note.name}</strong></div><div><span>Filter</span><strong>{formatFilter(synth.metrics.filter)}</strong></div><div><span>Energy</span><strong>{Math.round(synth.metrics.energy * 100)}%</strong></div><div><span>Source</span><strong>{source}</strong></div></section>{synth.error && <p className="synth-error" role="status">{synth.error}</p>}<footer className="synth-footer"><p>Move horizontally to change notes · Move vertically to shape the filter · <kbd>Space</kbd> to trigger a pulse</p><div><button onClick={calibrate}>Calibrate</button><span><kbd>R</kbd> reset · <kbd>M</kbd> audio</span></div></footer></main>
}
