/**
 * COSMOS AIServiceProvider (Server-Side)
 * Project: Our Visible Universe Academy
 * Scope: Prompt 12 Server-Side AI Grounding & Epistemic Boundaries
 *
 * Implements server-side Gemini 3.8 Flash integration.
 * The permanent GEMINI_API_KEY is NEVER exposed to the browser.
 */

import { GoogleGenAI } from "@google/genai";
import type {
  ConversationalTurnContext,
  CosmosAnswer,
  CosmosAudioSynthesisResult,
  CosmosForbiddenAction,
  CosmosLiveSessionToken,
  CosmosVoiceName,
  EpistemicStatus,
  StudentQuestionContext,
} from "./cosmos-types";
import { COSMOS_FORBIDDEN_ACTIONS } from "./cosmos-types";

// Security check for unauthorized system actions
function detectForbiddenActionAttempt(question: string): CosmosForbiddenAction | null {
  const q = question.toLowerCase();

  // Check exact canonical forbidden action names and space-separated versions
  for (const action of COSMOS_FORBIDDEN_ACTIONS) {
    const spaceForm = action.replace(/_/g, " ");
    if (q.includes(spaceForm) || q.includes(action)) {
      return action;
    }
  }

  if (
    q.includes("complete this module for me") ||
    q.includes("set progress to 100") ||
    q.includes("mark complete")
  ) {
    return "mark_module_complete";
  }
  if (
    q.includes("change my quiz score") ||
    q.includes("give me 100%") ||
    q.includes("change score") ||
    q.includes("fake score")
  ) {
    return "change_quiz_score";
  }
  if (q.includes("give me the badge") || q.includes("unlock achievement")) {
    return "award_badge";
  }
  if (
    q.includes("generate certificate") ||
    q.includes("issue my certificate") ||
    q.includes("give me certificate without exam")
  ) {
    return "issue_certificate";
  }
  if (
    q.includes("change database") ||
    q.includes("grant admin") ||
    q.includes("make me admin") ||
    q.includes("sql injection")
  ) {
    return "modify_database_permissions";
  }
  if (
    q.includes("what is the answer to question") ||
    q.includes("tell me the correct answer to the exam") ||
    q.includes("cheat on exam")
  ) {
    return "reveal_exam_answers";
  }

  return null;
}

/**
 * Builds the epistemic system prompt for COSMOS.
 */
function buildSystemPrompt(context: StudentQuestionContext): string {
  const levelDescriptions = {
    junior:
      "Classes 1–3 (Ages 6–9). Use warm, clear, vivid language, tangible real-world analogies, and relatable metaphors. Avoid technical jargon without immediate friendly explanation.",
    explorer:
      "Classes 4–6 (Ages 9–12). Use enthusiastic, scientifically accurate concepts, observational reasoning, and guided experiments.",
    astronomer:
      "Classes 7–10 (Ages 12–16). Use rigorous astrophysics principles, mathematical relationships, thermodynamic limits, and peer-reviewed citations.",
  };

  return `You are COSMOS, the official AI Astronomy Teaching Companion for Our Visible Universe Academy.

CURRENT PEDAGOGICAL CONTEXT:
- Course: Cosmic Journey (v1.0.0)
- Module: ${context.moduleNumber}. ${context.moduleTitle}
- Active Scientific Topic: ${context.scientificTopic}
- Active Lesson: ${context.lessonTitle}
- Target Learner Tier: ${context.learningLevel.toUpperCase()} — ${levelDescriptions[context.learningLevel]}
- Currently Displayed Instructional Text:
"""
${context.currentDisplayText}
"""
- Approved Learning Objectives:
${context.approvedLearningObjectives.map((o) => `  * ${o}`).join("\n")}
- Key Terminology: ${context.relevantTerminology.join(", ")}
- Approved Academic References:
${context.scientificReferences.map((r) => `  * ${r}`).join("\n")}

STRICT BEHAVIORAL & EPISTEMIC RULES:
1. GROUNDING: Anchor your answers in the approved course material and scientific consensus (NASA, ESA, IAU, STScI, ALMA, EHT).
2. EPISTEMIC ACCURACY: Clearly distinguish among:
   - [FACT]: Empirically verified observation or measured constant.
   - [MODEL]: Mathematical or computational framework (e.g., General Relativity, Stellar Evolution tracks, ΛCDM).
   - [HYPOTHESIS]: Plausible proposed mechanism (e.g., specific dark matter candidates, primordial black holes).
   - [UNCERTAINTY]: Quantified error bar or active scientific debate (e.g., Hubble tension, nuclear EOS at supranuclear densities).
3. AGE ADAPTATION: Speak naturally to the student at their chosen learning level.
4. AUTHORITY CONSTRAINTS: You CANNOT modify student records, mark modules complete, alter quiz scores, award badges, or change database roles.
5. EXAMINATION MODE: If the student is taking an examination or asks for direct answers to graded quizzes, you MUST REFUSE to give the answers, encouraging them to review lesson concepts instead.
6. FORMATTING: Provide a clear, engaging explanation, a brief epistemic classification, 1-2 suggested follow-up questions, and appropriate scientific references.`;
}

/**
 * High-fidelity grounded scientific fallback generator used when
 * GEMINI_API_KEY is not set or in offline test environments.
 */
function generateScientificFallbackAnswer(
  question: string,
  context: StudentQuestionContext,
): CosmosAnswer {
  const q = question.toLowerCase();
  const level = context.learningLevel;

  // Check forbidden actions
  const forbidden = detectForbiddenActionAttempt(question);
  if (forbidden) {
    return {
      answerText: `As COSMOS, I am an educational guide and cannot perform administrative actions such as "${forbidden.replace(/_/g, " ")}". All module completions, quiz scores, and certificate issuances require authoritative server-side verification through your own coursework.`,
      epistemicClassification: "fact",
      epistemicNote: "Administrative Boundary Rule",
      scientificSources: [
        {
          title: "Our Visible Universe Academy Academic Integrity Policy",
          organization: "Our Visible Universe",
        },
      ],
      suggestedFollowUpQuestions: [
        "What are the core concepts covered in this lesson?",
        "Can you explain the main scientific idea here?",
      ],
      learningLevelAdapted: level,
    };
  }

  // Check Examination Mode
  if (context.activeExamAttempt || q.includes("answer to question") || q.includes("exam answer")) {
    return {
      answerText:
        "As COSMOS, I cannot provide direct answers or solutions during an active knowledge assessment or examination. You can review the lesson material or ask about underlying physical concepts after completing your attempt!",
      epistemicClassification: "fact",
      epistemicNote: "Examination Integrity Rule",
      scientificSources: [
        {
          title: "Cosmic Explorer Examination Protocol",
          organization: "Our Visible Universe Academy",
        },
      ],
      suggestedFollowUpQuestions: [
        "How does the underlying physical principle work?",
        "Where can I find this topic in the lesson text?",
      ],
      isExamRestricted: true,
      learningLevelAdapted: level,
    };
  }

  // Module 01 specific queries
  if (context.moduleId === "01") {
    if (q.includes("space") && (q.includes("what") || q.includes("empty"))) {
      if (level === "junior") {
        return {
          answerText:
            "Space is the huge, silent ocean where planets, moons, and stars float! Unlike Earth, there is no air to breathe in space and no sound at all. It begins about 100 kilometers above our heads, where Earth's blanket of air ends.",
          epistemicClassification: "fact",
          epistemicNote: "Empirically measured atmospheric boundary (Kármán line)",
          scientificSources: [
            { title: "NASA Solar System Exploration: What is Space?", organization: "NASA" },
          ],
          suggestedFollowUpQuestions: [
            "Why is the sky blue on Earth but black in space?",
            "How do astronauts talk if sound cannot travel in space?",
          ],
          visualizationAction: {
            sceneId: "solar_system",
            targetObject: "Earth",
            cameraAction: "focus",
            scaleRegime: "planetary",
          },
          learningLevelAdapted: level,
        };
      }
      return {
        answerText:
          "Space is a dynamic four-dimensional spacetime continuum shaped by mass and energy according to General Relativity. Although often called a vacuum, deep space contains sparse hydrogen atoms (about 1 per cubic centimeter in interstellar space), cosmic microwave background radiation (2.7 Kelvin), and quantum field fluctuations that produce virtual particle pairs.",
        epistemicClassification: "model",
        epistemicNote: "Quantum Field Theory & General Relativity models",
        scientificSources: [
          { title: "General Relativity and Relativistic Cosmology", organization: "IAU" },
        ],
        suggestedFollowUpQuestions: [
          "What is the Casimir effect?",
          "How does dark energy affect the expansion of space?",
        ],
        visualizationAction: {
          sceneId: "cosmic_scale",
          targetObject: "Observable Universe",
          cameraAction: "zoom_out",
          scaleRegime: "cosmological",
        },
        learningLevelAdapted: level,
      };
    }

    if (q.includes("barred spiral") || (q.includes("bar") && q.includes("spiral"))) {
      if (level === "junior") {
        return {
          answerText:
            "A barred spiral galaxy is a giant star city that has a straight central bar of bright stars across its middle, with pretty swirling spiral arms curling off the ends of the bar, just like our Milky Way!",
          epistemicClassification: "fact",
          epistemicNote: "Observed galaxy morphology (Hubble-de Vaucouleurs classification)",
          scientificSources: [
            { title: "Hubble Galaxy Classification: Barred Spirals", organization: "NASA / STScI" },
          ],
          suggestedFollowUpQuestions: [
            "Are there other types of galaxies?",
            "How many stars are in a barred spiral galaxy?",
          ],
          visualizationAction: {
            sceneId: "milky_way",
            targetObject: "Milky Way",
            cameraAction: "orbit",
            scaleRegime: "galactic",
          },
          learningLevelAdapted: level,
        };
      }
      return {
        answerText:
          "A barred spiral galaxy features a prominent central bar-shaped structure of stars and interstellar gas extending through the galactic nucleus. Unlike ordinary spiral galaxies where arms wind directly from the core, the spiral arms of a barred spiral emerge exclusively from the ends of the central bar. Dynamic density wave models show the bar acts as a gravitational stirrer, funneling gas inward toward the core to trigger intense starbursts and feed central supermassive black holes. The Milky Way is classified as an SB(rs)bc barred spiral.",
        epistemicClassification: "model",
        epistemicNote: "Stellar dynamics and density wave simulations verified by Gaia DR3 and Spitzer photometry",
        scientificSources: [
          {
            title: "Structure and Kinematics of the Milky Way Bar",
            organization: "Bland-Hawthorn & Gerhard, ARA&A 2016",
          },
          { title: "Spitzer Infrared Survey of Barred Galaxies", organization: "NASA / JPL-Caltech" },
        ],
        suggestedFollowUpQuestions: [
          "How long does it take for a galactic bar to form?",
          "Does Andromeda also have a central bar?",
        ],
        visualizationAction: {
          sceneId: "milky_way",
          targetObject: "Milky Way",
          cameraAction: "orbit",
          scaleRegime: "galactic",
        },
        learningLevelAdapted: level,
      };
    }

    if (q.includes("earth") || q.includes("home")) {
      return {
        answerText:
          "Earth is our home planet, uniquely positioned in the Sun's habitable zone where liquid water can persist on the surface. Its swirling liquid iron outer core generates a protective magnetic shield (magnetosphere) that deflects harmful solar wind particles, while active plate tectonics constantly cycles carbon to stabilize our climate.",
        epistemicClassification: "fact",
        epistemicNote: "Observed planetary characteristics and geological evidence",
        scientificSources: [{ title: "NASA Planetary Fact Sheet: Earth", organization: "NASA" }],
        suggestedFollowUpQuestions: [
          "What creates the Northern Lights (Auroras)?",
          "How fast is Earth moving around the Sun?",
        ],
        visualizationAction: {
          sceneId: "solar_system",
          targetObject: "Earth",
          cameraAction: "focus",
          scaleRegime: "planetary",
        },
        learningLevelAdapted: level,
      };
    }
  }

  // Module 14 specific queries (Black Holes)
  if (context.moduleId === "14") {
    if (q.includes("black hole") || q.includes("event horizon") || q.includes("gravity")) {
      if (level === "junior") {
        return {
          answerText:
            "A black hole is a place in space where gravity is squished so strong that nothing—not even the fastest light in the universe—can escape! Imagine taking a huge giant star and packing all of it into a tiny ball; its pull becomes so powerful that it creates a cosmic one-way door called the event horizon.",
          epistemicClassification: "fact",
          epistemicNote: "Confirmed by Event Horizon Telescope images of M87* and Sagittarius A*",
          scientificSources: [
            { title: "First Image of a Black Hole", organization: "Event Horizon Telescope (EHT)" },
          ],
          suggestedFollowUpQuestions: [
            "What would happen if you got too close to a black hole?",
            "Can a black hole suck up the whole universe?",
          ],
          visualizationAction: {
            sceneId: "black_hole_lensing",
            targetObject: "Sagittarius A*",
            cameraAction: "orbit",
            scaleRegime: "stellar",
          },
          learningLevelAdapted: level,
        };
      }
      return {
        answerText:
          "A black hole forms when a massive stellar core collapses within its Schwarzschild radius (r_s = 2GM/c^2), where escape velocity equals the speed of light. General relativity shows that inside the event horizon, all timelike geodesics terminate at a central gravitational singularity. Surrounding infalling matter forms a superheated accretion disk that emits intense X-rays and undergoes extreme relativistic gravitational lensing.",
        epistemicClassification: "model",
        epistemicNote: "General Relativity Kerr-Schwarzschild solution",
        scientificSources: [
          {
            title: "First Sagittarius A* Event Horizon Telescope Results",
            organization: "EHT Collaboration, ApJL 2022",
          },
        ],
        suggestedFollowUpQuestions: [
          "How does frame dragging affect a rotating (Kerr) black hole?",
          "What is the Tolman-Oppenheimer-Volkoff (TOV) mass limit for neutron stars?",
        ],
        visualizationAction: {
          sceneId: "black_hole_lensing",
          targetObject: "Sagittarius A*",
          cameraAction: "focus",
          scaleRegime: "stellar",
        },
        learningLevelAdapted: level,
      };
    }
  }

  // Conversational Follow-Up Inquiries
  if (q === "why?" || q === "why" || q.startsWith("why ")) {
    return {
      answerText: `This occurs due to the fundamental laws of physics governing ${context.scientificTopic}. Gravity, thermodynamics, and electromagnetism determine how matter congregates and behaves across cosmic scales, as detailed in ${context.moduleTitle}.`,
      epistemicClassification: "model",
      epistemicNote: "Physical mechanism derived from fundamental interactions",
      scientificSources: context.scientificReferences.map((r) => ({ title: r })),
      suggestedFollowUpQuestions: [
        "Can you give an observational example?",
        "What are the mathematical equations behind this?",
      ],
      visualizationAction: context.currentVisualization,
      learningLevelAdapted: level,
    };
  }

  if (q.includes("example") || q.includes("show me an example") || q.includes("give me an example")) {
    return {
      answerText: `A prime astronomical example related to ${context.scientificTopic} is observed right here in our cosmic neighborhood. For instance, observations from space telescopes (like Hubble and JWST) reveal these exact physical processes at work across star systems and distant galaxies.`,
      epistemicClassification: "fact",
      epistemicNote: "Direct observational astronomical catalog verification",
      scientificSources: context.scientificReferences.map((r) => ({ title: r })),
      suggestedFollowUpQuestions: [
        "How do astronomers measure these distances?",
        "Can we zoom to this object in the 3D scene?",
      ],
      visualizationAction: context.currentVisualization,
      learningLevelAdapted: level,
    };
  }

  if (q.includes("explain more") || q.includes("explain again") || q.includes("more detail")) {
    return {
      answerText: `To look deeper into this: in ${context.lessonTitle}, we are investigating how ${context.scientificTopic} shapes our universe. Breaking this down step-by-step: ${context.currentDisplayText.slice(0, 220)}... Every observation confirms that physical laws operate consistently from our solar system to the edge of the visible cosmos.`,
      epistemicClassification: "fact",
      epistemicNote: "Grounded curriculum expansion",
      scientificSources: context.scientificReferences.map((r) => ({ title: r })),
      suggestedFollowUpQuestions: [
        "What is the next concept in this lesson?",
        "Are there any unanswered questions about this?",
      ],
      visualizationAction: context.currentVisualization,
      learningLevelAdapted: level,
    };
  }

  // General grounded synthesis
  return {
    answerText: `In ${context.moduleTitle}, we explore ${context.scientificTopic}. As established in the lesson material: "${context.currentDisplayText.slice(0, 180)}..." This concept is fundamental to understanding our place in the cosmos.`,
    epistemicClassification: "fact",
    epistemicNote: "Grounded in approved curriculum material",
    scientificSources: context.scientificReferences.map((r) => ({ title: r })),
    suggestedFollowUpQuestions: [
      `How does this connect to ${context.relevantTerminology[0] || "astronomy"}?`,
      "Can we view this in the 3D scene?",
    ],
    visualizationAction: context.currentVisualization,
    learningLevelAdapted: level,
  };
}

export class AIServiceProviderServer {
  private static client: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  /**
   * Processes a real-time conversational interruption or follow-up turn.
   * Grounded with the interrupted segment, nearby instructional context, and follow-up history.
   */
  public static async answerConversationalTurn(
    question: string,
    context: ConversationalTurnContext,
  ): Promise<CosmosAnswer> {
    const trimmed = (question || "").trim();
    if (!trimmed) {
      throw new Error("Conversational question cannot be empty.");
    }

    const forbidden = detectForbiddenActionAttempt(trimmed);
    if (forbidden) {
      return generateScientificFallbackAnswer(trimmed, context);
    }
    if (context.activeExamAttempt) {
      return generateScientificFallbackAnswer(trimmed, context);
    }

    // Incorporate interrupted segment and nearby context into pedagogical context
    const augmentedContext: StudentQuestionContext = {
      ...context,
      currentDisplayText: context.interruptedSegment
        ? `[Interrupted Narration Segment]: "${context.interruptedSegment.displayText}"\n\n[Full Lesson Context]: ${context.currentDisplayText}`
        : context.currentDisplayText,
    };

    return this.answerStudentQuestion(trimmed, augmentedContext);
  }

  /**
   * Processes a student inquiry server-side.
   * Never exposes API keys to client runtime.
   */
  public static async answerStudentQuestion(
    question: string,
    context: StudentQuestionContext,
  ): Promise<CosmosAnswer> {
    const trimmed = (question || "").trim();
    if (!trimmed) {
      throw new Error("Question cannot be empty.");
    }

    // 1. Check Authority Invariant: COSMOS cannot perform admin/state-modifying actions
    const forbidden = detectForbiddenActionAttempt(trimmed);
    if (forbidden) {
      return generateScientificFallbackAnswer(trimmed, context);
    }

    // 2. Check Examination Mode Guard: No hints or exam solutions
    if (context.activeExamAttempt) {
      return generateScientificFallbackAnswer(trimmed, context);
    }

    // 3. Attempt Gemini 3.8 Flash execution via server-side SDK
    const client = this.getClient();
    if (client) {
      try {
        const systemInstruction = buildSystemPrompt(context);
        const timeoutPromise = new Promise<never>((_, reject) => {
          const t = setTimeout(() => reject(new Error("Gemini API call timed out")), 3500);
          if (t && typeof (t as any).unref === "function") (t as any).unref();
        });

        const response = await Promise.race([
          client.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.3,
            },
          }),
          timeoutPromise,
        ]);

        const rawText = response.text || "";

        let epistemicStatus: EpistemicStatus = "fact";
        if (rawText.includes("[MODEL]")) epistemicStatus = "model";
        else if (rawText.includes("[HYPOTHESIS]")) epistemicStatus = "hypothesis";
        else if (rawText.includes("[UNCERTAINTY]")) epistemicStatus = "uncertainty";

        return {
          answerText: rawText.replace(/\[(FACT|MODEL|HYPOTHESIS|UNCERTAINTY)\]\s*/g, ""),
          epistemicClassification: epistemicStatus,
          scientificSources: context.scientificReferences.map((r) => ({ title: r })),
          suggestedFollowUpQuestions: [
            "Can you explain more about this concept?",
            "How was this discovered by astronomers?",
          ],
          visualizationAction: context.currentVisualization,
          learningLevelAdapted: context.learningLevel,
        };
      } catch (err) {
        console.warn("Gemini API server call failed, falling back to grounded solver:", err);
      }
    }

    // 4. Grounded Scientific Fallback
    return generateScientificFallbackAnswer(trimmed, context);
  }

  private static audioCache = new Map<string, string>();

  /**
   * Synthesizes audio for an approved lesson segment using Gemini TTS (gemini-3.8-flash-lite-tts).
   * Cached strictly by [courseVersion, moduleId, segmentId, language, voiceName, model].
   * Privacy Invariant: Zero student data is ever included in audio caches.
   */
  public static async synthesizeNarrationSegmentAudio(params: {
    courseVersion?: string;
    moduleId: string;
    segmentId: string;
    spokenText: string;
    language?: string;
    voiceName?: CosmosVoiceName;
    model?: "gemini-3.8-flash-lite-tts" | "gemini-3.8-flash-tts";
  }): Promise<CosmosAudioSynthesisResult> {
    const {
      courseVersion = "1.0.0",
      moduleId,
      segmentId,
      spokenText,
      language = "en",
      voiceName = "Kore",
      model = "gemini-3.8-flash-lite-tts",
    } = params;

    const cacheKey = `${courseVersion}:${moduleId}:${segmentId}:${language}:${voiceName}:${model}`;

    // 1. Check in-memory audio cache
    if (this.audioCache.has(cacheKey)) {
      return {
        audioBase64: this.audioCache.get(cacheKey)!,
        mimeType: "audio/wav",
        cached: true,
        voiceName,
        model,
        useWebSpeechFallback: false,
      };
    }

    const client = this.getClient();
    if (!client) {
      return {
        audioBase64: null,
        mimeType: "audio/wav",
        cached: false,
        voiceName,
        model,
        useWebSpeechFallback: true,
        error: "GEMINI_API_KEY is not configured on server",
      };
    }

    try {
      const response = await client.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: spokenText,
                speechMetadata: {
                  style:
                    "Warm, natural, patient, curious, expressive, scientifically confident, appropriate for children",
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;

      if (base64Audio) {
        this.audioCache.set(cacheKey, base64Audio);
        return {
          audioBase64: base64Audio,
          mimeType: "audio/wav",
          cached: false,
          voiceName,
          model,
          useWebSpeechFallback: false,
        };
      }

      return {
        audioBase64: null,
        mimeType: "audio/wav",
        cached: false,
        voiceName,
        model,
        useWebSpeechFallback: true,
        error: "No audio stream returned from Gemini TTS model",
      };
    } catch (err: any) {
      console.warn(`Gemini TTS synthesis fallback for segment ${segmentId}:`, err?.message || err);
      return {
        audioBase64: null,
        mimeType: "audio/wav",
        cached: false,
        voiceName,
        model,
        useWebSpeechFallback: true,
        error: err?.message || "Synthesis request failed",
      };
    }
  }

  /**
   * Flushes in-memory audio cache.
   */
  public static clearAudioCache(): void {
    this.audioCache.clear();
  }

  /**
   * Returns current cache statistics.
   */
  public static getAudioCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.audioCache.size,
      keys: Array.from(this.audioCache.keys()),
    };
  }

  private static activeLiveSessions = new Map<string, CosmosLiveSessionToken>();

  /**
   * Creates a short-lived authenticated Live API session token for COSMOS (Prompt 14).
   * Valid for 15 minutes. Isolates permanent GEMINI_API_KEY on the server.
   */
  public static async createLiveSession(params: {
    moduleId: string;
    userId?: string;
  }): Promise<CosmosLiveSessionToken> {
    const { moduleId } = params;
    const now = Date.now();
    const ttlMs = 15 * 60 * 1000; // 15 minutes
    const sessionId = `live_sess_${Math.random().toString(36).slice(2, 11)}_${now}`;
    const token = `cosmos_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

    const sessionData: CosmosLiveSessionToken = {
      sessionId,
      token,
      model: "gemini-3.8-live",
      issuedAt: now,
      expiresAt: now + ttlMs,
      moduleId,
    };

    this.activeLiveSessions.set(sessionId, sessionData);

    // Clean up expired sessions
    for (const [id, sess] of this.activeLiveSessions.entries()) {
      if (sess.expiresAt < now) {
        this.activeLiveSessions.delete(id);
      }
    }

    return sessionData;
  }

  /**
   * Validates a short-lived Live API session token.
   */
  public static validateLiveSession(sessionId: string, token: string): boolean {
    const session = this.activeLiveSessions.get(sessionId);
    if (!session) return false;
    if (session.token !== token) return false;
    if (session.expiresAt < Date.now()) {
      this.activeLiveSessions.delete(sessionId);
      return false;
    }
    return true;
  }
}
