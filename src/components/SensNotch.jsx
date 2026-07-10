export default function SensNotch({ value, onChange }) {
	return (
		<div className="field">
			<label htmlFor="notch">Sensitivity preference: {value}/10</label>
			<input
				id="notch"
				type="range"
				min="1"
				max="10"
				step="1"
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
			<div className="notch-labels">
				<span>Low sens</span>
				<span>High sens</span>
			</div>
		</div>
	);
}
