# BytesBrains Cruise for Cursor

[BytesBrains Cruise](https://bytesbrains.com/cruise/) is one endpoint in front of every
model provider, with per-project keys, budgets that stop a runaway loop, and a ledger of
every request. This plugin brings Cruise's **read-only MCP tools** and setup guidance into
Cursor. It is **not** a model provider extension — Cursor has no API for that.

## What you get

| | |
|---|---|
| **MCP server `cruise`** | `list_models`, `get_budget`, `get_spend` for the key's own project. Works in the IDE and in Agent CLI |
| **Skill `cruise`** | Choosing a lane or pinned model, and what each Cruise refusal means |
| **Command `/cruise-setup`** | Guided setup: configure the key, confirm MCP, optionally walk through IDE BYOK |

## What you do not get

- **Agent CLI inference through Cruise.** Cursor Agent CLI has no BYOK / custom base URL.
  Those sessions stay on Cursor's models. The plugin still loads MCP tools there.
- **A picker that registers Cruise as a vendor.** For IDE chat/agent billing through Cruise,
  use Settings → Models (OpenAI key + override base URL + a Cruise model id). Paid plan
  required; Free refuses named models.

## Install

From the Cursor Marketplace once published, or locally while developing:

```sh
agent --plugin-dir /path/to/cruise-cursor-plugin/plugins/cruise
```

Then set **Cruise API key** under Plugins → Configure (and optionally the demo base URL).
Never put the key in a synced settings file.

Try without spending: set base URL to `https://cruise-demo.bytesbrains.net` and use a
`cru_demo_` key.

## IDE BYOK (separate from the plugin)

| Field | Value |
|---|---|
| **OpenAI API Key** | your `cru_` key |
| **Override OpenAI Base URL** | `https://cruise.bytesbrains.net/v1` |
| **Add model** | e.g. `bb/agentic-coding` from `list_models` |

Run `/cruise-setup` for the full walkthrough and caveats (override vs Cursor-owned models,
key scoping to lane members, Free plan).

## Licence

See [`plugins/cruise/LICENSE.txt`](plugins/cruise/LICENSE.txt). Published from the
`clients/cursor/` directory of BytesBrains Cruise.
