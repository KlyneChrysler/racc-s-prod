import { useState } from "react";
import Landing from "./components/Landing";
import DpiInput from "./components/DpiInput";
import SensNotch from "./components/SensNotch";
import CurvePreview from "./components/CurvePreview";
import ResultPanel from "./components/ResultPanel";
import ImportGuide from "./components/ImportGuide";
import UpdatesAside from "./components/UpdatesAside";
import { CrosshairIcon, GitHubIcon } from "./components/icons";
import { validateDpi, recommend } from "./lib/recommend";

const REPO_URL = "https://github.com/KlyneChrysler/racc-s-prod";

export default function App() {
	const [started, setStarted] = useState(false);
	const [dpiText, setDpiText] = useState("");
	const [notch, setNotch] = useState(50);

	const validation = validateDpi(dpiText);
	const result = validation.valid ? recommend({ dpi: validation.dpi, notch }) : null;

	if (!started) {
		return <Landing onStart={() => setStarted(true)} />;
	}

	return (
		<div className="frame">
			<div className="sheet">
				<h1 className="sr-only">Raw Accel Easy Config</h1>
				<header className="nav">
					<span className="brand" data-tip="Raw Accel Easy Config" aria-label="Raw Accel Easy Config">
						<CrosshairIcon />
					</span>
					<nav className="nav-links" aria-label="Main">
						<a
							className="icon-link"
							href="https://github.com/RawAccelOfficial/rawaccel"
							target="_blank"
							rel="noreferrer"
							aria-label="Raw Accel project"
							data-tip="The Raw Accel project"
						>
							<img src="/rawaccel.ico" width="24" height="24" alt="Raw Accel" />
						</a>
						<a
							className="gh-link"
							href={REPO_URL}
							target="_blank"
							rel="noreferrer"
							aria-label="View the source code on GitHub"
							data-tip="Source code on GitHub"
						>
							<GitHubIcon />
						</a>
					</nav>
				</header>
				<main className="flow">
					<section className="card">
						<p className="eyebrow">
							<span className="step-icon">1</span>
							Your mouse
						</p>
						<DpiInput
							value={dpiText}
							onChange={setDpiText}
							error={!validation.valid && dpiText !== "" ? validation.error : null}
						/>
					</section>
					{validation.valid && result && (
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
								<CurvePreview outputDpi={result.summary.outputDpi} curve={result.curve} dpi={validation.dpi} />
							</section>
							<div className="reveal delay-2">
								<ResultPanel result={result} />
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
			<UpdatesAside />
		</div>
	);
}
