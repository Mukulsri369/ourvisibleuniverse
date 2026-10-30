import { evaluateCompletion } from "./academy-completion.server";
import { z } from "zod";
import { transaction } from "./db.server";
import type { Principal } from "./authorization.server";
import type { PoolConnection } from "mysql2/promise";

import { lessonProgressInput } from "../lib/academy/lesson-progress-inputs";

async function verifiedIdentity(connection: PoolConnection, principal: Principal | null) {
  if (!principal?.emailVerified) throw new Error("Verified student account required");
  // Serialize updates per learner and recheck verification in the database.
  const [rows]: any = await connection.execute(
    "SELECT id FROM auth_user WHERE id=? AND emailVerified=true FOR UPDATE",
    [principal.id],
  );
  if (!rows.length) throw new Error("Verified student account required");
  return principal.id;
}

export async function saveLessonProgress(principal: Principal | null, input: unknown) {
  const data = lessonProgressInput.parse(input);
  return transaction(async (connection) => {
    const userId = await verifiedIdentity(connection, principal);
    const [lessons]: any = await connection.execute(
      "SELECT id FROM academy_lessons WHERE id=? AND module_id=?",
      [data.lessonId, data.moduleId],
    );
    if (!lessons.length)
      throw new z.ZodError([
        {
          code: "custom",
          path: ["lessonId"],
          message: "Lesson does not belong to this module",
        },
      ]);
    await connection.execute(
      `INSERT INTO academy_lesson_progress
      (user_id,module_id,lesson_id,scroll_depth_percent,time_spent_seconds,is_bookmarked)
      VALUES(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE
      scroll_depth_percent=GREATEST(scroll_depth_percent,VALUES(scroll_depth_percent)),
      time_spent_seconds=GREATEST(time_spent_seconds,VALUES(time_spent_seconds)),
      is_bookmarked=IF(?,VALUES(is_bookmarked),is_bookmarked),last_accessed_at=CURRENT_TIMESTAMP(6)`,
      [
        userId,
        data.moduleId,
        data.lessonId,
        data.scrollDepthPercent,
        data.timeSpentSeconds,
        data.isBookmarked ?? false,
        data.isBookmarked !== undefined,
      ],
    );
    // Reading telemetry is unverified. It cannot award a quiz pass, completion or certificate.
    await connection.execute(
      `INSERT INTO academy_module_progress
      (user_id,module_id,status,percent,time_spent_seconds)
      SELECT ?,?, 'in_progress',MAX(scroll_depth_percent),SUM(time_spent_seconds)
      FROM academy_lesson_progress WHERE user_id=? AND module_id=?
      ON DUPLICATE KEY UPDATE percent=GREATEST(percent,VALUES(percent)),
      time_spent_seconds=GREATEST(time_spent_seconds,VALUES(time_spent_seconds)),
      status=IF(status='not_started','in_progress',status),updated_at=CURRENT_TIMESTAMP(6)`,
      [userId, data.moduleId, userId, data.moduleId],
    );
    await evaluateCompletion(connection, userId, data.moduleId);
    return { success: true as const };
  });
}

export function getLessonProgress(principal: Principal | null) {
  return transaction(async (connection) => {
    const userId = await verifiedIdentity(connection, principal);
    const [rows]: any = await connection.execute(
      `SELECT module_id,lesson_id,scroll_depth_percent,
      time_spent_seconds,is_bookmarked,last_accessed_at FROM academy_lesson_progress
      WHERE user_id=? ORDER BY module_id,lesson_id`,
      [userId],
    );
    return {
      lessons: rows.map((row: any) => ({
        ...row,
        is_bookmarked: Boolean(row.is_bookmarked),
        last_accessed_at: new Date(row.last_accessed_at).toISOString(),
      })),
    };
  });
}
