import { naturalSens } from "../lib/curve.js";

const WIDTH = 460;
const HEIGHT = 240;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 24;
const PAD_BOTTOM = 44;
const MAX_SPEED = 80;
const STEPS = 120;
const SPEED_TICKS = [0, 20, 40, 60, 80];

export default function CurvePreview({ outputDpi, curve }) {
	const cap = Math.round(outputDpi * curve.limit);
	const maxY = cap * 1.15;
	const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
	const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
	const toX = (speed) => PAD_LEFT + (speed / MAX_SPEED) * plotW;
	const toY = (dpi) => PAD_TOP + plotH - (dpi / maxY) * plotH;
	const offsetX = toX(curve.inputOffset);
	const baseline = HEIGHT - PAD_BOTTOM;

	const points = [];
	for (let i = 0; i <= STEPS; i++) {
		const speed = (i / STEPS) * MAX_SPEED;
		const effectiveDpi = naturalSens(speed, curve) * outputDpi;
		points.push(`${toX(speed).toFixed(1)},${toY(effectiveDpi).toFixed(1)}`);
	}

	return (
		<figure className="curve">
			<svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="curve-title">
				<title id="curve-title">
					Effective DPI versus mouse speed, from {outputDpi} base up to a {cap} cap
				</title>

				<line className="ref" x1={PAD_LEFT} y1={toY(outputDpi)} x2={WIDTH - PAD_RIGHT} y2={toY(outputDpi)} />
				<line className="ref" x1={PAD_LEFT} y1={toY(cap)} x2={WIDTH - PAD_RIGHT} y2={toY(cap)} />
				<line className="ref" x1={offsetX} y1={PAD_TOP} x2={offsetX} y2={baseline} />

				<line className="axis" x1={PAD_LEFT} y1={baseline} x2={WIDTH - PAD_RIGHT} y2={baseline} />
				<line className="axis" x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={baseline} />

				<text className="tick" x={PAD_LEFT - 8} y={toY(cap) + 3} textAnchor="end">{cap}</text>
				<text className="tick" x={PAD_LEFT - 8} y={toY(outputDpi) + 3} textAnchor="end">{outputDpi}</text>
				<text className="tick" x={PAD_LEFT - 8} y={baseline + 3} textAnchor="end">0</text>

				<text className="marker" x={WIDTH - PAD_RIGHT} y={toY(cap) - 5} textAnchor="end">cap on flicks</text>
				<text className="marker" x={WIDTH - PAD_RIGHT} y={toY(outputDpi) + 14} textAnchor="end">base sens</text>
				<text className="marker" x={offsetX + 6} y={PAD_TOP + 9}>accel starts</text>

				{SPEED_TICKS.map((s) => (
					<g key={s}>
						<line className="axis" x1={toX(s)} y1={baseline} x2={toX(s)} y2={baseline + 4} />
						<text className="tick" x={toX(s)} y={baseline + 16} textAnchor="middle">{s}</text>
					</g>
				))}
				<text className="tick" x={PAD_LEFT + plotW / 2} y={HEIGHT - 8} textAnchor="middle">
					mouse speed (inches per second)
				</text>

				<polyline className="plot" fill="none" points={points.join(" ")} />
			</svg>
			<figcaption>
				Effective DPI vs. mouse speed. Slow aim stays at your base sens, fast flicks ramp up to the cap.
			</figcaption>
		</figure>
	);
}
