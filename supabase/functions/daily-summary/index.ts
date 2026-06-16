// FireSafe ITM — Fase 9: resumo diário por e-mail (Brevo).
//
// Para cada usuário com daily_summary_enabled = true, agrupa as ocorrências por
// propriedade/sistema: VENCIDAS + a vencer no horizonte, e manda UM e-mail-resumo.
// Idempotente por dia: notification_logs com occurrence_id = 'daily-YYYY-MM-DD',
// channel = 'email_daily', offset_minutes = 0 (unique impede 2 envios no mesmo dia).
//
// Disparado 1x/dia pelo pg_cron (migration 0004). Segredos: BREVO_API_KEY,
// NOTIFY_FROM_EMAIL, NOTIFY_FROM_NAME (mesmos do notify-48h).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("NOTIFY_FROM_EMAIL") ?? "no-reply@firesafe-itm.app";
const FROM_NAME = Deno.env.get("NOTIFY_FROM_NAME") ?? "FireSafe ITM";
const CHANNEL = "email_daily";

interface OccRow {
  user_id: string;
  company_id: string | null;
  occurrence_id: string;
  property_name: string | null;
  system: string | null;
  activity: string | null;
  description: string | null;
  due_date: string | null;
  email: string | null;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function summaryHtml(
  overdue: OccRow[],
  upcoming: OccRow[],
): string {
  const row = (o: OccRow) =>
    `<tr>
       <td style="padding:6px 10px;border-bottom:1px solid #eee">${o.due_date ?? ""}</td>
       <td style="padding:6px 10px;border-bottom:1px solid #eee">${o.description || o.activity || ""}</td>
       <td style="padding:6px 10px;border-bottom:1px solid #eee;color:#6b6660">${o.property_name ?? ""}${o.system ? " · " + o.system : ""}</td>
     </tr>`;
  const section = (titulo: string, cor: string, itens: OccRow[]) =>
    itens.length
      ? `<h3 style="margin:18px 0 6px;color:${cor};font-size:15px">${titulo} (${itens.length})</h3>
         <table style="width:100%;border-collapse:collapse;font-size:13px">
           <tr style="text-align:left;color:#9a958d">
             <th style="padding:6px 10px">Venc.</th><th style="padding:6px 10px">Atividade</th><th style="padding:6px 10px">Local</th>
           </tr>
           ${itens.map(row).join("")}
         </table>`
      : "";

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:auto">
      <div style="background:#CE3A26;color:#fff;padding:16px 20px;border-radius:12px 12px 0 0">
        <h2 style="margin:0;font-size:18px">FireSafe ITM — Resumo do dia</h2>
      </div>
      <div style="border:1px solid #e5e2dc;border-top:none;padding:20px;border-radius:0 0 12px 12px">
        ${section("⚠️ Vencidas", "#CE3A26", overdue)}
        ${section("📅 A vencer", "#1f6feb", upcoming)}
        ${overdue.length + upcoming.length === 0 ? "<p>Nada pendente. 👍</p>" : ""}
        <p style="font-size:12px;color:#9a958d;margin:18px 0 0">
          Resumo diário do FireSafe ITM. Ajuste em Perfil &gt; Notificações e Calendário.
        </p>
      </div>
    </div>`;
}

async function sendEmail(to: string, html: string): Promise<void> {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY ausente");
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
      subject: "FireSafe ITM — Resumo diário",
      htmlContent: html,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const day = todayStr();
  const dailyId = `daily-${day}`;
  const summary = { users: 0, sent: 0, skipped: 0, failed: 0 };

  // Usuários que querem o resumo diário.
  const { data: prefs } = await supabase
    .from("user_notification_preferences")
    .select("user_id,sync_horizon_days")
    .eq("daily_summary_enabled", true);

  for (const pref of prefs ?? []) {
    summary.users++;
    const userId = pref.user_id as string;

    // Idempotência diária.
    const { data: already } = await supabase
      .from("notification_logs")
      .select("status")
      .eq("user_id", userId)
      .eq("occurrence_id", dailyId)
      .eq("channel", CHANNEL)
      .eq("offset_minutes", 0)
      .maybeSingle();
    if (already && already.status === "sent") {
      summary.skipped++;
      continue;
    }

    const horizon = (pref.sync_horizon_days as number) ?? 90;
    const limit = new Date(Date.now() + horizon * 86400000)
      .toISOString()
      .slice(0, 10);

    const { data: occs } = await supabase
      .from("itm_occurrences")
      .select(
        "user_id,company_id,occurrence_id,property_name,system,activity,description,due_date,email",
      )
      .eq("user_id", userId)
      .is("completed_at", null)
      .lte("due_date", limit)
      .order("due_date", { ascending: true })
      .limit(500);

    const rows = (occs ?? []) as OccRow[];
    if (rows.length === 0) {
      summary.skipped++;
      continue;
    }
    const to = rows.find((r) => r.email)?.email;
    if (!to) {
      summary.skipped++;
      continue;
    }

    const overdue = rows.filter((r) => (r.due_date ?? "") < day);
    const upcoming = rows.filter((r) => (r.due_date ?? "") >= day);

    try {
      await sendEmail(to, summaryHtml(overdue, upcoming));
      summary.sent++;
      await supabase.from("notification_logs").upsert(
        {
          user_id: userId,
          company_id: rows[0].company_id,
          occurrence_id: dailyId,
          channel: CHANNEL,
          offset_minutes: 0,
          status: "sent",
          sent_at: new Date().toISOString(),
          last_attempt_at: new Date().toISOString(),
        },
        { onConflict: "user_id,occurrence_id,channel,offset_minutes" },
      );
    } catch (e) {
      summary.failed++;
      await supabase.from("notification_logs").upsert(
        {
          user_id: userId,
          company_id: rows[0].company_id,
          occurrence_id: dailyId,
          channel: CHANNEL,
          offset_minutes: 0,
          status: "failed",
          error_message: String(e),
          last_attempt_at: new Date().toISOString(),
        },
        { onConflict: "user_id,occurrence_id,channel,offset_minutes" },
      );
    }
  }

  return new Response(JSON.stringify({ ok: true, day, ...summary }), {
    headers: { "Content-Type": "application/json" },
  });
});
