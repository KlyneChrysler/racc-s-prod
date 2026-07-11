# Contributing to Raw Accel Easy Config

Thanks for your interest. This project is free and open source, and contributions of any size are welcome: bug reports, curve feedback, code, and docs.

## Getting started

```bash
git clone git@github.com:KlyneChrysler/racc-s-prod.git
cd racc-s-prod
npm install
npm run dev
```

## Before you open a pull request

1. Run the test suite and keep it green:

```bash
npm test
npm run typecheck
npm run coverage
```

2. Run a production build to make sure nothing breaks:

```bash
npm run build
```

3. Add or update tests for any behavior you change. The settings.json schema tests in `src/lib/settingsTemplate.test.js` are strict on purpose: Raw Accel rejects files with any missing field, so every key and its order is pinned.

## Code style

- Tabs for indentation, semicolons, double quotes
- TypeScript everywhere: `.tsx` for components, `.ts` for logic, strict mode on
- IBM Plex Mono is the only typeface, weights 400 and 500 only
- No em dashes in UI copy, sentence case everywhere, no all caps
- Pure logic lives in `src/lib/`, components stay thin

## Commit messages

Use the form `<type>: <description>` in lowercase imperative, under 72 characters. Types: `fix`, `add`, `update`, `remove`, `refactor`, `merge`.

## Reporting issues

Open an issue at https://github.com/KlyneChrysler/racc-s-prod/issues with your mouse DPI, the notch you picked, and what felt wrong. If Raw Accel rejected a generated file, attach the settings.json.

## Scope

This tool intentionally exposes one input (DPI) plus a sensitivity notch. Feature requests that add more knobs to the UI will usually be declined; the parameter maze is what Raw Accel's own GUI is for.
