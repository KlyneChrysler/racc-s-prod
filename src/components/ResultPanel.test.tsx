import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import ResultPanel from "./ResultPanel";
import { recommend } from "../lib/recommend";

describe("ResultPanel", () => {
	afterEach(() => cleanup());

	it("shows the stat grid and a download button", () => {
		render(<ResultPanel result={recommend({ dpi: 1600, notch: 50 })} />);
		expect(screen.getByText(/~971 DPI/)).toBeTruthy();
		expect(screen.getByText("1.5x")).toBeTruthy();
		expect(screen.getByText("10.5 in/s")).toBeTruthy();
		expect(screen.getByText("5 cm")).toBeTruthy();
		expect(screen.getByRole("button", { name: /download settings\.json/i })).toBeTruthy();
	});

	it("shows contextual tips when the setup warrants them", () => {
		render(<ResultPanel result={recommend({ dpi: 400, notch: 100 })} />);
		expect(screen.getByText(/steppy/i)).toBeTruthy();
		expect(screen.getByText(/hardware DPI/i)).toBeTruthy();
	});

	it("shows no tips for a well-matched setup", () => {
		render(<ResultPanel result={recommend({ dpi: 1600, notch: 50 })} />);
		expect(screen.queryByText(/steppy/i)).toBeNull();
		expect(screen.queryByRole("list")).toBeNull();
	});

	it("downloads the settings as settings.json on click", () => {
		const createObjectURL = vi.fn((_blob: Blob) => "blob:mock-url");
		const revokeObjectURL = vi.fn();
		vi.stubGlobal("URL", Object.assign(Object.create(URL), { createObjectURL, revokeObjectURL }));
		const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

		const result = recommend({ dpi: 1600, notch: 50 });
		render(<ResultPanel result={result} />);
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
