export const RECOMMENDED_CURVE = {
	inputOffset: 10,
	decayRate: 0.1,
	limit: 1.5
};

export function naturalSens(speed, { inputOffset, decayRate, limit }) {
	if (speed <= inputOffset) {
		return 1;
	}
	return limit - (limit - 1) * Math.exp(-decayRate * (speed - inputOffset));
}
