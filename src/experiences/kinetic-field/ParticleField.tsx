import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  BURST_DECAY,
  FIELD_HEIGHT,
  FIELD_MAX_RADIUS,
  FIELD_WIDTH,
} from "./constants";
import {
  computeForceCenter,
  computeForceFalloff,
  createFormationTargets,
  detectEnergySpike,
  particleCountForQuality,
  sanitizeMotion,
} from "./particleMath";
import { particleFragmentShader, particleVertexShader } from "./shaders";
import type {
  FieldFormation,
  FieldMode,
  FieldMotion,
  FieldQuality,
} from "./types";

type Props = {
  motion: FieldMotion;
  mode: FieldMode;
  formation: FieldFormation;
  radius: number;
  quality: FieldQuality;
  disconnected: boolean;
  reducedMotion: boolean;
  resetSignal: number;
};

type SimulationBuffers = {
  positions: Float32Array;
  velocities: Float32Array;
  rest: Float32Array;
  scales: Float32Array;
  seeds: Float32Array;
};

const particlePalette = [
  new THREE.Color("#ff2f9f"),
  new THREE.Color("#db35ff"),
  new THREE.Color("#7b3cff"),
  new THREE.Color("#2f80ff"),
  new THREE.Color("#14cbd3"),
  new THREE.Color("#ff2f9f"),
];

function setAngularColors(
  colors: Float32Array,
  targets: Float32Array,
  count: number,
) {
  const mixed = new THREE.Color();
  for (let index = 0; index < count; index += 1) {
    const cursor = index * 3;
    const angle =
      (Math.atan2(targets[cursor + 1], targets[cursor]) +
        Math.PI * 2 +
        Math.PI * 0.08) %
      (Math.PI * 2);
    const progress = (angle / (Math.PI * 2)) * 5;
    const base = Math.floor(progress);
    mixed
      .copy(particlePalette[base])
      .lerp(particlePalette[base + 1], progress - base);
    colors[cursor] = mixed.r;
    colors[cursor + 1] = mixed.g;
    colors[cursor + 2] = mixed.b;
  }
}

const tempDirection = new THREE.Vector3();
const tempCenterVector = new THREE.Vector3();

export function ParticleField({
  motion,
  mode,
  formation,
  radius,
  quality,
  disconnected,
  reducedMotion,
  resetSignal,
}: Props) {
  const count = particleCountForQuality(quality, reducedMotion);
  const points = useRef<THREE.Points>(null);
  const group = useRef<THREE.Group>(null);
  const previousEnergy = useRef(0);
  const lastBurstAt = useRef(-Infinity);
  const burstStrength = useRef(0);
  const burstProgress = useRef(0);
  const smoothedMotion = useRef({ horizontal: 0, vertical: 0, energy: 0 });
  const stableTimer = useRef(0);
  const buffers = useRef<SimulationBuffers | null>(null);
  const formationRef = useRef(formation);
  const radiusRef = useRef(radius);

  formationRef.current = formation;
  radiusRef.current = radius;

  const geometry = useMemo(() => {
    const instance = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    instance.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    instance.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    instance.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    instance.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    return instance;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uBurst: { value: 0 },
          uGlow: { value: reducedMotion ? 0.3 : 0.68 },
        },
      }),
    [reducedMotion],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    const positions = geometry.getAttribute("position").array as Float32Array;
    const scales = geometry.getAttribute("aScale").array as Float32Array;
    const seeds = geometry.getAttribute("aSeed").array as Float32Array;
    const colors = geometry.getAttribute("aColor").array as Float32Array;
    const velocities = new Float32Array(count * 3);
    const rest = createFormationTargets(
      formationRef.current,
      count,
      radiusRef.current,
    );
    for (let index = 0; index < count; index += 1) {
      const cursor = index * 3;
      const seed = (index * 0.61803398875) % 1;
      const jitter = reducedMotion ? 0.04 : 0.11;
      positions[cursor] = rest[cursor] + Math.sin(seed * 48) * jitter;
      positions[cursor + 1] = rest[cursor + 1] + Math.cos(seed * 52) * jitter;
      positions[cursor + 2] =
        rest[cursor + 2] + Math.sin(seed * 64) * jitter * 0.75;
      velocities[cursor] = 0;
      velocities[cursor + 1] = 0;
      velocities[cursor + 2] = 0;
      scales[index] = 0.58 + seed * 0.9;
      seeds[index] = seed;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aScale.needsUpdate = true;
    geometry.attributes.aSeed.needsUpdate = true;
    setAngularColors(colors, rest, count);
    geometry.attributes.aColor.needsUpdate = true;
    buffers.current = { positions, velocities, rest, scales, seeds };
    previousEnergy.current = 0;
    burstStrength.current = 0;
    burstProgress.current = 0;
    stableTimer.current = 0;
  }, [count, geometry, reducedMotion, resetSignal]);

  useEffect(() => {
    if (!buffers.current) return;
    const rest = createFormationTargets(formation, count, radius);
    buffers.current.rest = rest;
    const colors = geometry.getAttribute("aColor").array as Float32Array;
    setAngularColors(colors, rest, count);
    geometry.attributes.aColor.needsUpdate = true;
  }, [count, formation, geometry, radius]);

  useFrame((state, delta) => {
    if (!buffers.current || !points.current || !group.current) return;
    const safeDelta = Math.min(0.033, delta);
    const time = state.clock.elapsedTime;
    const uniforms = material.uniforms;
    const current = sanitizeMotion(
      disconnected
        ? { horizontal: 0, vertical: 0, energy: 0, isStill: true }
        : motion,
    );
    const live = smoothedMotion.current;
    live.horizontal = THREE.MathUtils.damp(
      live.horizontal,
      current.horizontal,
      6.4,
      safeDelta,
    );
    live.vertical = THREE.MathUtils.damp(
      live.vertical,
      current.vertical,
      6.4,
      safeDelta,
    );
    live.energy = THREE.MathUtils.damp(
      live.energy,
      current.energy,
      current.isStill ? 3.1 : 5.8,
      safeDelta,
    );

    if (current.isStill) stableTimer.current += safeDelta;
    else stableTimer.current = 0;

    const now = performance.now();
    if (
      detectEnergySpike(
        live.energy,
        previousEnergy.current,
        now,
        lastBurstAt.current,
      )
    ) {
      burstStrength.current = 1;
      burstProgress.current = 0;
      lastBurstAt.current = now;
    }
    previousEnergy.current = live.energy;

    burstStrength.current = Math.max(
      0,
      burstStrength.current - safeDelta * BURST_DECAY,
    );
    burstProgress.current += safeDelta * (2.4 + live.energy * 1.8);

    const directionalForce = 0.26 + live.energy * 1.04;
    const restStrength =
      stableTimer.current > 0.9 ? 0.082 : current.isStill ? 0.056 : 0.016;
    const center = computeForceCenter(
      live.horizontal,
      live.vertical,
      FIELD_WIDTH * 0.58,
      FIELD_HEIGHT * 0.62,
    );
    const buffersNow = buffers.current;
    const turbulence = reducedMotion
      ? 0.01 + live.energy * 0.035
      : 0.02 + live.energy * 0.085;
    const burstRadius = burstProgress.current * 1.7;
    const burstWidth = 0.72 + live.energy * 0.52;
    const damping = Math.pow(current.isStill ? 0.8 : 0.93, safeDelta * 60);
    const positionAttribute = geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;

    tempDirection
      .set(live.horizontal, -live.vertical, live.horizontal * 0.16)
      .multiplyScalar(directionalForce);

    for (let index = 0; index < count; index += 1) {
      const cursor = index * 3;
      let px = buffersNow.positions[cursor];
      let py = buffersNow.positions[cursor + 1];
      let pz = buffersNow.positions[cursor + 2];
      let vx = buffersNow.velocities[cursor];
      let vy = buffersNow.velocities[cursor + 1];
      let vz = buffersNow.velocities[cursor + 2];

      const tx = buffersNow.rest[cursor];
      const ty = buffersNow.rest[cursor + 1];
      const tz = buffersNow.rest[cursor + 2];

      vx += (tx - px) * restStrength;
      vy += (ty - py) * restStrength;
      vz += (tz - pz) * restStrength;
      vx += tempDirection.x * (0.025 + live.energy * 0.06);
      vy += tempDirection.y * (0.025 + live.energy * 0.06);
      vz += tempDirection.z * (0.04 + live.energy * 0.06);

      tempCenterVector.set(px - center.x, py - center.y, pz - center.z);
      const distance = Math.max(0.0001, tempCenterVector.length());
      const falloff = computeForceFalloff(
        distance,
        mode === "flow" ? 3.5 : 3.15,
      );
      tempCenterVector.multiplyScalar(1 / distance);

      if (mode === "repel") {
        vx += tempCenterVector.x * falloff * directionalForce * 2.65;
        vy += tempCenterVector.y * falloff * directionalForce * 2.65;
        vz += tempCenterVector.z * falloff * directionalForce * 1.25;
      } else {
        vx += (tempDirection.x - tempCenterVector.y * 0.35) * falloff * 1.75;
        vy += (tempDirection.y + tempCenterVector.x * 0.35) * falloff * 1.75;
        vz +=
          (tempDirection.z + (tempCenterVector.x - tempCenterVector.y) * 0.12) *
          falloff *
          1.2;
      }

      const seed = buffersNow.seeds[index];
      vx += Math.sin(time * 0.72 + seed * 32 + py * 0.65) * turbulence;
      vy += Math.cos(time * 0.8 + seed * 26 + px * 0.58) * turbulence;
      vz +=
        Math.sin(time * 0.54 + seed * 41 + (px + py) * 0.4) * turbulence * 0.7;

      if (burstStrength.current > 0) {
        const pulse =
          1 - Math.min(1, Math.abs(distance - burstRadius) / burstWidth);
        if (pulse > 0) {
          const push =
            pulse * burstStrength.current * (reducedMotion ? 0.12 : 0.22);
          vx += tempCenterVector.x * push;
          vy += tempCenterVector.y * push;
          vz += tempCenterVector.z * push;
        }
      }

      const radius = Math.hypot(px, py, pz);
      if (radius > FIELD_MAX_RADIUS) {
        const pull = (radius - FIELD_MAX_RADIUS) * 0.03;
        vx -= (px / radius) * pull;
        vy -= (py / radius) * pull;
        vz -= (pz / radius) * pull;
      }

      vx -= px * 0.0014;
      vy -= py * 0.0014;
      vz -= pz * 0.0014;

      vx *= damping;
      vy *= damping;
      vz *= damping;

      px += vx * safeDelta * 4.4;
      py += vy * safeDelta * 4.4;
      pz += vz * safeDelta * 4.4;

      buffersNow.positions[cursor] = px;
      buffersNow.positions[cursor + 1] = py;
      buffersNow.positions[cursor + 2] = pz;
      buffersNow.velocities[cursor] = vx;
      buffersNow.velocities[cursor + 1] = vy;
      buffersNow.velocities[cursor + 2] = vz;
    }

    positionAttribute.needsUpdate = true;
    uniforms.uTime.value = time;
    uniforms.uEnergy.value = live.energy;
    uniforms.uBurst.value = burstStrength.current;
    uniforms.uGlow.value = reducedMotion
      ? 0.3
      : 0.58 + live.energy * 0.32 + burstStrength.current * 0.22;

    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      live.horizontal * 0.07,
      4.2,
      safeDelta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      live.vertical * 0.05,
      4.2,
      safeDelta,
    );
    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      live.horizontal * 0.12,
      4.8,
      safeDelta,
    );
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      -live.vertical * 0.08,
      4.8,
      safeDelta,
    );
    const scale = 1 + live.energy * 0.04 + burstStrength.current * 0.03;
    group.current.scale.setScalar(scale);
  });

  return (
    <group ref={group}>
      <points
        ref={points}
        geometry={geometry}
        material={material}
        frustumCulled={false}
      />
    </group>
  );
}
