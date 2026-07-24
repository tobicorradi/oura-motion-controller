import { ContactShadows, Environment, Float, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useMotion } from '../../motion/MotionProvider'

const finishes = { silver: { name: 'Brushed Silver', color: '#b9bbc0', metalness: .95, roughness: .27 }, black: { name: 'Matte Black', color: '#202124', metalness: .63, roughness: .36 }, gold: { name: 'Gold', color: '#b48c51', metalness: .92, roughness: .24 } }
export type Finish = keyof typeof finishes

function SmartRing({ finish }: { finish: Finish }) {
  const ring = useRef<THREE.Group>(null); const { motion } = useMotion()
  useFrame((_, delta) => { if (!ring.current) return; ring.current.rotation.y = THREE.MathUtils.damp(ring.current.rotation.y, motion.normalizedRoll * 1.7, 3.3, delta); ring.current.rotation.x = THREE.MathUtils.damp(ring.current.rotation.x, -.36 + motion.normalizedPitch * .62, 3.3, delta) })
  const material = finishes[finish]
  return <Float speed={motion.isStill ? .45 : 1.1} rotationIntensity={0} floatIntensity={.24}><group ref={ring} rotation={[-.36, 0, 0]}>
    <mesh castShadow><torusGeometry args={[1.48, .27, 38, 128]} /><meshPhysicalMaterial color={material.color} metalness={material.metalness} roughness={material.roughness} clearcoat={.65} clearcoatRoughness={.18} /></mesh>
    <mesh position={[0, 1.48, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.11, .024, 12, 32]} /><meshBasicMaterial color="#101114" /></mesh>
  </group></Float>
}
export function ProductScene({ finish }: { finish: Finish }) { const { motion } = useMotion(); return <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5.3 - motion.energy * .25], fov: 38 }}><color attach="background" args={['#0a0a0b']} /><ambientLight intensity={.48} /><spotLight position={[3, 5, 4]} intensity={55} angle={.38} penumbra={1} castShadow color="#fff1df" /><spotLight position={[-4, 1, 1]} intensity={30} color="#cbd5e6" /><SmartRing finish={finish} /><ContactShadows position={[0, -1.52, 0]} opacity={.52} scale={8} blur={2.5} far={4} /><Environment preset="studio" /><OrbitControls enablePan={false} enableZoom={false} /></Canvas> }
export { finishes }
