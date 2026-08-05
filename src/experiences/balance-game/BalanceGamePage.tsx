import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { ConnectionStatus } from '../../components/ConnectionStatus'
import { useMotion } from '../../motion/MotionProvider'
import { BalanceBoard } from './BalanceBoard'
import './balance-game.css'

export function BalanceGamePage() {
  const { motion, source, reset, calibrate } = useMotion()
  const [progress, setProgress] = useState(0)
  const [resetSignal, setResetSignal] = useState(0)
  const restart = () => { reset(); setProgress(0); setResetSignal(value => value + 1) }
  const direction = motion.energy < .035 ? 'Settle' : motion.normalizedPitch < -.22 ? 'Up' : motion.normalizedPitch > .22 ? 'Down' : motion.normalizedRoll < -.22 ? 'Left' : motion.normalizedRoll > .22 ? 'Right' : 'Center'

  return <AppShell accent="cyan"><main className="balance-game-page">
    <header className="experience-header"><Link to="/" className="back">← Home</Link><ConnectionStatus /></header>
    <section className="balance-heading"><div><p className="eyebrow">Experience 06 / Balance maze</p><h1>Balance<br /><i>Maze</i></h1><p>Tilt the maze to guide the sphere through its walls.</p></div><div className="balance-actions"><button onClick={restart}>Restart <kbd>R</kbd></button><button onClick={calibrate}>Calibrate</button></div></section>
    <section className="balance-stage"><BalanceBoard motion={motion} resetSignal={resetSignal} onProgress={setProgress} /><aside className="balance-panel"><p>Maze status</p><strong>{progress ? 'CLEAR' : 'PLAY'} <small>/ 01</small></strong><div className="balance-progress"><i style={{ width: `${progress * 100}%` }} /></div><div className="balance-direction"><span>Current input</span><b>{direction}</b></div><dl><div><dt>Horizontal</dt><dd>{motion.normalizedRoll.toFixed(2)}</dd></div><div><dt>Vertical</dt><dd>{motion.normalizedPitch.toFixed(2)}</dd></div><div><dt>Energy</dt><dd>{Math.round(motion.energy * 100)}%</dd></div><div><dt>Source</dt><dd>{source}</dd></div></dl></aside></section>
    <section className="balance-instructions"><i>◉</i><div><strong>Find the exit</strong><p>Tilt the maze left / right and forward / back to guide the sphere. Slow, intentional movement works best.</p></div><ol>{['Start at the upper-left corner', 'Tilt the maze around each wall', 'Reach the glowing exit'].map((item, index) => <li key={item}><b>{index + 1}</b>{item}</li>)}</ol></section>
  </main></AppShell>
}
