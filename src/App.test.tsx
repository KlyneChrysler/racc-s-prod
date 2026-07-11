import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import App from "./App";

function renderAndStart() {
	render(<App />);
	fireEvent.click(screen.getByRole("button", { name: /click anywhere to start/i }));
}

describe("App landing", () => {
	afterEach(() => cleanup());

	it("lands on the crosshair intro with the start tooltip", () => {
		render(<App />);
		expect(screen.getByText(/click anywhere to start/i)).toBeTruthy();
		expect(screen.getByText(/Enter your mouse DPI\. We decide everything else\./)).toBeTruthy();
		expect(screen.queryByLabelText(/mouse dpi/i)).toBeNull();
	});

	it("starts the tool on click and drops the intro text", () => {
		renderAndStart();
		expect(screen.getByLabelText(/mouse dpi/i)).toBeTruthy();
		expect(screen.queryByText(/We decide everything else/)).toBeNull();
		expect(screen.queryByText(/click anywhere to start/i)).toBeNull();
	});

	it("shows the updates aside on the tool screen", () => {
		renderAndStart();
		expect(screen.getByRole("complementary", { name: /app updates/i })).toBeTruthy();
		expect(screen.getByText(/100 sensitivity notches/i)).toBeTruthy();
	});

	it("starts the tool with the keyboard", () => {
		render(<App />);
		fireEvent.keyDown(screen.getByRole("button", { name: /click anywhere to start/i }), { key: "Enter" });
		expect(screen.getByLabelText(/mouse dpi/i)).toBeTruthy();
	});
});

describe("App progressive reveal", () => {
	afterEach(() => cleanup());

	it("shows only the DPI input at first", () => {
		renderAndStart();
		expect(screen.getByLabelText(/mouse dpi/i)).toBeTruthy();
		expect(screen.queryByRole("slider")).toBeNull();
		expect(screen.queryByRole("button", { name: /download/i })).toBeNull();
	});

	it("reveals notch, preview, result, and guide once a valid DPI is entered", () => {
		renderAndStart();
		fireEvent.change(screen.getByLabelText(/mouse dpi/i), { target: { value: "1600" } });
		expect(screen.getByRole("slider")).toBeTruthy();
		expect(screen.getByRole("button", { name: /download settings\.json/i })).toBeTruthy();
		expect(screen.getByText(/how to apply/i)).toBeTruthy();
		expect(screen.getByText(/~971 DPI/)).toBeTruthy();
	});

	it("shows an inline error and hides results for invalid DPI", () => {
		renderAndStart();
		fireEvent.change(screen.getByLabelText(/mouse dpi/i), { target: { value: "50" } });
		expect(screen.getByText(/between 100 and 35000/i)).toBeTruthy();
		expect(screen.queryByRole("slider")).toBeNull();
	});

	it("shows no error while the field is still empty", () => {
		renderAndStart();
		expect(screen.queryByText(/between 100 and 35000/i)).toBeNull();
	});

	it("updates the summary when the notch moves", () => {
		renderAndStart();
		fireEvent.change(screen.getByLabelText(/mouse dpi/i), { target: { value: "1600" } });
		fireEvent.change(screen.getByRole("slider"), { target: { value: "100" } });
		expect(screen.getByText(/~2400 DPI/)).toBeTruthy();
	});

	it("clears the error and reveals results once the DPI is fixed", () => {
		renderAndStart();
		const input = screen.getByLabelText(/mouse dpi/i);
		fireEvent.change(input, { target: { value: "50" } });
		expect(screen.getByText(/between 100 and 35000/i)).toBeTruthy();
		fireEvent.change(input, { target: { value: "1600" } });
		expect(screen.queryByText(/between 100 and 35000/i)).toBeNull();
		expect(screen.getByRole("slider")).toBeTruthy();
	});
});
