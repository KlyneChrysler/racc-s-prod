import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import App from "./App.jsx";

describe("App progressive reveal", () => {
	afterEach(() => cleanup());

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
