import { describe, it, expect } from "vitest";
import { naturalSens, RECOMMENDED_CURVE } from "./curve.js";

describe("RECOMMENDED_CURVE", () => {
	it("matches the community-consensus starter values", () => {
		expect(RECOMMENDED_CURVE).toEqual({ inputOffset: 10, decayRate: 0.1, limit: 1.5 });
	});
});

describe("naturalSens", () => {
	it("is flat 1.0 at and below the input offset", () => {
		expect(naturalSens(0, RECOMMENDED_CURVE)).toBe(1);
		expect(naturalSens(10, RECOMMENDED_CURVE)).toBe(1);
	});

	it("rises above 1.0 past the offset", () => {
		expect(naturalSens(20, RECOMMENDED_CURVE)).toBeGreaterThan(1);
	});

	it("is monotonically increasing past the offset", () => {
		let prev = naturalSens(10, RECOMMENDED_CURVE);
		for (let v = 11; v <= 100; v++) {
			const cur = naturalSens(v, RECOMMENDED_CURVE);
			expect(cur).toBeGreaterThan(prev);
			prev = cur;
		}
	});

	it("approaches but never exceeds the limit", () => {
		expect(naturalSens(1000, RECOMMENDED_CURVE)).toBeLessThanOrEqual(1.5);
		expect(naturalSens(1000, RECOMMENDED_CURVE)).toBeGreaterThan(1.49);
	});
});
