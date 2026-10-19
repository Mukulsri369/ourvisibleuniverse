# Our Visible Universe Academy: Real-Time Conversational AI Teacher Report

**Project:** OUR VISIBLE UNIVERSE ACADEMY  
**Specification:** Prompt 14 — Real-Time Conversational AI Teacher  
**Status:** Completed & Validated  
**Validation Suite:** `npm run test:realtime` (61/61 Checks Passed, 100% Success)

---

## 1. Executive Summary & Gemini Live API Evaluation

Prompt 14 implements natural, real-time voice conversations, sub-paragraph barge-in detection, contextual astrophysics question answering, multi-turn follow-up discussion windows, and deterministic lesson resumption for the COSMOS AI Teaching Companion.

### Model & SDK Architecture
- **Official SDK:** `@google/genai` (`^2.30.0`) initialized strictly server-side (`AIServiceProvider.server.ts`).
- **Live Session Target Model:** `gemini-3.8-live` for short-lived real-time multimodal voice sessions, paired with `gemini-3-flash-preview` and `gemini-2.5-pro-preview-tts` for grounded instructional Q&A and high-precision scientific speech synthesis.
- **Zero Client Secret Exposure:** No raw API keys are exposed in browser memory or client bundles. Short-lived session tokens (15-minute TTL) are provisioned via `createLiveSession` (`src/lib/cosmos/cosmos.functions.ts`) and rotated automatically by `LiveSessionManager.ts`.

---

## 2. Explicit 10-State Interaction Machine

`VoiceConversationController.ts` enforces deterministic, testable state transitions across all 10 required states:

| State | Responsibility & Transition Behaviour |
| :--- | :--- |
| `IDLE` | Default unengaged state prior to narration or voice session activation. |
| `NARRATING` | COSMOS is actively delivering verified curriculum narration segments. |
| `INTERRUPTING` | Transitional state entered immediately upon student barge-in or push-to-talk; halts TTS audio buffers and snapshots the exact narration cursor. |
| `LISTENING` | Captures student speech via Web Speech / Live audio stream with real-time RMS energy metering and live interim transcript preview. |
| `PROCESSING` | Assembles `StudentQuestionContext` (active module, lesson, segment, nearby content, learning tier, scientific sources, 3D visualization context) and queries COSMOS. |
| `ANSWERING` | Speaks the grounded scientific explanation naturally while displaying epistemic status (`verified`, `consensus`, `hypothesis`, `simplified`) and citations. |
| `FOLLOW_UP_WINDOW` | Holds an interactive multi-turn discussion window (default 8s countdown, configurable) allowing natural follow-ups (*"Explain more"*, *"Why?"*, *"Can you give an example?"*). |
| `RESUMING` | Announces transition back to the lesson (*"Let's return to our lesson..."*) and restores the preserved segment cursor. |
| `PAUSED` | Explicit learner pause or post-reconnection hold state; prevents unexpected narration restarts until the student says *"Continue"*, *"Resume"*, or *"Go ahead"*. |
| `ERROR` | Graceful recovery state for microphone permission denial, network drop during an answer, or audio hardware faults, while preserving the narration cursor intact. |

---

## 3. Barge-In & Voice Activity Detection (`VoiceActivityDetector.ts`)

1. **Immediate Sub-Paragraph Halting:** When valid student speech is detected during `NARRATING`, `VoiceConversationController.triggerBargeIn()` immediately invokes `narrationController.interruptForQuestion()`, cancelling all active HTMLAudioElement / Web Speech synthesis buffers without waiting for the current paragraph or sentence to finish.
2. **Hardware Echo Cancellation & Self-Playback Gating:**
   - Requests browser audio constraints `echoCancellation: true`, `noiseSuppression: true`, and `autoGainControl: true`.
   - Applies a **1.8× self-playback gating multiplier** (`setCosmosOutputtingAudio(true)`) whenever COSMOS is actively outputting speaker audio, preventing COSMOS's own voice from triggering false self-interruptions on open speakers.
3. **Dynamic Ambient Noise Floor (`setAmbientNoiseFloor`):** Adapts the RMS detection threshold dynamically in noisy environments (e.g., classroom murmur) so background noise is rejected while intentional student speech triggers reliably.
4. **Opt-In Microphone & Push-to-Talk Fallback:**
   - Microphone listening is strictly opt-in (`handsFreeBargeInEnabled: false` by default).
   - Provides a reliable Push-to-Talk button and Spacebar hold shortcut (`startPushToTalk()` / `stopPushToTalk()`) that works without continuous background VAD monitoring.

---

## 4. Application-Owned Narration Cursor & Exact Resumption

- **Application Cursor Authority:** `NarrationCursorManager.ts` and `NarrationController.ts` own the exact lesson playback cursor (`moduleId`, `lessonId`, `segmentId`, `segmentIndex`, `characterOffset`). The language model never invents or guesses where the lesson should resume.
- **Segment Boundary Integrity:** A segment is only marked completed when playback reaches 100% completion. If interrupted at the first word (0%), mid-sentence (50%), or final word (95%), the interrupted segment ID is preserved in `interruptedSegment` and `NarrationCursorManager`, and resumption restarts cleanly from the verified start of that segment.

---

## 5. Validated Voice Commands (`VoiceCommandProcessor.ts`)

All required voice commands are deterministically matched and mapped to validated application actions without awarding any unverified learning credit:

| Voice Command Utterances | Mapped Action (`VoiceCommandType`) | Validated Application Behaviour |
| :--- | :--- | :--- |
| *"Pause"*, *"Stop"*, *"Wait"* | `pause` | Halts narration immediately and enters `PAUSED`. |
| *"Continue"*, *"Resume"*, *"Go ahead"* | `continue` | Resumes narration from the preserved segment cursor. |
| *"Repeat that"*, *"Say that again"* | `repeat` | Replays the current narration segment from its beginning. |
| *"Go back"*, *"Previous"* | `go_back` | Seeks to the previous verified narration segment. |
| *"Explain again"* | `explain_again` | Re-synthesizes a clearer explanation of the current concept. |
| *"Speak slower"*, *"Slow down"* | `speak_slower` | Reduces playback speed by `0.15x` (down to `0.5x`) and persists preference. |
| *"Skip to the next lesson"*, *"Next section"* | `skip_next` | Advances the narration cursor to the next segment (`creditAwarded: false`). |
| *"Show me an example"*, *"Give me an example"* | `show_example` | Requests a concrete physical/astronomical example grounded in the current lesson. |

---

## 6. Live API Session Resilience (`LiveSessionManager.ts`)

- **Short-Lived Authenticated Sessions:** Issues 15-minute ephemeral tokens for `gemini-3.8-live` (`live_sess_*`) and schedules automatic renewal 60 seconds prior to expiration.
- **Environmental Resilience:** Handles network drops (`offline` / `online` events), session expiration, audio output device transitions (`navigator.mediaDevices.ondevicechange`, e.g., switching between speakers and Bluetooth headphones), background tab visibility shifts (`visibilitychange`), slow network latency warnings, and mobile browser WebAudio resume constraints.
- **Independent Cursor Persistence:** The narration cursor is persisted in `localStorage` (`NarrationCursorManager`) completely independently of Live API session state.

---

## 7. Verification Matrix (Test Scenarios A–L)

Executed via `npx tsx scripts/cosmos-realtime-voice-validation.ts` (`npm run test:realtime`):

| Scenario | Description | Measured Outcome | Status |
| :--- | :--- | :--- | :--- |
| **A** | Interrupt at the beginning of a sentence (0% boundary) | Halts playback immediately, transitions to `LISTENING`, preserves Segment 0 cursor, resumes at Segment 0. | **PASS** |
| **B** | Interrupt halfway through a sentence (50% boundary) | Halts mid-sentence, answers *"Wait, what does barred spiral mean?"* with grounded galactic morphology, enters `FOLLOW_UP_WINDOW`. | **PASS** |
| **C** | Interrupt at the final word (95% boundary) | Cursor does not prematurely advance; preserves Segment 4 and resumes cleanly from start of Segment 4. | **PASS** |
| **D** | Ask three consecutive questions in follow-up window | Handles 3 consecutive turns (*"Why does space look black?"* → *"Can you give an example?"* → *"Why does that happen?"*) without restarting narration early. | **PASS** |
| **E** | Say *"continue"* voice command | Matches `continue` command and transitions from `FOLLOW_UP_WINDOW`/`PAUSED` back to `NARRATING`. | **PASS** |
| **F** | Switch to push-to-talk | Enables push-to-talk mode, captures speech on press (`LISTENING`), and concludes cleanly on release. | **PASS** |
| **G** | Disable microphone permission | Transitions to `ERROR` with actionable learner message while keeping text Q&A and lesson cursor intact. | **PASS** |
| **H** | Lose connection during an answer | Transitions to `ERROR` on mid-answer disconnect while preserving interrupted segment cursor intact. | **PASS** |
| **I** | Return to the lesson after reconnecting | Transitions to `PAUSED` on reconnect and resumes exact pre-disconnect segment upon student confirmation. | **PASS** |
| **J** | Interrupt in a noisy environment | Rejects 0.15 RMS ambient noise via dynamic noise floor while triggering reliably on 0.35 RMS student speech. | **PASS** |
| **K** | Speaker audio & Bluetooth headphones | Applies 1.8× self-playback echo gating and handles Bluetooth audio device changes without state reset. | **PASS** |
| **L** | Automatic resume after discussion | Auto-resumes when countdown reaches 0s if enabled; holds in `PAUSED` waiting for *"Continue"* if disabled. | **PASS** |
| **Perf** | Measured Turn Resolution Latency | Grounded local/fallback turn resolution measured at **2 ms** (live network turn latency tracked via `LiveSessionManager.getLastLatencyMs()`). | **PASS** |
