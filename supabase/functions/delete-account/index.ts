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

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });

// Tabelas com dados escopados por usuário (user_id). Limpeza best-effort:
// uma tabela inexistente ou erro pontual não deve impedir a exclusão da conta.
const USER_SCOPED_TABLES = [
  "user_push_tokens",
  "itm_occurrences",
  "notification_settings",
  "calendar_feeds",
  "company_members",
];

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

  // 3) Apaga dados pessoais escopados por usuário (best-effort).
  const cleanup: Record<string, string> = {};
  for (const table of USER_SCOPED_TABLES) {
    const { error } = await admin.from(table).delete().eq("user_id", user.id);
    cleanup[table] = error ? `skip: ${error.message}` : "ok";
  }

  // 4) Exclui a conta de autenticação (irreversível). Linhas com FK ON DELETE
  // CASCADE para auth.users são removidas automaticamente pelo banco.
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return json({ error: `falha ao excluir conta: ${delErr.message}`, cleanup }, 500);

  return json({ ok: true, deletedUserId: user.id, cleanup });
});
