/**
 * COSMOS Client-Side Audio Cache Manager
 * Project: Our Visible Universe Academy
 * Scope: Prompt 13 Audio Caching & Privacy Invariants
 *
 * Caches synthesized narration audio clips locally in browser memory and sessionStorage
 * to minimize latency, reduce redundant network requests, and support offline recitation.
 *
 * STRICT PRIVACY INVARIANT:
 * Cache keys are strictly composed of course content identifiers and audio parameters.
 * Student IDs, names, quiz scores, or private data are NEVER included in cache keys or payloads.
 */

const AUDIO_STORAGE_PREFIX = "ovu_cosmos_audio_";
const MAX_IN_MEMORY_ENTRIES = 100;

export class AudioCacheManager {
  private static memoryCache = new Map<string, string>();

  /**
   * Generates a stable, privacy-preserving cache key.
   */
  public static createCacheKey(params: {
    courseVersion?: string;
    moduleId: string;
    segmentId: string;
    language?: string;
    voiceName?: string;
    model?: string;
  }): string {
    const {
      courseVersion = "1.0.0",
      moduleId,
      segmentId,
      language = "en",
      voiceName = "Kore",
      model = "gemini-3.8-flash-lite-tts",
    } = params;

    return `${courseVersion}_${moduleId}_${segmentId}_${language}_${voiceName}_${model}`;
  }

  /**
   * Retrieves cached audio base64 payload if present.
   */
  public static get(key: string): string | null {
    if (!key) return null;

    // 1. In-memory cache
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }

    // 2. SessionStorage cache
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        const stored = sessionStorage.getItem(`${AUDIO_STORAGE_PREFIX}${key}`);
        if (stored) {
          this.memoryCache.set(key, stored);
          return stored;
        }
      } catch (err) {
        console.warn("Could not read audio from sessionStorage:", err);
      }
    }

    return null;
  }

  /**
   * Stores an audio clip in memory and sessionStorage.
   */
  public static set(key: string, audioBase64: string): void {
    if (!key || !audioBase64) return;

    if (this.memoryCache.size >= MAX_IN_MEMORY_ENTRIES) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(key, audioBase64);

    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        sessionStorage.setItem(`${AUDIO_STORAGE_PREFIX}${key}`, audioBase64);
      } catch {
        // Storage quota might be reached, memory cache remains active
      }
    }
  }

  /**
   * Checks if an audio clip exists in cache.
   */
  public static has(key: string): boolean {
    return this.memoryCache.has(key) || (typeof window !== "undefined" && window.sessionStorage ? sessionStorage.getItem(`${AUDIO_STORAGE_PREFIX}${key}`) !== null : false);
  }

  /**
   * Clears the audio cache.
   */
  public static clear(): void {
    this.memoryCache.clear();
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(AUDIO_STORAGE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        for (const k of keysToRemove) {
          sessionStorage.removeItem(k);
        }
      } catch (err) {
        void err;
      }
    }
  }

  /**
   * Returns cache metrics.
   */
  public static getStats(): { memorySize: number } {
    return {
      memorySize: this.memoryCache.size,
    };
  }
}
