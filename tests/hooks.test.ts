import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const HOOKS = join(ROOT, "hooks");
const { detectMode } = require("../hooks/gen-z-mode-tracker.js");

let home: string;
const flag = () => join(home, ".claude", ".gen-z-active");

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), "gen-z-home-"));
});
afterEach(() => {
  rmSync(home, { recursive: true, force: true });
});

function run(cmd: string[], stdin = "") {
  const proc = Bun.spawnSync(cmd, {
    cwd: ROOT,
    env: { ...process.env, HOME: home, USERPROFILE: home },
    stdin: new TextEncoder().encode(stdin),
  });
  return { code: proc.exitCode, stdout: proc.stdout.toString(), stderr: proc.stderr.toString() };
}

const runtimes = ["bun", "node"].filter((bin) => Bun.which(bin));

describe("detectMode", () => {
  test.each([
    ["/bro", "full"],
    ["/bro lite", "lite"],
    ["/bro ULTRA", "ultra"],
    ["  /bro full  ", "full"],
    ["/bro lite explain closures", "lite"],
    ["/bro explain closures", "full"],
    ["/gen-z-claude-bro:bro ultra", "ultra"],
    ["/gen-z-claude-bro:bro", "full"],
    ["stop gen z", "off"],
    ["Normal mode.", "off"],
    ["stop gen z!", "off"],
  ])("%p -> %p", (prompt, mode) => {
    expect(detectMode(prompt)).toBe(mode);
  });

  test.each(["", "/brother", "how do I stop gen z mode in my app", "/bros lite", "please use normal mode later"])(
    "%p -> no change",
    (prompt) => {
      expect(detectMode(prompt)).toBeNull();
    },
  );
});

describe.each(runtimes)("hooks under %s", (runtime) => {
  test("activate writes full flag and injects skill without frontmatter", () => {
    const { code, stdout } = run([runtime, join(HOOKS, "gen-z-activate.js")]);
    expect(code).toBe(0);
    expect(readFileSync(flag(), "utf8")).toBe("full");
    expect(stdout).toContain("## Core Vocab");
    expect(stdout).not.toMatch(/^---/);
    expect(stdout).not.toContain("description: >");
  });

  test("activate nudges statusline only when it is missing", () => {
    mkdirSync(join(home, ".claude"), { recursive: true });
    writeFileSync(join(home, ".claude", "settings.json"), "{}");
    const nudge = run([runtime, join(HOOKS, "gen-z-activate.js")]).stdout;
    expect(nudge).toContain("statusline not configured");
    // The suggested snippet must be valid JSON when wrapped in braces
    const snippet = nudge.match(/`("statusLine".*?)`/)![1];
    expect(JSON.parse(`{${snippet}}`).statusLine.type).toBe("command");

    writeFileSync(join(home, ".claude", "settings.json"), JSON.stringify({ statusLine: { type: "command" } }));
    expect(run([runtime, join(HOOKS, "gen-z-activate.js")]).stdout).not.toContain("statusline not configured");
  });

  test("activate tolerates malformed settings.json", () => {
    mkdirSync(join(home, ".claude"), { recursive: true });
    writeFileSync(join(home, ".claude", "settings.json"), "{not json");
    expect(run([runtime, join(HOOKS, "gen-z-activate.js")]).code).toBe(0);
  });

  test("tracker switches intensity and turns off", () => {
    const tracker = join(HOOKS, "gen-z-mode-tracker.js");
    expect(run([runtime, tracker], JSON.stringify({ prompt: "/bro ultra" })).code).toBe(0);
    expect(readFileSync(flag(), "utf8")).toBe("ultra");

    run([runtime, tracker], JSON.stringify({ prompt: "what is a closure" }));
    expect(readFileSync(flag(), "utf8")).toBe("ultra");

    run([runtime, tracker], JSON.stringify({ prompt: "stop gen z" }));
    expect(existsSync(flag())).toBe(false);

    // Turning off twice is fine
    expect(run([runtime, tracker], JSON.stringify({ prompt: "normal mode" })).code).toBe(0);
  });

  test("tracker accepts pretty-printed JSON and silent-fails on garbage", () => {
    const tracker = join(HOOKS, "gen-z-mode-tracker.js");
    run([runtime, tracker], JSON.stringify({ session_id: "x", prompt: "/bro lite" }, null, 2));
    expect(readFileSync(flag(), "utf8")).toBe("lite");

    const bad = run([runtime, tracker], "not json at all");
    expect(bad.code).toBe(0);
    expect(bad.stderr).toBe("");
    expect(run([runtime, tracker], "").code).toBe(0);
  });
});

describe("run.sh launcher", () => {
  test("runs the hook with an available runtime", () => {
    const { code, stdout } = run(["bash", join(HOOKS, "run.sh"), join(HOOKS, "gen-z-activate.js")]);
    expect(code).toBe(0);
    expect(stdout).toContain("## Core Vocab");
  });

  test("exits 0 silently when no runtime is on PATH", () => {
    const proc = Bun.spawnSync([Bun.which("bash")!, join(HOOKS, "run.sh"), join(HOOKS, "gen-z-activate.js")], {
      env: { HOME: home, PATH: "/nonexistent" },
    });
    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString()).toBe("");
  });
});

describe("statusline", () => {
  const statusline = (mode?: string) => {
    if (mode !== undefined) {
      mkdirSync(join(home, ".claude"), { recursive: true });
      writeFileSync(flag(), mode);
    }
    return run(["bash", join(HOOKS, "gen-z-statusline.sh")]).stdout;
  };

  test("no flag -> no badge", () => expect(statusline()).toBe(""));
  test("full -> [GEN-Z]", () => expect(statusline("full")).toBe("[GEN-Z]"));
  test("ultra -> [GEN-Z:ULTRA]", () => expect(statusline("ultra")).toBe("[GEN-Z:ULTRA]"));
  test("lite -> [GEN-Z:LITE]", () => expect(statusline("lite")).toBe("[GEN-Z:LITE]"));
});

describe("install.sh / uninstall.sh", () => {
  test("round-trips into a clean HOME", () => {
    const install = run(["bash", join(HOOKS, "install.sh")]);
    expect(install.code).toBe(0);
    for (const f of ["gen-z-activate.js", "gen-z-mode-tracker.js", "gen-z-statusline.sh", "gen-z-run.sh"]) {
      expect(existsSync(join(home, ".claude", "hooks", f))).toBe(true);
    }
    expect(existsSync(join(home, ".claude", "skills", "bro", "SKILL.md"))).toBe(true);

    // Installed hook resolves the installed skill
    const activated = run(["bash", join(home, ".claude/hooks/gen-z-run.sh"), join(home, ".claude/hooks/gen-z-activate.js")]);
    expect(activated.stdout).toContain("## Core Vocab");

    const uninstall = run(["bash", join(HOOKS, "uninstall.sh")]);
    expect(uninstall.code).toBe(0);
    expect(existsSync(join(home, ".claude", "hooks", "gen-z-activate.js"))).toBe(false);
    expect(existsSync(join(home, ".claude", "skills", "bro"))).toBe(false);
    expect(existsSync(flag())).toBe(false);
  });
});
