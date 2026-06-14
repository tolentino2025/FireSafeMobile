// Schema Drizzle (pg-core) do motor de agendamento ITM.
// Granularidade de data = dia. Datas no dominio sao colunas `date` (string YYYY-MM-DD),
// nunca timestamptz.
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Enums de dominio.
export const frequencyUnit = pgEnum("frequency_unit", [
  "day",
  "week",
  "month",
  "year",
]);

export const anchorMode = pgEnum("anchor_mode", ["calendar", "completion"]);

export const occurrenceStatus = pgEnum("occurrence_status", [
  "scheduled",
  "due",
  "completed",
  "skipped",
  "overdue",
]);

// Modelos normativos de atividade (templates de tarefa ITM).
export const itmTaskTemplates = pgTable("itm_task_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  system: text("system").notNull(),
  activity: text("activity").notNull(),
  description: text("description").notNull(),
  intervalUnit: frequencyUnit("interval_unit").notNull(),
  intervalCount: integer("interval_count").notNull(),
  toleranceDays: integer("tolerance_days").notNull().default(0),
  anchorMode: anchorMode("anchor_mode").notNull().default("calendar"),
  normativeRef: text("normative_ref").notNull(),
  sourceRef: text("source_ref").array().notNull().default([]),
  active: boolean("active").notNull().default(true),
});

// Plano de ITM associado a um ativo.
export const itmPlans = pgTable("itm_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id").notNull(),
  startDate: date("start_date").notNull(),
  normativeProfile: text("normative_profile").notNull().default("nfpa25"),
});

// Ocorrencias agendadas. unique(planId, templateId, dueDate) eh a chave de idempotencia.
export const itmOccurrences = pgTable(
  "itm_occurrences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id").notNull(),
    templateId: uuid("template_id").notNull(),
    dueDate: date("due_date").notNull(),
    scheduledDate: date("scheduled_date").notNull(),
    windowStart: date("window_start").notNull(),
    windowEnd: date("window_end").notNull(),
    status: occurrenceStatus("status").notNull().default("scheduled"),
    completedAt: date("completed_at"),
  },
  (t) => ({
    idempotencia: unique("itm_occurrences_plan_template_due_unq").on(
      t.planId,
      t.templateId,
      t.dueDate,
    ),
  }),
);
