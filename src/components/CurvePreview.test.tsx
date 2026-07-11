import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import CurvePreview from "./CurvePreview";

const MID_CURVE = { inputOffset: 10.5, decayRate: 0.1, limit: 1.5 };
const LOW_SENS_CURVE = { inputOffset: 15, decayRate: 0.1, limit: 1.7 };

function svgTexts(container: HTMLElement): string[] {
	return [...container.querySelectorAll("text")].map((t) => t.textContent ?? "");
}

describe("CurvePreview", () => {
	afterEach(() => cleanup());

	it("renders an svg polyline with many plotted points", () => {
		const { container } = render(<CurvePreview outputDpi={971} curve={MID_CURVE} />);
		const polyline = container.querySelector("polyline");
		expect(polyline).toBeTruthy();
		expect(polyline?.getAttribute("points")?.split(" ").length).toBeGreaterThan(50);
	});

	it("labels the base and cap values plus the accel start marker", () => {
		const { container } = render(<CurvePreview outputDpi={971} curve={MID_CURVE} />);
		const texts = svgTexts(container);
		expect(texts).toContain("971");
		expect(texts).toContain("1457");
		expect(texts.join(" ")).toMatch(/accel starts/);
		expect(texts.join(" ")).toMatch(/base/);
		expect(texts.join(" ")).toMatch(/cap/);
	});

	it("rescales its labels for a different output dpi and curve", () => {
		const { container } = render(<CurvePreview outputDpi={400} curve={LOW_SENS_CURVE} />);
		const texts = svgTexts(container);
		expect(texts).toContain("400");
		expect(texts).toContain("680");
	});

	it("marks the speed zones and the halfway point", () => {
		const { container } = render(<CurvePreview outputDpi={971} curve={MID_CURVE} />);
		const texts = svgTexts(container);
		expect(texts.join(" ")).toMatch(/accelerating/);
		expect(texts.join(" ")).toMatch(/at cap/);
		expect(texts.join(" ")).toMatch(/halfway/);
		expect(container.querySelector("circle.halfway")).toBeTruthy();
	});

	it("shows speed ticks on the x axis", () => {
		const { container } = render(<CurvePreview outputDpi={971} curve={MID_CURVE} />);
		const texts = svgTexts(container);
		for (const tick of ["0", "20", "40", "60", "80"]) {
			expect(texts).toContain(tick);
		}
	});
});
