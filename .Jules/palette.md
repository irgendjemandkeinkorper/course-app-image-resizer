## 2024-05-14 - File Input Focus Visibility
**Learning:** In custom upload zones where the native `<input type="file">` is visually hidden (e.g., using `opacity: 0`), the browser's default focus ring won't be visible during keyboard navigation. Using `:focus-within` on the container or `:has(input:focus-visible)` applies the focus styles appropriately to the parent container.
**Action:** When creating or modifying custom upload areas, always ensure a focus ring is provided on the visible container when the hidden input is focused, often by using `.container:has(input:focus-visible)`.
