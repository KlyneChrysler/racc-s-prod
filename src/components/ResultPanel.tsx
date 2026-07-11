import type { Recommendation } from "../lib/recommend";

interface ResultPanelProps {
	dpi: number;
	result: Recommendation;
}

export default function ResultPanel({ dpi, result }: ResultPanelProps) {
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
			<p>
				Your mouse will feel like <strong>~{summary.outputDpi} DPI</strong> and ramp up to{" "}
				<strong>{summary.limit}x</strong> on fast flicks. Below {summary.inputOffset} inches per
				second your aim stays one to one.
			</p>
			{summary.pixelSkipRisk && (
				<p className="note">
					Heads up: this feel is above your mouse&apos;s {dpi} DPI, so the desktop cursor may feel
					slightly steppy. Games with raw input are unaffected.
				</p>
			)}
			<button type="button" onClick={download}>Download settings.json</button>
		</section>
	);
}
