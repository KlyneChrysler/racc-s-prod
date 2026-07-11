import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import ResultPanel from "./ResultPanel";
import { recommend } from "../lib/recommend";

describe("ResultPanel", () => {
	afterEach(() => cleanup());

	it("shows the effective DPI summary and a download button", () => {
		render(<ResultPanel dpi={1600} result={recommend({ dpi: 1600, notch: 50 })} />);
		expect(screen.getByText(/~971 DPI/)).toBeTruthy();
		expect(screen.getByText(/Below 10\.5 inches per second/)).toBeTruthy();
		expect(screen.getByRole("button", { name: /download settings\.json/i })).toBeTruthy();
	});

	it("warns about desktop steppiness when effective DPI exceeds mouse DPI", () => {
		render(<ResultPanel dpi={400} result={recommend({ dpi: 400, notch: 100 })} />);
		expect(screen.getByText(/steppy/i)).toBeTruthy();
	});

	it("shows no warning when effective DPI is at or below mouse DPI", () => {
		render(<ResultPanel dpi={1600} result={recommend({ dpi: 1600, notch: 50 })} />);
		expect(screen.queryByText(/steppy/i)).toBeNull();
	});

	it("downloads the settings as settings.json on click", () => {
		const createObjectURL = vi.fn((_blob: Blob) => "blob:mock-url");
		const revokeObjectURL = vi.fn();
		vi.stubGlobal("URL", Object.assign(Object.create(URL), { createObjectURL, revokeObjectURL }));
		const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

		const result = recommend({ dpi: 1600, notch: 50 });
		render(<ResultPanel dpi={1600} result={result} />);
		fireEvent.click(screen.getByRole("button", { name: /download settings\.json/i }));

		expect(createObjectURL).toHaveBeenCalledTimes(1);
		const blob = createObjectURL.mock.calls[0]?.[0];
		expect(blob?.type).toBe("application/json");
		expect(click).toHaveBeenCalledTimes(1);
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

		click.mockRestore();
		vi.unstubAllGlobals();
	});
});
