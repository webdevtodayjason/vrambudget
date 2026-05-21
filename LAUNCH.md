# Launch X thread — copy / paste / iterate

Draft for the @argentAIOS launch thread. Eight tweets, plus one optional pinned tweet for the profile.

Notes:
- No em dashes (voice rule).
- Numbers in monospace where possible (X doesn't render mono natively; just use the digits cleanly).
- Each `/calc?...` URL renders its own dynamic OG card, so the link previews carry the actual configuration the recipient will land on.
- Replace `__SCREENSHOT__` placeholders with the actual social card screenshot you grab from the live site.

---

## Tweet 1 (the hook)

> Just shipped vrambudget.com — a calculator for local LLM memory budgets.
>
> The formula is:
>
>   VRAM ≈ params × (bits ÷ 8)
>
> Every other "can I run this LLM" tool lists models. This one shows the math, then the models.
>
> 🧵
>
> [optionally attach the home OG card image]

## Tweet 2 (the problem)

> A 24GB card is not 24GB of weights budget.
>
> By the time you've paid the KV cache, framework overhead, and a sane safety margin, you have around 18GB. The site shows that math in plain text — no magic numbers.

## Tweet 3 (the share / virality)

> Every URL on /calc captures the full state. So
>
> vrambudget.com/calc?gpu=4090&ctx=32k&conc=4
>
> opens directly on that exact computation. DM it to a friend, drop it in Discord, paste it in Slack — they land on the answer.

## Tweet 4 (the catalog scope)

> Catalog at launch:
>
> 42 GPU presets — RTX 30/40/50, Apple Silicon M2/M3/M4/M5, A6000, H100/H200/B200, MI300X, Gaudi 3
> 30 curated models — Llama 3.x, Qwen 3/3.5/3.6, DeepSeek V3/R1, gpt-oss 20B/120B, Phi-4, Gemma 4, Mistral Small 3
> 5 hosting runtimes — Ollama, LM Studio, vLLM, MLX, oMLX

## Tweet 5 (a real config to share)

> Quick example. Want to run Llama 3.3 70B on a single GPU?
>
> RTX 4090 / 24GB / 8K ctx: budget is 18 GB → 70B fits at Q3, tight at Q4
>
> vrambudget.com/gpu/rtx-4090
>
> [attach the /gpu/rtx-4090 OG screenshot if you want the visual]

## Tweet 6 (open-source / no-ads stake)

> Open source, MIT licensed, no ads, no tracking pixels beyond GA.
>
> Every page also ships a parallel agent-readable view at <path>.agent (AVL L3 conformant) so agents can drive the calculator over HTTP without parsing HTML.
>
> github.com/webdevtodayjason/vrambudget

## Tweet 7 (community ask)

> The catalog is opinionated and the formulas are first-order approximations. If you have better data — real tokens/sec on real hardware, math corrections, missing models — drop a comment on the relevant page:
>
> github.com/webdevtodayjason/vrambudget/discussions
>
> The discussion threads are pinned per-page.

## Tweet 8 (the close + reshare ask)

> Built solo over the last few days. Day-one numbers are zero across the board.
>
> If this is useful to you, the most helpful thing you can do is share it. The URL carries the answer; a screenshot of an OG card carries the story.
>
> vrambudget.com

---

## Optional pinned tweet (profile-level)

> 📌 Building vrambudget.com
>
> The calculator I wish existed when I bought my last GPU. Shows the math before listing the models.
>
> Try yours: vrambudget.com/calc

---

## Things to swap before posting

1. **Verify Railway URL** — if `vrambudget.com` DNS isn't pointing yet, use the `.up.railway.app` URL in the thread and update once the domain swaps.
2. **OG card screenshots** — grab fresh ones from `https://vrambudget.com/api/og/calc?gpu=...` and attach to the tweets that benefit from a visual.
3. **GA-tracked UTMs** — if you want to track which tweet pulled the most traffic, append `?utm_source=x&utm_medium=tweet&utm_campaign=launch&utm_content=tweet-3` etc. The dynamic OG handler strips unknown params so the cards still render correctly.
4. **Reply-thread strategy** — after posting, reply to your own thread 12-24 hours later with a "what people are running" recap based on early Discussion activity.

## Cross-post checklist

- X (this thread)
- LinkedIn (compressed version of tweets 1, 4, 6, 8)
- HackerNews ("Show HN: vrambudget — the math behind local LLM memory budgets")
- Reddit r/LocalLLaMA (tweet 5's example is the lede; link the calculator URL)
- Reddit r/MachineLearning (lean on tweet 6's "agent-readable view" angle)
- Substack post (long-form: the design philosophy + the AVL backstory)
- Dev.to and Medium (tutorial format: "Building a static + dynamic Next.js 15 site for AI hosting")
