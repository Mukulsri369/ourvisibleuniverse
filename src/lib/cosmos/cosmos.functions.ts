/**
 * COSMOS Server Functions
 * Project: Our Visible Universe Academy
 *
 * Exposes server-side COSMOS endpoints for student inquiry and contextual resolution.
 * The permanent GEMINI_API_KEY is completely isolated on the server.
 */

import { createServerFn } from "@tanstack/react-start";
import type { CosmosAnswer, StudentQuestionContext } from "./cosmos-types";

export const askCosmosQuestion = createServerFn({ method: "POST" })
  .validator((input: { question: string; context: StudentQuestionContext }) => input)
  .handler(async ({ data }) => {
    const { AIServiceProviderServer } = await import("./AIServiceProvider.server");
    return AIServiceProviderServer.answerStudentQuestion(data.question, data.context);
  });

export const getCosmosModuleContext = createServerFn({ method: "GET" })
  .validator(
    (input: {
      moduleId: string;
      sublessonId?: string;
      level?: "junior" | "explorer" | "astronomer";
    }) => input,
  )
  .handler(async ({ data }) => {
    const { StudentQuestionContextManager } = await import("./StudentQuestionContext");
    return StudentQuestionContextManager.buildContext({
      moduleId: data.moduleId,
      sublessonId: data.sublessonId,
      learningLevel: data.level || "explorer",
    });
  });
