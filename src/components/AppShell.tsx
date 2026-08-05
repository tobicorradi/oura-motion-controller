import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMotion } from '../motion/MotionProvider'
import { AxisControls } from './AxisControls'
import './appShell.css'

const navigation = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/motion-visualizer', label: 'Motion Input', icon: '⌁' },
  { to: '/kinetic-field', label: 'Kinetic Field', icon: '✦' },
  { to: '/balance-game', label: 'Balance Game', icon: '◉' },
  { to: '/motion-synthesizer', label: 'Motion Synth', icon: '≈' },
  { to: '/product-viewer', label: '3D Viewer', icon: '◇' },
  { to: '/spatial-environment', label: 'Spatial Environment', icon: '▦' },
]

function sourceText(source: string, status: string) {
  if (source === 'oura' && status === 'streaming') return 'Connected'
  if (source === 'oura') return 'Connecting'
  return 'Demo mode'
}

export function AppShell({ children, accent = 'violet' }: { children: ReactNode; accent?: string }) {
  const location = useLocation()
  const { source, status } = useMotion()
  const current = navigation.find(item => item.to === location.pathname)

  return <div className={`app-shell accent-${accent}`}>
    <aside className="app-sidebar">
      <nav className="shell-navigation" aria-label="Experiences">
        {navigation.map(item => <Link key={item.to} to={item.to} className={item.to === '/spatial-environment' ? ['/spatial-environment', '/spatial-gallery', '/orbital-balance'].includes(location.pathname) ? 'active' : '' : location.pathname === item.to ? 'active' : ''}>
          <i aria-hidden="true">{item.icon}</i><span>{item.label}</span>
        </Link>)}
      </nav>

      <div className="shell-sidebar-bottom">
        <AxisControls />
        <div className="shell-bottom-row">
          <div className={`ring-connection ${source === 'oura' ? 'live' : ''}`}>
            <span className="ring-connection-icon" aria-hidden="true" />
            <div><strong>Oura Ring</strong><small>{sourceText(source, status)}</small></div>
          </div>
          <Link to="/motion-visualizer" className="shell-diagnostics" aria-label="Open motion diagnostics">⚙</Link>
        </div>
      </div>
    </aside>

    <div className="app-content">
      <div className="mobile-shell-bar">
        <Link className="shell-brand compact" to="/"><span className="shell-brand-mark"><i /><b /></span><strong>Oura Motion Controller</strong></Link>
        <span>{current?.label ?? 'Experiences'}</span>
      </div>
      {children}
    </div>
  </div>
}
