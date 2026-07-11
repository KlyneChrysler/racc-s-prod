import { clampNotch, curveForNotch, NOTCH_MIN, NOTCH_MAX } from "./curve";
import type { Curve } from "./curve";
import { buildSettings } from "./settingsTemplate";
import type { RawAccelSettings } from "./settingsTemplate";

export const DPI_MIN = 100;
export const DPI_MAX = 35000;

const OUTPUT_DPI_MIN = 400;
const OUTPUT_DPI_MAX = 2400;

export type DpiValidation = { valid: true; dpi: number } | { valid: false; error: string };

export interface Summary {
	outputDpi: number;
	limit: number;
	inputOffset: number;
	pixelSkipRisk: boolean;
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

export function recommend({ dpi, notch }: { dpi: number; notch: number }): Recommendation {
	const outputDpi = outputDpiForNotch(notch);
	const curve = curveForNotch(notch);
	return {
		settings: buildSettings({ dpi, outputDpi, curve }),
		curve,
		summary: {
			outputDpi,
			limit: curve.limit,
			inputOffset: curve.inputOffset,
			pixelSkipRisk: outputDpi > dpi
		}
	};
}
