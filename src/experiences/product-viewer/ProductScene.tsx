import { ContactShadows, Environment, Float, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useMotion } from '../../motion/MotionProvider'

export type ViewPreset = 'front' | 'side' | 'top' | 'perspective'

const viewRotations: Record<ViewPreset, [number, number, number]> = {
  front: [-.36, 0, 0], side: [-.18, Math.PI / 2, 0], top: [-Math.PI / 2, 0, 0], perspective: [-.52, -.64, .08],
}

function SmartRing({ viewPreset, resetSignal }: { viewPreset: ViewPreset; resetSignal: number }) {
  const ring = useRef<THREE.Group>(null)
  const { motion } = useMotion()
  const target = useRef(new THREE.Euler(...viewRotations[viewPreset]))

  useEffect(() => { target.current.set(...viewRotations[viewPreset]) }, [viewPreset, resetSignal])

  useFrame((_, delta) => {
    if (!ring.current) return
    ring.current.rotation.y = THREE.MathUtils.damp(ring.current.rotation.y, target.current.y + motion.normalizedRoll * 1.7, 3.3, delta)
    ring.current.rotation.x = THREE.MathUtils.damp(ring.current.rotation.x, target.current.x + motion.normalizedPitch * .62, 3.3, delta)
    ring.current.rotation.z = THREE.MathUtils.damp(ring.current.rotation.z, target.current.z, 3.3, delta)
    const scale = 1 + motion.energy * .035
    ring.current.scale.setScalar(scale)
  })

  return <Float speed={motion.isStill ? .45 : 1.1} rotationIntensity={0} floatIntensity={.24}><group ref={ring} rotation={viewRotations[viewPreset]}>
    <mesh castShadow><torusGeometry args={[1.48, .27, 38, 128]} /><meshPhysicalMaterial color="#c4ccd8" metalness={.96} roughness={.2} clearcoat={.8} clearcoatRoughness={.13} /></mesh>
    <mesh position={[0, 1.48, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.11, .024, 12, 32]} /><meshBasicMaterial color="#111521" /></mesh>
  </group></Float>
}

export function ProductScene({ viewPreset, resetSignal }: { viewPreset: ViewPreset; resetSignal: number }) {
  const { motion } = useMotion()
  return <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5.3 - motion.energy * .25], fov: 38 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#080d1b']} />
    <ambientLight intensity={.48} />
    <spotLight position={[3, 5, 4]} intensity={55} angle={.38} penumbra={1} castShadow color="#f4f8ff" />
    <spotLight position={[-4, 1, 1]} intensity={30} color="#8cacff" />
    <SmartRing viewPreset={viewPreset} resetSignal={resetSignal} />
    <ContactShadows position={[0, -1.52, 0]} opacity={.52} scale={8} blur={2.5} far={4} />
    <Environment preset="studio" />
    <OrbitControls enablePan={false} enableZoom={false} />
  </Canvas>
}
