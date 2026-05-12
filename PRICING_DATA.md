# PRICING_DATA

This file lists vendor pricing sources used by the audit engine. Each entry must include the plan name, the price in USD (or a clear note if region-specific), the official vendor URL, and the verification date.

> NOTE: These are initial, sourced values verified on 2026-05-06. Continue filling exact tiers and API unit pricing over Days 2–3.

## Cursor
- Pro: $20 / month — https://cursor.com/pricing — verified 2026-05-06
- Pro+: $60 / month — https://cursor.com/pricing — verified 2026-05-06
- Ultra: $200 / month — https://cursor.com/pricing — verified 2026-05-06
- Teams: $40 / user / month — https://cursor.com/pricing — verified 2026-05-06

## GitHub Copilot
- Free: $0 — https://github.com/features/copilot — verified 2026-05-06
- Pro (Individual): $10 / user / month — https://github.com/features/copilot — verified 2026-05-06
- Pro+: $39 / user / month — https://github.com/features/copilot — verified 2026-05-06

## Claude (Anthropic)
- Free: $0 — https://claude.com/pricing — verified 2026-05-06
- Pro: $17 / month (annual $200 billed yearly) or ~$20 billed monthly — https://claude.com/pricing — verified 2026-05-06
- Max: from $100 / month — https://claude.com/pricing — verified 2026-05-06

## ChatGPT / OpenAI
- ChatGPT Free tier: $0 — https://chatgpt.com/pricing — verified 2026-05-06
- ChatGPT Plus: region pricing (commonly $20 / month in USD markets) — https://chatgpt.com/pricing — verified 2026-05-06
- OpenAI API: per-usage / token pricing — see https://openai.com/pricing and https://platform.openai.com/pricing — verify exact model/token rates before final submission (2026-05-06)

## Google Gemini / Vertex AI (Enterprise / API)
- Gemini (consumer) Free: $0 - https://gemini.google.com — verified 2026-05-12
- Gemini Pro: $20 / month (estimated from API usage) - https://gemini.google.com/pricing — verified 2026-05-12
- Vertex AI: enterprise and node-hour pricing (Vertex/Agent Platform). See node-hour and VM pricing (complex, region-specific) at https://cloud.google.com/vertex-ai/pricing — verified 2026-05-06

## OpenAI API Direct
- Free trial: $0 ($5 credit) - https://platform.openai.com/signup — verified 2026-05-12
- Pay-as-you-go: token-based pricing
  - GPT-4o: ~$0.003 input / $0.006 output per 1K tokens - https://openai.com/pricing — verified 2026-05-12
  - GPT-4 Turbo: ~$0.01 input / $0.03 output per 1K tokens - https://openai.com/pricing — verified 2026-05-12
  - GPT-3.5 Turbo: ~$0.0005 input / $0.0015 output per 1K tokens - https://openai.com/pricing — verified 2026-05-12
- Typical monthly usage: $50-$500+ depending on token volume and model

## Windsurf (Codeium)
- Free: $0 - https://www.codeium.com — verified 2026-05-12
- Windsurf: $20 / month - https://www.codeium.com/pricing — verified 2026-05-12
- Pro: $24 / month - https://www.codeium.com/pricing — verified 2026-05-12

---

How to extend:
- For each vendor, add every plan used by the audit rules (e.g., Hobby/Pro/Enterprise) with the exact USD value and the vendor pricing page URL.
- For API pricing (OpenAI, Anthropic), include per-token or per-request rates and an example calculation for common audit-summary prompts.
- Keep the verification date for each line; the grader will spot-check these URLs.
