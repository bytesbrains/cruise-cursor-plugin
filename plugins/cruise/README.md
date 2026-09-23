# BytesBrains Cruise for Cursor

[BytesBrains Cruise](https://bytesbrains.com/cruise/) is one endpoint in front of every
model provider, with per-project keys, budgets that stop a runaway loop, and a ledger of
every request. This Cursor plugin loads Cruise's read-only MCP tools and a guided setup.
It does **not** redirect Cursor Agent CLI inference through Cruise — Cursor has no BYOK
path for the CLI — and it is not a VS Code-style language-model provider.

## Install

From the Cursor Marketplace (once listed), or while developing from this tree:

```sh
agent --plugin-dir ./plugins/cruise
```

Set **Cruise API key** under Plugins → Configure. Optional **Cruise base URL** defaults to
production; use `https://cruise-demo.bytesbrains.net` with a `cru_demo_` key for the demo.

Then run **`/cruise-setup`**.

## What is inside

| | |
|---|---|
| **MCP `cruise`** | `list_models`, `get_budget`, `get_spend` — same remote server as Claude Code |
| **Skill `cruise`** | Lanes, spend, and Cruise refusal codes |
| **`/cruise-setup`** | Key + MCP check, then optional IDE Models BYOK (paid plan) |

## Worth knowing

- **IDE BYOK** is Settings → Models (OpenAI key + base URL `/v1` + a Cruise model id). The
  plugin guides it; it cannot register models into Cursor's picker by itself.
- **Agent CLI** gets the MCP tools only. Inference stays on Cursor until they add BYOK.
- The plugin never stores your key in the repo or in a synced settings file — only the
  plugin variable `CRUISE_API_KEY`.

## Licence

[Apache-2.0](LICENSE.txt); see [`NOTICE`](NOTICE). The license covers this plugin's code only.
The Cruise service is governed by the terms of service of BytesBrains Pte. Ltd., and the BytesBrains
and Cruise names are not licensed. Releases up to v0.1.0 keep the licence they shipped with.
