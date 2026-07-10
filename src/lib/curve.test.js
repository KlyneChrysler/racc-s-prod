import { describe, it, expect } from "vitest";
import { naturalSens, curveForNotch, clampNotch } from "./curve.js";

const MID_CURVE = { inputOffset: 11, decayRate: 0.1, limit: 1.5 };

describe("curveForNotch", () => {
	it("waits longer and ramps higher for low sens preferences", () => {
		expect(curveForNotch(1)).toEqual({ inputOffset: 15, decayRate: 0.1, limit: 1.7 });
	});

	it("starts sooner and caps gentler for high sens preferences", () => {
		expect(curveForNotch(10)).toEqual({ inputOffset: 6, decayRate: 0.1, limit: 1.3 });
	});

	it("lands on the community starter values in the middle", () => {
		expect(curveForNotch(5)).toEqual(MID_CURVE);
	});

	it("keeps the offset strictly decreasing and the limit within consensus bounds", () => {
		for (let n = 2; n <= 10; n++) {
			const prev = curveForNotch(n - 1);
			const cur = curveForNotch(n);
			expect(cur.inputOffset).toBeLessThan(prev.inputOffset);
			expect(cur.limit).toBeLessThanOrEqual(prev.limit);
			expect(cur.limit).toBeGreaterThanOrEqual(1.3);
			expect(cur.limit).toBeLessThanOrEqual(1.7);
		}
	});

	it("clamps out-of-range notches", () => {
		expect(curveForNotch(0)).toEqual(curveForNotch(1));
		expect(curveForNotch(11)).toEqual(curveForNotch(10));
		expect(curveForNotch(5.4)).toEqual(curveForNotch(5));
	});
});

describe("clampNotch", () => {
	it("rounds and clamps to 1 through 10", () => {
		expect(clampNotch(-3)).toBe(1);
		expect(clampNotch(5.4)).toBe(5);
		expect(clampNotch(42)).toBe(10);
	});
});

describe("naturalSens", () => {
	it("is flat 1.0 at and below the input offset", () => {
		expect(naturalSens(0, MID_CURVE)).toBe(1);
		expect(naturalSens(11, MID_CURVE)).toBe(1);
	});

	it("rises above 1.0 past the offset", () => {
		expect(naturalSens(20, MID_CURVE)).toBeGreaterThan(1);
	});

	it("is monotonically increasing past the offset", () => {
		let prev = naturalSens(11, MID_CURVE);
		for (let v = 12; v <= 100; v++) {
			const cur = naturalSens(v, MID_CURVE);
			expect(cur).toBeGreaterThan(prev);
			prev = cur;
		}
	});

	it("approaches but never exceeds the limit", () => {
		expect(naturalSens(1000, MID_CURVE)).toBeLessThanOrEqual(1.5);
		expect(naturalSens(1000, MID_CURVE)).toBeGreaterThan(1.49);
	});
});
