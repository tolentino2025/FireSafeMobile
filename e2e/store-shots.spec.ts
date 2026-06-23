import { test } from "@playwright/test";
import { clickTab, waitForApp } from "./helpers/nav";
import { injectScopedData } from "./helpers/storage";

// Captura screenshots reais do app (com dados de exemplo) para a ficha da Play
// Store, nos tamanhos definidos por cada projeto.
// Saída: store-assets/<projeto>/<n>-<aba>.png

const TABS: { label: string; file: string }[] = [
  { label: "Inicio", file: "1-inicio" },
  { label: "Inspeções", file: "2-inspecoes" },
  { label: "Agenda", file: "3-agenda" },
  { label: "Cadastros", file: "4-cadastros" },
  { label: "Perfil", file: "5-perfil" },
];

// Inspeções de exemplo (campos mínimos que as telas leem). Datas em junho/2026.
const now = "2026-06-23T12:00:00.000Z";
const mk = (
  id: string,
  type: string,
  status: string,
  propertyName: string,
  date: string,
) => ({
  id,
  type,
  status,
  propertyName,
  propertyAddress: "Av. Paulista, 1000 - São Paulo/SP",
  propertyPhone: "(11) 3000-0000",
  inspectorName: "Cleiton Almeida",
  contractNo: `CT-2026-${id}`,
  date,
  frequency: "monthly",
  checklist: [],
  observations: "",
  signature: null,
  photos: [],
  createdAt: now,
  updatedAt: now,
  version: 1,
});

const SAMPLE_INSPECTIONS = [
  mk("001", "wet_pipe", "completed", "Edifício Comercial Centro", "2026-06-21"),
  mk("002", "pump_monthly", "completed", "Galpão Industrial Norte", "2026-06-18"),
  mk("003", "hydrant_flow", "in_progress", "Shopping Plaza Sul", "2026-06-22"),
  mk("004", "standpipe", "pending", "Hospital São Lucas", "2026-06-23"),
  mk("005", "water_tank", "completed", "Condomínio Jardins", "2026-06-13"),
  mk("006", "dry_pipe", "draft", "Centro Logístico Oeste", "2026-06-20"),
];

const SAMPLE_COMPANIES = [
  { id: "c1", name: "JONEL INCÊNDIO", cnpj: "12.345.678/0001-90", city: "São Paulo", state: "SP", createdAt: now, updatedAt: now },
];

test("captura telas para a loja (com dados)", async ({ page }, testInfo) => {
  const dir = `store-assets/${testInfo.project.name}`;
  await page.goto("/");
  await waitForApp(page);

  // Semeia dados no escopo guest e recarrega para os contextos lerem.
  await injectScopedData(page, "@firesafe_inspections", "u:guest", SAMPLE_INSPECTIONS);
  await injectScopedData(page, "@firesafe_companies", "u:guest", SAMPLE_COMPANIES);
  await page.reload();
  await waitForApp(page);

  for (const tab of TABS) {
    await clickTab(page, tab.label);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${dir}/${tab.file}.png` });
  }
});
