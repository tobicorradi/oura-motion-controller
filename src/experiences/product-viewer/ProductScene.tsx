import { ContactShadows, Environment, Float, OrbitControls, RoundedBox } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useMotion } from '../../motion/MotionProvider'

export type ViewPreset = 'front' | 'side' | 'top' | 'perspective'

const viewRotations: Record<ViewPreset, [number, number, number]> = {
  front: [-.36, 0, 0], side: [-.18, Math.PI / 2, 0], top: [-Math.PI / 2, 0, 0], perspective: [-.52, -.64, .08],
}

function LoungeChair({ viewPreset, resetSignal }: { viewPreset: ViewPreset; resetSignal: number }) {
  const sculpture = useRef<THREE.Group>(null)
  const { motion } = useMotion()
  const target = useRef(new THREE.Euler(...viewRotations[viewPreset]))

  useEffect(() => { target.current.set(...viewRotations[viewPreset]) }, [viewPreset, resetSignal])

  useFrame((_, delta) => {
    if (!sculpture.current) return
    sculpture.current.rotation.y = THREE.MathUtils.damp(sculpture.current.rotation.y, target.current.y + motion.normalizedRoll * 1.7, 3.3, delta)
    sculpture.current.rotation.x = THREE.MathUtils.damp(sculpture.current.rotation.x, target.current.x + motion.normalizedPitch * .62, 3.3, delta)
    sculpture.current.rotation.z = THREE.MathUtils.damp(sculpture.current.rotation.z, target.current.z, 3.3, delta)
    const scale = 1 + motion.energy * .035
    sculpture.current.scale.setScalar(scale)
  })

  return <Float speed={motion.isStill ? .3 : .75} rotationIntensity={0} floatIntensity={.12}><group ref={sculpture} rotation={viewRotations[viewPreset]}>
    {/* Green upholstered cushions */}
    <RoundedBox castShadow receiveShadow args={[1.9, .23, 1.42]} radius={.08} smoothness={5} position={[0, -.46, .08]}><meshPhysicalMaterial color="#1a5b3d" roughness={.54} /></RoundedBox>
    <RoundedBox castShadow args={[1.73, .27, 1.28]} radius={.13} smoothness={5} position={[0, -.22, .17]}><meshPhysicalMaterial color="#3f9968" roughness={.62} /></RoundedBox>
    <RoundedBox castShadow args={[1.72, 1.32, .3]} radius={.16} smoothness={5} position={[0, .59, -.57]} rotation={[-.1, 0, 0]}><meshPhysicalMaterial color="#367e58" roughness={.63} /></RoundedBox>
    <RoundedBox castShadow args={[.25, .62, 1.28]} radius={.12} smoothness={5} position={[-1.02, -.02, .08]}><meshPhysicalMaterial color="#2c704d" roughness={.6} /></RoundedBox>
    <RoundedBox castShadow args={[.25, .62, 1.28]} radius={.12} smoothness={5} position={[1.02, -.02, .08]}><meshPhysicalMaterial color="#2c704d" roughness={.6} /></RoundedBox>

    {/* Warm walnut frame, arm rails and legs */}
    {[-1.12, 1.12].map(x => <group key={x}>
      <mesh castShadow position={[x, .26, -.55]}><cylinderGeometry args={[.06, .07, 1.25, 18]} /><meshPhysicalMaterial color="#87431a" roughness={.3} /></mesh>
      <mesh castShadow position={[x, .18, .62]}><cylinderGeometry args={[.06, .07, 1.12, 18]} /><meshPhysicalMaterial color="#87431a" roughness={.3} /></mesh>
      <mesh castShadow position={[x, .55, .05]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.075, .085, 1.35, 18]} /><meshPhysicalMaterial color="#a75b1e" roughness={.28} /></mesh>
    </group>)}
    {[[-1.06, .62], [1.06, .62], [-1.06, -.56], [1.06, -.56]].map(([x, z]) => <mesh key={`${x}-${z}`} castShadow position={[x, -.92, z]} rotation={[z > 0 ? -.12 : .1, 0, x > 0 ? .07 : -.07]}><cylinderGeometry args={[.065, .09, .82, 18]} /><meshPhysicalMaterial color="#87431a" roughness={.3} /></mesh>)}
    <mesh castShadow position={[0, -.66, .62]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.06, .07, 2.15, 18]} /><meshPhysicalMaterial color="#87431a" roughness={.3} /></mesh>
  </group></Float>
}

export function ProductScene({ viewPreset, resetSignal }: { viewPreset: ViewPreset; resetSignal: number }) {
  const { motion } = useMotion()
  return <Canvas shadows dpr={[1, 2]} camera={{ position: [0, .1, 6.1 - motion.energy * .25], fov: 38 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#080d1b']} />
    <ambientLight intensity={.48} />
    <spotLight position={[3, 5, 4]} intensity={55} angle={.38} penumbra={1} castShadow color="#f4f8ff" />
    <spotLight position={[-4, 1, 1]} intensity={30} color="#8cacff" />
    <LoungeChair viewPreset={viewPreset} resetSignal={resetSignal} />
    <ContactShadows position={[0, -1.51, 0]} opacity={.58} scale={7} blur={2.5} far={4} />
    <Environment preset="studio" />
    <OrbitControls enablePan={false} enableZoom={false} />
  </Canvas>
}
