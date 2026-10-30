import { createServerFn } from "@tanstack/react-start";
import { requireIndependentAuth } from "@/backend/session-middleware";
import { updateProfileInput, syncProgressInput } from "./student-inputs";

export const getMyStudentProfile = createServerFn({ method: "GET" })
  .middleware([requireIndependentAuth])
  .handler(async ({ context }) => {
    const { getStudentProfile } = await import("@/backend/student.server");
    return getStudentProfile(context.principal);
  });
export const updateMyStudentProfile = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => updateProfileInput.parse(input))
  .handler(async ({ context, data }) => {
    const { updateStudentProfile } = await import("@/backend/student.server");
    return updateStudentProfile(context.principal, data);
  });
export const syncStudentProgress = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => syncProgressInput.parse(input))
  .handler(async ({ context, data }) => {
    const { syncGuestProgress } = await import("@/backend/student.server");
    return syncGuestProgress(context.principal, data);
  });
