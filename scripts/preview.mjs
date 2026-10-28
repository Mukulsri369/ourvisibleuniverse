// Preview the actual Nitro Cloudflare build under Node without rebuilding or deploying it.
import { createServer } from "node:http";
import { Readable } from "node:stream";
import { readFile, stat } from "node:fs/promises";
import { resolve, relative, extname, sep, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
try {
  process.loadEnvFile(resolve(root, ".env"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const args = process.argv.slice(2);
const value = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};
const port = Number(value("--port", process.env.PORT || "4173"));
const host = value("--host", "127.0.0.1");
if (!Number.isInteger(port) || port < 1 || port > 65535 || !host) {
  throw new Error("Use --port 1..65535 and a valid --host.");
}
const publicRoot = resolve(root, ".output/public");
const entry = resolve(root, ".output/server/index.mjs");
try {
  await stat(entry);
} catch {
  throw new Error("No production build found. Run npm run build before npm run preview.");
}
const { default: worker } = await import(pathToFileURL(entry).href);
const mime = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};
const assets = {
  async fetch(request) {
    if (!["GET", "HEAD"].includes(request.method)) return new Response(null, { status: 405 });
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url).pathname);
    } catch {
      return new Response(null, { status: 400 });
    }
    const file = resolve(publicRoot, "." + pathname);
    const inside = relative(publicRoot, file);
    if (
      !inside ||
      isAbsolute(inside) ||
      inside === ".." ||
      inside.startsWith(".." + sep) ||
      resolve(publicRoot, inside) !== file
    ) {
      return new Response(null, { status: 404 });
    }
    try {
      const bytes = await readFile(file);
      return new Response(request.method === "HEAD" ? null : bytes, {
        headers: {
          "content-type": mime[extname(file)] || "application/octet-stream",
          "content-length": String(bytes.byteLength),
        },
      });
    } catch {
      return new Response(null, { status: 404 });
    }
  },
};
const server = createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(
      incoming.url || "/",
      "http://" + (incoming.headers.host || host + ":" + port),
    );
    const method = incoming.method || "GET";
    const headers = new Headers();
    for (const [key, value] of Object.entries(incoming.headers)) {
      if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
      else if (value !== undefined) headers.set(key, value);
    }
    const init = { method, headers };
    if (method !== "GET" && method !== "HEAD") {
      init.body = Readable.toWeb(incoming);
      init.duplex = "half";
    }
    const request = new Request(url, init);
    const response = await worker.fetch(
      request,
      { ...process.env, ASSETS: assets },
      {
        waitUntil: (promise) => Promise.resolve(promise).catch(console.error),
      },
    );
    outgoing.statusCode = response.status;
    response.headers.forEach((value, key) => {
      if (key !== "set-cookie") outgoing.setHeader(key, value);
    });
    const cookies = response.headers.getSetCookie();
    if (cookies.length) outgoing.setHeader("set-cookie", cookies);
    if (!response.body || method === "HEAD") outgoing.end();
    else
      Readable.fromWeb(response.body)
        .on("error", () => outgoing.destroy())
        .pipe(outgoing);
  } catch (error) {
    console.error(error);
    if (!outgoing.headersSent) outgoing.writeHead(500, { "content-type": "text/plain" });
    outgoing.end("The local preview could not complete this request.");
  }
});
server.listen(port, host, () => console.log("Production preview: http://" + host + ":" + port));
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => server.close(() => process.exit(0)));
