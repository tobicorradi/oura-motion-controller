import { describe, expect, it } from "vitest";
import {
  clampInput,
  computeForceCenter,
  computeForceFalloff,
  createFormationTargets,
  createRingTargets,
  createSphereTargets,
  createWaveTargets,
  detectEnergySpike,
  particleCountForQuality,
  sanitizeMotion,
} from "./particleMath";

describe("kinetic field particle math", () => {
  it("maps motion into a centered force point", () => {
    expect(computeForceCenter(0.5, -0.25, 4, 2)).toEqual({
      x: 2,
      y: 0.5,
      z: 0,
    });
  });

  it("clamps and sanitizes invalid input values", () => {
    expect(clampInput(4)).toBe(1);
    expect(clampInput(Number.NaN)).toBe(0);
    expect(
      sanitizeMotion({
        horizontal: Infinity,
        vertical: -0.4,
        energy: -3,
        isStill: 0 as never,
      }),
    ).toEqual({ horizontal: 0, vertical: -0.4, energy: 0, isStill: false });
  });

  it("detects energy spikes with a cooldown", () => {
    expect(detectEnergySpike(0.42, 0.12, 1000, 0, 0.2, 600)).toBe(true);
    expect(detectEnergySpike(0.42, 0.12, 1200, 900, 0.2, 600)).toBe(false);
  });

  it("computes a smooth force falloff by distance", () => {
    expect(computeForceFalloff(0, 3)).toBe(1);
    expect(computeForceFalloff(1.5, 3)).toBeGreaterThan(0.45);
    expect(computeForceFalloff(3, 3)).toBe(0);
  });

  it("creates ring formation targets", () => {
    const targets = createRingTargets(12);
    expect(targets).toHaveLength(36);
    const radialDistance = Math.hypot(targets[0], targets[1]);
    expect(radialDistance).toBeGreaterThan(1);
    expect(Math.abs(targets[2])).toBeLessThan(0.6);
  });

  it("creates sphere formation targets", () => {
    const targets = createSphereTargets(10);
    expect(targets).toHaveLength(30);
    const radius = Math.hypot(targets[0], targets[1], targets[2]);
    expect(radius).toBeCloseTo(1.7, 1);
  });

  it("creates wave formation targets", () => {
    const targets = createWaveTargets(16);
    expect(targets).toHaveLength(48);
    expect(Math.abs(targets[1])).toBeLessThan(0.5);
    expect(Math.abs(targets[47])).toBeLessThan(1.3);
  });

  it("applies a requested radius to each formation target", () => {
    const ring = createFormationTargets("ring", 12, 3);
    const sphere = createFormationTargets("sphere", 12, 3);
    const wave = createFormationTargets("wave", 12, 3);
    expect(Math.hypot(ring[0], ring[1])).toBeGreaterThan(2);
    expect(Math.hypot(sphere[0], sphere[1], sphere[2])).toBeCloseTo(3, 1);
    expect(Math.abs(wave[0])).toBeGreaterThan(1);
  });

  it("maps quality levels to particle counts", () => {
    expect(particleCountForQuality("high")).toBeGreaterThan(
      particleCountForQuality("balanced"),
    );
    expect(particleCountForQuality("low")).toBeLessThan(
      particleCountForQuality("balanced"),
    );
    expect(particleCountForQuality("balanced", true)).toBeLessThan(
      particleCountForQuality("balanced"),
    );
  });
});
