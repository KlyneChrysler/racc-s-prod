const DECAY_RATE = 0.1;
const OFFSET_MAX = 15;
const LIMIT_MAX = 1.7;
const LIMIT_MIN = 1.3;
const NOTCH_MIN = 1;
const NOTCH_MAX = 10;

export function clampNotch(notch) {
	return Math.min(NOTCH_MAX, Math.max(NOTCH_MIN, Math.round(notch)));
}

/*
 * Low sens players cover aim with fast arm swipes, so acceleration must wait
 * longer (higher offset) and can ramp higher (bigger limit) to help on large
 * turns. High sens players move slowly and overshoot easily, so acceleration
 * starts sooner and caps gently. Ranges follow community consensus: offset
 * 5 to 15 counts/ms at 1000 DPI, cap 1.2x to 2.0x.
 */
export function curveForNotch(notch) {
	const n = clampNotch(notch);
	const t = (n - NOTCH_MIN) / (NOTCH_MAX - NOTCH_MIN);
	return {
		inputOffset: OFFSET_MAX - (n - NOTCH_MIN),
		decayRate: DECAY_RATE,
		limit: Math.round((LIMIT_MAX - (LIMIT_MAX - LIMIT_MIN) * t) * 20) / 20
	};
}

export function naturalSens(speed, { inputOffset, decayRate, limit }) {
	if (speed <= inputOffset) {
		return 1;
	}
	return limit - (limit - 1) * Math.exp(-decayRate * (speed - inputOffset));
}
