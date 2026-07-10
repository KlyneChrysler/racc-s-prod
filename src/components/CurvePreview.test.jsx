import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import CurvePreview from "./CurvePreview.jsx";

function svgTexts(container) {
	return [...container.querySelectorAll("text")].map((t) => t.textContent);
}

describe("CurvePreview", () => {
	afterEach(() => cleanup());

	it("renders an svg polyline with many plotted points", () => {
		const { container } = render(<CurvePreview outputDpi={887} />);
		const polyline = container.querySelector("polyline");
		expect(polyline).toBeTruthy();
		expect(polyline.getAttribute("points").split(" ").length).toBeGreaterThan(50);
	});

	it("labels the base and cap values plus the accel start marker", () => {
		const { container } = render(<CurvePreview outputDpi={887} />);
		const texts = svgTexts(container);
		expect(texts).toContain("887");
		expect(texts).toContain("1331");
		expect(texts.join(" ")).toMatch(/accel starts/);
		expect(texts.join(" ")).toMatch(/base/);
		expect(texts.join(" ")).toMatch(/cap/);
	});

	it("rescales its labels when the output dpi changes", () => {
		const { container } = render(<CurvePreview outputDpi={400} />);
		const texts = svgTexts(container);
		expect(texts).toContain("400");
		expect(texts).toContain("600");
	});

	it("shows speed ticks on the x axis", () => {
		const { container } = render(<CurvePreview outputDpi={887} />);
		const texts = svgTexts(container);
		for (const tick of ["0", "20", "40", "60", "80"]) {
			expect(texts).toContain(tick);
		}
	});
});
