import { Link, useLocation } from 'react-router-dom'
import { ConnectionStatus } from '../components/ConnectionStatus'
const labels: Record<string, string> = { '/orbital-balance': 'Orbital Balance', '/motion-synthesizer': 'Motion Synthesizer' }
export function ComingSoonPage() { const location = useLocation(); const title = labels[location.pathname] ?? 'Experience'; return <main className="coming"><header className="experience-header"><Link to="/" className="back">← Home</Link><ConnectionStatus /></header><p className="eyebrow">Next experiment</p><h1>{title}</h1><p>This study is intentionally held for the next increment. The motion demo system is active and ready.</p><Link className="button" to="/product-viewer">Explore Product Viewer →</Link></main> }
