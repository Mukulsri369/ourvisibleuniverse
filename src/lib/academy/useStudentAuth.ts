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
  const syncedRef = useRef(false);

  const fetchAuthenticatedProfile = useCallback(async (activeUser: User) => {
    try {
      const res = await getMyStudentProfile();
      if (res?.profile) {
        setProfile(res.profile);

        // Perform initial synchronization of guest local progress if not done yet
        if (!syncedRef.current && typeof window !== "undefined") {
          syncedRef.current = true;
          try {
            const rawProgress = localStorage.getItem("cosmic_academy_user_progress_v1");
            if (rawProgress) {
              const parsed = JSON.parse(rawProgress);
              if (parsed.moduleProgress && Object.keys(parsed.moduleProgress).length > 0) {
                await syncStudentProgress({
                  data: {
                    moduleProgress: parsed.moduleProgress,
                    selectedLevel: res.profile.selected_level,
                  },
                });
              }
            }
          } catch (syncErr) {
            console.warn("Could not sync local progress on login:", syncErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load authenticated student profile:", err);
      // Fallback: derive safe profile for authenticated user
      setProfile((prev) => ({
        ...prev,
        user_id: activeUser.id,
        student_public_id: prev.student_public_id.startsWith("GUEST")
          ? generateStudentPublicId()
          : prev.student_public_id,
        display_name: activeUser.user_metadata?.full_name || prev.display_name || "Cosmic Explorer",
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    void supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!mounted) return;
        if (data?.user) {
          setUser(data.user);
          void fetchAuthenticatedProfile(data.user);
        } else {
          setUser(null);
          setProfile(loadGuestProfile());
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
        setProfile(loadGuestProfile());
        setIsLoading(false);
      });

    let unsubscribe = () => {};
    try {
      const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          await fetchAuthenticatedProfile(session.user);
        } else {
          setUser(null);
          setProfile(loadGuestProfile());
          setIsLoading(false);
        }
      });
      if (sub?.subscription) {
        unsubscribe = () => sub.subscription.unsubscribe();
      }
    } catch (err) {
      console.warn("[StudentAuth] Auth listener fallback:", err);
    }

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [fetchAuthenticatedProfile]);

  const updateProfile = useCallback(
    async (changes: Partial<StudentProfile>): Promise<StudentProfile> => {
      const sanitized = applyChildSafetyRules(changes);

      if (user) {
        try {
          const res = await updateMyStudentProfile({ data: sanitized as any });
          if (res?.profile) {
            setProfile(res.profile);
            toast.success("Student profile updated successfully.");
            return res.profile;
          }
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
    isLoading,
    isMinor,
    updateProfile,
    changeLearningLevel,
    refreshProfile: () => (user ? fetchAuthenticatedProfile(user) : Promise.resolve()),
    signOut: handleSignOut,
  };
}
