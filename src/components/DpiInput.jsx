export default function DpiInput({ value, onChange, error }) {
	return (
		<div className="field">
			<label htmlFor="dpi">Mouse DPI</label>
			<input
				id="dpi"
				type="number"
				inputMode="numeric"
				placeholder="e.g. 1600"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				aria-describedby={error ? "dpi-error" : undefined}
				aria-invalid={error ? "true" : undefined}
			/>
			{error && <p id="dpi-error" className="error" role="alert">{error}</p>}
		</div>
	);
}
