# vrambudget.com

The math behind local LLM memory budgets.

```
VRAM ~= params * (bits / 8). Everything else is overhead.
```

vrambudget.com shows the formula every "can I run this LLM" tool skips. Plug in a GPU and context length; get the actual weights budget after the KV cache, the framework overhead, and a sane safety margin. Browse 40 GPUs and 20 curated models, each with the precomputed fit matrix.

## Stack

- Next.js 15 + TypeScript, static export to `out/`
- Vanilla CSS, two custom fonts via `next/font/google`
- AVL (Agent View Layer) at L3 on every route via `@frontier-infra/avl`
- Postbuild: `scripts/emit-agent-views.ts` writes the TOON `.agent` sibling for each page
- Target: Cloudflare Pages

## Build

```
pnpm install
pnpm build
```

`out/` contains 62 routes:

- `/` and `/the-math`
- 40 `/gpu/<slug>` pages
- 20 `/model/<slug>` pages
- A `.agent` companion next to each (TOON-encoded, L3 conformance)
- `agent.txt` manifest, `sitemap.xml`, `robots.txt`, OG images

## Project layout

```
src/
  app/                  # Next.js routes (pages + agent-views.ts central index)
    _views/             # AVL view registration helpers (home, math, all-gpus, all-models)
    gpu/[slug]/         # 40 GPU detail pages
    model/[slug]/       # 20 model detail pages
    the-math/           # the long-form explainer
  components/           # Nav, Footer, AvlBadge, Calculator
  lib/                  # vram math, gpus, quants, models, hf, fonts, avl
scripts/
  emit-agent-views.ts   # postbuild: writes out/<route>.agent + agent.txt
docs/handoff/           # Claude Design handoff bundle (reference, not built)
```

## AVL

Every page ships a parallel agent-readable view at `<route>.agent` and links to it via `<link rel="alternate" type="text/agent-view">` and the AVL badge in the footer.

`agent.txt` at the root lists every endpoint. Spec: https://agentviewlayer.org. Package: `@frontier-infra/avl`.

## License

MIT. See LICENSE.

## Credits

- Designed at claude.ai/design
- Built with Next.js 15
- Voice: Frontier Operations. The formula is the brand.
