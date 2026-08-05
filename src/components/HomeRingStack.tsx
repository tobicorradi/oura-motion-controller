import { Environment, Float } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useMotion } from '../motion/MotionProvider'

const rings: Array<{ color: string; position: [number, number, number]; rotation: [number, number, number] }> = [
  { color: '#0c3853', position: [-.52, -1.55, 0], rotation: [-.72, -.55, -.35] },
  { color: '#e9c5d8', position: [-.12, -.52, .22], rotation: [-.88, .34, .2] },
  { color: '#bde6df', position: [.2, .5, -.03], rotation: [-.82, -.4, -.14] },
  { color: '#faf9f6', position: [.53, 1.5, .25], rotation: [-.72, .43, .22] },
]

function FloatingRing({ color, position, rotation, index }: typeof rings[number] & { index: number }) {
  const group = useRef<THREE.Group>(null)
  const { motion } = useMotion()

  useFrame((state, delta) => {
    if (!group.current) return
    const time = state.clock.elapsedTime
    const targetX = rotation[0] + motion.normalizedPitch * .08
    const targetY = rotation[1] + motion.normalizedRoll * .13
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 2.4, delta)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 2.4, delta)
    group.current.position.y = position[1] + Math.sin(time * .65 + index * 1.1) * .06
  })

  return <group ref={group} position={position} rotation={rotation}>
    <mesh castShadow>
      <torusGeometry args={[.82, .19, 32, 96]} />
      <meshPhysicalMaterial color={color} metalness={.72} roughness={.24} clearcoat={.9} clearcoatRoughness={.12} />
    </mesh>
    <mesh position={[0, .8, .02]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[.07, .016, 10, 24]} />
      <meshBasicMaterial color="#151c2e" />
    </mesh>
  </group>
}

function RingStackScene() {
  return <>
    <ambientLight intensity={.72} />
    <directionalLight position={[3, 4, 5]} intensity={3.2} color="#ffffff" />
    <directionalLight position={[-4, 1, 2]} intensity={1.25} color="#b9dfff" />
    <Float speed={.8} rotationIntensity={0} floatIntensity={.12}>
      <group rotation={[0, 0, -.08]}>{rings.map((ring, index) => <FloatingRing key={ring.color} {...ring} index={index} />)}</group>
    </Float>
    <Environment preset="studio" />
  </>
}

export function HomeRingStack() {
  return <div className="home-ring-stack" aria-label="Floating smart rings responding subtly to motion">
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5.9], fov: 35 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <RingStackScene />
    </Canvas>
  </div>
}
