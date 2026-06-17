// Teste de DIAGNÓSTICO (não faz parte da suíte normal).
// Só roda quando E2E_DIAGNOSE=1. Navega até o app, espera, e imprime no
// stdout (visível no log do CI) o que foi renderizado e quaisquer erros de
// console/página — para descobrir por que waitForApp("Perfil") não encontra
// a tab bar no CI.

import { test } from "@playwright/test";

test("diagnóstico: o que o app renderiza no CI", async ({ page }) => {
  test.skip(!process.env.E2E_DIAGNOSE, "diagnóstico só roda sob demanda (E2E_DIAGNOSE=1)");

  const logs: string[] = [];
  page.on("console", (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}\n${e.stack ?? ""}`));
  page.on("requestfailed", (r) =>
    logs.push(`[requestfailed] ${r.url()} :: ${r.failure()?.errorText ?? "?"}`),
  );

  await page.goto("/", { waitUntil: "load" });
  // Tempo generoso para o bundle/app montarem e o AuthContext resolver.
  await page.waitForTimeout(15_000);

  const title = await page.title().catch(() => "<no title>");
  const bodyText = (await page.locator("body").innerText().catch(() => "<no body>")).slice(0, 1500);
  const tabCount = await page.getByRole("tab").count().catch(() => -1);
  const perfilCount = await page.getByText("Perfil").count().catch(() => -1);
  // Conta elementos do shell para distinguir splash vs ErrorBoundary vs tabs.
  const spinnerCount = await page.locator('[role="progressbar"], .css-view [aria-busy="true"]').count().catch(() => -1);
  const rootText = await page.locator("#root, #main, body > div").first().innerText().catch(() => "<no root>");

  // Ordem: dados pequenos e os LOGS por ÚLTIMO (ficam no tail do CI).
  console.log("===DIAG_TITLE===", JSON.stringify(title));
  console.log("===DIAG_TABCOUNT===", tabCount);
  console.log("===DIAG_PERFILCOUNT===", perfilCount);
  console.log("===DIAG_SPINNERCOUNT===", spinnerCount);
  console.log("===DIAG_BODYTEXT_START===");
  console.log(bodyText);
  console.log("===DIAG_BODYTEXT_END===");
  console.log("===DIAG_ROOTTEXT_START===");
  console.log(String(rootText).slice(0, 800));
  console.log("===DIAG_ROOTTEXT_END===");
  console.log("===DIAG_PAGELOGS_START===");
  console.log(logs.length ? logs.join("\n") : "(nenhum log/erro capturado)");
  console.log("===DIAG_PAGELOGS_END===");
});
