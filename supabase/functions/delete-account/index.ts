// FireSafe ITM — Exclusão de conta e dados (LGPD / Google Play User Data policy).
// Autenticada: o usuário só pode excluir a PRÓPRIA conta (id vem do JWT, nunca do body).
// Usa a service_role apenas no servidor para apagar dados pessoais e o usuário de auth.
//
// Deploy: supabase functions deploy delete-account
// Body: {} (nenhum parâmetro — a identidade vem do token)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const COMPANY_BUCKET = "company-files";

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });

// Tabelas com coluna user_id (dados pessoais escopados por usuário). Conferidas
// contra as migrations 0001/0002/0005. Limpeza best-effort: erro pontual numa
// tabela não impede a exclusão das demais nem da conta.
const USER_SCOPED_TABLES = [
  "user_push_tokens",
  "itm_occurrences",
  "notification_logs",
  "user_notification_preferences",
  "user_calendar_connections",
  "itm_calendar_events",
  "calendar_feed_tokens",
  "company_members", // remove a associação às empresas mantidas (com outros membros)
];

// Remove recursivamente todos os arquivos do bucket sob o prefixo da empresa.
async function deleteCompanyFiles(
  admin: ReturnType<typeof createClient>,
  companyId: string,
): Promise<number> {
  const bucket = admin.storage.from(COMPANY_BUCKET);
  let removed = 0;

  async function rm(prefix: string): Promise<void> {
    const { data, error } = await bucket.list(prefix, { limit: 1000 });
    if (error || !data) return;
    const files: string[] = [];
    for (const item of data) {
      const path = `${prefix}/${item.name}`;
      // Pastas vêm sem id/metadata no storage.list; arquivos têm id.
      if ((item as { id?: string | null }).id == null) {
        await rm(path);
      } else {
        files.push(path);
      }
    }
    if (files.length > 0) {
      const { error: rmErr } = await bucket.remove(files);
      if (!rmErr) removed += files.length;
    }
  }

  await rm(companyId);
  return removed;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ error: "missing authorization" }, 401);

  // 1) Identifica o usuário a partir do token (cliente anônimo com o JWT do app).
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: "unauthorized" }, 401);

  // 2) Cliente admin (service_role) — só existe no servidor, nunca no app.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const report: Record<string, unknown> = {};

  // 3) Empresas em que o usuário é membro. Onde for o ÚNICO membro, a empresa
  //    (e tudo dela: company_data, arquivos, convites) é removida. Empresas com
  //    outros membros são preservadas — apenas a associação do usuário sai (passo 4).
  const { data: memberships } = await admin
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id);

  const companiesDeleted: string[] = [];
  let filesRemoved = 0;
  for (const m of memberships ?? []) {
    const companyId = (m as { company_id: string }).company_id;
    const { count } = await admin
      .from("company_members")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId);

    if ((count ?? 0) <= 1) {
      // Único membro → apaga arquivos do Storage e a empresa (cascade limpa o resto).
      filesRemoved += await deleteCompanyFiles(admin, companyId);
      const { error: delCoErr } = await admin.from("companies").delete().eq("id", companyId);
      if (!delCoErr) companiesDeleted.push(companyId);
    }
  }
  report.companiesDeleted = companiesDeleted;
  report.storageFilesRemoved = filesRemoved;

  // 4) Apaga dados pessoais escopados por usuário (inclui company_members das
  //    empresas mantidas; as já removidas no passo 3 saíram via cascade).
  const cleanup: Record<string, string> = {};
  for (const table of USER_SCOPED_TABLES) {
    const { error } = await admin.from(table).delete().eq("user_id", user.id);
    cleanup[table] = error ? `skip: ${error.message}` : "ok";
  }
  report.cleanup = cleanup;

  // 5) Exclui a conta de autenticação (irreversível).
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return json({ error: `falha ao excluir conta: ${delErr.message}`, report }, 500);

  return json({ ok: true, deletedUserId: user.id, report });
});
