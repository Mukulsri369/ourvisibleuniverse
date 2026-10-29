import { createIndependentAuth } from './auth.server';
import { smtpEmail } from './email.server';

let auth: ReturnType<typeof createIndependentAuth> | undefined;
export function independentAuth() {
  return auth ??= createIndependentAuth(smtpEmail());
}
