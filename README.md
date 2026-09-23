<p align="center">
  <a href="https://bytesbrains.com/cruise/"><img src="assets/cruise-logo.svg" alt="Cruise" width="360"></a>
</p>

# BytesBrains Cruise for Cursor

**Your Cruise account, inside Cursor.** Ask the agent what budget is left, what a project spent
this month, or which models your key can use. Get a plain explanation when Cruise refuses a
request.

[BytesBrains Cruise](https://bytesbrains.com/cruise/) is one endpoint in front of every model
provider, with per-project keys, budgets that stop a runaway loop, and a ledger of every request.
This plugin is for teams that already use Cruise and write code in Cursor.

> [!IMPORTANT]
> **This plugin does not make Cursor's chats run on Cruise.** Cursor's Agent CLI has no setting
> for a custom model key or endpoint, so every CLI chat runs on Cursor's models and uses your
> Cursor quota. The plugin cannot change that. If your Cursor quota runs out, it cannot keep you
> working on Cruise. For that, see [Running your agent on Cruise](#running-your-agent-on-cruise).

## What you get

| | |
|---|---|
| **MCP server `cruise`** | `list_models`, `get_budget`, `get_spend` for the key's own project. Works in the IDE and in Agent CLI |
| **Skill `cruise`** | Choosing a lane or pinned model, and what each Cruise refusal means (`budget_exhausted`, `wallet_exhausted`, `measurement_stale`, …) |
| **Command `/cruise-setup`** | Guided setup: configure the key, confirm MCP, optionally walk through IDE BYOK |

## How billing works

| What happens | Who charges |
|---|---|
| Chats and agent turns in **Agent CLI** | Cursor, always |
| Tab, inline edit, Auto and Cursor's own models in the **IDE** | Cursor, always |
| IDE chat with a Cruise model you added via [IDE BYOK](#ide-byok-optional) | Cruise. BYOK itself needs a paid Cursor plan |
| The plugin's MCP tools | They read your Cruise account and call no model. The results enter the chat, where Cursor counts them like any other text |

The Cruise key and base URL you give the plugin are used only to reach Cruise's MCP server. They
are never used for chat.

## Install

The plugin is distributed from this repository. It is not listed on the Cursor Marketplace.

**Agent CLI:** add this repository as a plugin marketplace, then install `cruise` from it:

```sh
agent plugin marketplace add https://github.com/bytesbrains/cruise-cursor-plugin
```

Start `agent`, run `/plugins`, and install **cruise** from the **bytesbrains** marketplace.

**Local copy** (for development, or to pin a checkout):

```sh
agent --plugin-dir /path/to/cruise-cursor-plugin/plugins/cruise
```

Then set **Cruise API key** under Plugins → Configure, and optionally the base URL. Never put
the key in a synced settings file. Run `/cruise-setup` to check that the MCP tools answer.

Try it without spending: set the base URL to `https://cruise-demo.bytesbrains.net` and use a
`cru_demo_` key. A `cru_live_` key only works against production, and a demo key only against
the demo.

## IDE BYOK (optional)

This is separate from the plugin. In **Cursor Settings → Models**:

| Field | Value |
|---|---|
| **OpenAI API Key** | your `cru_` key |
| **Override OpenAI Base URL** | `https://cruise.bytesbrains.net/v1` |
| **Add model** | e.g. `bb/agentic-coding` from `list_models` |

Then pick that model in the chat's model picker. Worth knowing:

- **Paid Cursor plan required.** Free plans refuse named custom models.
- **"This model does not support custom API keys"** means a Cursor-owned model (such as Auto) is
  selected while the override is on. Pick your Cruise model, or turn the key off to use Cursor's
  models.
- **"Invalid API key" / "Unauthorized User API key"** means Cruise did not accept what Cursor sent.
  Check that the key is pasted without spaces and that the base URL matches the key: production
  for `cru_live_`, demo for `cru_demo_`, with `/v1` on the end.
- **Cursor sends the request from its own servers**, so the key leaves your machine. Prefer a
  rate-limited key scoped to the models you use.
- **Tab and inline edit stay on Cursor** and never appear in the Cruise ledger.
- Whether Cursor keeps serving a custom model after your included usage runs out is Cursor's
  policy. Check it before you rely on it.

## Running your agent on Cruise

To bill agent work to Cruise, including when your Cursor quota is used up, use a coding agent
that lets you set the model endpoint:

- **Claude Code** with the [Cruise plugin for Claude Code](https://github.com/bytesbrains/cruise-claude-plugin).
- **Any agent that accepts an OpenAI-compatible base URL:** set the base URL to
  `https://cruise.bytesbrains.net/v1`, the key to your `cru_` key, and the model to a Cruise id
  such as `bb/agentic-coding`.

Every request then goes through Cruise's budgets and ledger. You can keep Cursor for the editor
and switch agents in the same repository when you need to.

## Development

This repository is the source of the plugin. Develop, test and release it here. A change is a
pull request here, and a bug or request is an issue here. `npm ci && npm test` runs the plugin's
contract tests. [`CONTRIBUTING.md`](CONTRIBUTING.md) covers the checks and how a release is cut.
To report a vulnerability, see [`SECURITY.md`](SECURITY.md).

## Licence

[Apache-2.0](LICENSE); see [`NOTICE`](NOTICE). The plugin carries the same text in
[`plugins/cruise/`](plugins/cruise/LICENSE.txt), because that directory is all an install copies.
The license covers this plugin's code only. The Cruise service is governed by the terms of service
of BytesBrains Pte. Ltd., and the BytesBrains and Cruise names are not licensed. Releases up to
v0.1.0 keep the licence they shipped with.
