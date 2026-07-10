# Raw Accel Easy Config

Generate a complete [Raw Accel](https://github.com/RawAccelOfficial/rawaccel) `settings.json`
from a single input: your mouse DPI. Pick a 1-10 sensitivity preference and download.
No other parameters to understand.

## How it works

- **DPI normalization:** the generated file sets your DPI in Raw Accel's device config,
  so the driver treats every mouse like a 1000 DPI mouse and the curve feels identical
  for everyone.
- **Preference-adaptive curve:** Natural mode with gain, decay rate 0.1. The 1-10 notch
  tunes the whole setup, not just speed. Low sens players swipe fast even while aiming,
  so acceleration waits longer (input offset 15 at notch 1) and can ramp higher (cap 1.7x).
  High sens players move slowly and overshoot easily, so it starts sooner (offset 6 at
  notch 10) and caps gently (1.3x). All values stay inside community consensus ranges.
- **Overall speed:** the notch also maps log-spaced onto Raw Accel's Output DPI, from a
  400 DPI feel (notch 1) to 2400 (notch 10).

Targets Raw Accel v1.7.x.

## Develop

```bash
npm install
npm run dev       # local dev server
npm test          # run test suite
npm run coverage  # coverage report
npm run build     # production build to dist/
```
