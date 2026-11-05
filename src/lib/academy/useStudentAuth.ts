import { useEffect, useState, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { LearningLevel } from "./types";
import {
  type StudentProfile,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  DEFAULT_LEARNING_SETTINGS,
  generateStudentPublicId,
  applyChildSafetyRules,
} from "./student-types";
import {
  getMyStudentProfile,
  updateMyStudentProfile,
  syncStudentProgress,
} from "./student.functions";
import { toast } from "sonner";
import { progressStorageKey } from "./local-progress";

const LOCAL_PROFILE_KEY = "cosmic_academy_guest_profile_v1";

function loadGuestProfile(): StudentProfile {
  if (typeof window === "undefined") {
    return {
      user_id: "guest-user",
      student_public_id: "GUEST-EXPLORER",
      display_name: "Guest Explorer",
      certificate_name: "Guest Explorer",
      selected_level: "explorer",
      preferred_language: "en",
      age_bracket: "13_to_17",
      guardian_consent_status: "not_required",
      guardian_email: null,
      guardian_consent_date: null,
      profile_visibility: "private",
      accessibility_settings: DEFAULT_ACCESSIBILITY_SETTINGS,
      learning_settings: DEFAULT_LEARNING_SETTINGS,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        accessibility_settings: {
          ...DEFAULT_ACCESSIBILITY_SETTINGS,
          ...(parsed.accessibility_settings || {}),
        },
        learning_settings: {
          ...DEFAULT_LEARNING_SETTINGS,
          ...(parsed.learning_settings || {}),
        },
      };
    }
  } catch (e) {
    console.error("Failed to parse guest student profile:", e);
  }

  const initialGuest: StudentProfile = {
    user_id: "guest-user",
    student_public_id: "GUEST-EXPLORER",
    display_name: "Guest Explorer",
    certificate_name: "Guest Explorer",
    selected_level: "explorer",
    preferred_language: "en",
    age_bracket: "13_to_17",
    guardian_consent_status: "not_required",
    guardian_email: null,
    guardian_consent_date: null,
    profile_visibility: "private",
    accessibility_settings: DEFAULT_ACCESSIBILITY_SETTINGS,
    learning_settings: DEFAULT_LEARNING_SETTINGS,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return initialGuest;
}

function pendingProfile(userId: string): StudentProfile {
  return { ...loadGuestProfileDefaults(), user_id: userId, student_public_id: "GUEST-SYNC-PENDING",
    display_name: "Cosmic Explorer", certificate_name: "Cosmic Explorer" };
}

function loadGuestProfileDefaults(): StudentProfile {
  return { user_id: "guest-user", student_public_id: "GUEST-EXPLORER", display_name: "Guest Explorer", certificate_name: "Guest Explorer",
    selected_level: "explorer", preferred_language: "en", age_bracket: "13_to_17", guardian_consent_status: "not_required",
    guardian_email: null, guardian_consent_date: null, profile_visibility: "private",
    accessibility_settings: { ...DEFAULT_ACCESSIBILITY_SETTINGS }, learning_settings: { ...DEFAULT_LEARNING_SETTINGS },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

function saveGuestProfile(profile: StudentProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save guest student profile:", e);
  }
}

export function useStudentAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile>(loadGuestProfile);
  const [isLoading, setIsLoading] = useState(true);
  const syncedRef = useRef<string | null>(null);
  const currentUserRef = useRef<string | null>(null);
  const profileRequestRef = useRef(0);

  const fetchAuthenticatedProfile = useCallback(async (activeUser: User) => {
    const request = ++profileRequestRef.current;
    const current = () => currentUserRef.current === activeUser.id && profileRequestRef.current === request;
    try {
      const res = await getMyStudentProfile();
      if (!current()) return;
      if (!res?.profile || res.profile.user_id !== activeUser.id) throw new Error("Student profile identity was not confirmed.");
      setProfile(res.profile);
      if (syncedRef.current !== activeUser.id && typeof window !== "undefined") {
        // Only this account's navigation may be synchronized. Unowned legacy and
        // guest practice stay local, regardless of which account signs in next.
        const raw = localStorage.getItem(progressStorageKey(activeUser.id));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.moduleProgress && Object.keys(parsed.moduleProgress).length > 0) {
            const ack = await syncStudentProgress({ data: { moduleProgress: parsed.moduleProgress,
              selectedLevel: res.profile.selected_level, expectedUserId: activeUser.id } });
            if (ack?.success !== true) throw new Error("Navigation synchronization is pending.");
          }
        }
        if (current()) syncedRef.current = activeUser.id;
      }
    } catch (err) {
      if (!current()) return;
      console.warn("Student profile or navigation synchronization is pending.");
      // Keep an already confirmed profile for this owner, but never invent a
      // persisted STU identity or carry a previous account's name across login.
      setProfile(previous => previous.user_id === activeUser.id ? previous : pendingProfile(activeUser.id));
    } finally {
      if (current()) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let authEvent = 0;
    const accept = (active: User | null) => {
      if (!mounted) return;
      const changed = currentUserRef.current !== (active?.id ?? null);
      currentUserRef.current = active?.id ?? null;
      setUser(active);
      if (changed) {
        syncedRef.current = null;
        ++profileRequestRef.current;
        setProfile(active ? pendingProfile(active.id) : loadGuestProfile());
      }
      if (active) {
        // Defer API calls until Supabase releases its auth callback lock.
        setTimeout(() => { if (mounted && currentUserRef.current === active.id) void fetchAuthenticatedProfile(active); }, 0);
      } else { setProfile(loadGuestProfile()); setIsLoading(false); }
    };
    const initialEvent = authEvent;
    void supabase.auth.getUser().then(({ data }) => {
      if (authEvent === initialEvent) accept(data?.user ?? null);
    }).catch(() => { if (authEvent === initialEvent) accept(null); });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      ++authEvent;
      accept(session?.user ?? null);
    });
    const retry = () => { void supabase.auth.getUser().then(({ data }) => { if (mounted) accept(data?.user ?? null); }).catch(() => {}); };
    window.addEventListener("online", retry);
    return () => { mounted = false; ++profileRequestRef.current; sub.subscription.unsubscribe(); window.removeEventListener("online", retry); };
  }, [fetchAuthenticatedProfile]);

  const updateProfile = useCallback(
    async (changes: Partial<StudentProfile>): Promise<StudentProfile> => {
      const sanitized = applyChildSafetyRules(changes);

      if (user) {
        try {
          const res = await updateMyStudentProfile({ data: { ...sanitized, expectedUserId: user.id } as any });
          if (currentUserRef.current !== user.id) throw new Error("Account changed before the profile response arrived.");
          if (res?.profile) {
            setProfile(res.profile);
            toast.success("Student profile updated successfully.");
            return res.profile;
          }
          throw new Error("Profile update was not confirmed. Please retry.");
        } catch (err: any) {
          toast.error(err?.message || "Failed to save profile changes.");
          throw err;
        }
      }

      // Guest profile update
      const updatedGuest: StudentProfile = {
        ...profile,
        ...sanitized,
        accessibility_settings: {
          ...profile.accessibility_settings,
          ...(sanitized.accessibility_settings || {}),
        },
        learning_settings: {
          ...profile.learning_settings,
          ...(sanitized.learning_settings || {}),
        },
        updated_at: new Date().toISOString(),
      };
      setProfile(updatedGuest);
      saveGuestProfile(updatedGuest);
      toast.success("Settings saved.");
      return updatedGuest;
    },
    [user, profile],
  );

  const changeLearningLevel = useCallback(
    async (newLevel: LearningLevel) => {
      return updateProfile({ selected_level: newLevel });
    },
    [updateProfile],
  );

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(loadGuestProfile());
    toast.info("Signed out of student profile. You are now exploring as a guest.");
  }, []);

  const isMinor = profile.age_bracket === "under_13" || profile.age_bracket === "13_to_17";

  return {
    user,
    profile,
    isLoggedIn: Boolean(user),
    isProfileSynced: Boolean(user && profile.user_id === user.id && profile.student_public_id.startsWith("STU-")),
    isLoading,
    isMinor,
    updateProfile,
    changeLearningLevel,
    refreshProfile: () => (user ? fetchAuthenticatedProfile(user) : Promise.resolve()),
    signOut: handleSignOut,
  };
}
