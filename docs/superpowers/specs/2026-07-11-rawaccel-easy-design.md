# Raw Accel Easy Config — Design

Date: 2026-07-11
Status: Approved pending user spec review

## Problem

Raw Accel (https://github.com/RawAccelOfficial/rawaccel) requires users to understand and enter many numeric parameters (curve mode, acceleration, offsets, caps, sens multipliers). Most users just want "good settings for my mouse." This app reduces the entire configuration to one required input — mouse DPI — plus a 1–10 sensitivity preference notch, and generates a complete, ready-to-import `settings.json`.

## User flow (progressive, single-input)

1. User lands on a single page and sees exactly one input: **DPI** (number field).
2. Once a valid DPI is entered, the **1–10 sensitivity notch** slider is revealed (default: notch 5).
3. The result panel appears immediately and updates live as the notch moves:
   - Plain-language summary ("Your mouse will feel like ~890 DPI, ramping up to 1.5x on fast flicks").
   - SVG preview of the sensitivity-vs-input-speed curve.
   - **Download settings.json** button.
   - Import instructions.
4. No other parameters are ever shown or editable. The system decides everything else.

## Recommendation model

All logic lives in one pure module: `src/lib/recommend.js`.

`recommend({ dpi, notch })` → `{ settings, summary }`

1. **DPI normalization (exact, driver-native).** The generated file sets
   `defaultDeviceConfig["DPI (normalizes input speed unit: counts/ms -> in/s)"] = dpi`.
   Raw Accel's driver then scales input by `1000/dpi`, so every user's curve behaves
   identically to a 1000 DPI mouse. The curve parameters never need per-DPI scaling.

2. **Fixed community-consensus curve.** Natural mode, gain on:
   - `mode: "natural"`
   - `decayRate: 0.1`
   - `inputOffset: 10` (no accel during slow, precise aiming)
   - `limit: 1.5` (sensitivity self-caps at 1.5x — accel never gets wild)
   These are the widely recommended starter values from the official guide and
   community sources, quoted at/normalized to 1000 DPI. The notch never changes
   the curve shape.

3. **Notch → overall sensitivity via `Output DPI`.** Log-spaced mapping from
   effective 400 DPI (notch 1) to 2400 DPI (notch 10):

   `outputDPI(n) = round(400 * 6^((n-1)/9))`

   | Notch | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
   |---|---|---|---|---|---|---|---|---|---|---|
   | Effective DPI | 400 | 488 | 596 | 727 | 887 | 1082 | 1321 | 1612 | 1967 | 2400 |

   Notch 5 lands near the classic ~800–900 competitive feel. Rounded to integers.

4. **Pixel-skip note.** If `outputDPI > dpi`, still generate the file but show a
   non-blocking caution ("may feel slightly steppy on desktop; fine in games with
   raw input").

## Generated settings.json (target: Raw Accel v1.7.x)

- Full v1.7.x schema — every field of every object present (Raw Accel deserializes
  with `ItemRequired = Always`; missing fields = rejected file). Template is the
  verified real-world v1.7.0 example, with only these values changed:
  - `defaultDeviceConfig` DPI = user DPI
  - Profile `"Whole or horizontal accel parameters"`: mode/decayRate/inputOffset/limit
    as above (all other AccelArgs fields keep schema defaults)
  - `"Output DPI"` = notch-mapped value
  - `"Degrees of angle snapping"` = 0 (off)
  - Vertical accel parameters stay defaults (whole/combined mode is on, so unused)
- `version: "1.7.0"`, `devices: []`, comment keys (`### Accel modes ###`, `### Cap modes ###`) included as Raw Accel writes them.
- v1.6.1 legacy format is out of scope.

## UI / tech

- Vite + React SPA, pure client-side, no backend. `.jsx` components, tabs/semicolons/double quotes per user conventions.
- Components (small, focused files):
  - `App.jsx` — layout + state (dpi, notch)
  - `DpiInput.jsx` — validated number input (integer, 100–35000; inline error otherwise)
  - `SensNotch.jsx` — 10-notch slider, labeled "Low sens" ↔ "High sens"
  - `ResultPanel.jsx` — summary text, pixel-skip note, download button
  - `CurvePreview.jsx` — SVG plot of sensitivity vs input speed (counts/ms 0–80):
    flat 1.0 until offset 10, natural rise toward 1.5, y-axis scaled by outputDPI/1000
  - `ImportGuide.jsx` — static instructions: close Raw Accel GUI → replace
    `settings.json` in install folder → reopen GUI and Apply (or run `writer.exe settings.json`);
    note that settings don't persist across reboots unless GUI/writer runs at startup
- Download via Blob + anchor, filename `settings.json`.

## Error handling

- DPI input: reject non-numeric, non-integer, out-of-range (100–35000) with inline
  message; notch/result hidden until valid.
- Notch clamped to integers 1–10 (slider enforces).
- No network, no storage — no other failure modes.

## Testing (Vitest)

- `recommend.test.js`:
  - Generated object's key set (deep) exactly matches the known-good v1.7.0 example's key set.
  - Notch mapping: monotonic increasing; notch 1 → 400; notch 10 → 2400; notch 5 ≈ 887.
  - Device DPI field = input DPI; Output DPI = mapped value; curve fields = fixed constants.
  - Validation: dpi 99, 35001, 1600.5, "abc" rejected; 100/35000 accepted.
- Component smoke tests: notch hidden until valid DPI; download button renders with valid state.
- Target: 80%+ coverage on `src/lib/`.

## Out of scope (YAGNI)

- No backend, accounts, or persistence.
- No per-game presets, no curve editing, no advanced mode — Raw Accel's own GUI covers that.
- No v1.6.1 legacy export, no per-device configs, no writer.exe automation.
