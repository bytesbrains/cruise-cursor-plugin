// The Cursor plugin: what gets published, held before it is.
//
// JSON and Markdown only, so what is worth testing is the contract each file
// makes — marketplace and manifest agree, MCP uses plugin variables and never
// a baked-in key, skills say when they apply, and setup refuses to claim CLI
// inference goes through Cruise.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.join(import.meta.dirname, "..");
const PLUGIN = path.join(ROOT, "plugins/cruise");
const json = (file: string) => JSON.parse(readFileSync(path.join(ROOT, file), "utf8")) as Record<string, any>;

/**
 * Every file git would publish: tracked, or new and not ignored. An ignored
 * file such as a local .env never leaves the machine, so it is not checked.
 * Test plumbing is excluded.
 */
function published(): string[] {
  return execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" })
    .split("\0")
    .filter((file) => file && !file.startsWith("test/") && existsSync(path.join(ROOT, file)))
    .map((file) => path.join(ROOT, file));
}

describe("the manifest and the marketplace", () => {
  it("name one plugin, found where the marketplace says", () => {
    const manifest = json("plugins/cruise/.cursor-plugin/plugin.json");
    const marketplace = json(".cursor-plugin/marketplace.json");

    expect(manifest.name).toBe("cruise");
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(marketplace.plugins).toHaveLength(1);
    expect(marketplace.plugins[0]).toMatchObject({ name: "cruise", source: "./plugins/cruise" });
    // One version, in plugin.json: set in both, the two drift.
    expect(marketplace.plugins[0]).not.toHaveProperty("version");
    // package.json carries one too, for npm; it follows the manifest.
    expect(json("package.json").version).toBe(manifest.version);
  });

  it("declares CRUISE_API_KEY as a required plugin variable", () => {
    const manifest = json("plugins/cruise/.cursor-plugin/plugin.json");
    expect(manifest.variables).toMatchObject({
      type: "object",
      required: ["CRUISE_API_KEY"],
      properties: {
        CRUISE_API_KEY: { type: "string" },
        CRUISE_BASE_URL: {
          type: "string",
          default: "https://cruise.bytesbrains.net",
        },
      },
    });
  });
});

describe("the MCP server config", () => {
  it("reads the key and the base URL from plugin variables", () => {
    const server = json("plugins/cruise/mcp.json").mcpServers.cruise;
    expect(server).toEqual({
      url: "${CRUISE_BASE_URL}/mcp",
      headers: { Authorization: "Bearer ${CRUISE_API_KEY}" },
    });
  });

  // A published artifact holding a key is a leaked key.
  it("carries no Cruise credential in any published file", () => {
    for (const file of published()) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/cru_(live|test|demo|svc)_[A-Za-z0-9]{8,}/);
    }
  });
});

describe("the skills and the setup command", () => {
  it("each skill says when it applies, and setup runs only when asked", () => {
    const skills = readdirSync(path.join(PLUGIN, "skills"));
    expect(skills.sort()).toEqual(["cruise", "setup"]);
    for (const skill of skills) {
      const text = readFileSync(path.join(PLUGIN, "skills", skill, "SKILL.md"), "utf8");
      const front = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
      expect(front, skill).toMatch(new RegExp(`^name: ${skill}$`, "m"));
      expect(front, skill).toMatch(/^description: .{40,}$/m);
    }
    expect(readFileSync(path.join(PLUGIN, "skills/setup/SKILL.md"), "utf8")).toMatch(
      /^disable-model-invocation: true$/m,
    );
  });

  it("ships a /cruise-setup command that points at the setup skill", () => {
    const text = readFileSync(path.join(PLUGIN, "commands/setup.md"), "utf8");
    const front = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
    expect(front).toMatch(/^name: cruise-setup$/m);
    expect(text).toMatch(/skills\/setup\/SKILL\.md/);
  });

  it("says Agent CLI inference is not redirected through Cruise", () => {
    const setup = readFileSync(path.join(PLUGIN, "skills/setup/SKILL.md"), "utf8");
    const cruise = readFileSync(path.join(PLUGIN, "skills/cruise/SKILL.md"), "utf8");
    const readme = readFileSync(path.join(PLUGIN, "README.md"), "utf8");
    for (const [name, text] of [
      ["setup", setup],
      ["cruise", cruise],
      ["readme", readme],
    ] as const) {
      expect(text, name).toMatch(/Agent CLI/i);
      expect(text, name).toMatch(/does not|not redirect|stay|stays|no BYOK/i);
    }
  });
});
