import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import CurvePreview from "./CurvePreview";

const MID_CURVE = { inputOffset: 10.5, decayRate: 0.1, limit: 1.5 };
const LOW_SENS_CURVE = { inputOffset: 15, decayRate: 0.1, limit: 1.7 };

function svgTexts(container: HTMLElement): string[] {
	return [...container.querySelectorAll("text")].map((t) => t.textContent ?? "");
}

function lastPlotY(container: HTMLElement): number {
	const points = container.querySelector("polyline.plot")?.getAttribute("points")?.split(" ") ?? [];
	return Number(points[points.length - 1]?.split(",")[1]);
}

describe("CurvePreview", () => {
	afterEach(() => cleanup());

	it("renders the applied sens and gain curves with many plotted points", () => {
		const { container } = render(<CurvePreview outputDpi={971} curve={MID_CURVE} dpi={1600} />);
		const plot = container.querySelector("polyline.plot");
		const gain = container.querySelector("polyline.gain");
		expect(plot).toBeTruthy();
		expect(gain).toBeTruthy();
		expect(plot?.getAttribute("points")?.split(" ").length).toBeGreaterThan(50);
	});

	it("keeps the applied sens curve below the gain curve past the offset", () => {
		const { container } = render(<CurvePreview outputDpi={971} curve={MID_CURVE} dpi={1600} />);
		const last = (sel: string) => {
			const pts = container.querySelector(sel)?.getAttribute("points")?.split(" ") ?? [];
			return Number(pts[pts.length - 1]?.split(",")[1]);
		};
		// SVG y grows downward, so the lower sens curve has a larger y.
		expect(last("polyline.plot")).toBeGreaterThan(last("polyline.gain"));
	});

	it("visibly moves the curve when the notch output changes (fixed scale)", () => {
		const low = render(<CurvePreview outputDpi={400} curve={LOW_SENS_CURVE} dpi={1600} />);
		const lowY = lastPlotY(low.container);
		cleanup();
		const high = render(<CurvePreview outputDpi={2400} curve={{ inputOffset: 6, decayRate: 0.1, limit: 1.3 }} dpi={1600} />);
		const highY = lastPlotY(high.container);
		expect(highY).toBeLessThan(lowY);
	});

	it("marks the mouse's raw DPI and moves the line when DPI changes", () => {
		const a = render(<CurvePreview outputDpi={971} curve={MID_CURVE} dpi={800} />);
		expect(svgTexts(a.container).join(" ")).toMatch(/your mouse 800 dpi/);
		const yA = a.container.querySelector("line.mouse")?.getAttribute("y1");
		cleanup();
		const b = render(<CurvePreview outputDpi={971} curve={MID_CURVE} dpi={1600} />);
		const yB = b.container.querySelector("line.mouse")?.getAttribute("y1");
		expect(yA).not.toBe(yB);
	});

	it("hides the mouse line when the DPI is beyond the scale", () => {
		const { container } = render(<CurvePreview outputDpi={971} curve={MID_CURVE} dpi={25600} />);
		expect(container.querySelector("line.mouse")).toBeNull();
	});

	it("labels base, gain cap, applied sens, and the accel start marker", () => {
		const { container } = render(<CurvePreview outputDpi={971} curve={MID_CURVE} dpi={1600} />);
		const texts = svgTexts(container);
		expect(texts).toContain("971");
		expect(texts).toContain("1457");
		const joined = texts.join(" ");
		expect(joined).toMatch(/accel starts/);
		expect(joined).toMatch(/base sens/);
		expect(joined).toMatch(/gain cap/);
		expect(joined).toMatch(/applied sens/);
	});

	it("marks the speed zones and the halfway point", () => {
		const { container } = render(<CurvePreview outputDpi={971} curve={MID_CURVE} dpi={1600} />);
		const joined = svgTexts(container).join(" ");
		expect(joined).toMatch(/accelerating/);
		expect(joined).toMatch(/halfway/);
		expect(container.querySelector("circle.halfway")).toBeTruthy();
	});

	it("shows speed ticks on the x axis", () => {
		const { container } = render(<CurvePreview outputDpi={971} curve={MID_CURVE} dpi={1600} />);
		const texts = svgTexts(container);
		for (const tick of ["0", "20", "40", "60", "80"]) {
			expect(texts).toContain(tick);
		}
	});
});
