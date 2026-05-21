# Orchestration Log — vrambudget.com

**Session:** vrambudget-build
**Orchestrator:** pane 0 (this Claude instance)
**Protocol start:** 2026-05-21T01:23:00Z
**Repo target:** github.com/webdevtodayjason/vrambudget
**Spec:** `docs/handoff/README.md` (design) + `tmp/docs/HANDOFF.md` (wiring) + `tmp/docs/The Math Behind VRAM Budget.md` (math)

## Decisions locked

- **Stack:** Next.js 15 + TypeScript + pnpm + `output: 'export'` → Cloudflare Pages
- **Routing layout:** `src/app/...`, `src/lib/...`, `src/components/...` per HANDOFF.md
- **Catalogs:** 40 GPUs (full design set, expanded with researched fields), 21 curated models (HANDOFF.md slugs + hfRepo)
- **Math:** authoritative formulas from `tmp/docs/HANDOFF.md` §1.1 (not the placeholders in the design's `calculator.jsx`)
- **HF integration:** hybrid — build-time enrichment of curated catalog + live client-side `searchHF()` from the calculator
- **AVL:** target L3 on every route. `@frontier-infra/avl@0.1.0` for `serialize()` and types; project-local `scripts/emit-agent-views.ts` for the postbuild static emit (package v0.1.0 has no static emitter)
- **Voice:** no em dashes in any generated copy
- **Commits:** land everything locally first, single commit pass at the end (no remote push without explicit operator request)

## Task Ledger

| ID  | Task                                                  | State    | Worker  | Started              | Finished |
|-----|-------------------------------------------------------|----------|---------|----------------------|----------|
| S0  | Cleanup root + move handoff to docs/                  | done     | orch    | 2026-05-21T01:23:00Z | 2026-05-21T01:23:30Z |
| S1  | Scaffold Next.js 15 + TS + tooling                    | done     | scaffold-worker | 2026-05-21T01:24:00Z | 2026-05-21T01:27:00Z |
| S2  | Port styles.css → globals.css + next/font Geist+JBM   | done     | styles-worker | 2026-05-21T01:28:00Z | 2026-05-21T01:31:00Z |
| S3  | Data libs (vram, gpus×40, quants, models×20, hf)      | done     | data-worker  | 2026-05-21T01:28:00Z | 2026-05-21T01:35:00Z |
| S4  | Shared chrome (Nav, Footer, AvlBadge)                 | done     | chrome-worker | 2026-05-21T01:28:00Z | 2026-05-21T01:32:00Z |
| S5  | Port calculator.jsx → Calculator.tsx                  | done     | calc-worker | 2026-05-21T01:36:00Z | 2026-05-21T01:42:00Z |
| S8  | gpu/[slug] route (40 pages) + agent.ts + OG           | done     | gpu-worker | 2026-05-21T01:43:00Z | 2026-05-21T01:52:00Z |
| S9  | model/[slug] route (20 pages) + agent.ts + OG         | done     | model-worker | 2026-05-21T01:43:00Z | 2026-05-21T01:52:00Z |
| S10 | SEO chrome (sitemap, robots, home OG)                 | done     | seo-worker | 2026-05-21T01:36:00Z | 2026-05-21T01:41:00Z |
| S6  | AVL lib + emit-agent-views.ts postbuild script        | done     | avl-worker   | 2026-05-21T01:28:00Z | 2026-05-21T01:34:00Z |
| S7  | Home + the-math + layout rewrite + agent-views index  | done     | integration-worker | 2026-05-21T01:53:00Z | 2026-05-21T02:01:00Z |
| S11 | Verify + polish (LICENSE, README, tracingRoot)        | done     | verify-worker | 2026-05-21T02:01:00Z | 2026-05-21T02:06:00Z |

State flow: blocked → pending → in_progress → done.

## Slice dependencies

```
S0 → S1 → {S2, S3, S4, S6} → S5 → {S7, S8, S9, S10} → S11
                                ↑
                            S10 also needs S3
```

## Worker file scopes (CONSTRAINTS for non-overlap)

| Slice | May touch                                             | May NOT touch                              |
|-------|-------------------------------------------------------|--------------------------------------------|
| S1    | `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx` (stub), `src/app/page.tsx` (stub), `src/app/not-found.tsx` | anything under `src/lib/`, `src/components/` |
| S2    | `src/app/globals.css`, `src/app/layout.tsx` (font imports only) | `src/app/page.tsx`, anything else in src/  |
| S3    | `src/lib/vram.ts`, `src/lib/gpus.ts`, `src/lib/quants.ts`, `src/lib/models.ts`, `src/lib/hf.ts` | anything outside src/lib/                   |
| S4    | `src/components/Nav.tsx`, `src/components/Footer.tsx`, `src/components/AvlBadge.tsx` | src/lib/, src/app/                          |
| S5    | `src/components/Calculator.tsx`                       | src/lib/ (read-only imports)                |
| S6    | `src/lib/avl.ts`, `scripts/emit-agent-views.ts`, `src/app/agent-views.ts` (registry) | route files                                 |
| S7    | `src/app/page.tsx`, `src/app/page.agent.ts`, `src/app/the-math/page.tsx`, `src/app/the-math/page.agent.ts` | gpu/, model/                                |
| S8    | `src/app/gpu/[slug]/**`                               | model/, home                                |
| S9    | `src/app/model/[slug]/**`                             | gpu/, home                                  |
| S10   | `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, `src/app/gpu/[slug]/opengraph-image.tsx`, `src/app/model/[slug]/opengraph-image.tsx` | route page.tsx files                        |
| S11   | read-only verification                                | anything                                    |

## Decision Log

- **2026-05-21T01:23:00Z** — Scaffold begins. User chose "Design's full 40" GPUs and "Switch to orchestrator-mode" in the dispatch question.
- **2026-05-21T01:23:00Z** — HANDOFF.md (`tmp/docs/HANDOFF.md`) is the authoritative spec. Design files in `docs/handoff/` are the visual reference only.
- **2026-05-21T01:23:30Z** — S0 cleanup complete: `/gpu/`, `/styles.css`, `/calculator.jsx` deleted from root; `vrambudget-com/` moved to `docs/handoff/`; `.gitignore` written.
- **2026-05-21T01:24:00Z** — Operator activated full autonomous mode. No more per-step approval pings. Open questions resolve to best-judgement defaults documented here.
- **2026-05-21T01:24:00Z** — U1 resolved: S3 worker will research the 28 missing GPU fields via WebFetch (NVIDIA/AMD/Intel/Apple spec pages, TechPowerUp DB). Operator may override post-hoc.
- **2026-05-21T01:27:30Z** — U1 dissolved entirely: orchestrator extracted bandwidth/FP16/budget/summary for all 40 GPUs and hf_repo/params/family/context/fp16_gb for all 20 models from the design HTML files. Stored in `tmp/{gpu,model}-specs-extracted.json`. Design HTMLs were already pre-populated with these specs. Saves S3 ~2 hours of research.
- **2026-05-21T01:27:30Z** — Catalog count correction: design ships 20 model HTML files (not 21 as README claimed). Going with 20.
- **2026-05-21T01:30:00Z** — Em-dash rule resolution: the design's existing copy (index.html, the-math.html) contains em dashes despite HANDOFF.md's "no em dashes" rule. Ship design copy verbatim (preserves visual + tonal contract). Em-dash ban applies ONLY to new copy workers write (page metadata, AVL state strings, alt text, READMEs, etc.). Rewriting design copy is out of scope for this build.
- **2026-05-21T01:30:00Z** — Hf_repo for `command-r-plus` extracted from design crumb as `CohereForAI/c4ai-command-r-plus`. HANDOFF.md uses different slugs (newer Llama 3.3 70B); design uses Llama 3.1 70B. We follow design since the user picked "Design's full 40" — same logic for models.
- **2026-05-21T01:43:00Z** — Phase E split into E1 (S8+S9 parallel) and E2 (S7 alone). Reason: all three would compete on `src/app/agent-views.ts`. Resolved by having S8 write `src/app/_views/all-gpus.ts`, S9 write `src/app/_views/all-models.ts`, and S7 (E2) write the index `src/app/agent-views.ts` that imports from all of them. S7 typecheck depends on S8+S9's helper files existing.
- **2026-05-21T01:24:00Z** — GH repo: land everything locally first, single commit at end of S11, NO remote push without explicit instruction.

## Verification Evidence

### S1 — scaffold (done 2026-05-21T01:27:00Z)
- `out/index.html` contains literal `vrambudget scaffold OK` (grep confirmed)
- `out/404.html` present (3849 bytes)
- `package.json` lists next@^15, react@^18, pnpm@9, scripts include typecheck/prebuild/postbuild
- `next.config.ts` has `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`
- src tree: layout.tsx, page.tsx, not-found.tsx + .gitkeep in lib/components/scripts
- `pnpm install`, `pnpm typecheck`, `pnpm build` all exit 0

### Pre-research artifacts (orch-prepared for S3)
- `tmp/gpu-specs-extracted.json` — 40 GPUs with slug/name/vram_gb/bandwidth_gbs/fp16_tflops/budget_8k_gb/summary, extracted from design HTML files
- `tmp/model-specs-extracted.json` — 20 models with slug/name/hf_repo/params_b/family/context_k/fp16_gb/summary, extracted from design HTML files
- These dissolve U1: no external web research needed; S3 worker imports + transforms into TS.

### S2 — styles + fonts (done 2026-05-21T01:31:00Z)
- `src/app/globals.css` 1254 lines (matches design styles.css)
- `src/lib/fonts.ts` 15 lines with Geist + JetBrains_Mono next/font exports
- Two `:root` lines (21–22 in globals.css) modified to wire `var(--font-mono, "JetBrains Mono")` and `var(--font-sans, "Geist")` as the first font in each stack
- pnpm typecheck + build still green
- DID NOT touch layout.tsx (S7 will wire fonts + globals.css import)

### S4 — shared chrome (done 2026-05-21T01:32:00Z)
- `src/components/Nav.tsx` 1440 bytes — server component, 5 links + brand, supports `active` prop
- `src/components/AvlBadge.tsx` 729 bytes — server component, L3 spec markup verified by grep: data-agent-discovery, data-avl-endpoint, data-avl-manifest, data-avl-package, rel="alternate agent-view", type="text/agent-view" all present
- `src/components/Footer.tsx` 1061 bytes — server component, route + lastBuilt props, embeds AvlBadge in `.foot-avl` wrapper above `.foot-bottom`
- One non-blocking lint warning: `@next/next/no-img-element` on AVL's `<img>` (correct per spec — `next/image` would break the alternate-link structure). Acknowledged, will not "fix".

### Open follow-up from S1 (deferred to S11)
- scaffold-worker flagged: Next 15 inferred workspace root as `/Users/sem` due to stray lockfiles at `/Users/sem/package-lock.json` and `/Users/sem/code/package-lock.json`. Build still succeeds but emits a warning. Fix: add `outputFileTracingRoot: __dirname` to next.config.ts during S11 hardening. Do NOT delete the stray lockfiles (they belong to other projects, not ours).

### S3 — data libs (done 2026-05-21T01:35:00Z)
- 5 files in src/lib/: vram.ts (99), gpus.ts (512, 40 entries), quants.ts (38, 9 entries), models.ts (287, 20 entries), hf.ts (50)
- Category counts: rtx-30:6, rtx-40:8, rtx-50:4, apple:7, workstation:4, datacenter:5, amd:3, intel:3 → 40 ✓
- MoE classification: mixtral-8x7b (12.9B active), mixtral-8x22b (39B), deepseek-v2-5 (21B); all others dense
- Smoke check: `node --experimental-strip-types ./src/lib/gpus.ts` confirms GPUS.length=40, gpuBySlug('rtx-4090').vramGB=24, nearbyGpusByVram returns 4 closest
- typecheck + build still green; postbuild AVL emit still writes out/index.agent + out/agent.txt
- Em-dash policy applied per 2026-05-21T01:30:00Z decision: design-sourced summaries kept verbatim (including 4 em dashes restored)
- HANDOFF.md vs design model slug divergence: design's 20 win per orchestrator decision; data-worker confirmed no silent fixes



### S11 — Verify + polish (done 2026-05-21T02:06:00Z)
- Applied next.config.ts `outputFileTracingRoot: path.join(__dirname)` — workspace-root warning silenced ✓
- Applied OG `≈` → `~=` in `src/app/opengraph-image.tsx` (gpu + model OG files already ASCII)
- Added `LICENSE` (MIT, Jason Brashear 2026)
- Rewrote `README.md` with project description, stack, build instructions, AVL note, project layout
- FINAL INVENTORY (verified):
  - HTML routes: 62 (1 home + 1 the-math + 40 gpu + 20 model)
  - AVL .agent files: 62
  - OG PNGs: 61 (1 home + 40 gpu + 20 model)
  - sitemap.xml URLs: 62
  - All AVL L3 sections present in sampled .agent files
  - AVL footer badge + alternate link verified in home HTML
  - typecheck + build green; postbuild `wrote 62 .agent files + 1 manifest`
- New copy em-dash audit: zero hits in src/app/_views/, agent-views.ts, layout.tsx, README, LICENSE. Code comments contain em dashes (developer-facing only, not user copy).

### S7 — Integration (done 2026-05-21T02:01:00Z)
- 7 files: `src/app/layout.tsx` (35 lines, full rewrite w/ fonts + metadataBase + globals.css import + suppressHydrationWarning), `src/app/page.tsx` (226 lines, design home), `src/app/the-math/page.tsx` (247 lines, design article), `src/app/_views/home.ts` (61 lines), `src/app/_views/math.ts` (52 lines), `src/app/agent-views.ts` (17 lines, central index), `src/lib/models.ts` (293 lines, similarModelsByParams patched)
- AVL postbuild: `wrote 62 .agent files + 1 manifest` ✓
- 62 .agent files: 1 home + 1 math + 40 gpus + 20 models
- `out/agent.txt`: 64 lines (2 header + 62 routes)
- llama-3-1-70b page: 4 compare-cards (was 1) ✓ — k-nearest patch worked
- Hero rendered, the-math article rendered, scaffold marker gone
- Zero em-dashes in new AVL/metadata copy; design verbatim copy preserves 4 em-dashes from the-math.html
- `similarModelsByParams` signature normalized: `n >= 1 ? Math.floor(n) : 4`, so legacy 0.3 callers default to 4 nearest by absolute Δparams
- `metadataBase` warning silenced via layout.tsx
- Remaining warnings (deferred to S11): workspace-root inference, ≈ glyph in OG image

### S5 — Calculator (done 2026-05-21T01:42:00Z)
- `src/components/Calculator.tsx` 795 lines, `"use client"`, default-export `Calculator`, fully typed `CalculatorProps`
- `src/app/page.tsx` mounts `<Calculator />` alongside the preserved scaffold marker
- Build verified: 20 model rows, 16 gpu-card markers (8 cards × 2 occurrences), 20 HF external links, 8 categories, 5 sliders, 4 tiles, 4 bar segments, 3 tabs
- typecheck + build still green

### S8 — gpu/[slug] (done 2026-05-21T01:52:00Z)
- 3 files: `src/app/gpu/[slug]/page.tsx` (server), `opengraph-image.tsx`, `src/app/_views/all-gpus.ts`
- Build emits 40 `out/gpu/<slug>/index.html` + 40 `out/gpu/<slug>/opengraph-image.png`
- Each page: detail-hero (vram/bw/fp16/budget stats), Calculator mount tuned to slug, fits table (top 12), compare cards (4 nearest by vram)
- `registerAllGpuViews()` exported, NOT auto-called (S7 wires)

### S9 — model/[slug] (done 2026-05-21T01:52:00Z)
- 3 files: `src/app/model/[slug]/page.tsx`, `opengraph-image.tsx`, `src/app/_views/all-models.ts`
- Build emits 20 `out/model/<slug>/index.html` + 20 OG PNGs
- Each page: detail-hero, 5-column gpu-recs grid (FP16/Q8_0/Q6_K/Q5_K_M/Q4_K_M), alternatives panel
- `registerAllModelViews()` exported, NOT auto-called
- Surfaced: `similarModelsByParams(..., 0.3)` yields only 1 sibling for 70B-class. Design shows 4. Fix folded into S7 scope: switch lib/models.ts `similarModelsByParams` from "±30% percent tolerance" to "k-nearest absolute distance" (always returns 4 unless catalog is too small).
- Surfaced: had to drop `generateImageMetadata` from OG file (Next 15 + output:'export' + generateImageMetadata creates a [__metadata_id__] subroute that demands its own static params). Worked around by moving `alt` to top-level export.

### S10 — SEO chrome (done 2026-05-21T01:41:00Z)
- `src/app/sitemap.ts` 41 lines, generates 62 URLs (1 home + 1 the-math + 40 GPU + 20 model). Orchestrator's earlier "63" was an off-by-one; 62 is correct.
- `src/app/robots.ts` 17 lines, points to vrambudget.com/sitemap.xml with Host hint.
- `src/app/opengraph-image.tsx` 58 lines, generates 1200×630 PNG with the formula in mono.
- `out/sitemap.xml` (10345 bytes, 62 `<url>` entries), `out/robots.txt` (97 bytes), `out/opengraph-image` (27885 bytes, valid PNG per `file`).
- Required `dynamic = 'force-static'` on all three (static export demands it; otherwise build errors).
- Known cosmetic issues, deferred to S11:
  - OG image file is at `out/opengraph-image` without `.png` extension. Internally consistent (HTML refs match), this is Next 15's metadata-file convention with `trailingSlash:true` + `output:'export'`. Will leave as-is; downstream consumers (OG card scrapers) honor Content-Type, not extension.
  - `≈` glyph in OG text fails dynamic Google Font fetch; renders as tofu. Decision: keep as-is for now. Brand asset can be hardened in a follow-up by bundling a Noto Sans Math subset via fetch() in the OG handler. Not a build blocker.
- Surfaced for S7: `metadataBase` not set on layout.tsx — S7 must add `export const metadata = { metadataBase: new URL('https://vrambudget.com'), ... }` to suppress the warning.
- `@frontier-infra/avl@0.1.0` + `tsx@^4.22.3` installed (devDep for tsx)
- `src/lib/avl.ts` 2497 bytes — re-exports + Route type + AGENT_ROUTES registry + registerAgentRoute<S>() generic + buildAgentDocument()
- `src/app/agent-views.ts` 1380 bytes — home view registered with all 6 L3 sections (intent + state + actions + context + nav, meta auto-wrapped)
- `scripts/emit-agent-views.ts` 3255 bytes — walks AGENT_ROUTES, renders each, calls serialize(), writes `out/<pattern>.agent` + `out/agent.txt` manifest
- `package.json` postbuild: `tsx scripts/emit-agent-views.ts`
- Smoke test: `pnpm build` → postbuild emits `out/index.agent` (1 file) + `out/agent.txt` (manifest), exit 0
- TOON output verified: all 6 L3 sections present in /index.agent
- Worker notes: TS `.ts` extensions stripped from imports for `tsc` compat; `registerAgentRoute<S>()` is generic with safe cast to `DefinedAgentView<unknown>` (registry only ever calls render which returns RenderedAgentView regardless of S)
- Ready for S7/S8/S9 to add their routes — emitter handles nested dirs (e.g. `out/gpu/rtx-4090.agent`) automatically

## Open questions (deferred, not blocking)

- **GH repo init / push timing** — currently planning a single commit pass at end, no push. Operator can override.
- **U1 (28 GPU spec fields)** — RESOLVED: orchestrator extracted all 40 specs from design HTMLs (2026-05-21T01:27:30Z).
- **Cloudflare Pages deploy** — out of scope for this session; wrangler.toml exists in HANDOFF.md template but no `wrangler pages deploy` will run.

## Build complete

Slices S0–S11 done. Local build green. No remote push performed (per session policy).

Single local commit performed at session end: see `git log` in repo.

Outstanding follow-ups (post-session):
- `gh repo create webdevtodayjason/vrambudget` + `git push -u origin main` — operator runs when ready
- `wrangler pages deploy out --project-name=vrambudget` — operator runs when DNS + CF Pages project are set up
- Brand polish: bundle Noto Sans Math subset in OG handlers to restore `≈` glyph (currently rendered as `~=` in OG PNGs)
- Optional: `eslint@9` flat config bump (current `eslint@8.57.1` is upstream-deprecated but functional)
