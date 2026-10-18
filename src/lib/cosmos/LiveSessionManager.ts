/**
 * COSMOS Live Session Manager
 * Project: Our Visible Universe Academy
 * Scope: Prompt 14 Live API Session Management & Environmental Resilience
 *
 * Implements secure short-lived authenticated Live API sessions,
 * automatic token rotation, connection drop recovery with exponential backoff,
 * background tab handling, audio device change adaptation, and network state monitoring.
 *
 * CRITICAL INVARIANT:
 * Retains the narration cursor independently of the Live API session.
 * The session manager never mutates or overrides the application's narration cursor.
 */

import type {
  CosmosLiveSessionToken,
  LiveSessionState,
} from "./cosmos-types";
import { createLiveSession } from "./cosmos.functions";

export interface LiveSessionEventPayload {
  state: LiveSessionState;
  token?: CosmosLiveSessionToken | null;
  isOnline: boolean;
  isTabVisible: boolean;
  reconnectAttempts: number;
  lastLatencyMs?: number;
  activeAudioDevice?: string;
  errorMessage?: string;
}

export class LiveSessionManager {
  private static instance: LiveSessionManager | null = null;

  private state: LiveSessionState = "DISCONNECTED";
  private currentToken: CosmosLiveSessionToken | null = null;
  private currentModuleId = "01";

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 6;
  private reconnectTimer: any = null;
  private tokenRefreshTimer: any = null;

  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  private isTabVisible = typeof document !== "undefined" ? !document.hidden : true;
  private lastLatencyMs = 0;
  private activeAudioDevice = "default";

  private listeners: Set<(payload: LiveSessionEventPayload) => void> = new Set();

  private constructor() {
    this.initNetworkListeners();
    this.initVisibilityListeners();
    this.initAudioDeviceListeners();
  }

  public static getInstance(): LiveSessionManager {
    if (!this.instance) {
      this.instance = new LiveSessionManager();
    }
    return this.instance;
  }

  /**
   * Initializes network online/offline listeners.
   */
  private initNetworkListeners(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      this.isOnline = true;
      this.notifyListeners();
      if (this.state === "ERROR" || this.state === "DISCONNECTED" || this.state === "RECONNECTING") {
        void this.reconnect("Network connection restored");
      }
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.setState("RECONNECTING", {
        errorMessage: "Network connection lost. Waiting for connection...",
      });
    });
  }

  /**
   * Monitors background tabs (Page Visibility API).
   */
  private initVisibilityListeners(): void {
    if (typeof document === "undefined") return;

    document.addEventListener("visibilitychange", () => {
      this.isTabVisible = !document.hidden;
      this.notifyListeners();

      if (this.isTabVisible) {
        // Returned to tab: check if session expired or needs refresh
        if (this.currentToken && this.currentToken.expiresAt <= Date.now()) {
          void this.refreshToken();
        }
      }
    });
  }

  /**
   * Monitors audio input/output device changes (e.g., plugging in Bluetooth headphones).
   */
  private initAudioDeviceListeners(): void {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;

    navigator.mediaDevices.addEventListener?.("devicechange", async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        if (audioInputs.length > 0) {
          this.activeAudioDevice = audioInputs[0].label || "default";
        }
        this.notifyListeners();
      } catch {
        // ignore device listing errors
      }
    });
  }

  /**
   * Connects to a short-lived authenticated Live API session for the given module.
   */
  public async connect(moduleId: string): Promise<boolean> {
    this.currentModuleId = moduleId;
    this.setState("CONNECTING");

    try {
      const startTime = Date.now();
      let token: CosmosLiveSessionToken;
      try {
        token = await createLiveSession({
          data: {
            moduleId,
          },
        });
      } catch (fnErr: any) {
        if (typeof window === "undefined" || fnErr?.message?.includes("No Start context")) {
          const { AIServiceProviderServer } = await import("./AIServiceProvider.server");
          token = await AIServiceProviderServer.createLiveSession({ moduleId });
        } else {
          throw fnErr;
        }
      }

      this.lastLatencyMs = Date.now() - startTime;
      this.currentToken = token;
      this.reconnectAttempts = 0;
      this.setState("CONNECTED", { token });

      this.scheduleTokenRefresh(token);
      return true;
    } catch (err: any) {
      console.warn("Failed to connect Live API session:", err);
      this.setState("ERROR", {
        errorMessage: err?.message || "Failed to establish Live API session",
      });
      return false;
    }
  }

  /**
   * Schedules proactive token rotation 2 minutes before the 15-minute TTL expires.
   */
  private scheduleTokenRefresh(token: CosmosLiveSessionToken): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    const msUntilExpiry = token.expiresAt - Date.now();
    const refreshDelayMs = Math.max(1000, msUntilExpiry - 2 * 60 * 1000); // 2 mins prior

    this.tokenRefreshTimer = setTimeout(() => {
      void this.refreshToken();
    }, refreshDelayMs);
    if (this.tokenRefreshTimer && typeof (this.tokenRefreshTimer as any).unref === "function") {
      (this.tokenRefreshTimer as any).unref();
    }
  }

  /**
   * Refreshes the session token seamlessly.
   */
  public async refreshToken(): Promise<boolean> {
    try {
      const token = await createLiveSession({
        data: {
          moduleId: this.currentModuleId,
        },
      });
      this.currentToken = token;
      this.scheduleTokenRefresh(token);
      this.notifyListeners();
      return true;
    } catch (err) {
      console.warn("Could not refresh live session token:", err);
      return false;
    }
  }

  /**
   * Reconnects with exponential backoff on transient errors or network drops.
   */
  public async reconnect(reason = "reconnecting"): Promise<boolean> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setState("ERROR", {
        errorMessage: `Reconnection failed after ${this.reconnectAttempts} attempts. Please check network.`,
      });
      return false;
    }

    this.reconnectAttempts++;
    this.setState("RECONNECTING");

    // Exponential backoff: 500ms, 1000ms, 2000ms, 4000ms...
    const backoffMs = Math.min(8000, 500 * Math.pow(2, this.reconnectAttempts - 1));

    return new Promise((resolve) => {
      this.reconnectTimer = setTimeout(async () => {
        const ok = await this.connect(this.currentModuleId);
        resolve(ok);
      }, backoffMs);
    });
  }

  /**
   * Disconnects active session and cleans up timers.
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    this.currentToken = null;
    this.setState("DISCONNECTED");
  }

  private setState(state: LiveSessionState, extra: Partial<LiveSessionEventPayload> = {}): void {
    this.state = state;
    this.notifyListeners(extra);
  }

  private notifyListeners(extra: Partial<LiveSessionEventPayload> = {}): void {
    const payload = this.getPayload(extra);
    for (const listener of this.listeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error("LiveSession listener error:", err);
      }
    }
  }

  public getPayload(extra: Partial<LiveSessionEventPayload> = {}): LiveSessionEventPayload {
    return {
      state: this.state,
      token: this.currentToken,
      isOnline: this.isOnline,
      isTabVisible: this.isTabVisible,
      reconnectAttempts: this.reconnectAttempts,
      lastLatencyMs: this.lastLatencyMs,
      activeAudioDevice: this.activeAudioDevice,
      ...extra,
    };
  }

  public getState(): LiveSessionState {
    return this.state;
  }

  public getToken(): CosmosLiveSessionToken | null {
    return this.currentToken;
  }

  public getLatency(): number {
    return this.lastLatencyMs;
  }

  public isConnected(): boolean {
    return this.state === "CONNECTED" && !!this.currentToken;
  }

  public subscribe(listener: (payload: LiveSessionEventPayload) => void): () => void {
    this.listeners.add(listener);
    listener(this.getPayload());
    return () => {
      this.listeners.delete(listener);
    };
  }
}
