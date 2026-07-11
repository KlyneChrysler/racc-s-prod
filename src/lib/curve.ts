export interface Curve {
	inputOffset: number;
	decayRate: number;
	limit: number;
}

const DECAY_RATE = 0.1;
const OFFSET_MAX = 15;
const OFFSET_MIN = 6;
const LIMIT_MAX = 1.7;
const LIMIT_MIN = 1.3;

export const NOTCH_MIN = 1;
export const NOTCH_MAX = 100;

export function clampNotch(notch: number): number {
	return Math.min(NOTCH_MAX, Math.max(NOTCH_MIN, Math.round(notch)));
}

/*
 * Low sens players cover aim with fast arm swipes, so acceleration must wait
 * longer (higher offset) and can ramp higher (bigger limit) to help on large
 * turns. High sens players move slowly and overshoot easily, so acceleration
 * starts sooner and caps gently. Ranges follow community consensus: offset
 * 5 to 15 counts/ms at 1000 DPI, cap 1.2x to 2.0x.
 */
export function curveForNotch(notch: number): Curve {
	const t = (clampNotch(notch) - NOTCH_MIN) / (NOTCH_MAX - NOTCH_MIN);
	return {
		inputOffset: Math.round((OFFSET_MAX - (OFFSET_MAX - OFFSET_MIN) * t) * 10) / 10,
		decayRate: DECAY_RATE,
		limit: Math.round((LIMIT_MAX - (LIMIT_MAX - LIMIT_MIN) * t) * 100) / 100
	};
}

export function naturalSens(speed: number, { inputOffset, decayRate, limit }: Curve): number {
	if (speed <= inputOffset) {
		return 1;
	}
	return limit - (limit - 1) * Math.exp(-decayRate * (speed - inputOffset));
}
