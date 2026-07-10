import { naturalSens, RECOMMENDED_CURVE } from "../lib/curve.js";

const WIDTH = 420;
const HEIGHT = 180;
const PAD = 24;
const MAX_SPEED = 80;
const MAX_EFFECTIVE_DPI = 3700;
const STEPS = 120;

export default function CurvePreview({ outputDpi }) {
	const points = [];
	for (let i = 0; i <= STEPS; i++) {
		const speed = (i / STEPS) * MAX_SPEED;
		const effectiveDpi = naturalSens(speed, RECOMMENDED_CURVE) * outputDpi;
		const x = PAD + (speed / MAX_SPEED) * (WIDTH - 2 * PAD);
		const y = HEIGHT - PAD - (effectiveDpi / MAX_EFFECTIVE_DPI) * (HEIGHT - 2 * PAD);
		points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
	}

	return (
		<figure className="curve">
			<svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Effective DPI versus mouse speed">
				<line className="axis" x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} />
				<line className="axis" x1={PAD} y1={PAD} x2={PAD} y2={HEIGHT - PAD} />
				<polyline className="plot" fill="none" points={points.join(" ")} />
			</svg>
			<figcaption>Effective DPI vs. mouse speed (slow aim left, fast flicks right)</figcaption>
		</figure>
	);
}
