import { describe, it, expect } from "vitest";
import {
  initialMetrics,
  simulate,
  score,
  isMetrics,
  inPhilippines,
} from "./state";
describe("simulated rider score", () => {
  it("starts at 82 and rewards steady riding", () => {
    expect(score(initialMetrics)).toBe(82);
    expect(score(simulate(initialMetrics, "steady"))).toBe(86);
  });
  it("weights unsafe speed and smoothness independently", () => {
    expect(simulate(initialMetrics, "speed").compliance).toBe(68);
    expect(simulate(initialMetrics, "brake").compliance).toBe(82);
    expect(score(simulate(initialMetrics, "accelerate"))).toBeLessThan(
      score(initialMetrics),
    );
  });
  it("remains within the 0–100 score range after repeated events", () => {
    let m = initialMetrics;
    for (let i = 0; i < 100; i++) m = simulate(m, "steady");
    expect(score(m)).toBe(100);
    for (let i = 0; i < 100; i++) {
      m = simulate(simulate(simulate(m, "speed"), "brake"), "accelerate");
    }
    expect(score(m)).toBe(0);
  });
  it("rejects invalid persisted metrics", () => {
    expect(isMetrics(initialMetrics)).toBe(true);
    expect(isMetrics({ ...initialMetrics, patterns: 1000 })).toBe(false);
    expect(isMetrics({ ...initialMetrics, braking: NaN })).toBe(false);
    expect(isMetrics(null)).toBe(false);
  });
  it("accepts Philippine coordinates and rejects external GPS positions", () => {
    expect(inPhilippines(14.5995, 120.9842)).toBe(true);
    expect(inPhilippines(15.1813, 120.5226)).toBe(true);
    expect(inPhilippines(51.5, -0.1)).toBe(false);
  });
});
