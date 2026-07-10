import { useState } from "react";
import DpiInput from "./components/DpiInput.jsx";
import SensNotch from "./components/SensNotch.jsx";
import CurvePreview from "./components/CurvePreview.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import ImportGuide from "./components/ImportGuide.jsx";
import { validateDpi, recommend } from "./lib/recommend.js";

export default function App() {
	const [dpiText, setDpiText] = useState("");
	const [notch, setNotch] = useState(5);

	const validation = validateDpi(dpiText);
	const showError = dpiText !== "" && !validation.valid;
	const result = validation.valid ? recommend({ dpi: validation.dpi, notch }) : null;

	return (
		<div className="page">
			<div className="shell">
				<header className="nav">
					<span className="logo">Raw Accel Easy Config</span>
					<a
						className="nav-link"
						href="https://github.com/RawAccelOfficial/rawaccel"
						target="_blank"
						rel="noreferrer"
					>
						Raw Accel
					</a>
				</header>
				<section className="hero">
					<p className="eyebrow">Mouse acceleration · Zero config</p>
					<h1 className="display">
						One input.
						<br />
						Every setting.
					</h1>
					<p className="hero-sub">
						Type your mouse DPI and we tune the entire Raw Accel curve — normalized, capped, and
						ready to import.
					</p>
				</section>
				<main className="flow">
					<section className="panel">
						<p className="eyebrow">Step 01 — Your mouse</p>
						<DpiInput value={dpiText} onChange={setDpiText} error={showError ? validation.error : null} />
					</section>
					{result && (
						<>
							<section className="panel reveal">
								<p className="eyebrow">Step 02 — Preference</p>
								<SensNotch value={notch} onChange={setNotch} />
							</section>
							<section className="panel panel-white reveal delay-1">
								<p className="eyebrow">Your curve</p>
								<CurvePreview outputDpi={result.summary.outputDpi} />
							</section>
							<div className="reveal delay-2">
								<ResultPanel dpi={validation.dpi} result={result} />
							</div>
							<div className="reveal delay-3">
								<ImportGuide />
							</div>
						</>
					)}
				</main>
			</div>
			<footer className="footer">
				<div className="shell footer-inner">
					<span>Generates Raw Accel v1.7.x settings.json from a single DPI input.</span>
					<span>
						Not affiliated with the{" "}
						<a href="https://github.com/RawAccelOfficial/rawaccel" target="_blank" rel="noreferrer">
							Raw Accel
						</a>{" "}
						project.
					</span>
				</div>
			</footer>
		</div>
	);
}
