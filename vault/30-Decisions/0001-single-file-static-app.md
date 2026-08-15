# ADR 0001: Keep the runtime single-file and static

## Status

Accepted

## Decision

The live application remains a static `index.html` with no build step or application server. The file is easy to deploy to GitHub Pages and keeps browser-only image processing local to the user's device.

## Consequences

Runtime changes must preserve the existing inline CSS and JavaScript boundaries until a deliberate module split is completed. CDN-backed libraries and the public GitHub rejection-library API remain explicit network dependencies.
