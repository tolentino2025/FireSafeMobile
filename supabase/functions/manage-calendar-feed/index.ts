// FireSafe ITM — Fase 7: gerar/revogar o token do feed .ics assinável.
// Autenticada (JWT do usuário). O token é gerado e o hash calculado NO SERVIDOR
// (o cliente nunca precisa de crypto). Guardamos só o hash (calendar_feed_tokens);
// a URL com o token é devolvida UMA vez e o app a guarda localmente para exibir.
//
// Ações (body JSON): { "action": "create" } | { "action": "revoke" }
//   create  → revoga tokens ativos antigos e cria um novo; devolve { token, feedUrl }
//   revoke  → desativa todos os tokens ativos do usuário
//
// Deploy: supabase functions deploy manage-calendar-feed   (verify_jwt = true, padrão)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ error: "missing authorization" }, 401);

  // Cliente com o JWT do usuário → RLS aplica (usuário só toca nas próprias linhas).
  const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  let action = "create";
  try {
    const body = await req.json();
    if (body?.action) action = String(body.action);
  } catch {
    /* sem body → create */
  }

  // Horizonte vem das preferências do usuário (default 90).
  const { data: pref } = await supabase
    .from("user_notification_preferences")
    .select("sync_horizon_days")
    .eq("user_id", user.id)
    .maybeSingle();
  const horizon = pref?.sync_horizon_days ?? 90;

  if (action === "revoke") {
    await supabase
      .from("calendar_feed_tokens")
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_active", true);
    return json({ ok: true, revoked: true });
  }

  // create: revoga ativos antigos e cria um novo.
  await supabase
    .from("calendar_feed_tokens")
    .update({ is_active: false, revoked_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const token = randomToken();
  const tokenHash = await sha256Hex(token);

  const { error } = await supabase.from("calendar_feed_tokens").insert({
    user_id: user.id,
    token_hash: tokenHash,
    horizon_days: horizon,
    is_active: true,
  });
  if (error) return json({ error: error.message }, 500);

  const feedUrl = `${SUPABASE_URL}/functions/v1/calendar-feed?token=${token}`;
  return json({ ok: true, token, feedUrl, horizonDays: horizon });
});
