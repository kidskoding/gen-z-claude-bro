import { expect, test } from "bun:test";

test("bun run validate passes", () => {
  const proc = Bun.spawnSync(["bun", "scripts/validate.ts"], { cwd: `${import.meta.dir}/..` });
  expect(proc.stderr.toString()).toBe("");
  expect(proc.exitCode).toBe(0);
});
