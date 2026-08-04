import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { ConnectionStatus } from '../../components/ConnectionStatus'
import { useMotion } from '../../motion/MotionProvider'
import { atmosphereStyle, createAtmosphere } from './atmosphere'
import { categoryIcons, categoryLabels, categoryValue, categories } from './environmentData'
import { EnvironmentPreview } from './EnvironmentPreview'
import { EnvironmentWheel } from './EnvironmentWheel'
import { useEnvironmentWheel } from './useEnvironmentWheel'
import './environment.css'
import './environmentShell.css'

export function SpatialEnvironmentPage() {
  const viewportRef = useRef<HTMLElement>(null)
  const { motion, source, status, useDemoMode } = useMotion()
  const disconnected = source === 'oura' && !['streaming', 'waiting-for-data', 'calibrating'].includes(status)
  const input = disconnected ? { horizontal: 0, vertical: 0, isStill: true } : motion
  const wheel = useEnvironmentWheel(viewportRef, input, source)
  const temperature = categoryValue('temperature', wheel.selection) as number
  const lighting = categoryValue('lighting', wheel.selection) as string
  const airflow = categoryValue('airflow', wheel.selection) as string
  const atmosphere = useMemo(() => createAtmosphere(temperature, lighting, airflow), [airflow, lighting, temperature])

  return <AppShell accent="gallery"><main className="environment-page" style={atmosphereStyle(atmosphere)}>
    <section className="environment-heading"><div><p className="eyebrow">Experience 05 / Climate wheel</p><h1>Spatial Environment</h1><p>Shape the atmosphere through motion.</p></div><div className="environment-actions"><button onClick={wheel.toggleAutoDemo} aria-pressed={wheel.autoDemo}>Auto Demo {wheel.autoDemo ? 'On' : 'Off'}</button><button onClick={wheel.reset}>Reset <kbd>R</kbd></button><details><summary>Connection</summary><div><Link to="/" className="back">← Home</Link><ConnectionStatus /></div></details></div></section>
    <nav className="environment-categories" aria-label="Environment category">{categories.map(category => <button key={category} className={wheel.activeCategory === category ? 'active' : ''} onClick={() => { wheel.setCategory(category); wheel.disableAuto() }}><i>{categoryIcons[category]}</i>{categoryLabels[category]}</button>)}</nav>
    <section ref={viewportRef} className="environment-stage" aria-label="Motion controlled environment wheel. Move vertically to adjust the current category and horizontally to change categories."><div className="environment-ambient" /><EnvironmentWheel category={wheel.activeCategory} selection={wheel.selection} position={wheel.wheelPosition} positionRef={wheel.wheelPositionRef} /><EnvironmentPreview temperature={temperature} lighting={lighting} airflow={airflow} atmosphere={atmosphere} />{disconnected && <div className="environment-warning"><strong>Live connection needs attention</strong><button onClick={useDemoMode}>Return to Demo Mode</button></div>}</section>
    <section className="environment-instructions"><i>✦</i><div><strong>Control the environment</strong><p>Move up or down to adjust the active value.<br />Move left or right to switch category. Hold still to let the wheel settle.</p></div></section>
  </main></AppShell>
}
