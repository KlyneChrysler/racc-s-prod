import { clampNotch, curveForNotch, NOTCH_MIN, NOTCH_MAX } from "./curve";
import type { Curve } from "./curve";
import { buildSettings } from "./settingsTemplate";
import type { RawAccelSettings } from "./settingsTemplate";

export const DPI_MIN = 100;
export const DPI_MAX = 35000;

const OUTPUT_DPI_MIN = 400;
const OUTPUT_DPI_MAX = 2400;
const LOW_DPI_SENSOR = 800;
const LOW_SENS_NOTCH = 20;
const HIGH_SENS_NOTCH = 80;
const SCREEN_WIDTH_PX = 1920;
const CM_PER_INCH = 2.54;

export type DpiValidation = { valid: true; dpi: number } | { valid: false; error: string };

export interface Summary {
	outputDpi: number;
	limit: number;
	inputOffset: number;
	pixelSkipRisk: boolean;
	cmPerScreen: number;
	tips: string[];
}

export interface Recommendation {
	settings: RawAccelSettings;
	curve: Curve;
	summary: Summary;
}

export function validateDpi(value: unknown): DpiValidation {
	const dpi = value === "" || value === null ? NaN : Number(value);
	if (!Number.isInteger(dpi) || dpi < DPI_MIN || dpi > DPI_MAX) {
		return { valid: false, error: `DPI must be a whole number between ${DPI_MIN} and ${DPI_MAX}` };
	}
	return { valid: true, dpi };
}

export function outputDpiForNotch(notch: number): number {
	const t = (clampNotch(notch) - NOTCH_MIN) / (NOTCH_MAX - NOTCH_MIN);
	return Math.round(OUTPUT_DPI_MIN * Math.pow(OUTPUT_DPI_MAX / OUTPUT_DPI_MIN, t));
}

function tipsFor(dpi: number, notch: number, pixelSkipRisk: boolean): string[] {
	const tips: string[] = [];
	if (pixelSkipRisk) {
		tips.push(
			`This feel is above your mouse's ${dpi} DPI, so the desktop cursor may feel slightly steppy. Games with raw input are unaffected.`
		);
	}
	if (dpi < LOW_DPI_SENSOR) {
		tips.push(
			"Sensors track more smoothly at higher hardware DPI. Raise it in your mouse software if you can; DPI normalization keeps this exact feel."
		);
	}
	if (notch <= LOW_SENS_NOTCH) {
		tips.push(
			"Low sens setups expect big arm swipes. A large mousepad helps you stay below the accel threshold during precise aim."
		);
	}
	if (notch >= HIGH_SENS_NOTCH) {
		tips.push(
			"High sens magnifies small wrist movements. If aim feels twitchy, step the preference down a few notches."
		);
	}
	return tips;
}

export function recommend({ dpi, notch }: { dpi: number; notch: number }): Recommendation {
	const clamped = clampNotch(notch);
	const outputDpi = outputDpiForNotch(clamped);
	const curve = curveForNotch(clamped);
	const pixelSkipRisk = outputDpi > dpi;
	return {
		settings: buildSettings({ dpi, outputDpi, curve }),
		curve,
		summary: {
			outputDpi,
			limit: curve.limit,
			inputOffset: curve.inputOffset,
			pixelSkipRisk,
			cmPerScreen: Math.round((SCREEN_WIDTH_PX / outputDpi) * CM_PER_INCH * 10) / 10,
			tips: tipsFor(dpi, clamped, pixelSkipRisk)
		}
	};
}
