import type { Recommendation } from "../lib/recommend";

interface ResultPanelProps {
	result: Recommendation;
}

export default function ResultPanel({ result }: ResultPanelProps) {
	const { settings, summary } = result;

	function download() {
		const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "settings.json";
		a.click();
		URL.revokeObjectURL(url);
	}

	return (
		<section className="result">
			<p className="eyebrow">Your recommendation</p>
			<dl className="stats">
				<div className="stat">
					<dt>feels like</dt>
					<dd>~{summary.outputDpi} DPI</dd>
				</div>
				<div className="stat">
					<dt>flick cap</dt>
					<dd>{summary.limit}x</dd>
				</div>
				<div className="stat">
					<dt>accel starts at</dt>
					<dd>{summary.inputOffset} in/s</dd>
				</div>
				<div className="stat">
					<dt>to cross a 1080p screen</dt>
					<dd>{summary.cmPerScreen} cm</dd>
				</div>
			</dl>
			{summary.tips.length > 0 && (
				<ul className="tips">
					{summary.tips.map((tip) => (
						<li key={tip}>{tip}</li>
					))}
				</ul>
			)}
			<button
				type="button"
				data-tip="Saves a ready to import settings.json"
				onClick={download}
			>
				Download settings.json
			</button>
		</section>
	);
}
