// FireSafe ITM — Fase 7: feed .ics ASSINÁVEL (calendário que atualiza sozinho).
// PÚBLICA por design: Google/Apple/Outlook acessam a URL sem header de auth.
// A segurança vem do TOKEN secreto na URL (hash conferido contra calendar_feed_tokens).
// Usa service_role (ignora RLS) porque não há JWT do usuário aqui.
//
// Deploy: supabase functions deploy calendar-feed --no-verify-jwt
//   (ou defina verify_jwt=false em supabase/config.toml — já incluído.)
// URL: <project>/functions/v1/calendar-feed?token=XXXX

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DEFAULT_START_HOUR = 8;
const DEFAULT_DURATION_MIN = 60;
const NOTIFY_OFFSET_HOURS = 48;

interface FeedRow {
  occurrence_id: string;
  property_name: string | null;
  system: string | null;
  activity: string | null;
  frequency: string | null;
  description: string | null;
  due_date: string | null;
  scheduled_date: string | null;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function esc(text: string): string {
  return (text || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function icsTimes(dateStr: string): { start: string; end: string } {
  const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
  const startMin = DEFAULT_START_HOUR * 60;
  const endMin = startMin + DEFAULT_DURATION_MIN;
  const day = `${y}${pad(m)}${pad(d)}`;
  return {
    start: `${day}T${pad(Math.floor(startMin / 60) % 24)}${pad(startMin % 60)}00`,
    end: `${day}T${pad(Math.floor(endMin / 60) % 24)}${pad(endMin % 60)}00`,
  };
}

function nowUtc(): string {
  const d = new Date();
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function buildIcs(rows: FeedRow[]): string {
  const dtstamp = nowUtc();
  const events: string[] = [];
  for (const o of rows) {
    const base = o.scheduled_date || o.due_date;
    if (!base) continue;
    const { start, end } = icsTimes(base);
    const summary = `ITM — ${o.description || o.activity || "Atividade"}`;
    const desc = [
      o.property_name ? `Propriedade: ${o.property_name}` : "",
      o.system ? `Sistema: ${o.system}` : "",
      o.activity ? `Atividade: ${o.activity}` : "",
      o.frequency ? `Periodicidade: ${o.frequency}` : "",
      o.due_date ? `Vencimento: ${o.due_date}` : "",
      "Fonte oficial: FireSafe ITM.",
    ]
      .filter(Boolean)
      .join("\n");

    events.push(
      [
        "BEGIN:VEVENT",
        `UID:${o.occurrence_id}@firesafeitm`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${esc(summary)}`,
        `DESCRIPTION:${esc(desc)}`,
        o.property_name ? `LOCATION:${esc(o.property_name)}` : "",
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        `TRIGGER:-PT${NOTIFY_OFFSET_HOURS}H`,
        "ACTION:DISPLAY",
        "DESCRIPTION:Lembrete ITM 48h",
        "END:VALARM",
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n"),
    );
  }
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FireSafe ITM//NFPA 25//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:FireSafe ITM",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  if (!token) return new Response("missing token", { status: 400 });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const tokenHash = await sha256Hex(token);
  const { data: feed } = await supabase
    .from("calendar_feed_tokens")
    .select("user_id,horizon_days,is_active")
    .eq("token_hash", tokenHash)
    .eq("is_active", true)
    .maybeSingle();

  if (!feed) return new Response("invalid or revoked token", { status: 404 });

  const horizon = feed.horizon_days ?? 90;
  const today = new Date();
  const limit = new Date(today.getTime() + horizon * 24 * 60 * 60 * 1000);
  const todayStr = today.toISOString().slice(0, 10);
  const limitStr = limit.toISOString().slice(0, 10);

  const { data: rows } = await supabase
    .from("itm_occurrences")
    .select(
      "occurrence_id,property_name,system,activity,frequency,description,due_date,scheduled_date",
    )
    .eq("user_id", feed.user_id)
    .is("completed_at", null)
    .gte("due_date", todayStr)
    .lte("due_date", limitStr)
    .order("due_date", { ascending: true })
    .limit(500);

  const ics = buildIcs((rows ?? []) as FeedRow[]);
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="firesafe-itm.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
});
