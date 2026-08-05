import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useMotion } from "../../motion/MotionProvider";

export type ViewPreset = "front" | "side" | "top" | "perspective";

const viewRotations: Record<ViewPreset, [number, number, number]> = {
  front: [-0.36, 0, 0],
  side: [-0.18, Math.PI / 2, 0],
  top: [-Math.PI / 2, 0, 0],
  perspective: [-0.52, -0.64, 0.08],
};

function LoungeChair({
  viewPreset,
  resetSignal,
}: {
  viewPreset: ViewPreset;
  resetSignal: number;
}) {
  const sculpture = useRef<THREE.Group>(null);
  const { motion } = useMotion();
  const target = useRef(new THREE.Euler(...viewRotations[viewPreset]));

  useEffect(() => {
    target.current.set(...viewRotations[viewPreset]);
  }, [viewPreset, resetSignal]);

  useFrame((_, delta) => {
    if (!sculpture.current) return;
    sculpture.current.rotation.y = THREE.MathUtils.damp(
      sculpture.current.rotation.y,
      target.current.y + motion.normalizedRoll * 1.7,
      3.3,
      delta,
    );
    sculpture.current.rotation.x = THREE.MathUtils.damp(
      sculpture.current.rotation.x,
      target.current.x + motion.normalizedPitch * 0.62,
      3.3,
      delta,
    );
    sculpture.current.rotation.z = THREE.MathUtils.damp(
      sculpture.current.rotation.z,
      target.current.z,
      3.3,
      delta,
    );
    const scale = 1 + motion.energy * 0.035;
    sculpture.current.scale.setScalar(scale);
  });

  return (
    <Float
      speed={motion.isStill ? 0.3 : 0.75}
      rotationIntensity={0}
      floatIntensity={0.12}
    >
      <group ref={sculpture} rotation={viewRotations[viewPreset]}>
        {/* Green upholstered cushions */}
        <RoundedBox
          castShadow
          receiveShadow
          args={[1.9, 0.23, 1.42]}
          radius={0.08}
          smoothness={5}
          position={[0, -0.46, 0.08]}
        >
          <meshPhysicalMaterial color="#1a5b3d" roughness={0.54} />
        </RoundedBox>
        <RoundedBox
          castShadow
          args={[1.73, 0.27, 1.28]}
          radius={0.13}
          smoothness={5}
          position={[0, -0.22, 0.17]}
        >
          <meshPhysicalMaterial color="#3f9968" roughness={0.62} />
        </RoundedBox>
        <RoundedBox
          castShadow
          args={[1.72, 1.32, 0.3]}
          radius={0.16}
          smoothness={5}
          position={[0, 0.59, -0.57]}
          rotation={[-0.1, 0, 0]}
        >
          <meshPhysicalMaterial color="#367e58" roughness={0.63} />
        </RoundedBox>
        <RoundedBox
          castShadow
          args={[0.25, 0.62, 1.28]}
          radius={0.12}
          smoothness={5}
          position={[-1.02, -0.02, 0.08]}
        >
          <meshPhysicalMaterial color="#2c704d" roughness={0.6} />
        </RoundedBox>
        <RoundedBox
          castShadow
          args={[0.25, 0.62, 1.28]}
          radius={0.12}
          smoothness={5}
          position={[1.02, -0.02, 0.08]}
        >
          <meshPhysicalMaterial color="#2c704d" roughness={0.6} />
        </RoundedBox>

        {/* Warm walnut frame, arm rails and legs */}
        {[-1.12, 1.12].map((x) => (
          <group key={x}>
            <mesh castShadow position={[x, 0.26, -0.55]}>
              <cylinderGeometry args={[0.06, 0.07, 1.25, 18]} />
              <meshPhysicalMaterial color="#87431a" roughness={0.3} />
            </mesh>
            <mesh castShadow position={[x, 0.18, 0.62]}>
              <cylinderGeometry args={[0.06, 0.07, 1.12, 18]} />
              <meshPhysicalMaterial color="#87431a" roughness={0.3} />
            </mesh>
            <mesh
              castShadow
              position={[x, 0.55, 0.05]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.075, 0.085, 1.35, 18]} />
              <meshPhysicalMaterial color="#a75b1e" roughness={0.28} />
            </mesh>
          </group>
        ))}
        {[
          [-1.06, 0.62],
          [1.06, 0.62],
          [-1.06, -0.56],
          [1.06, -0.56],
        ].map(([x, z]) => (
          <mesh
            key={`${x}-${z}`}
            castShadow
            position={[x, -0.92, z]}
            rotation={[z > 0 ? -0.12 : 0.1, 0, x > 0 ? 0.07 : -0.07]}
          >
            <cylinderGeometry args={[0.065, 0.09, 0.82, 18]} />
            <meshPhysicalMaterial color="#87431a" roughness={0.3} />
          </mesh>
        ))}
        <mesh
          castShadow
          position={[0, -0.66, 0.62]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.06, 0.07, 2.15, 18]} />
          <meshPhysicalMaterial color="#87431a" roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

export function ProductScene({
  viewPreset,
  resetSignal,
}: {
  viewPreset: ViewPreset;
  resetSignal: number;
}) {
  const { motion } = useMotion();
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.1, 6.1 - motion.energy * 0.25], fov: 38 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#080d1b"]} />
      <ambientLight intensity={0.48} />
      <spotLight
        position={[3, 5, 4]}
        intensity={55}
        angle={0.38}
        penumbra={1}
        castShadow
        color="#f4f8ff"
      />
      <spotLight position={[-4, 1, 1]} intensity={30} color="#8cacff" />
      <LoungeChair viewPreset={viewPreset} resetSignal={resetSignal} />
      <ContactShadows
        position={[0, -1.51, 0]}
        opacity={0.58}
        scale={7}
        blur={2.5}
        far={4}
      />
      <Environment preset="studio" />
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
}
