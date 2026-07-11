import { describe, it, expect } from "vitest";
import { validateDpi, outputDpiForNotch, recommend, DPI_MIN, DPI_MAX } from "./recommend";

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
			if (result.valid) {
				throw new Error("expected invalid result");
			}
			expect(result.error).toMatch(/between 100 and 35000/);
		}
	});

	it("exports the bounds it enforces", () => {
		expect(DPI_MIN).toBe(100);
		expect(DPI_MAX).toBe(35000);
	});
});

describe("outputDpiForNotch", () => {
	it("maps the notch range log-spaced from 400 to 2400", () => {
		expect(outputDpiForNotch(1)).toBe(400);
		expect(outputDpiForNotch(50)).toBe(971);
		expect(outputDpiForNotch(100)).toBe(2400);
	});

	it("is strictly increasing across all 100 notches", () => {
		for (let n = 2; n <= 100; n++) {
			expect(outputDpiForNotch(n)).toBeGreaterThan(outputDpiForNotch(n - 1));
		}
	});

	it("clamps out-of-range notches", () => {
		expect(outputDpiForNotch(0)).toBe(400);
		expect(outputDpiForNotch(-5)).toBe(400);
		expect(outputDpiForNotch(101)).toBe(2400);
		expect(outputDpiForNotch(50.4)).toBe(outputDpiForNotch(50));
	});
});

describe("recommend", () => {
	it("wires DPI and notch into the settings file", () => {
		const { settings, curve, summary } = recommend({ dpi: 1600, notch: 50 });
		expect(settings.defaultDeviceConfig["DPI (normalizes input speed unit: counts/ms -> in/s)"]).toBe(1600);
		expect(settings.profiles[0]["Output DPI"]).toBe(971);
		expect(curve).toEqual({ inputOffset: 10.5, decayRate: 0.1, limit: 1.5 });
		expect(summary).toEqual({ outputDpi: 971, limit: 1.5, inputOffset: 10.5, pixelSkipRisk: false });
	});

	it("adapts the curve character to the preference notch", () => {
		const low = recommend({ dpi: 1600, notch: 1 });
		const high = recommend({ dpi: 1600, notch: 100 });
		const argsOf = (r: ReturnType<typeof recommend>) =>
			r.settings.profiles[0]["Whole or horizontal accel parameters"];
		expect(argsOf(low).inputOffset).toBe(15);
		expect(argsOf(low).limit).toBe(1.7);
		expect(argsOf(high).inputOffset).toBe(6);
		expect(argsOf(high).limit).toBe(1.3);
	});

	it("flags pixel-skip risk when the effective DPI exceeds the mouse DPI", () => {
		const { summary } = recommend({ dpi: 400, notch: 100 });
		expect(summary).toEqual({ outputDpi: 2400, limit: 1.3, inputOffset: 6, pixelSkipRisk: true });
	});

	it("does not flag risk when effective DPI equals mouse DPI", () => {
		const { summary } = recommend({ dpi: 400, notch: 1 });
		expect(summary.pixelSkipRisk).toBe(false);
	});
});
