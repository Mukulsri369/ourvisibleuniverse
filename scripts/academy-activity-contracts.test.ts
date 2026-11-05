import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { MODULE_COMPLETION_RULES } from "../src/lib/academy/completion-rules";

test("every static lesson activity submission remains accepted by its module's rule", async () => {
  const directory = new URL("../src/components/academy/", import.meta.url);
  let checked = 0;
  for (const filename of await readdir(directory)) {
    const moduleId = filename === "LessonLayout.tsx" ? "01" : filename.match(/^Module(\d{2})Layout\.tsx$/)?.[1];
    if (!moduleId) continue;
    const source = await readFile(new URL(filename, directory), "utf8");
    const activities = MODULE_COMPLETION_RULES[moduleId]?.requiredActivities ?? [];
    const allowed = new Set(activities.flatMap(activity => [activity.id, activity.validationKey, activity.accessibleAlternativeId].filter(Boolean)));
    for (const [, activityId] of source.matchAll(/activityId:\s*["']([^"']+)["']/g)) {
      assert.ok(allowed.has(activityId), `${filename} submits unknown module activity ${activityId}`);
      checked++;
    }
  }
  assert.equal(checked, 28, "All existing static lesson submissions must be covered");
});
