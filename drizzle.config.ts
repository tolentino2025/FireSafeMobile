import { defineConfig } from "drizzle-kit";

// Config Drizzle do motor de agendamento ITM (Postgres).
export default defineConfig({
  dialect: "postgresql",
  schema: "./server/scheduler/schema.ts",
  out: "./server/scheduler/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/firesafeitm",
  },
});
