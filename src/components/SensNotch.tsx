import { NOTCH_MIN, NOTCH_MAX } from "../lib/curve";

interface SensNotchProps {
	value: number;
	onChange: (value: number) => void;
}

export default function SensNotch({ value, onChange }: SensNotchProps) {
	return (
		<div className="field">
			<label htmlFor="notch">
				Sensitivity preference: <span className="notch-value">{value}/{NOTCH_MAX}</span>
			</label>
			<input
				id="notch"
				type="range"
				min={NOTCH_MIN}
				max={NOTCH_MAX}
				step="1"
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				data-tip="Drag to tune how fast your aim feels"
			/>
			<div className="notch-labels">
				<span>Low sens</span>
				<span>High sens</span>
			</div>
		</div>
	);
}
