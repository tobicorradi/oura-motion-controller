import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Component, useEffect, useMemo, useState, type PropsWithChildren, type ReactNode } from 'react'
import { Vector3 } from 'three'
import { useReducedMotion } from 'framer-motion'
import { ParticleField } from './ParticleField'
import type { FieldFormation, FieldMode, FieldMotion, FieldQuality } from './types'

type Props = {
  motion: FieldMotion
  mode: FieldMode
  formation: FieldFormation
  radius: number
  quality: FieldQuality
  disconnected: boolean
  resetSignal: number
}

type BoundaryProps = PropsWithChildren<{ fallback: ReactNode }>
type BoundaryState = { hasError: boolean }

function isWebGlAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

class SceneErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  override componentDidCatch() {}

  override render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

function CameraRig({ motion, reducedMotion }: { motion: FieldMotion; reducedMotion: boolean }) {
  const { camera } = useThree()
  const focus = useMemo(() => new Vector3(), [])
  useFrame((_, delta) => {
    const safeDelta = Math.min(.033, delta)
    focus.set(motion.horizontal * .26, -motion.vertical * .18, 10 - motion.energy * (reducedMotion ? .12 : .28))
    camera.position.lerp(focus, 1 - Math.exp(-safeDelta * 3.4))
    camera.lookAt(0, 0, 0)
  })
  return null
}

function SceneContents({ motion, mode, formation, radius, quality, disconnected, reducedMotion, resetSignal }: Props & { reducedMotion: boolean }) {
  return <>
    <color attach="background" args={['#ffffff']} />
    <fog attach="fog" args={['#ffffff', 7.4, 13.5]} />
    <ambientLight intensity={.48} />
    <pointLight position={[0, 0, 3.2]} intensity={12} color="#d4ecff" />
    <pointLight position={[-2.6, 1.8, 2.4]} intensity={5} color="#f0d6ff" />
    <ParticleField motion={motion} mode={mode} formation={formation} radius={radius} quality={quality} disconnected={disconnected} reducedMotion={reducedMotion} resetSignal={resetSignal} />
    <CameraRig motion={motion} reducedMotion={reducedMotion} />
  </>
}

function SceneFallback({ message }: { message: string }) {
  return <div className="kinetic-fallback" role="status">
    <strong>Kinetic Field unavailable</strong>
    <p>{message}</p>
    <span>Keyboard and demo controls remain available in the rest of the experience.</span>
  </div>
}

export function KineticFieldScene(props: Props) {
  const reducedMotion = useReducedMotion() ?? false
  const [webGlReady, setWebGlReady] = useState(true)

  useEffect(() => {
    setWebGlReady(isWebGlAvailable())
  }, [])

  if (!webGlReady) return <SceneFallback message="WebGL is not available in this browser, so the particle field cannot be rendered here." />

  return <SceneErrorBoundary fallback={<SceneFallback message="The particle scene could not initialize cleanly. Switch to Demo Mode or refresh to try again." />}>
    <Canvas
      dpr={reducedMotion ? 1 : [1, props.quality === 'high' ? 1.85 : props.quality === 'balanced' ? 1.5 : 1.25]}
      camera={{ position: [0, 0, 10], fov: 38 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    >
      <SceneContents {...props} reducedMotion={reducedMotion} />
    </Canvas>
  </SceneErrorBoundary>
}
