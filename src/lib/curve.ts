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

/*
 * The generated settings use Raw Accel's natural mode with the gain switch on.
 * In gain mode the curve below defines the GAIN (the derivative of output vs
 * input speed), and the sensitivity the driver actually applies at speed v is
 * the average gain up to v: sens(v) = (1/v) * integral of gain from 0 to v.
 * naturalGain is the gain curve; naturalSens is the exact applied multiplier.
 */
export function naturalGain(speed: number, { inputOffset, decayRate, limit }: Curve): number {
	if (speed <= inputOffset) {
		return 1;
	}
	return limit - (limit - 1) * Math.exp(-decayRate * (speed - inputOffset));
}

export function naturalSens(speed: number, curve: Curve): number {
	const { inputOffset, decayRate, limit } = curve;
	if (speed <= inputOffset) {
		return 1;
	}
	const x = speed - inputOffset;
	const integral = speed + (limit - 1) * (x + (Math.exp(-decayRate * x) - 1) / decayRate);
	return integral / speed;
}

export function speedAtSens(target: number, curve: Curve, maxSpeed = 400): number | null {
	if (target <= 1) {
		return curve.inputOffset;
	}
	if (naturalSens(maxSpeed, curve) < target) {
		return null;
	}
	let lo = curve.inputOffset;
	let hi = maxSpeed;
	for (let i = 0; i < 60; i++) {
		const mid = (lo + hi) / 2;
		if (naturalSens(mid, curve) < target) {
			lo = mid;
		} else {
			hi = mid;
		}
	}
	return (lo + hi) / 2;
}
