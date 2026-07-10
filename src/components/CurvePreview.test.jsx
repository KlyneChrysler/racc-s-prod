import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import CurvePreview from "./CurvePreview.jsx";

describe("CurvePreview", () => {
	afterEach(() => cleanup());

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
