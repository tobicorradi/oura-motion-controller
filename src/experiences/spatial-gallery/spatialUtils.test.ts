import { describe, expect, it } from "vitest";
import { galleryCards } from "./galleryData";
import {
  applySpatialDeadZone,
  clampPosition,
  clampSpatial,
  getTargetVelocity,
  nearestCard,
} from "./spatialUtils";

describe("spatial navigation utilities", () => {
  it("applies a neutral dead zone", () => {
    expect(applySpatialDeadZone(0.11)).toBe(0);
    expect(applySpatialDeadZone(-0.2)).toBe(-0.2);
  });
  it("clamps input values", () => {
    expect(clampSpatial(3)).toBe(1);
    expect(clampSpatial(-3)).toBe(-1);
  });
  it("returns directional target velocity", () => {
    expect(getTargetVelocity({ horizontal: 0.5, vertical: -1 }, 400)).toEqual({
      x: 200,
      y: -400,
    });
  });
  it("selects the nearest card to the gallery center", () => {
    expect(nearestCard(galleryCards, { x: 0, y: 0 }).id).toBe("digital-matter");
    expect(nearestCard(galleryCards, { x: 390, y: 0 }).id).toBe("light-field");
  });
  it("constrains gallery position to the bounds", () => {
    expect(clampPosition({ x: 500, y: -500 }, 430)).toEqual({
      x: 430,
      y: -430,
    });
  });
});
