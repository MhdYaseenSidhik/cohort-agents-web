# Design direction: "Stripe-dense, calm"

No repository brand file exists, so this is the direction. All values live in `src/styles/tokens.css`; Tailwind maps to those variables; components never use literal colours or pixels.

- **Type:** system-ui stack (Inter if installed), scale 12/14/16/20/24/32, tabular numerals for figures.
- **Space:** 4px scale (4, 8, 12, 16, 24, 32, 48). Content max-width 1280px, centred.
- **Colour:** neutral surface scale, ONE accent (indigo), semantic success/warning/danger/info. Categorical series palette of 6 hues chosen for both themes (ZSPR = series 1, ZSPN = series 2 everywhere).
- **Radii:** 6 and 10. **Elevation:** three levels (border-only, card, overlay). **Motion:** 180ms ease-out, disabled under prefers-reduced-motion.
- **Controls:** heights 32/36/40; 40px on touch. Focus ring 2px accent with 2px offset.
- **Themes:** `[data-theme]` on html, follows the system by default, toggle in the header. Dark uses lighter surfaces for depth, not shadows.
- **Icons:** lucide-react.
- Colour of KPI change follows catalog.direction only; neutral is grey.
- The backtest is always drawn dashed/muted with a "Backtest" badge; the forecast is solid with a shaded band.
