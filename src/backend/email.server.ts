import { createTransport } from 'nodemailer';
import type { TransactionalEmail } from './auth.server';

/** No console/token fallback: delivery must be configured explicitly. */
export function smtpEmail(): TransactionalEmail {
  return { async send(message) {
    const { SMTP_HOST: host, SMTP_USER: user, SMTP_PASSWORD: pass, SMTP_FROM: from } = process.env;
    const port = Number(process.env.SMTP_PORT ?? 587);
    if (!host || !user || !pass || !from || ![465,587].includes(port) || /[\r\n]/.test(from)) {
      throw new Error('Transactional email delivery is not configured');
    }
    const transport = createTransport({
      host, port, secure: port === 465, requireTLS: true,
      auth: { user, pass }, tls: { rejectUnauthorized: true },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
      disableFileAccess: true, disableUrlAccess: true,
    });
    try {
      await transport.sendMail({ from, to: message.to, subject: message.subject,
        text: `${message.subject}\n\n${message.url}\n\nIf you did not request this, ignore this email.`,
      });
    } catch {
      // Provider errors can contain credentials, recipients or verification URLs.
      throw new Error('Transactional email delivery failed');
    } finally { transport.close(); }
  }};
}
