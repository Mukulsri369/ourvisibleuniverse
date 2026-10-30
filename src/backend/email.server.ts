import { createTransport } from "nodemailer";
import type { TransactionalEmail } from "./auth.server";
import { mkdir, realpath, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, parse } from "node:path";
import { randomUUID } from "node:crypto";

/** Explicit private local outbox for development, with no external mail delivery. */
export function configuredEmail(): TransactionalEmail {
  if (process.env.OVU_MAIL_MODE !== "local-outbox") return smtpEmail();
  return {
    async send(message) {
      const origin = new URL(process.env.BETTER_AUTH_URL!);
      if (
        process.env.OVU_LOCAL_DEVELOPMENT !== "true" ||
        origin.protocol !== "http:" ||
        !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)
      )
        throw new Error("Local mail is restricted to loopback development");
      const directory = process.env.OVU_LOCAL_MAIL_DIRECTORY;
      if (!directory || !isAbsolute(directory))
        throw new Error("A private absolute local mail directory is required");
      await mkdir(directory, { recursive: true, mode: 0o700 });
      const target = await realpath(directory);
      // Reject any Git checkout, including a sibling repository or a symlink into one.
      for (let parent = target; ; parent = dirname(parent)) {
        if (
          await stat(join(parent, ".git")).then(
            () => true,
            (error: any) => {
              if (error.code === "ENOENT") return false;
              throw error;
            },
          )
        )
          throw new Error("Local mail must stay outside source repositories");
        if (parent === parse(parent).root) break;
      }
      await writeFile(join(target, randomUUID() + ".json"), JSON.stringify(message), {
        mode: 0o600,
        flag: "wx",
      });
    },
  };
}

/** No console/token fallback: delivery must be configured explicitly. */
export function smtpEmail(): TransactionalEmail {
  return {
    async send(message) {
      const {
        SMTP_HOST: host,
        SMTP_USER: user,
        SMTP_PASSWORD: pass,
        SMTP_FROM: from,
      } = process.env;
      const port = Number(process.env.SMTP_PORT ?? 587);
      if (!host || !user || !pass || !from || ![465, 587].includes(port) || /[\r\n]/.test(from)) {
        throw new Error("Transactional email delivery is not configured");
      }
      const transport = createTransport({
        host,
        port,
        secure: port === 465,
        requireTLS: true,
        auth: { user, pass },
        tls: { rejectUnauthorized: true },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      try {
        await transport.sendMail({
          from,
          to: message.to,
          subject: message.subject,
          text: `${message.subject}\n\n${message.url}\n\nIf you did not request this, ignore this email.`,
        });
      } catch {
        // Provider errors can contain credentials, recipients or verification URLs.
        throw new Error("Transactional email delivery failed");
      } finally {
        transport.close();
      }
    },
  };
}
