---
name: cruise
description: Use when work goes through BytesBrains Cruise — choosing a model or lane, checking what is left in the budget or what a month cost, or explaining a Cruise refusal such as budget_exhausted, wallet_exhausted or measurement_stale.
---

# Working through BytesBrains Cruise

Cruise is one OpenAI-compatible gateway in front of every model provider. It holds
the provider keys, enforces a budget per project and a prepaid wallet per account,
and records every request in a cost ledger. The `cruise` MCP server in this plugin
reads the key's own project; it never changes anything.

## What this plugin does and does not do in Cursor

- **Does:** expose `list_models`, `get_budget` and `get_spend` over MCP in the IDE
  and in Agent CLI, and guide a paid IDE setup that points Models at Cruise.
- **Does not:** redirect Cursor Agent CLI inference through Cruise. The CLI has no
  BYOK / base-URL path; those runs stay on Cursor's models. Say so plainly if the
  user expects CLI traffic in the Cruise ledger.

## Choosing what to call (IDE BYOK)

- **A lane** is a model id that names a job — `bb/agentic-coding`, `bb/chat-assistant`,
  `bb/code-review`, `bb/summarization`, `bb/extraction`, `bb/translation`,
  `bb/deep-reasoning`, `bb/code-completion`. Cruise picks a member model per request,
  usually the cheapest that fits. Prefer a lane when the job matters more than the model.
- **A pinned model** (`provider/model`, e.g. `deepseek/deepseek-v4-flash`) when one
  specific model is required.
- Call the `list_models` tool (optionally `kind: "lanes"`) for what this key can
  actually reach. Use ids exactly as it returns them.

## Knowing what is left

- `get_budget` — the project's spend in its current period against its caps, and the
  account's wallet. **`action` is what the next request gets**: `serve` or `refuse`.
- `get_spend` — what a month cost, by model or by lane.

## Reading a refusal

Branch on `error.code`, never on the status — several are 429s that mean different things.

| Code | Means | What to do |
|---|---|---|
| `budget_exhausted` | The project's cap for this period is spent. Carries `retry-after` | Wait for the period to reset, or ask the project owner to raise the cap |
| `wallet_exhausted` | The account has no credit left. **No** `retry-after`: waiting does not help | A top-up or a credit grant; say so plainly rather than retrying |
| `measurement_stale` | The model's measurement aged out, so Cruise will not route it | Use a lane, or another model from `list_models` |
| `model_not_found` | No such model or lane, or nothing in the lane this key may reach | Check the id against `list_models` |
| `permission_error` (403) | The key is not scoped for that model | Pick a model the key reaches, or ask for a wider key |

## Never

- Never print, echo or write the Cruise key (`cru_…`). It lives in the plugin
  variable `CRUISE_API_KEY` (Plugins → Configure) and nowhere in chat or settings files.
- Never suggest retrying a `wallet_exhausted` refusal in a loop.
- Never claim Agent CLI is billed through Cruise while Cursor still owns that path.
