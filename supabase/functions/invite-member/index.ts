// FireSafe ITM — Fase 2B: convidar membro para a empresa (e-mail via Brevo).
// Autenticada. O chamador precisa ser owner/admin da empresa (garantido pela RLS
// de company_invites). Gera token, guarda só o hash, e envia o convite por e-mail.
//
// Deploy: supabase functions deploy invite-member
// Body: { companyId, email, role }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("NOTIFY_FROM_EMAIL") ?? "no-reply@firesafe-itm.app";
const FROM_NAME = Deno.env.get("NOTIFY_FROM_NAME") ?? "FireSafe ITM";
const APP_URL = Deno.env.get("APP_URL") ?? "https://fire-safe-mobile.vercel.app";

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function sendInviteEmail(to: string, company: string, role: string, token: string) {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY ausente");
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto">
      <div style="background:#CE3A26;color:#fff;padding:16px 20px;border-radius:12px 12px 0 0">
        <h2 style="margin:0;font-size:18px">Convite — FireSafe ITM</h2>
      </div>
      <div style="border:1px solid #e5e2dc;border-top:none;padding:20px;border-radius:0 0 12px 12px">
        <p>Você foi convidado para a empresa <b>${company}</b> no FireSafe ITM como <b>${role}</b>.</p>
        <p>Para aceitar: abra o app, faça login com <b>${to}</b> e vá em
           <b>Perfil &gt; Empresa / Equipe &gt; Aceitar convite</b>, colando o código abaixo:</p>
        <p style="font-size:16px;background:#f3f1ec;border:1px solid #e5e2dc;border-radius:8px;padding:12px;word-break:break-all">
          <b>${token}</b>
        </p>
        <p><a href="${APP_URL}" style="color:#CE3A26">Abrir o FireSafe ITM</a></p>
        <p style="font-size:12px;color:#9a958d">O convite expira em 14 dias.</p>
      </div>
    </div>`;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject: `Convite para ${company} — FireSafe ITM`,
      htmlContent: html,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ error: "missing authorization" }, 401);

  const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  let companyId = "", email = "", role = "inspector";
  try {
    const b = await req.json();
    companyId = String(b.companyId ?? "");
    email = String(b.email ?? "").trim();
    role = String(b.role ?? "inspector");
  } catch { /* ignore */ }
  if (!companyId || !email) return json({ error: "companyId e email são obrigatórios" }, 400);

  // Nome da empresa (RLS garante que o chamador é membro).
  const { data: company } = await supabase
    .from("companies").select("name").eq("id", companyId).maybeSingle();
  if (!company) return json({ error: "empresa não encontrada ou sem acesso" }, 403);

  const token = randomToken();
  const tokenHash = await sha256Hex(token);

  // Insere o convite — a RLS (invites_write) exige owner/admin; se não for, falha.
  const { error } = await supabase.from("company_invites").insert({
    company_id: companyId,
    email,
    role,
    token_hash: tokenHash,
  });
  if (error) return json({ error: error.message }, 403);

  try {
    await sendInviteEmail(email, company.name as string, role, token);
  } catch (e) {
    // Convite criado, mas e-mail falhou — devolve o token para o admin repassar.
    return json({ ok: true, emailed: false, token, warning: String(e) });
  }
  return json({ ok: true, emailed: true });
});
