import { naturalSens, naturalGain, speedAtSens } from "../lib/curve";
import type { Curve } from "../lib/curve";

const WIDTH = 460;
const HEIGHT = 240;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 24;
const PAD_BOTTOM = 44;
const MAX_SPEED = 80;
const STEPS = 120;
const SPEED_TICKS = [0, 20, 40, 60, 80];
const ZONE_MIN_WIDTH = 44;
const GAIN_CAPPED_FRACTION = Math.log(100);
/* Fixed absolute scale: max possible cap is 2400 * 1.3 = 3120, so every
 * notch and DPI change moves the chart instead of being rescaled away. */
const Y_MAX = 3400;
const GRID_LINES = [1000, 2000, 3000];

interface CurvePreviewProps {
	outputDpi: number;
	curve: Curve;
	dpi: number;
}

export default function CurvePreview({ outputDpi, curve, dpi }: CurvePreviewProps) {
	const cap = Math.round(outputDpi * curve.limit);
	const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
	const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
	const toX = (speed: number) => PAD_LEFT + (speed / MAX_SPEED) * plotW;
	const toY = (value: number) => PAD_TOP + plotH - (Math.min(value, Y_MAX) / Y_MAX) * plotH;
	const offsetX = toX(curve.inputOffset);
	const baseline = HEIGHT - PAD_BOTTOM;

	const halfwaySpeed = speedAtSens((1 + curve.limit) / 2, curve);
	const gainCappedSpeed = curve.inputOffset + GAIN_CAPPED_FRACTION / curve.decayRate;
	const showMouseLine = dpi <= Y_MAX - 120;

	const sensPoints: string[] = [];
	const gainPoints: string[] = [];
	for (let i = 0; i <= STEPS; i++) {
		const speed = (i / STEPS) * MAX_SPEED;
		sensPoints.push(`${toX(speed).toFixed(1)},${toY(naturalSens(speed, curve) * outputDpi).toFixed(1)}`);
		gainPoints.push(`${toX(speed).toFixed(1)},${toY(naturalGain(speed, curve) * outputDpi).toFixed(1)}`);
	}

	function zoneLabel(from: number, to: number, label: string) {
		const width = ((Math.min(to, MAX_SPEED) - from) / MAX_SPEED) * plotW;
		if (width < ZONE_MIN_WIDTH) {
			return null;
		}
		return (
			<text className="zone" x={toX((from + Math.min(to, MAX_SPEED)) / 2)} y={baseline - 8} textAnchor="middle">
				{label}
			</text>
		);
	}

	return (
		<figure className="curve">
			<svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="curve-title">
				<title id="curve-title">
					Effective DPI versus mouse speed, from {outputDpi} base toward a {cap} gain cap
				</title>

				{GRID_LINES.map((g) => (
					<line key={g} className="grid" x1={PAD_LEFT} y1={toY(g)} x2={WIDTH - PAD_RIGHT} y2={toY(g)} />
				))}

				<line className="ref" x1={PAD_LEFT} y1={toY(outputDpi)} x2={WIDTH - PAD_RIGHT} y2={toY(outputDpi)} />
				<line className="ref" x1={PAD_LEFT} y1={toY(cap)} x2={WIDTH - PAD_RIGHT} y2={toY(cap)} />
				<line className="ref" x1={offsetX} y1={PAD_TOP} x2={offsetX} y2={baseline} />
				{showMouseLine && (
					<>
						<line className="mouse" x1={PAD_LEFT} y1={toY(dpi)} x2={WIDTH - PAD_RIGHT} y2={toY(dpi)} />
						<text className="zone" x={PAD_LEFT + 6} y={toY(dpi) - 4}>
							your mouse {dpi} dpi
						</text>
					</>
				)}

				<line className="axis" x1={PAD_LEFT} y1={baseline} x2={WIDTH - PAD_RIGHT} y2={baseline} />
				<line className="axis" x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={baseline} />

				<text className="tick" x={PAD_LEFT - 8} y={toY(cap) + 3} textAnchor="end">{cap}</text>
				<text className="tick" x={PAD_LEFT - 8} y={toY(outputDpi) + 3} textAnchor="end">{outputDpi}</text>
				<text className="tick" x={PAD_LEFT - 8} y={baseline + 3} textAnchor="end">0</text>

				<text className="marker" x={WIDTH - PAD_RIGHT} y={toY(cap) - 5} textAnchor="end">gain cap</text>
				<text className="marker" x={WIDTH - PAD_RIGHT} y={toY(outputDpi) + 14} textAnchor="end">base sens</text>
				<text className="marker" x={offsetX + 6} y={PAD_TOP + 9}>accel starts</text>
				<text
					className="marker"
					x={WIDTH - PAD_RIGHT}
					y={toY(naturalSens(MAX_SPEED, curve) * outputDpi) + 14}
					textAnchor="end"
				>
					applied sens
				</text>

				{zoneLabel(0, curve.inputOffset, "precise")}
				{zoneLabel(curve.inputOffset, gainCappedSpeed, "accelerating")}
				{zoneLabel(gainCappedSpeed, MAX_SPEED, "full accel")}

				{SPEED_TICKS.map((s) => (
					<g key={s}>
						<line className="axis" x1={toX(s)} y1={baseline} x2={toX(s)} y2={baseline + 4} />
						<text className="tick" x={toX(s)} y={baseline + 16} textAnchor="middle">{s}</text>
					</g>
				))}
				<text className="tick" x={PAD_LEFT + plotW / 2} y={HEIGHT - 8} textAnchor="middle">
					mouse speed (inches per second)
				</text>

				<polyline className="gain" fill="none" points={gainPoints.join(" ")} />
				<polyline className="plot" fill="none" points={sensPoints.join(" ")} />
				{halfwaySpeed !== null && halfwaySpeed <= MAX_SPEED - 4 && (
					<>
						<circle
							className="halfway"
							cx={toX(halfwaySpeed)}
							cy={toY(((1 + curve.limit) / 2) * outputDpi)}
							r="4.5"
						/>
						<text
							className="marker"
							x={toX(halfwaySpeed) + 8}
							y={toY(((1 + curve.limit) / 2) * outputDpi) + 14}
						>
							halfway
						</text>
					</>
				)}
			</svg>
			<figcaption>
				Solid line is the sensitivity the driver applies, dashed is the accel gain it follows.
				Exact gain mode math on a fixed scale.
			</figcaption>
		</figure>
	);
}
