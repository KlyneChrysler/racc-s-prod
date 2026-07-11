import { describe, it, expect } from "vitest";
import { naturalSens, curveForNotch, clampNotch, NOTCH_MIN, NOTCH_MAX } from "./curve";

const MID_CURVE = { inputOffset: 10.5, decayRate: 0.1, limit: 1.5 };

describe("curveForNotch", () => {
	it("waits longer and ramps higher for low sens preferences", () => {
		expect(curveForNotch(1)).toEqual({ inputOffset: 15, decayRate: 0.1, limit: 1.7 });
	});

	it("starts sooner and caps gentler for high sens preferences", () => {
		expect(curveForNotch(100)).toEqual({ inputOffset: 6, decayRate: 0.1, limit: 1.3 });
	});

	it("lands on the community starter values in the middle", () => {
		expect(curveForNotch(50)).toEqual(MID_CURVE);
	});

	it("keeps offset and limit monotonic within consensus bounds", () => {
		for (let n = NOTCH_MIN + 1; n <= NOTCH_MAX; n++) {
			const prev = curveForNotch(n - 1);
			const cur = curveForNotch(n);
			expect(cur.inputOffset).toBeLessThanOrEqual(prev.inputOffset);
			expect(cur.limit).toBeLessThanOrEqual(prev.limit);
			expect(cur.inputOffset).toBeGreaterThanOrEqual(6);
			expect(cur.inputOffset).toBeLessThanOrEqual(15);
			expect(cur.limit).toBeGreaterThanOrEqual(1.3);
			expect(cur.limit).toBeLessThanOrEqual(1.7);
		}
	});

	it("clamps out-of-range notches", () => {
		expect(curveForNotch(0)).toEqual(curveForNotch(1));
		expect(curveForNotch(101)).toEqual(curveForNotch(100));
		expect(curveForNotch(50.4)).toEqual(curveForNotch(50));
	});
});

describe("clampNotch", () => {
	it("rounds and clamps to the notch range", () => {
		expect(clampNotch(-3)).toBe(1);
		expect(clampNotch(50.4)).toBe(50);
		expect(clampNotch(420)).toBe(100);
	});
});

describe("naturalSens", () => {
	it("is flat 1.0 at and below the input offset", () => {
		expect(naturalSens(0, MID_CURVE)).toBe(1);
		expect(naturalSens(10.5, MID_CURVE)).toBe(1);
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
