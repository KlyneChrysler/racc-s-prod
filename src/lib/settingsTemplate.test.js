import { describe, it, expect } from "vitest";
import { buildSettings } from "./settingsTemplate.js";

const EXPECTED_ROOT_KEYS = [
	"### Accel modes ###",
	"### Cap modes ###",
	"version",
	"defaultDeviceConfig",
	"profiles",
	"devices"
];

const EXPECTED_DEVICE_CONFIG_KEYS = [
	"disable",
	"Use constant time interval based on polling rate",
	"DPI (normalizes input speed unit: counts/ms -> in/s)",
	"Polling rate Hz (keep at 0 for automatic adjustment)"
];

const EXPECTED_PROFILE_KEYS = [
	"name",
	"Stretches domain for horizontal vs vertical inputs",
	"Stretches accel range for horizontal vs vertical inputs",
	"Whole or horizontal accel parameters",
	"Vertical accel parameters",
	"Input speed calculation parameters",
	"Output DPI",
	"Y/X output DPI ratio (vertical sens multiplier)",
	"L/R output DPI ratio (left sens multiplier)",
	"U/D output DPI ratio (up sens multiplier)",
	"Degrees of rotation",
	"Degrees of angle snapping",
	"Input Speed Cap"
];

const EXPECTED_ACCEL_KEYS = [
	"mode",
	"Gain / Velocity",
	"inputOffset",
	"outputOffset",
	"acceleration",
	"decayRate",
	"gamma",
	"motivity",
	"exponentClassic",
	"scale",
	"exponentPower",
	"limit",
	"syncSpeed",
	"smooth",
	"Cap / Jump",
	"Cap mode",
	"data"
];

const EXPECTED_SPEED_KEYS = [
	"Whole/combined accel (set false for 'by component' mode)",
	"lpNorm",
	"Time in ms after which an input is weighted at half its original value.",
	"Time in ms after which scale is weighted at half its original value.",
	"Time in ms after which an output is weighted at half its original value."
];

const MID_CURVE = { inputOffset: 11, decayRate: 0.1, limit: 1.5 };

describe("buildSettings", () => {
	const settings = buildSettings({ dpi: 1600, outputDpi: 887, curve: MID_CURVE });
	const profile = settings.profiles[0];
	const argsX = profile["Whole or horizontal accel parameters"];
	const argsY = profile["Vertical accel parameters"];

	it("matches the exact v1.7.x key sets and order", () => {
		expect(Object.keys(settings)).toEqual(EXPECTED_ROOT_KEYS);
		expect(Object.keys(settings.defaultDeviceConfig)).toEqual(EXPECTED_DEVICE_CONFIG_KEYS);
		expect(settings.profiles).toHaveLength(1);
		expect(Object.keys(profile)).toEqual(EXPECTED_PROFILE_KEYS);
		expect(Object.keys(argsX)).toEqual(EXPECTED_ACCEL_KEYS);
		expect(Object.keys(argsY)).toEqual(EXPECTED_ACCEL_KEYS);
		expect(Object.keys(profile["Input speed calculation parameters"])).toEqual(EXPECTED_SPEED_KEYS);
	});

	it("targets version 1.7.0 with no per-device overrides", () => {
		expect(settings.version).toBe("1.7.0");
		expect(settings.devices).toEqual([]);
	});

	it("normalizes input using the user's DPI", () => {
		expect(settings.defaultDeviceConfig["DPI (normalizes input speed unit: counts/ms -> in/s)"]).toBe(1600);
	});

	it("applies the given natural curve on the whole/horizontal args", () => {
		expect(argsX.mode).toBe("natural");
		expect(argsX["Gain / Velocity"]).toBe(true);
		expect(argsX.inputOffset).toBe(11);
		expect(argsX.decayRate).toBe(0.1);
		expect(argsX.limit).toBe(1.5);
	});

	it("leaves vertical args at inert defaults", () => {
		expect(argsY.mode).toBe("noaccel");
		expect(argsY.inputOffset).toBe(0);
	});

	it("sets overall sensitivity via Output DPI and disables angle snapping", () => {
		expect(profile["Output DPI"]).toBe(887);
		expect(profile["Degrees of angle snapping"]).toBe(0);
		expect(profile["Input Speed Cap"]).toBe(0);
	});

	it("returns a fresh object each call (no shared mutable state)", () => {
		const a = buildSettings({ dpi: 800, outputDpi: 400, curve: MID_CURVE });
		const b = buildSettings({ dpi: 800, outputDpi: 400, curve: MID_CURVE });
		expect(a).not.toBe(b);
		expect(a.profiles[0]).not.toBe(b.profiles[0]);
		expect(a).toEqual(b);
	});
});
