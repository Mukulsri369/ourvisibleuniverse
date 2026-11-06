# Universe startup defaults — 6 November 2026

Requested: show the existing toolbar automatically when the Universe loads; set Solar System galactic travel speed to 3090; set simulation time to seven days per real second.

Changed the initial Zustand UI visibility and galactic speed, and derived the initial time rate from the existing physical time conversion. The Time panel's Default shortcut now restores the same seven-day rate. Camera startup position, galaxy membership, astronomical datasets, orbital equations, independent planet speed controls, journey visibility handling and payment/access rules are unchanged.

Validation: solar-controls (including one-second clock advance and independent Galactic multiplier), solar-galactic-motion and navigation-flight suites passed. TypeScript passed. Production client and Cloudflare Worker builds passed. The local built preview is bound to 127.0.0.1:31751; no production upload or settings change was performed.

Built-app browser verification passed on the existing authenticated local session: toolbar present without toggling visibility, Settings displays 3,090× galactic travel and 7.0 days/s. Local screenshot is retained outside Git. The screenshot and automated elapsed-time check verify the UI and actual clock rate separately. The production site remains on its previous deployed version pending publication approval.

Publication explicitly approved by owner and completed: Worker version d367a27f-8be5-4390-bad9-b9beaef31b05 serves 100% of traffic on apex/www. Source commit cfcf1cb. Startup 2 ms. Verified production origin, owned Supabase, Live checkout enabled and all five exact secret binding names retained. Ten live HTTP/security checks passed; no payment, entitlement or database mutation was performed by this deployment. Wrangler authorization was renewed after its saved login expired.
Live authenticated browser verification also passed after publication: toolbar visible on a fresh Universe load; Settings shows 3,090× and 7.0 days/s. Proof screenshot retained outside Git.
