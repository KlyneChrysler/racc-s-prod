import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ResultPanel from "./ResultPanel.jsx";
import { recommend } from "../lib/recommend.js";

describe("ResultPanel", () => {
	afterEach(() => cleanup());

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
