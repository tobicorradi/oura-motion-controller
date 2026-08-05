import { describe, expect, it } from "vitest";
import { clampEnergy, motionToNote, pitchToFilter } from "./music";
import { presets } from "./presets";

describe("Motion Synthesizer mappings", () => {
  it("maps roll into a constrained scale", () => {
    expect(motionToNote(-1, "ambient").name).toBe("C3");
    expect(motionToNote(1, "ambient").name).toBe("E4");
    expect(motionToNote(0.1, "pulse").name).toBe("B3");
  });
  it("maps pitch to safe filter frequencies", () => {
    expect(pitchToFilter(-1)).toBe(200);
    expect(pitchToFilter(1)).toBe(8000);
    expect(pitchToFilter(0)).toBeGreaterThan(1000);
  });
  it("clamps energy safely", () => {
    expect(clampEnergy(-0.2)).toBe(0);
    expect(clampEnergy(1.2)).toBe(1);
  });
  it("defines distinct audio presets", () => {
    expect(presets.ambient.oscillatorA).toBe("sine");
    expect(presets.pulse.lfoRate).toBeGreaterThan(1);
    expect(presets.cosmic.feedback).toBeLessThanOrEqual(0.35);
  });
});
