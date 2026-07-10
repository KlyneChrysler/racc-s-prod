import { describe, it, expect } from "vitest";
import { validateDpi, outputDpiForNotch, recommend, DPI_MIN, DPI_MAX } from "./recommend.js";

describe("validateDpi", () => {
	it("accepts integer DPI within 100-35000, including string form", () => {
		expect(validateDpi(100)).toEqual({ valid: true, dpi: 100 });
		expect(validateDpi(35000)).toEqual({ valid: true, dpi: 35000 });
		expect(validateDpi("1600")).toEqual({ valid: true, dpi: 1600 });
	});

	it("rejects out-of-range, fractional, and non-numeric input", () => {
		for (const bad of [99, 35001, 1600.5, "abc", "", null, undefined]) {
			const result = validateDpi(bad);
			expect(result.valid).toBe(false);
			expect(result.error).toMatch(/between 100 and 35000/);
		}
	});

	it("exports the bounds it enforces", () => {
		expect(DPI_MIN).toBe(100);
		expect(DPI_MAX).toBe(35000);
	});
});

describe("outputDpiForNotch", () => {
	it("maps the 10 notches log-spaced from 400 to 2400", () => {
		const expected = [400, 488, 596, 727, 887, 1082, 1321, 1612, 1967, 2400];
		for (let n = 1; n <= 10; n++) {
			expect(outputDpiForNotch(n)).toBe(expected[n - 1]);
		}
	});

	it("is strictly increasing", () => {
		for (let n = 2; n <= 10; n++) {
			expect(outputDpiForNotch(n)).toBeGreaterThan(outputDpiForNotch(n - 1));
		}
	});

	it("clamps out-of-range notches to the 1-10 range", () => {
		expect(outputDpiForNotch(0)).toBe(400);
		expect(outputDpiForNotch(-5)).toBe(400);
		expect(outputDpiForNotch(11)).toBe(2400);
		expect(outputDpiForNotch(5.4)).toBe(outputDpiForNotch(5));
	});
});

describe("recommend", () => {
	it("wires DPI and notch into the settings file", () => {
		const { settings, curve, summary } = recommend({ dpi: 1600, notch: 5 });
		expect(settings.defaultDeviceConfig["DPI (normalizes input speed unit: counts/ms -> in/s)"]).toBe(1600);
		expect(settings.profiles[0]["Output DPI"]).toBe(887);
		expect(curve).toEqual({ inputOffset: 11, decayRate: 0.1, limit: 1.5 });
		expect(summary).toEqual({ outputDpi: 887, limit: 1.5, inputOffset: 11, pixelSkipRisk: false });
	});

	it("adapts the curve character to the preference notch", () => {
		const low = recommend({ dpi: 1600, notch: 1 });
		const high = recommend({ dpi: 1600, notch: 10 });
		const argsOf = (r) => r.settings.profiles[0]["Whole or horizontal accel parameters"];
		expect(argsOf(low).inputOffset).toBe(15);
		expect(argsOf(low).limit).toBe(1.7);
		expect(argsOf(high).inputOffset).toBe(6);
		expect(argsOf(high).limit).toBe(1.3);
	});

	it("flags pixel-skip risk when the effective DPI exceeds the mouse DPI", () => {
		const { summary } = recommend({ dpi: 400, notch: 10 });
		expect(summary).toEqual({ outputDpi: 2400, limit: 1.3, inputOffset: 6, pixelSkipRisk: true });
	});

	it("does not flag risk when effective DPI equals mouse DPI", () => {
		const { summary } = recommend({ dpi: 400, notch: 1 });
		expect(summary.pixelSkipRisk).toBe(false);
	});
});
