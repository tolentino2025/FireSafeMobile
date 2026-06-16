// FireSafe ITM — Fase 5: worker de e-mail 48h (Supabase Edge Function / Deno).
//
// O QUE FAZ:
//   1. Varre public.itm_occurrences com notify_at já vencido (<= agora), não concluídas.
//   2. Respeita user_notification_preferences.email_48h_enabled (default: ligado).
//   3. Pula o que já foi enviado (notification_logs — idempotência).
//   4. Envia e-mail via Brevo (Sendinblue) e grava o log.
//
// COMO RODAR:
//   - Disparado a cada 60 min pelo pg_cron (ver migration 0003_cron_notify_48h.sql).
//   - Também pode ser chamado manualmente: supabase functions invoke notify-48h
//
// SEGREDOS (NÃO vão para o cliente) — definir com:
//   supabase secrets set BREVO_API_KEY=xkeysib-...
//   supabase secrets set NOTIFY_FROM_EMAIL="itm@seu-dominio" NOTIFY_FROM_NAME="FireSafe ITM"
//   (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem no runtime das Edge Functions.)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("NOTIFY_FROM_EMAIL") ?? "no-reply@firesafe-itm.app";
const FROM_NAME = Deno.env.get("NOTIFY_FROM_NAME") ?? "FireSafe ITM";
const CHANNEL = "email";
const OFFSET_MINUTES = 2880; // 48h
const MAX_RETRIES = 3; // após 3 falhas, desiste (fica registrado no notification_logs)

interface OccRow {
  id: string;
  user_id: string;
  company_id: string | null;
  occurrence_id: string;
  property_name: string | null;
  system: string | null;
  activity: string | null;
  frequency: string | null;
  description: string | null;
  email: string | null;
  due_date: string | null;
  scheduled_date: string | null;
  notify_at: string | null;
}

function emailHtml(o: OccRow): string {
  const titulo = o.activity || o.description || "Atividade ITM";
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto">
      <div style="background:#CE3A26;color:#fff;padding:16px 20px;border-radius:12px 12px 0 0">
        <h2 style="margin:0;font-size:18px">FireSafe ITM — Vence em 48 horas</h2>
      </div>
      <div style="border:1px solid #e5e2dc;border-top:none;padding:20px;border-radius:0 0 12px 12px">
        <p style="font-size:15px;margin:0 0 12px">A atividade abaixo vence em <b>48 horas</b>:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#6b6660">Atividade</td><td style="padding:6px 0"><b>${titulo}</b></td></tr>
          ${o.system ? `<tr><td style="padding:6px 0;color:#6b6660">Sistema</td><td style="padding:6px 0">${o.system}</td></tr>` : ""}
          ${o.property_name ? `<tr><td style="padding:6px 0;color:#6b6660">Propriedade</td><td style="padding:6px 0">${o.property_name}</td></tr>` : ""}
          ${o.frequency ? `<tr><td style="padding:6px 0;color:#6b6660">Periodicidade</td><td style="padding:6px 0">${o.frequency}</td></tr>` : ""}
          ${o.due_date ? `<tr><td style="padding:6px 0;color:#6b6660">Vencimento</td><td style="padding:6px 0"><b>${o.due_date}</b></td></tr>` : ""}
        </table>
        <p style="font-size:12px;color:#9a958d;margin:18px 0 0">
          Você recebe este aviso porque ativou lembretes por e-mail no FireSafe ITM.
          Ajuste em Perfil &gt; Notificações e Calendário.
        </p>
      </div>
    </div>`;
}

async function sendEmail(to: string, o: OccRow): Promise<void> {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY ausente");
  // Brevo (Sendinblue) — API transacional: POST https://api.brevo.com/v3/smtp/email
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject: `ITM vence em 48h: ${o.activity || o.description || "atividade"}`,
      htmlContent: emailHtml(o),
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Brevo ${res.status}: ${txt}`);
  }
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const nowIso = new Date().toISOString();
  const summary = { scanned: 0, sent: 0, skipped: 0, failed: 0 };

  // 1) Ocorrências cuja janela de 48h já chegou e ainda não foram concluídas.
  const { data: occs, error } = await supabase
    .from("itm_occurrences")
    .select(
      "id,user_id,company_id,occurrence_id,property_name,system,activity,frequency,description,email,due_date,scheduled_date,notify_at",
    )
    .is("completed_at", null)
    .lte("notify_at", nowIso)
    .not("notify_at", "is", null)
    .limit(500);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  for (const occ of (occs ?? []) as OccRow[]) {
    summary.scanned++;

    // 2) Preferência do usuário (default: e-mail ligado se não houver linha).
    const { data: pref } = await supabase
      .from("user_notification_preferences")
      .select("email_48h_enabled")
      .eq("user_id", occ.user_id)
      .maybeSingle();
    if (pref && pref.email_48h_enabled === false) {
      summary.skipped++;
      continue;
    }

    // 3) Idempotência + retries: já enviado, ou falhou demais? (auditoria via log)
    const { data: existing } = await supabase
      .from("notification_logs")
      .select("id,status,retry_count")
      .eq("user_id", occ.user_id)
      .eq("occurrence_id", occ.occurrence_id)
      .eq("channel", CHANNEL)
      .eq("offset_minutes", OFFSET_MINUTES)
      .maybeSingle();
    if (existing && existing.status === "sent") {
      summary.skipped++;
      continue;
    }
    const priorRetries = existing?.retry_count ?? 0;
    if (existing && existing.status === "failed" && priorRetries >= MAX_RETRIES) {
      summary.skipped++; // desistiu após MAX_RETRIES tentativas (registrado no log)
      continue;
    }

    const to = occ.email;
    if (!to) {
      summary.skipped++;
      continue;
    }

    // 4) Enviar + logar (com auditoria de tentativa/retry).
    const nowAttempt = new Date().toISOString();
    try {
      await sendEmail(to, occ);
      summary.sent++;
      await supabase.from("notification_logs").upsert(
        {
          user_id: occ.user_id,
          company_id: occ.company_id,
          occurrence_id: occ.occurrence_id,
          channel: CHANNEL,
          offset_minutes: OFFSET_MINUTES,
          status: "sent",
          sent_at: nowAttempt,
          last_attempt_at: nowAttempt,
          retry_count: priorRetries,
        },
        { onConflict: "user_id,occurrence_id,channel,offset_minutes" },
      );
    } catch (e) {
      summary.failed++;
      await supabase.from("notification_logs").upsert(
        {
          user_id: occ.user_id,
          company_id: occ.company_id,
          occurrence_id: occ.occurrence_id,
          channel: CHANNEL,
          offset_minutes: OFFSET_MINUTES,
          status: "failed",
          error_message: String(e),
          last_attempt_at: nowAttempt,
          retry_count: priorRetries + 1,
        },
        { onConflict: "user_id,occurrence_id,channel,offset_minutes" },
      );
    }
  }

  return new Response(JSON.stringify({ ok: true, at: nowIso, ...summary }), {
    headers: { "Content-Type": "application/json" },
  });
});
