# Dense galaxy-view motion follow-up — 8 November 2026

Local implementation **`5a911d6`** addresses the owner's repeat report and screenshot of mouse rotation after zooming out from the initial Milky Way view. It follows `0f7a928`/`f29fe43`, preserves the prior appearance work, and supersedes the earlier direct-pointer angle behavior. Local only: no push, deployment, production, account, payment, DNS or service changes.

## Findings and fix

The dense view could render at about 120 FPS while its camera still moved in steps. The previous controller snapped to each arriving pointer packet and held the same heading until the next packet. Average renderer FPS therefore did not establish smooth visible motion. A controlled 20 Hz input test through the actual `CameraRig` held its heading on **170/204 frames (83.3%)** despite rendering at 120.2 FPS.

Manual angles now interpolate at render time between mouse/touch packets, including a short settle after release. The response has a **20 ms time constant**, substantially shorter than automated flight easing. This is a mathematical controller parameter, not a measured hardware input-to-display latency. Tests require less than 25 ms of following error during constant input at 30/60/120 Hz, at least 95% of a step within 70 ms, no overshoot, an exact final heading and no continuing drift. Explicit navigation retains ownership and its existing easing; zoom and simulation rates are unchanged.

The same 20 Hz browser test now changes camera heading on **every measured moving frame: 0/199 held frames**, with no continuing movement after settling. Its measured render rate was 116.8 FPS; the improvement here is continuous camera motion between input packets, not a claimed increase in GPU throughput. See [before](sparse-pointer-before.json) and [after](sparse-pointer-after.json).

A second issue was expensive survey picking at the wrong time. React Three Fiber intersects click targets on pointer-down, pointer-up and wheel events too. The 42,541-source field was therefore scanned when starting/ending a drag and during zoom. The field now registers a last-priority initial hit in constant time so R3F can recognize a later click, but resolves the actual source/index/distance only for a genuine click. Named-object priority and real survey selection are preserved.

| Browser input test | Survey position reads before | After |
| --- | ---: | ---: |
| Drag, including pointer-down/up | 85,048 | **0** |
| One wheel event | 42,524 | **0** |
| Genuine survey click | 127,573 | **42,525** |

These are instrumented CPU attribute reads, not galaxy counts or GPU vertex counts. The real click selected the same `2MRS field source 17` fixture. No survey record or visible galaxy was removed. [Before](survey-events-before.json), [after](survey-events-after.json).

## Actual in-app preview verification

The existing right-pane preview was tested directly, starting with the Milky Way and selecting the 35-Mly orbit radius that reproduces the screenshot's dense field. Its viewport was **678×615, DPR 1**, using Intel Iris Xe through ANGLE/D3D11. Native browser mouse drags were measured using a local QA-only frame probe:

| Final drag | FPS | p95 frame ms | Maximum ms | Frames above 33.4 ms |
| --- | ---: | ---: | ---: | ---: |
| Horizontal with vertical movement | 120.0 | 10.7 | 21.7 | 0/72 |
| Reverse diagonal | 120.3 | 9.9 | 11.9 | 0/113 |

These are short automated native-browser gestures after initial scene/shader loading, not physical-phone tests, hardware latency measurements or a universal zero-jank guarantee. [Native preview readings](dense-orbit-in-app.json). Cold shader/asset initialization remains outside this steady-drag acceptance. The measurement panel was hidden afterward and the dense Milky Way-centered overview was left open for review. The probe and preset selector exist only under `scripts/nearby-qa/` with `?motion=1`; no production HUD or route was introduced.

The six-radius 696×640 headless coverage check also exercised 1.8, 3.6, 12, 35, 100 and 326 Mly. Its before/after render rates varied with concurrent preview/load state (before near 120; after 78–112 FPS), so these are coverage records, not a matched GPU-performance improvement claim. [Before coverage](dense-orbit-before.json), [after coverage](dense-orbit-after.json). The key regression checks count held camera frames and unnecessary picking work separately from average FPS.

## Checks and scope

- PASS: updated orbit/click regression at 30/60/120 Hz, sparse input, final settling, navigation takeover, cancellation and closed-loop click suppression.
- PASS: actual-browser sparse-pointer and survey-event tests, including a genuine source click and zero page/console/network errors in those tests.
- PASS: existing camera-navigation, navigation-flight and exploration-camera-ownership suites.
- PASS: real-component desktop/mobile-viewport filters, aliases, information panels, explicit entry/exit/re-entry, host gating and NED fallback checks.
- PASS: the existing real-mouse wide-orbit test, including its revised prompt-settling check, closed-loop drag selection guard and preserved catalogue field. [Sample](nearby-motion-smooth-followup.json). Its 90.5 FPS/p95 24.9 ms result is retained separately from the actual in-app readings, not substituted for them.
- PASS: TypeScript and affected-source ESLint/formatting.
- PASS: normal client/Cloudflare Worker build, with the existing unrelated deprecation/bundle warnings. No deployment was run.

All 831 catalogue galaxies, the separate Milky Way, 42,541 survey sources, the prior appearance profiles and the M31 14/124/18 counts are retained. No scientific data, source edition, galaxy geometry, colour, authenticated-access rule or production setting changed. Earlier authenticated full-app M31 acceptance and physical-device testing remain pending; this follow-up does not close them.

## Reproduction

Start the existing loopback QA server using `scripts/nearby-qa/vite.config.mts`. Set `OVU_PLAYWRIGHT_MODULE` to the locally installed Playwright module, then run:

```
node scripts/sparse-pointer-orbit-validation.mjs after
node scripts/survey-event-validation.mjs after
node scripts/dense-orbit-validation.mjs after
node scripts/nearby-browser-validation.mjs
```

For the actual in-app measurement, open `http://127.0.0.1:31755/scripts/nearby-qa/navigation.html?motion=1`, minimize the explorer, select 35 Mly, allow the initial scene to load, and drag the canvas. The panel reports the last drag's frame intervals and can be hidden without resetting the view. Loopback 31755 is intentionally left running; it is not a deployment.
