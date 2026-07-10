# Raw Accel Easy Config

Generate a complete [Raw Accel](https://github.com/RawAccelOfficial/rawaccel) `settings.json`
from a single input: your mouse DPI. Pick a 1-10 sensitivity preference and download —
no other parameters to understand.

## How it works

- **DPI normalization:** the generated file sets your DPI in Raw Accel's device config,
  so the driver treats every mouse like a 1000 DPI mouse and the curve feels identical
  for everyone.
- **Community-consensus curve:** Natural mode with gain (decay rate 0.1, input offset 10,
  limit 1.5). No acceleration during slow precise aim; sensitivity ramps to at most 1.5x
  on fast flicks.
- **Sensitivity notch:** maps 1-10 log-spaced onto Raw Accel's Output DPI, from a 400 DPI
  feel (notch 1) to 2400 (notch 10).

Targets Raw Accel v1.7.x.

## Develop

```bash
npm install
npm run dev       # local dev server
npm test          # run test suite
npm run coverage  # coverage report
npm run build     # production build to dist/
```
