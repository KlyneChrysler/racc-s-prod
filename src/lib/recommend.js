import { clampNotch, curveForNotch } from "./curve.js";
import { buildSettings } from "./settingsTemplate.js";

export const DPI_MIN = 100;
export const DPI_MAX = 35000;

const OUTPUT_DPI_MIN = 400;
const OUTPUT_DPI_MAX = 2400;
const NOTCH_SPAN = 9;

export function validateDpi(value) {
	const dpi = value === "" || value === null ? NaN : Number(value);
	if (!Number.isInteger(dpi) || dpi < DPI_MIN || dpi > DPI_MAX) {
		return { valid: false, error: `DPI must be a whole number between ${DPI_MIN} and ${DPI_MAX}` };
	}
	return { valid: true, dpi };
}

export function outputDpiForNotch(notch) {
	const clamped = clampNotch(notch);
	const ratio = OUTPUT_DPI_MAX / OUTPUT_DPI_MIN;
	return Math.round(OUTPUT_DPI_MIN * Math.pow(ratio, (clamped - 1) / NOTCH_SPAN));
}

export function recommend({ dpi, notch }) {
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
