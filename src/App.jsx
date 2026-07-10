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
		<main>
			<h1>Raw Accel Easy Config</h1>
			<p className="tagline">Enter your mouse DPI. We decide everything else.</p>
			<DpiInput value={dpiText} onChange={setDpiText} error={showError ? validation.error : null} />
			{result && (
				<>
					<SensNotch value={notch} onChange={setNotch} />
					<CurvePreview outputDpi={result.summary.outputDpi} />
					<ResultPanel dpi={validation.dpi} result={result} />
					<ImportGuide />
				</>
			)}
		</main>
	);
}
