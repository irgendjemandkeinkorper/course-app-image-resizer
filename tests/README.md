# PNG validation tests

These dependency-light tests generate deterministic PNG fixtures and inspect their IHDR metadata. They cover the opaque RGB app-icon contract, transparent RGBA logo contract, and the 4 MiB size boundary without requiring a browser or production-code changes.

Run them from the repository root with:

```sh
npm test
```
