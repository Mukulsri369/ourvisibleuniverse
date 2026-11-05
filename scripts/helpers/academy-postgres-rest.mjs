// Test-only HTTP adapter: production Supabase SDK queries execute real PostgreSQL.
// It never forwards requests to a network or production project.
export function academyPostgresFetch(database, control = {}) {
  return async (input, init = {}) => {
    control.calls = (control.calls ?? 0) + 1;
    if (control.unavailable) return Response.json({ message: "Synthetic storage outage" }, { status: 503 });
    const url = new URL(typeof input === "string" ? input : input instanceof Request ? input.url : String(input));
    if (control.failProfile && url.pathname === "/rest/v1/student_profiles") return Response.json({ message: "Synthetic profile outage" }, { status: 503 });
    if (url.origin !== "http://127.0.0.1:37999") throw new Error("Unexpected test network destination");
    const headers = new Headers(init.headers), method = init.method ?? "GET";
    const db = database();
    try {
      const certificateRpc = {
        academy_certificate_context: ["p_user_id"],
        academy_issue_certificate: ["p_user_id", "p_attempt_id", "p_payload"],
        academy_admin_certificate_change: ["p_actor_id", "p_number", "p_action", "p_reason", "p_expected_updated_at", "p_payload"],
      };
      const rpcName = url.pathname.split("/").at(-1);
      if (url.pathname.startsWith("/rest/v1/rpc/") && certificateRpc[rpcName]) {
        const value = JSON.parse(init.body), keys = certificateRpc[rpcName];
        const args = keys.map(key => key === "p_payload" && value[key] !== null ? JSON.stringify(value[key]) : value[key]);
        const result = await db.query(`SELECT public.${rpcName}(${args.map((_, index) => "$" + (index + 1)).join(",")}) AS result`, args);
        return Response.json(result.rows[0].result);
      }
      if (url.pathname === "/rest/v1/rpc/academy_commit_official_attempt") {
        const value = JSON.parse(init.body);
        const result = await db.query("SELECT public.academy_commit_official_attempt($1,$2,$3,$4) AS result", [value.p_session_id, value.p_user_id, JSON.stringify(value.p_answers), value.p_result === null ? null : JSON.stringify(value.p_result)]);
        return Response.json(result.rows[0].result);
      }
      if (url.pathname === "/rest/v1/rpc/academy_apply_verified_completion") {
        const value = JSON.parse(init.body);
        const result = await db.query("SELECT public.academy_apply_verified_completion($1,$2,$3,$4) AS result", [value.p_user_id, value.p_module_id, JSON.stringify(value.p_rule), value.p_badge_id]);
        return Response.json(result.rows[0].result);
      }
      if (url.pathname === "/rest/v1/rpc/academy_sync_stage_achievements") {
        const value = JSON.parse(init.body);
        const result = await db.query("SELECT public.academy_sync_stage_achievements($1,$2) AS result", [value.p_user_id, JSON.stringify(value.p_badges)]);
        return Response.json(result.rows[0].result);
      }
      const table = url.pathname.split("/").at(-1);
      if (!/^academy_[a-z_]+$/.test(table) && table !== "student_profiles") throw new Error("Unexpected fixture table");
      const quote = name => { if (!/^[a-z_]+$/.test(name)) throw new Error("Invalid fixture identifier"); return `"${name}"`; };
      let rows;
      if (method === "POST") {
        const data = JSON.parse(init.body), columns = Object.keys(data);
        const arrayColumns = ["assigned_question_ids", "qualifying_evidence_ids", "qualifying_module_ids"];
        rows = (await db.query(`INSERT INTO public.${quote(table)}(${columns.map(quote).join(",")}) VALUES(${columns.map((_, i) => "$" + (i + 1)).join(",")}) RETURNING *`, columns.map(key => typeof data[key] === "object" && data[key] !== null && !arrayColumns.includes(key) ? JSON.stringify(data[key]) : data[key]))).rows;
      } else if (method === "GET" || method === "HEAD") {
        const values = [], where = [];
        for (const [key, value] of url.searchParams) {
          if (["select", "order", "limit", "offset"].includes(key)) continue;
          if (value.startsWith("eq.")) { values.push(value.slice(3)); where.push(`${quote(key)}=$${values.length}`); }
          else if (value.startsWith("in.(") && value.endsWith(")")) { values.push(value.slice(4, -1).split(",")); where.push(`${quote(key)}=ANY($${values.length})`); }
          else throw new Error("Unsupported test filter");
        }
        const selection = url.searchParams.get("select") ?? "*";
        const select = selection === "*" ? "*" : selection.split(",").map(quote).join(",");
        let query = `SELECT ${select} FROM public.${quote(table)}${where.length ? " WHERE " + where.join(" AND ") : ""}`;
        const order = url.searchParams.get("order");
        if (order) { const [column, direction] = order.split("."); query += ` ORDER BY ${quote(column)} ${direction === "desc" ? "DESC" : "ASC"}`; }
        for (const keyword of ["limit", "offset"]) {
          const value = url.searchParams.get(keyword);
          if (value) { if (!/^\d+$/.test(value)) throw new Error("Invalid test page"); query += ` ${keyword} ${value}`; }
        }
        rows = (await db.query(query, values)).rows;
      } else throw new Error("Unexpected fixture write");
      return new Response(method === "HEAD" ? null : JSON.stringify(headers.get("Accept")?.includes("vnd.pgrst.object") ? rows[0] ?? null : rows), {
        status: 200, headers: { "Content-Type": "application/json", "Content-Range": `0-${Math.max(0, rows.length - 1)}/${rows.length}` },
      });
    } catch (error) {
      return Response.json({ message: "Synthetic PostgreSQL constraint or permission rejection", code: error.code ?? "XX000" }, { status: error.code === "23505" ? 409 : 400 });
    }
  };
}
