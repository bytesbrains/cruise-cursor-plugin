---
name: setup
description: Set up BytesBrains Cruise in Cursor — configure the key for MCP, confirm the server answers, and with the user's consent walk through IDE BYOK so chat and agent can use Cruise models. Does not redirect Agent CLI inference.
disable-model-invocation: true
---

# Set up BytesBrains Cruise in Cursor

Walk the user through these steps in order. **Ask before changing any file**, show what
will change, and never print, repeat or write the Cruise key (`cru_…`). If the user
pastes a key into the conversation, do not echo it back; tell them to keep it in
Plugins → Configure (or their secret manager) instead.

## 1. The key (plugin variable)

The MCP server reads `CRUISE_API_KEY` and optional `CRUISE_BASE_URL` from this
plugin's variables — set under **Plugins → Configure** after install, not in a
settings JSON file Cursor might sync.

If the tools are missing or answer 401:

- get a key from their Cruise dashboard (or from whoever runs their Cruise account),
  ideally rate-limited and scoped to the models they will use;
- set **Cruise API key** on the plugin; leave base URL at production, or set
  `https://cruise-demo.bytesbrains.net` with a `cru_demo_` key for the free demo;
- reload the window / restart Agent CLI so MCP picks up the variables, then run
  `/cruise-setup` again.

## 2. The MCP server

Call the `cruise` MCP server's `get_budget` tool. If it answers with a project name,
this half works — in the IDE and in Agent CLI alike.

If it fails:

- **401 / incorrect key:** wrong key, revoked key, or demo key against production
  (or the reverse). Check `CRUISE_BASE_URL` against the key's `cru_demo_` / `cru_live_`
  prefix.
- **Server not listed:** the plugin is not installed or MCP is disabled. Check
  `agent mcp list` in the CLI, or MCPs in Customize in the IDE.

## 3. Route the IDE through Cruise (optional — ask first; paid plan required)

Explain before asking:

- This only affects **Cursor IDE** chat and agent when a **named** custom model is
  selected. Free plans refuse named models; Auto never hits the override.
- Cursor sends from its backend, so the Cruise key leaves the machine. Prefer a
  rate-limited key scoped to **lane members**, not the lane id (#382).
- While Override OpenAI Base URL is on, Cursor-provided models often break; Tab and
  inline edit stay on Cursor regardless and never appear in the Cruise ledger.
- **Agent CLI does not use these fields.** CLI inference stays on Cursor. This step
  will not put CLI sessions in the ledger.

If the user agrees, tell them to open **Cursor Settings → Models** and set:

| Field | Value |
|---|---|
| **OpenAI API Key** | their Cruise key (same as the plugin variable) |
| **Override OpenAI Base URL** | `{CRUISE_BASE_URL}/v1` — with `/v1`; Cursor appends `/chat/completions` |
| **Add model** | a Cruise id from `list_models`, e.g. `bb/agentic-coding` |

Do **not** write these into a settings file yourself unless the user explicitly asks
and you know their Cursor version's config shape. Prefer the Settings UI.

Rehearse on the demo first when they have not spent before.

## 4. Finish

Summarise exactly what they configured (MCP only vs MCP + IDE BYOK), what will and
will not appear in the Cruise ledger, and how to undo: clear the Models override,
and remove or disable the plugin / its variables.
