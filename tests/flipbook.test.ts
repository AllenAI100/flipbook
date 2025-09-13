import { describe, it, expect } from "vitest";
import { computeDims } from "../components/FlipBook";

describe("computeDims", () => {
  it("clamps width to [280,1000] and keeps ratio", () => {
    const { w, h } = computeDims({ viewportWidth: 2000, designWidth: 800, designHeight: 600 });
    expect(w).toBe(1000);
    expect(h).toBe(Math.round(1000 * (600/800)));
  });
  it("respects minimum 480", () => {
    const { w } = computeDims({ viewportWidth: 200, designWidth: 800, designHeight: 600 });
    expect(w).toBe(480);
  });
  it("works mid-range", () => {
    const { w, h } = computeDims({ viewportWidth: 720, designWidth: 800, designHeight: 600 });
    expect(w).toBe(720);
    expect(h).toBe(Math.round(720 * (600/800)));
  });
});
