# Oura Motion Controller

An internal React Roundtable experiment, presented as **Oura Motion Controller**: motion input for web experiences. Demo Mode always works with mouse and keyboard. Live Oura Mode uses a **local** `open_oura` bridge; the browser never handles Bluetooth pairing or the ring authentication key.

## Live-motion architecture

```text
Oura Ring → BLE → open_oura → local SSE → Vite /oura proxy → MotionProvider
                                                               ├ Motion Input Visualizer
                                                               ├ Spatial Gallery
                                                               ├ Motion Synthesizer
                                                               └ 3D Product Viewer
```

The bridge is `Th0rgal/open_oura`. This implementation targets its current `main` behavior: `oura viz --port 8088 --minutes 15`, loopback-only SSE `/stream`, and protected `/start` / `/stop` controls. The inspected upstream revision is `c5106bd5674dd98f07954b96dff9e16c8fe26f06` (2026-07-24); `pnpm oura:setup` prints the local clone revision as well. Verify again after upstream updates. [open_oura](https://github.com/Th0rgal/open_oura) is attributed under its upstream license.

## Quick start

```bash
pnpm install
pnpm dev
```

Use **Demo Mode** when the bridge or ring is unavailable. Mouse and keyboard remain the fallback for every presentation.

## Live Oura setup — macOS

1. Install Rust/Cargo, then grant Bluetooth access to the terminal application in macOS Privacy & Security.
2. Use a charged, dedicated backup ring. Manually factory-reset it with Oura's supported process; this repository never automates resets.
3. Copy `.env.oura.example` to `.env.oura` and set absolute local paths. Keep the key file outside this repository. With multiple rings, keep the dedicated backup ring closest to the Mac: open_oura selects the strongest matching advertiser. `OURA_RING_ADDRESS` is optional only when that identifier stays stable; CoreBluetooth identifiers can rotate on macOS. Use `OURA_SCAN_TIMEOUT=45` to give the ring time to advertise. Never use `VITE_OURA_AUTH_KEY` or any `VITE_*` secret.
4. Build the bridge: `pnpm oura:setup`.
5. Find the ring: `pnpm oura:scan`.
6. Pair only after the manual reset: `OURA_CONFIRM_PAIR=1 pnpm oura:pair`. The command can take 25–60 seconds while it scans and connects; keep the ring nearby and still. For transport logs, prefix it with `OURA_LOG_LEVEL=debug`.
7. Verify info and a 15-second accelerometer sample: `pnpm oura:verify`.
8. Start both processes: `pnpm dev:live`, then select **Connect Oura** in the app and hold the hand still during calibration.

The actual upstream commands are `oura scan`, `oura --name "Oura" --key-file /secure/key.hex pair`, `info`, `accel --seconds 15`, and `viz --port 8088 --minutes 15`. If the official Oura app or another device holds the ring connection, close it or temporarily disable the phone Bluetooth before testing.

An already-onboarded ring needs its existing 16-byte app-auth key from its app database. This project does not extract that key or provide an unreliable workaround; a factory-reset backup ring paired with `open_oura` is the supported demo path.

## Safety and limitations

`open_oura` starts ACM streaming only after an explicit action and applies a ring-side duration backstop. Disconnect in the UI or Ctrl-C the bridge when finished. The Vite proxy only exists for local development and preserves the bridge Host, Origin, and `x-oura-viz` protections.

The live Oura channel provides accelerometer data. It supports gravity-based tilt and movement intensity, but it does not provide reliable live yaw, exact hand position, or finger tracking.

Live calibration averages normalized gravity samples for three seconds, builds an orientation basis, then derives horizontal and vertical tilt. The Live details panel supports axis swap/inversion, dead zone, full-scale angle, smoothing, and counts-per-g adjustment. Settings reset when the page reloads and no authentication material enters browser storage.

## Roundtable runbook

Before: charge the backup ring, close the official app, run `oura:verify`, start `dev:live`, connect, calibrate, and confirm direction in Motion Input Visualizer. During: explain Ring → local bridge → React, then show Spatial Gallery, Motion Synthesizer, and Product Viewer. Disconnect at the end. If anything fails, choose Demo Mode and continue; do not debug Bluetooth during the presentation.

Hardware was not available in this coding environment. Complete the numbered setup steps above, confirm the bridge receives samples, calibrate direction, test each experience, then verify Disconnect and browser-close teardown.
