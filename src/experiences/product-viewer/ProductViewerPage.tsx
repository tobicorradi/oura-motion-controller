import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { ConnectionStatus } from '../../components/ConnectionStatus'
import { useMotion } from '../../motion/MotionProvider'
import { ProductScene, type ViewPreset } from './ProductScene'
import './product.css'

const views: { id: ViewPreset; label: string; icon: string }[] = [
  { id: 'front', label: 'Front', icon: '◯' }, { id: 'side', label: 'Side', icon: '│' }, { id: 'top', label: 'Top', icon: '◎' }, { id: 'perspective', label: 'Perspective', icon: '◉' },
]

const directionFor = (horizontal: number, vertical: number) => {
  if (Math.abs(horizontal) < .12 && Math.abs(vertical) < .12) return 'Settling'
  if (Math.abs(horizontal) >= Math.abs(vertical)) return horizontal > 0 ? 'Rotating right' : 'Rotating left'
  return vertical > 0 ? 'Tilting up' : 'Tilting down'
}

export function ProductViewerPage() {
  const [view, setView] = useState<ViewPreset>('front')
  const [resetSignal, setResetSignal] = useState(0)
  const { reset, motion, source } = useMotion()
  const resetView = () => { setView('front'); setResetSignal(value => value + 1); reset() }
  const live = source === 'oura'

  return <AppShell accent="blue"><main className="product-viewer-page">
    <section className="product-viewer-heading"><div><h1>3D Product Viewer</h1><p>Explore motion, form and perspective through a responsive 3D viewer.</p></div><div className="viewer-header-actions"><div className={`viewer-live-status ${live ? 'live' : ''}`}><strong><i />{live ? 'Live mode' : 'Demo mode'}</strong><span>{live ? 'Using Oura Ring' : 'Mouse and keyboard'}</span></div><button className="viewer-fullscreen" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Enter fullscreen">⛶</button><details className="viewer-connection"><summary>Connection</summary><div><Link to="/" className="back">← Home</Link><ConnectionStatus /></div></details></div></section>
    <section className="viewer-showcase"><div className="viewer-canvas"><ProductScene viewPreset={view} resetSignal={resetSignal} /><span className="viewer-cube" aria-hidden="true">◇</span><aside className="viewer-motion-panel"><p>Source</p><strong className={live ? 'live' : ''}><i />{live ? 'Live (Oura Ring)' : 'Demo input'}</strong><hr /><p>Motion direction</p><b>{directionFor(motion.horizontal, motion.vertical)}</b><hr /><Metric label="Horizontal" value={motion.horizontal} color="blue" /><Metric label="Vertical" value={motion.vertical} color="violet" /></aside></div><div className="viewer-controls" role="group" aria-label="Camera view"><div>{views.map(item => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}><i>{item.icon}</i>{item.label}</button>)}</div><button className="viewer-reset" onClick={resetView}>⟳ Reset View</button></div></section>
    <aside className="viewer-instructions"><i>✋</i><span>Move left / right to rotate. Move up / down to tilt. Hold still to settle.</span></aside>
  </main></AppShell>
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) { return <div className={`viewer-axis ${color}`}><p>{label}</p><div><i style={{ width: `${Math.max(2, Math.abs(value) * 100)}%` }} /><b>{value.toFixed(2)}</b></div></div> }
