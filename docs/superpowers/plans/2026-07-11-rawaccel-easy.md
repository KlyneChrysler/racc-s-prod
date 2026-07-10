# Raw Accel Easy Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A single-page web app where a user enters only their mouse DPI, picks a 1-10 sensitivity notch, and downloads a complete, valid Raw Accel v1.7.x `settings.json`.

**Architecture:** Vite + React SPA, pure client-side. All recommendation logic lives in pure modules under `src/lib/` (curve constants/math, settings.json template, notch mapping + validation). Components are thin views over those modules. Progressive reveal: notch + results only appear after a valid DPI.

**Tech Stack:** Vite, React, Vitest, @testing-library/react, jsdom. Code style: tabs, semicolons, double quotes, `.jsx` for JSX, `export default function` components.

**Spec:** `docs/superpowers/specs/2026-07-11-rawaccel-easy-design.md`

**Repo:** `/Users/CK/Desktop/P_NO_16/rawaccel-easy`, remote `origin` = `git@github-personal:KlyneChrysler/racc-s.git`, branch `main`. Commit after every task.

---

## File structure

```
rawaccel-easy/
├── package.json
├── vite.config.js
├── index.html
├── .gitignore
├── README.md                      (Task 8)
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx                    (state + progressive reveal)
    ├── App.test.jsx
    ├── lib/
    │   ├── curve.js               (RECOMMENDED_CURVE constants + naturalSens math)
    │   ├── curve.test.js
    │   ├── settingsTemplate.js    (full v1.7.x settings.json builder)
    │   ├── settingsTemplate.test.js
    │   ├── recommend.js           (validateDpi, outputDpiForNotch, recommend)
    │   └── recommend.test.js
    └── components/
        ├── DpiInput.jsx           (validated DPI field)
        ├── SensNotch.jsx          (1-10 slider)
        ├── ResultPanel.jsx        (summary, pixel-skip note, download)
        ├── ResultPanel.test.jsx
        ├── CurvePreview.jsx       (SVG plot)
        ├── CurvePreview.test.jsx
        └── ImportGuide.jsx        (static import instructions)
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `src/main.jsx`, `src/index.css`, `src/App.jsx` (placeholder)

- [ ] **Step 1: Write `package.json`**

```json
{
	"name": "rawaccel-easy",
	"private": true,
	"version": "0.1.0",
	"type": "module",
	"scripts": {
		"dev": "vite",
		"build": "vite build",
		"preview": "vite preview",
		"test": "vitest run",
		"test:watch": "vitest",
		"coverage": "vitest run --coverage"
	}
}
```

- [ ] **Step 2: Install dependencies (latest versions — do not pin by hand)**

Run in `/Users/CK/Desktop/P_NO_16/rawaccel-easy`:

```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react vitest jsdom @testing-library/react @vitest/coverage-v8
```

Expected: exits 0, `node_modules/` and lockfile created.

- [ ] **Step 3: Write `vite.config.js`**

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		coverage: {
			include: ["src/**"]
		}
	}
});
```

- [ ] **Step 4: Write `.gitignore`**

```
node_modules/
dist/
coverage/
.DS_Store
```

- [ ] **Step 5: Write `index.html`**

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Raw Accel Easy Config</title>
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="/src/main.jsx"></script>
	</body>
</html>
```

- [ ] **Step 6: Write `src/main.jsx`**

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
```

- [ ] **Step 7: Write placeholder `src/App.jsx`** (replaced in Task 7)

```jsx
export default function App() {
	return <h1>Raw Accel Easy Config</h1>;
}
```

- [ ] **Step 8: Write empty `src/index.css`** (filled in Task 8)

```css
/* styles land in Task 8 */
```

- [ ] **Step 9: Verify build and test runner**

Run: `npm run build`
Expected: `vite build` succeeds, `dist/` produced.

Run: `npm test`
Expected: exits reporting "No test files found" (that is fine at this point — vitest exits 1 with `--passWithNoTests` absent; run `npx vitest run --passWithNoTests` to confirm the runner itself works, expected exit 0).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "add: scaffold vite react app with vitest"
```

---

### Task 2: Curve constants and math (`src/lib/curve.js`)

The recommended curve (from spec): Natural mode, gain on, `decayRate 0.1`, `inputOffset 10`, `limit 1.5`. The preview math uses the natural sensitivity function: flat `1.0` up to the input offset, then an exponential approach to `limit`:

`sens(v) = 1                                          for v <= inputOffset`
`sens(v) = limit - (limit - 1) * e^(-decayRate * (v - inputOffset))   for v > inputOffset`

(Illustrative preview of the driver's natural curve; exact gain-mode output differs slightly, which is acceptable for a preview.)

**Files:**
- Create: `src/lib/curve.js`
- Test: `src/lib/curve.test.js`

- [ ] **Step 1: Write the failing test `src/lib/curve.test.js`**

```js
import { describe, it, expect } from "vitest";
import { naturalSens, RECOMMENDED_CURVE } from "./curve.js";

describe("RECOMMENDED_CURVE", () => {
	it("matches the community-consensus starter values", () => {
		expect(RECOMMENDED_CURVE).toEqual({ inputOffset: 10, decayRate: 0.1, limit: 1.5 });
	});
});

describe("naturalSens", () => {
	it("is flat 1.0 at and below the input offset", () => {
		expect(naturalSens(0, RECOMMENDED_CURVE)).toBe(1);
		expect(naturalSens(10, RECOMMENDED_CURVE)).toBe(1);
	});

	it("rises above 1.0 past the offset", () => {
		expect(naturalSens(20, RECOMMENDED_CURVE)).toBeGreaterThan(1);
	});

	it("is monotonically increasing past the offset", () => {
		let prev = naturalSens(10, RECOMMENDED_CURVE);
		for (let v = 11; v <= 100; v++) {
			const cur = naturalSens(v, RECOMMENDED_CURVE);
			expect(cur).toBeGreaterThan(prev);
			prev = cur;
		}
	});

	it("approaches but never exceeds the limit", () => {
		expect(naturalSens(1000, RECOMMENDED_CURVE)).toBeLessThanOrEqual(1.5);
		expect(naturalSens(1000, RECOMMENDED_CURVE)).toBeGreaterThan(1.49);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/curve.test.js`
Expected: FAIL — cannot resolve `./curve.js`.

- [ ] **Step 3: Write `src/lib/curve.js`**

```js
export const RECOMMENDED_CURVE = {
	inputOffset: 10,
	decayRate: 0.1,
	limit: 1.5
};

export function naturalSens(speed, { inputOffset, decayRate, limit }) {
	if (speed <= inputOffset) {
		return 1;
	}
	return limit - (limit - 1) * Math.exp(-decayRate * (speed - inputOffset));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/curve.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/curve.js src/lib/curve.test.js
git commit -m "add: recommended natural curve constants and preview math"
```

---

### Task 3: settings.json template (`src/lib/settingsTemplate.js`)

Raw Accel v1.7.x deserializes with `ItemRequired = Always` — **every field of every object must be present** or the file is rejected. The template below is field-for-field the verified v1.7.0 serializer output. Key order is asserted in tests to stay byte-compatible with what Raw Accel itself writes.

**Files:**
- Create: `src/lib/settingsTemplate.js`
- Test: `src/lib/settingsTemplate.test.js`

- [ ] **Step 1: Write the failing test `src/lib/settingsTemplate.test.js`**

```js
import { describe, it, expect } from "vitest";
import { buildSettings } from "./settingsTemplate.js";

const EXPECTED_ROOT_KEYS = [
	"### Accel modes ###",
	"### Cap modes ###",
	"version",
	"defaultDeviceConfig",
	"profiles",
	"devices"
];

const EXPECTED_DEVICE_CONFIG_KEYS = [
	"disable",
	"Use constant time interval based on polling rate",
	"DPI (normalizes input speed unit: counts/ms -> in/s)",
	"Polling rate Hz (keep at 0 for automatic adjustment)"
];

const EXPECTED_PROFILE_KEYS = [
	"name",
	"Stretches domain for horizontal vs vertical inputs",
	"Stretches accel range for horizontal vs vertical inputs",
	"Whole or horizontal accel parameters",
	"Vertical accel parameters",
	"Input speed calculation parameters",
	"Output DPI",
	"Y/X output DPI ratio (vertical sens multiplier)",
	"L/R output DPI ratio (left sens multiplier)",
	"U/D output DPI ratio (up sens multiplier)",
	"Degrees of rotation",
	"Degrees of angle snapping",
	"Input Speed Cap"
];

const EXPECTED_ACCEL_KEYS = [
	"mode",
	"Gain / Velocity",
	"inputOffset",
	"outputOffset",
	"acceleration",
	"decayRate",
	"gamma",
	"motivity",
	"exponentClassic",
	"scale",
	"exponentPower",
	"limit",
	"syncSpeed",
	"smooth",
	"Cap / Jump",
	"Cap mode",
	"data"
];

const EXPECTED_SPEED_KEYS = [
	"Whole/combined accel (set false for 'by component' mode)",
	"lpNorm",
	"Time in ms after which an input is weighted at half its original value.",
	"Time in ms after which scale is weighted at half its original value.",
	"Time in ms after which an output is weighted at half its original value."
];

describe("buildSettings", () => {
	const settings = buildSettings({ dpi: 1600, outputDpi: 887 });
	const profile = settings.profiles[0];
	const argsX = profile["Whole or horizontal accel parameters"];
	const argsY = profile["Vertical accel parameters"];

	it("matches the exact v1.7.x key sets and order", () => {
		expect(Object.keys(settings)).toEqual(EXPECTED_ROOT_KEYS);
		expect(Object.keys(settings.defaultDeviceConfig)).toEqual(EXPECTED_DEVICE_CONFIG_KEYS);
		expect(settings.profiles).toHaveLength(1);
		expect(Object.keys(profile)).toEqual(EXPECTED_PROFILE_KEYS);
		expect(Object.keys(argsX)).toEqual(EXPECTED_ACCEL_KEYS);
		expect(Object.keys(argsY)).toEqual(EXPECTED_ACCEL_KEYS);
		expect(Object.keys(profile["Input speed calculation parameters"])).toEqual(EXPECTED_SPEED_KEYS);
	});

	it("targets version 1.7.0 with no per-device overrides", () => {
		expect(settings.version).toBe("1.7.0");
		expect(settings.devices).toEqual([]);
	});

	it("normalizes input using the user's DPI", () => {
		expect(settings.defaultDeviceConfig["DPI (normalizes input speed unit: counts/ms -> in/s)"]).toBe(1600);
	});

	it("applies the recommended natural curve on the whole/horizontal args", () => {
		expect(argsX.mode).toBe("natural");
		expect(argsX["Gain / Velocity"]).toBe(true);
		expect(argsX.inputOffset).toBe(10);
		expect(argsX.decayRate).toBe(0.1);
		expect(argsX.limit).toBe(1.5);
	});

	it("leaves vertical args at inert defaults", () => {
		expect(argsY.mode).toBe("noaccel");
		expect(argsY.inputOffset).toBe(0);
	});

	it("sets overall sensitivity via Output DPI and disables angle snapping", () => {
		expect(profile["Output DPI"]).toBe(887);
		expect(profile["Degrees of angle snapping"]).toBe(0);
		expect(profile["Input Speed Cap"]).toBe(0);
	});

	it("returns a fresh object each call (no shared mutable state)", () => {
		const a = buildSettings({ dpi: 800, outputDpi: 400 });
		const b = buildSettings({ dpi: 800, outputDpi: 400 });
		expect(a).not.toBe(b);
		expect(a.profiles[0]).not.toBe(b.profiles[0]);
		expect(a).toEqual(b);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/settingsTemplate.test.js`
Expected: FAIL — cannot resolve `./settingsTemplate.js`.

- [ ] **Step 3: Write `src/lib/settingsTemplate.js`**

```js
import { RECOMMENDED_CURVE } from "./curve.js";

function defaultAccelArgs() {
	return {
		"mode": "noaccel",
		"Gain / Velocity": true,
		"inputOffset": 0,
		"outputOffset": 0,
		"acceleration": 0.005,
		"decayRate": 0.1,
		"gamma": 1,
		"motivity": 1.5,
		"exponentClassic": 2,
		"scale": 1,
		"exponentPower": 0.05,
		"limit": 1.5,
		"syncSpeed": 5,
		"smooth": 0.5,
		"Cap / Jump": { "x": 15, "y": 1.5 },
		"Cap mode": "output",
		"data": []
	};
}

export function buildSettings({ dpi, outputDpi }) {
	return {
		"### Accel modes ###": "classic | jump | natural | synchronous | power | lut | noaccel",
		"### Cap modes ###": "in_out | input | output",
		"version": "1.7.0",
		"defaultDeviceConfig": {
			"disable": false,
			"Use constant time interval based on polling rate": false,
			"DPI (normalizes input speed unit: counts/ms -> in/s)": dpi,
			"Polling rate Hz (keep at 0 for automatic adjustment)": 0
		},
		"profiles": [
			{
				"name": "rawaccel-easy",
				"Stretches domain for horizontal vs vertical inputs": { "x": 1, "y": 1 },
				"Stretches accel range for horizontal vs vertical inputs": { "x": 1, "y": 1 },
				"Whole or horizontal accel parameters": {
					...defaultAccelArgs(),
					"mode": "natural",
					"inputOffset": RECOMMENDED_CURVE.inputOffset,
					"decayRate": RECOMMENDED_CURVE.decayRate,
					"limit": RECOMMENDED_CURVE.limit
				},
				"Vertical accel parameters": defaultAccelArgs(),
				"Input speed calculation parameters": {
					"Whole/combined accel (set false for 'by component' mode)": true,
					"lpNorm": 2,
					"Time in ms after which an input is weighted at half its original value.": 0,
					"Time in ms after which scale is weighted at half its original value.": 0,
					"Time in ms after which an output is weighted at half its original value.": 0
				},
				"Output DPI": outputDpi,
				"Y/X output DPI ratio (vertical sens multiplier)": 1,
				"L/R output DPI ratio (left sens multiplier)": 1,
				"U/D output DPI ratio (up sens multiplier)": 1,
				"Degrees of rotation": 0,
				"Degrees of angle snapping": 0,
				"Input Speed Cap": 0
			}
		],
		"devices": []
	};
}
```

Note: the object spread keeps `defaultAccelArgs()` key order because all overridden keys already exist in the spread source — the test's key-order assertion verifies this.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/settingsTemplate.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/settingsTemplate.js src/lib/settingsTemplate.test.js
git commit -m "add: raw accel v1.7 settings.json builder"
```

---

### Task 4: Recommendation engine (`src/lib/recommend.js`)

Notch mapping (from spec): `outputDpi(n) = round(400 * 6^((n-1)/9))` → `[400, 488, 596, 727, 887, 1082, 1321, 1612, 1967, 2400]`.

**Files:**
- Create: `src/lib/recommend.js`
- Test: `src/lib/recommend.test.js`

- [ ] **Step 1: Write the failing test `src/lib/recommend.test.js`**

```js
import { describe, it, expect } from "vitest";
import { validateDpi, outputDpiForNotch, recommend, DPI_MIN, DPI_MAX } from "./recommend.js";

describe("validateDpi", () => {
	it("accepts integer DPI within 100-35000, including string form", () => {
		expect(validateDpi(100)).toEqual({ valid: true, dpi: 100 });
		expect(validateDpi(35000)).toEqual({ valid: true, dpi: 35000 });
		expect(validateDpi("1600")).toEqual({ valid: true, dpi: 1600 });
	});

	it("rejects out-of-range, fractional, and non-numeric input", () => {
		for (const bad of [99, 35001, 1600.5, "abc", "", null, undefined]) {
			const result = validateDpi(bad);
			expect(result.valid).toBe(false);
			expect(result.error).toMatch(/between 100 and 35000/);
		}
	});

	it("exports the bounds it enforces", () => {
		expect(DPI_MIN).toBe(100);
		expect(DPI_MAX).toBe(35000);
	});
});

describe("outputDpiForNotch", () => {
	it("maps the 10 notches log-spaced from 400 to 2400", () => {
		const expected = [400, 488, 596, 727, 887, 1082, 1321, 1612, 1967, 2400];
		for (let n = 1; n <= 10; n++) {
			expect(outputDpiForNotch(n)).toBe(expected[n - 1]);
		}
	});

	it("is strictly increasing", () => {
		for (let n = 2; n <= 10; n++) {
			expect(outputDpiForNotch(n)).toBeGreaterThan(outputDpiForNotch(n - 1));
		}
	});
});

describe("recommend", () => {
	it("wires DPI and notch into the settings file", () => {
		const { settings, summary } = recommend({ dpi: 1600, notch: 5 });
		expect(settings.defaultDeviceConfig["DPI (normalizes input speed unit: counts/ms -> in/s)"]).toBe(1600);
		expect(settings.profiles[0]["Output DPI"]).toBe(887);
		expect(summary).toEqual({ outputDpi: 887, limit: 1.5, pixelSkipRisk: false });
	});

	it("flags pixel-skip risk when the effective DPI exceeds the mouse DPI", () => {
		const { summary } = recommend({ dpi: 400, notch: 10 });
		expect(summary).toEqual({ outputDpi: 2400, limit: 1.5, pixelSkipRisk: true });
	});

	it("does not flag risk when effective DPI equals mouse DPI", () => {
		const { summary } = recommend({ dpi: 400, notch: 1 });
		expect(summary.pixelSkipRisk).toBe(false);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/recommend.test.js`
Expected: FAIL — cannot resolve `./recommend.js`.

- [ ] **Step 3: Write `src/lib/recommend.js`**

```js
import { RECOMMENDED_CURVE } from "./curve.js";
import { buildSettings } from "./settingsTemplate.js";

export const DPI_MIN = 100;
export const DPI_MAX = 35000;

const OUTPUT_DPI_MIN = 400;
const OUTPUT_DPI_MAX = 2400;
const NOTCH_COUNT = 10;

export function validateDpi(value) {
	const dpi = value === "" || value === null ? NaN : Number(value);
	if (!Number.isInteger(dpi) || dpi < DPI_MIN || dpi > DPI_MAX) {
		return { valid: false, error: `DPI must be a whole number between ${DPI_MIN} and ${DPI_MAX}` };
	}
	return { valid: true, dpi };
}

export function outputDpiForNotch(notch) {
	const ratio = OUTPUT_DPI_MAX / OUTPUT_DPI_MIN;
	return Math.round(OUTPUT_DPI_MIN * Math.pow(ratio, (notch - 1) / (NOTCH_COUNT - 1)));
}

export function recommend({ dpi, notch }) {
	const outputDpi = outputDpiForNotch(notch);
	return {
		settings: buildSettings({ dpi, outputDpi }),
		summary: {
			outputDpi,
			limit: RECOMMENDED_CURVE.limit,
			pixelSkipRisk: outputDpi > dpi
		}
	};
}
```

Note: `Number("")` is `0` and `Number(null)` is `0`, which would wrongly pass the integer check — hence the explicit empty/null guard.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/recommend.test.js`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/recommend.js src/lib/recommend.test.js
git commit -m "add: dpi validation and notch-to-output-dpi engine"
```

---

### Task 5: Result panel (`src/components/ResultPanel.jsx`)

**Files:**
- Create: `src/components/ResultPanel.jsx`
- Test: `src/components/ResultPanel.test.jsx`

- [ ] **Step 1: Write the failing test `src/components/ResultPanel.test.jsx`**

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultPanel from "./ResultPanel.jsx";
import { recommend } from "../lib/recommend.js";

describe("ResultPanel", () => {
	it("shows the effective DPI summary and a download button", () => {
		render(<ResultPanel dpi={1600} result={recommend({ dpi: 1600, notch: 5 })} />);
		expect(screen.getByText(/~887 DPI/)).toBeTruthy();
		expect(screen.getByRole("button", { name: /download settings\.json/i })).toBeTruthy();
	});

	it("warns about desktop steppiness when effective DPI exceeds mouse DPI", () => {
		render(<ResultPanel dpi={400} result={recommend({ dpi: 400, notch: 10 })} />);
		expect(screen.getByText(/steppy/i)).toBeTruthy();
	});

	it("shows no warning when effective DPI is at or below mouse DPI", () => {
		render(<ResultPanel dpi={1600} result={recommend({ dpi: 1600, notch: 5 })} />);
		expect(screen.queryByText(/steppy/i)).toBeNull();
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ResultPanel.test.jsx`
Expected: FAIL — cannot resolve `./ResultPanel.jsx`.

- [ ] **Step 3: Write `src/components/ResultPanel.jsx`**

```jsx
export default function ResultPanel({ dpi, result }) {
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
			<p>
				Your mouse will feel like <strong>~{summary.outputDpi} DPI</strong> and ramp up to{" "}
				<strong>{summary.limit}x</strong> on fast flicks. Slow, precise aim stays unaccelerated.
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ResultPanel.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultPanel.jsx src/components/ResultPanel.test.jsx
git commit -m "add: result panel with summary and download"
```

---

### Task 6: Curve preview (`src/components/CurvePreview.jsx`)

**Files:**
- Create: `src/components/CurvePreview.jsx`
- Test: `src/components/CurvePreview.test.jsx`

- [ ] **Step 1: Write the failing test `src/components/CurvePreview.test.jsx`**

```jsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import CurvePreview from "./CurvePreview.jsx";

describe("CurvePreview", () => {
	it("renders an svg polyline with many plotted points", () => {
		const { container } = render(<CurvePreview outputDpi={887} />);
		const polyline = container.querySelector("polyline");
		expect(polyline).toBeTruthy();
		expect(polyline.getAttribute("points").split(" ").length).toBeGreaterThan(50);
	});

	it("plots a higher curve for a higher output DPI", () => {
		const lastY = (outputDpi) => {
			const { container } = render(<CurvePreview outputDpi={outputDpi} />);
			const points = container.querySelector("polyline").getAttribute("points").split(" ");
			return Number(points[points.length - 1].split(",")[1]);
		};
		// SVG y grows downward, so a higher curve means a smaller y value.
		expect(lastY(2400)).toBeLessThan(lastY(400));
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/CurvePreview.test.jsx`
Expected: FAIL — cannot resolve `./CurvePreview.jsx`.

- [ ] **Step 3: Write `src/components/CurvePreview.jsx`**

The y-axis is effective DPI (`sens * outputDpi`) on a fixed 0-3700 scale (max possible: 2400 * 1.5 = 3600), so moving the notch visibly shifts the whole curve.

```jsx
import { naturalSens, RECOMMENDED_CURVE } from "../lib/curve.js";

const WIDTH = 420;
const HEIGHT = 180;
const PAD = 24;
const MAX_SPEED = 80;
const MAX_EFFECTIVE_DPI = 3700;
const STEPS = 120;

export default function CurvePreview({ outputDpi }) {
	const points = [];
	for (let i = 0; i <= STEPS; i++) {
		const speed = (i / STEPS) * MAX_SPEED;
		const effectiveDpi = naturalSens(speed, RECOMMENDED_CURVE) * outputDpi;
		const x = PAD + (speed / MAX_SPEED) * (WIDTH - 2 * PAD);
		const y = HEIGHT - PAD - (effectiveDpi / MAX_EFFECTIVE_DPI) * (HEIGHT - 2 * PAD);
		points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
	}

	return (
		<figure className="curve">
			<svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Effective DPI versus mouse speed">
				<line className="axis" x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} />
				<line className="axis" x1={PAD} y1={PAD} x2={PAD} y2={HEIGHT - PAD} />
				<polyline className="plot" fill="none" points={points.join(" ")} />
			</svg>
			<figcaption>Effective DPI vs. mouse speed (slow aim left, fast flicks right)</figcaption>
		</figure>
	);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/CurvePreview.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/CurvePreview.jsx src/components/CurvePreview.test.jsx
git commit -m "add: svg curve preview scaled by output dpi"
```

---

### Task 7: Inputs, guide, and progressive-reveal App

**Files:**
- Create: `src/components/DpiInput.jsx`, `src/components/SensNotch.jsx`, `src/components/ImportGuide.jsx`
- Modify: `src/App.jsx` (replace placeholder entirely)
- Test: `src/App.test.jsx`

- [ ] **Step 1: Write the failing test `src/App.test.jsx`**

```jsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App.jsx";

describe("App progressive reveal", () => {
	it("shows only the DPI input at first", () => {
		render(<App />);
		expect(screen.getByLabelText(/mouse dpi/i)).toBeTruthy();
		expect(screen.queryByRole("slider")).toBeNull();
		expect(screen.queryByRole("button", { name: /download/i })).toBeNull();
	});

	it("reveals notch, preview, result, and guide once a valid DPI is entered", () => {
		render(<App />);
		fireEvent.change(screen.getByLabelText(/mouse dpi/i), { target: { value: "1600" } });
		expect(screen.getByRole("slider")).toBeTruthy();
		expect(screen.getByRole("button", { name: /download settings\.json/i })).toBeTruthy();
		expect(screen.getByText(/how to apply/i)).toBeTruthy();
		expect(screen.getByText(/~887 DPI/)).toBeTruthy();
	});

	it("shows an inline error and hides results for invalid DPI", () => {
		render(<App />);
		fireEvent.change(screen.getByLabelText(/mouse dpi/i), { target: { value: "50" } });
		expect(screen.getByText(/between 100 and 35000/i)).toBeTruthy();
		expect(screen.queryByRole("slider")).toBeNull();
	});

	it("shows no error while the field is still empty", () => {
		render(<App />);
		expect(screen.queryByText(/between 100 and 35000/i)).toBeNull();
	});

	it("updates the summary when the notch moves", () => {
		render(<App />);
		fireEvent.change(screen.getByLabelText(/mouse dpi/i), { target: { value: "1600" } });
		fireEvent.change(screen.getByRole("slider"), { target: { value: "10" } });
		expect(screen.getByText(/~2400 DPI/)).toBeTruthy();
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.jsx`
Expected: FAIL — placeholder App has no DPI input (`getByLabelText` throws).

- [ ] **Step 3: Write `src/components/DpiInput.jsx`**

```jsx
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
			/>
			{error && <p className="error">{error}</p>}
		</div>
	);
}
```

- [ ] **Step 4: Write `src/components/SensNotch.jsx`**

```jsx
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
```

- [ ] **Step 5: Write `src/components/ImportGuide.jsx`**

```jsx
export default function ImportGuide() {
	return (
		<section className="guide">
			<h2>How to apply</h2>
			<ol>
				<li>Close the Raw Accel window if it is open.</li>
				<li>
					Move the downloaded <code>settings.json</code> into your Raw Accel install folder,
					replacing the existing file.
				</li>
				<li>
					Open Raw Accel and press <strong>Apply</strong> — or run{" "}
					<code>writer.exe settings.json</code> from that folder.
				</li>
			</ol>
			<p className="note">
				Raw Accel resets after a reboot unless the GUI or <code>writer.exe</code> runs at startup.
			</p>
		</section>
	);
}
```

- [ ] **Step 6: Replace `src/App.jsx`**

```jsx
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
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run src/App.test.jsx`
Expected: PASS (5 tests).

- [ ] **Step 8: Run the whole suite**

Run: `npm test`
Expected: PASS — all test files green (curve, settingsTemplate, recommend, ResultPanel, CurvePreview, App).

- [ ] **Step 9: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/components/DpiInput.jsx src/components/SensNotch.jsx src/components/ImportGuide.jsx
git commit -m "add: single-input progressive reveal flow"
```

---

### Task 8: Styling, README, verification, push

**Files:**
- Modify: `src/index.css` (replace placeholder comment)
- Create: `README.md`

- [ ] **Step 1: Replace `src/index.css`**

```css
:root {
	color-scheme: dark;
	font-family: system-ui, -apple-system, sans-serif;
}

body {
	margin: 0;
	background: #111318;
	color: #e8eaf0;
}

main {
	max-width: 560px;
	margin: 0 auto;
	padding: 48px 20px;
	display: flex;
	flex-direction: column;
	gap: 24px;
}

h1 {
	margin: 0;
	font-size: 1.7rem;
}

.tagline {
	margin: 0;
	color: #9aa0ae;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.field label {
	font-weight: 600;
}

.field input[type="number"] {
	background: #1a1d24;
	border: 1px solid #2c313c;
	border-radius: 8px;
	color: inherit;
	font-size: 1.1rem;
	padding: 10px 12px;
}

.field input[type="range"] {
	width: 100%;
	accent-color: #5b8cff;
}

.notch-labels {
	display: flex;
	justify-content: space-between;
	color: #9aa0ae;
	font-size: 0.85rem;
}

.error {
	margin: 0;
	color: #ff7a7a;
	font-size: 0.9rem;
}

.note {
	margin: 0;
	color: #ffc46b;
	font-size: 0.9rem;
}

.result {
	background: #1a1d24;
	border: 1px solid #2c313c;
	border-radius: 12px;
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.result p {
	margin: 0;
}

.result button {
	background: #5b8cff;
	border: none;
	border-radius: 8px;
	color: #0b0d12;
	cursor: pointer;
	font-size: 1rem;
	font-weight: 700;
	padding: 12px;
}

.result button:hover {
	background: #7aa2ff;
}

.curve {
	margin: 0;
}

.curve svg {
	width: 100%;
	height: auto;
}

.curve .axis {
	stroke: #2c313c;
	stroke-width: 1;
}

.curve .plot {
	stroke: #5b8cff;
	stroke-width: 2;
}

.curve figcaption {
	color: #9aa0ae;
	font-size: 0.85rem;
	text-align: center;
}

.guide h2 {
	font-size: 1.1rem;
	margin: 0 0 8px;
}

.guide ol {
	margin: 0 0 12px;
	padding-left: 20px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

code {
	background: #1a1d24;
	border-radius: 4px;
	padding: 1px 5px;
}
```

- [ ] **Step 2: Write `README.md`**

```markdown
# Raw Accel Easy Config

Generate a complete [Raw Accel](https://github.com/RawAccelOfficial/rawaccel) `settings.json`
from a single input: your mouse DPI. Pick a 1-10 sensitivity preference and download —
no other parameters to understand.

## How it works

- **DPI normalization:** the generated file sets your DPI in Raw Accel's device config,
  so the driver treats every mouse like a 1000 DPI mouse and the curve feels identical
  for everyone.
- **Community-consensus curve:** Natural mode with gain (decay rate 0.1, input offset 10,
  limit 1.5). No acceleration during slow precise aim; sensitivity ramps to at most 1.5x
  on fast flicks.
- **Sensitivity notch:** maps 1-10 log-spaced onto Raw Accel's Output DPI, from a 400 DPI
  feel (notch 1) to 2400 (notch 10).

Targets Raw Accel v1.7.x.

## Develop

```bash
npm install
npm run dev       # local dev server
npm test          # run test suite
npm run coverage  # coverage report
npm run build     # production build to dist/
```
```

- [ ] **Step 3: Full verification**

Run: `npm test`
Expected: all tests PASS.

Run: `npm run coverage`
Expected: `src/lib/` at 100% lines; overall src coverage above 80%.

Run: `npm run build`
Expected: succeeds, `dist/` produced.

Manual smoke (optional but recommended): `npm run dev`, open the printed URL, type `1600`, confirm the notch appears, slide it, download the file, and inspect that the JSON contains `"Output DPI"` matching the slider and `"DPI (normalizes input speed unit: counts/ms -> in/s)": 1600`.

- [ ] **Step 4: Commit and push**

```bash
git add -A
git commit -m "add: styling and readme"
git push origin main
```
