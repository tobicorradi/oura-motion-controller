import { Environment, Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useMotion } from "../motion/MotionProvider";

const rings: Array<{
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
}> = [
  {
    color: "#0c3853",
    position: [-0.52, -1.55, 0],
    rotation: [-0.72, -0.55, -0.35],
  },
  {
    color: "#e9c5d8",
    position: [-0.12, -0.52, 0.22],
    rotation: [-0.88, 0.34, 0.2],
  },
  {
    color: "#bde6df",
    position: [0.2, 0.5, -0.03],
    rotation: [-0.82, -0.4, -0.14],
  },
  {
    color: "#faf9f6",
    position: [0.53, 1.5, 0.25],
    rotation: [-0.72, 0.43, 0.22],
  },
];

function FloatingRing({
  color,
  position,
  rotation,
  index,
}: (typeof rings)[number] & { index: number }) {
  const group = useRef<THREE.Group>(null);
  const { motion } = useMotion();

  useFrame((state, delta) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    const targetX = rotation[0] + motion.normalizedPitch * 0.08;
    const targetY = rotation[1] + motion.normalizedRoll * 0.13;
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      targetX,
      2.4,
      delta,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetY,
      2.4,
      delta,
    );
    group.current.position.y =
      position[1] + Math.sin(time * 0.65 + index * 1.1) * 0.06;
  });

  return (
    <group ref={group} position={position} rotation={rotation}>
      <mesh castShadow>
        <torusGeometry args={[0.82, 0.19, 32, 96]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.72}
          roughness={0.24}
          clearcoat={0.9}
          clearcoatRoughness={0.12}
        />
      </mesh>
      <mesh position={[0, 0.8, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.016, 10, 24]} />
        <meshBasicMaterial color="#151c2e" />
      </mesh>
    </group>
  );
}

function RingStackScene() {
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[3, 4, 5]} intensity={3.2} color="#ffffff" />
      <directionalLight
        position={[-4, 1, 2]}
        intensity={1.25}
        color="#b9dfff"
      />
      <Float speed={0.8} rotationIntensity={0} floatIntensity={0.12}>
        <group rotation={[0, 0, -0.08]}>
          {rings.map((ring, index) => (
            <FloatingRing key={ring.color} {...ring} index={index} />
          ))}
        </group>
      </Float>
      <Environment preset="studio" />
    </>
  );
}

export function HomeRingStack() {
  return (
    <div
      className="home-ring-stack"
      aria-label="Floating smart rings responding subtly to motion"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.9], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <RingStackScene />
      </Canvas>
    </div>
  );
}
