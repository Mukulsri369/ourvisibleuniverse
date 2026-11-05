import { writeFile } from "node:fs/promises";
import { importCustomers } from "./customer-import.mjs";
const target = "https://pdvwkdggyyrfkoqrpbji.supabase.co";
async function main() {
  if (
    !process.argv.includes("--approved-customer-import") ||
    !process.argv.includes("--private-output")
  )
    throw new Error("Explicit approved import/private output flags required");
  if (
    process.env.SUPABASE_URL !== target ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("sb_secret_")
  )
    throw new Error("Wrong target configuration");
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  async function request(path, method = "GET", body) {
    const response = await fetch(target + path, {
      method,
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error("Owned-project API rejected a migration operation");
    return response.json();
  }
  const api = {
    async listUsers() {
      const users = [];
      for (let page = 1; ; page++) {
        if (page > 100) throw new Error("Pagination bound exceeded");
        const result = await request(`/auth/v1/admin/users?page=${page}&per_page=1000`);
        users.push(...result.users);
        if (result.users.length < 1000) return users;
      }
    },
    async listPasses() {
      const rows = await request("/rest/v1/access_passes?select=*&limit=1000");
      if (rows.length >= 1000) throw new Error("Expand pass pagination first");
      return rows;
    },
    createUser: (payload) => request("/auth/v1/admin/users", "POST", payload),
    insertPasses: (rows) => request("/rest/v1/access_passes", "POST", rows),
  };
  const result = await importCustomers({
    ...input,
    api,
    progress: (status) =>
      writeFile(
        new URL("../../../evidence/ovu-customer-import-progress.json", import.meta.url),
        JSON.stringify(status, null, 2),
      ),
  });
  process.stdout.write(JSON.stringify(result));
}
main().catch(() => {
  console.error(
    "Customer import stopped safely. Preserve created records and encrypted evidence; reconcile before resuming. No private values logged.",
  );
  process.exitCode = 1;
});
