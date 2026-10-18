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

export const synthesizeSegmentAudio = createServerFn({ method: "POST" })
  .validator(
    (input: {
      courseVersion?: string;
      moduleId: string;
      segmentId: string;
      spokenText: string;
      language?: string;
      voiceName?: "Kore" | "Puck" | "Fenrir" | "Zephyr" | "Charon";
      model?: "gemini-3.8-flash-lite-tts" | "gemini-3.8-flash-tts";
    }) => input,
  )
  .handler(async ({ data }) => {
    const { AIServiceProviderServer } = await import("./AIServiceProvider.server");
    return AIServiceProviderServer.synthesizeNarrationSegmentAudio(data);
  });

export const converseWithCosmos = createServerFn({ method: "POST" })
  .validator((input: { question: string; context: any }) => input)
  .handler(async ({ data }) => {
    const { AIServiceProviderServer } = await import("./AIServiceProvider.server");
    return AIServiceProviderServer.answerConversationalTurn(data.question, data.context);
  });

export const createLiveSession = createServerFn({ method: "POST" })
  .validator((input: { moduleId: string; userId?: string }) => input)
  .handler(async ({ data }) => {
    const { AIServiceProviderServer } = await import("./AIServiceProvider.server");
    return AIServiceProviderServer.createLiveSession(data);
  });
