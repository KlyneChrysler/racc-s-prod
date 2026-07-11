import type { Curve } from "./curve";

interface Vec2 {
	x: number;
	y: number;
}

type AccelMode = "classic" | "jump" | "natural" | "synchronous" | "power" | "lut" | "noaccel";

export interface AccelArgs {
	"mode": AccelMode;
	"Gain / Velocity": boolean;
	"inputOffset": number;
	"outputOffset": number;
	"acceleration": number;
	"decayRate": number;
	"gamma": number;
	"motivity": number;
	"exponentClassic": number;
	"scale": number;
	"exponentPower": number;
	"limit": number;
	"syncSpeed": number;
	"smooth": number;
	"Cap / Jump": Vec2;
	"Cap mode": "in_out" | "input" | "output";
	"data": number[];
}

export interface DeviceConfig {
	"disable": boolean;
	"Use constant time interval based on polling rate": boolean;
	"DPI (normalizes input speed unit: counts/ms -> in/s)": number;
	"Polling rate Hz (keep at 0 for automatic adjustment)": number;
}

export interface SpeedArgs {
	"Whole/combined accel (set false for 'by component' mode)": boolean;
	"lpNorm": number;
	"Time in ms after which an input is weighted at half its original value.": number;
	"Time in ms after which scale is weighted at half its original value.": number;
	"Time in ms after which an output is weighted at half its original value.": number;
}

export interface Profile {
	"name": string;
	"Stretches domain for horizontal vs vertical inputs": Vec2;
	"Stretches accel range for horizontal vs vertical inputs": Vec2;
	"Whole or horizontal accel parameters": AccelArgs;
	"Vertical accel parameters": AccelArgs;
	"Input speed calculation parameters": SpeedArgs;
	"Output DPI": number;
	"Y/X output DPI ratio (vertical sens multiplier)": number;
	"L/R output DPI ratio (left sens multiplier)": number;
	"U/D output DPI ratio (up sens multiplier)": number;
	"Degrees of rotation": number;
	"Degrees of angle snapping": number;
	"Input Speed Cap": number;
}

export interface RawAccelSettings {
	"### Accel modes ###": string;
	"### Cap modes ###": string;
	"version": string;
	"defaultDeviceConfig": DeviceConfig;
	"profiles": Profile[];
	"devices": never[];
}

export interface BuildSettingsInput {
	dpi: number;
	outputDpi: number;
	curve: Curve;
}

function defaultAccelArgs(): AccelArgs {
	return {
		"mode": "noaccel",
		"Gain / Velocity": true,
		"inputOffset": 0,
		"outputOffset": 0,
		"acceleration": 0.005,
		"decayRate": 0.1,
		"gamma": 1,
		"motivity": 1.5,
		"exponentClassic": 2,
		"scale": 1,
		"exponentPower": 0.05,
		"limit": 1.5,
		"syncSpeed": 5,
		"smooth": 0.5,
		"Cap / Jump": { "x": 15, "y": 1.5 },
		"Cap mode": "output",
		"data": []
	};
}

export function buildSettings({ dpi, outputDpi, curve }: BuildSettingsInput): RawAccelSettings {
	return {
		"### Accel modes ###": "classic | jump | natural | synchronous | power | lut | noaccel",
		"### Cap modes ###": "in_out | input | output",
		"version": "1.7.0",
		"defaultDeviceConfig": {
			"disable": false,
			"Use constant time interval based on polling rate": false,
			"DPI (normalizes input speed unit: counts/ms -> in/s)": dpi,
			"Polling rate Hz (keep at 0 for automatic adjustment)": 0
		},
		"profiles": [
			{
				"name": "rawaccel-easy",
				"Stretches domain for horizontal vs vertical inputs": { "x": 1, "y": 1 },
				"Stretches accel range for horizontal vs vertical inputs": { "x": 1, "y": 1 },
				"Whole or horizontal accel parameters": {
					...defaultAccelArgs(),
					"mode": "natural",
					"inputOffset": curve.inputOffset,
					"decayRate": curve.decayRate,
					"limit": curve.limit
				},
				"Vertical accel parameters": defaultAccelArgs(),
				"Input speed calculation parameters": {
					"Whole/combined accel (set false for 'by component' mode)": true,
					"lpNorm": 2,
					"Time in ms after which an input is weighted at half its original value.": 0,
					"Time in ms after which scale is weighted at half its original value.": 0,
					"Time in ms after which an output is weighted at half its original value.": 0
				},
				"Output DPI": outputDpi,
				"Y/X output DPI ratio (vertical sens multiplier)": 1,
				"L/R output DPI ratio (left sens multiplier)": 1,
				"U/D output DPI ratio (up sens multiplier)": 1,
				"Degrees of rotation": 0,
				"Degrees of angle snapping": 0,
				"Input Speed Cap": 0
			}
		],
		"devices": []
	};
}
