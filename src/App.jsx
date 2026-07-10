import { useState } from "react";
import DpiInput from "./components/DpiInput.jsx";
import SensNotch from "./components/SensNotch.jsx";
import CurvePreview from "./components/CurvePreview.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import ImportGuide from "./components/ImportGuide.jsx";
import { validateDpi, recommend } from "./lib/recommend.js";

const REPO_URL = "https://github.com/KlyneChrysler/racc-s";

function CrosshairIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			width="22"
			height="22"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="7" />
			<line x1="12" y1="1.5" x2="12" y2="5.5" />
			<line x1="12" y1="18.5" x2="12" y2="22.5" />
			<line x1="1.5" y1="12" x2="5.5" y2="12" />
			<line x1="18.5" y1="12" x2="22.5" y2="12" />
			<circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
		</svg>
	);
}

function GitHubIcon() {
	return (
		<svg viewBox="0 0 16 16" width="26" height="26" fill="currentColor" aria-hidden="true">
			<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
		</svg>
	);
}

export default function App() {
	const [dpiText, setDpiText] = useState("");
	const [notch, setNotch] = useState(5);

	const validation = validateDpi(dpiText);
	const showError = dpiText !== "" && !validation.valid;
	const result = validation.valid ? recommend({ dpi: validation.dpi, notch }) : null;

	return (
		<div className="sheet">
			<header className="nav">
				<span className="brand" aria-label="Raw Accel Easy Config">
					<CrosshairIcon />
				</span>
				<nav className="nav-links" aria-label="Main">
					<a
						className="icon-link"
						href="https://github.com/RawAccelOfficial/rawaccel"
						target="_blank"
						rel="noreferrer"
						aria-label="Raw Accel project"
					>
						<img src="/rawaccel.ico" width="24" height="24" alt="Raw Accel" />
					</a>
					<a
						className="gh-link"
						href={REPO_URL}
						target="_blank"
						rel="noreferrer"
						aria-label="View the source code on GitHub"
					>
						<GitHubIcon />
					</a>
				</nav>
			</header>
			<section className="masthead">
				<h1>Raw Accel Easy Config</h1>
				<p className="tagline">Enter your mouse DPI. We decide everything else.</p>
			</section>
			<main className="flow">
				<section className="card">
					<p className="eyebrow">
						<span className="step-icon">1</span>
						Your mouse
					</p>
					<DpiInput value={dpiText} onChange={setDpiText} error={showError ? validation.error : null} />
				</section>
				{result && (
					<>
						<section className="card reveal">
							<p className="eyebrow">
								<span className="step-icon">2</span>
								Preference
							</p>
							<SensNotch value={notch} onChange={setNotch} />
						</section>
						<section className="card reveal delay-1">
							<p className="eyebrow">Your curve</p>
							<CurvePreview outputDpi={result.summary.outputDpi} curve={result.curve} />
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
			<footer className="foot">
				<span className="foot-mark">
					<CrosshairIcon />
				</span>
				<p>Free and open source. Targets Raw Accel v1.7.x.</p>
				<p>Not affiliated with the Raw Accel project.</p>
			</footer>
		</div>
	);
}
