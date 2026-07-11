# Raw Accel Easy Config

Ready-to-import [Raw Accel](https://github.com/RawAccelOfficial/rawaccel) settings from two inputs: your mouse DPI and a sensitivity preference.

**Live at [racc-s.vercel.app](https://racc-s.vercel.app)**

## What it does

Raw Accel is a Windows mouse acceleration driver with a dozen parameters to hand-tune. This app decides all of them for you. Enter your DPI, slide a 1 to 100 preference, and download a complete `settings.json`. Drop it into your Raw Accel folder and hit Apply.

Under the hood it normalizes your DPI so every mouse feels identical, applies a community-consensus Natural curve that adapts to your preference, and maps that preference onto an effective sensitivity from a 400 to 2400 DPI feel. You see a labeled curve chart, plain-language stats, and contextual tips before you download.

Targets Raw Accel v1.7.x. Not affiliated with the Raw Accel project.

## Run it locally

```bash
npm install
npm run dev
```

## Contributing

Contributions are welcome. The short version:

```bash
npm test          # must stay green
npm run typecheck # strict TypeScript, no errors
npm run build     # must pass
```

- Logic lives in `src/lib/` (pure, fully tested), components stay thin in `src/components/`
- The settings schema tests are strict on purpose: Raw Accel rejects files with any missing field
- Every change goes through a pull request; CI and a code owner review gate the merge

See [CONTRIBUTION.md](CONTRIBUTION.md) for style rules, commit format, and how to report a bad curve feel.
