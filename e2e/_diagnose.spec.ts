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
  const bodyText = (await page.locator("body").innerText().catch(() => "<no body>")).slice(0, 2000);
  const tabCount = await page.getByRole("tab").count().catch(() => -1);
  const perfilCount = await page.getByText("Perfil").count().catch(() => -1);
  const html = (await page.content().catch(() => "<no html>")).slice(0, 3000);

  console.log("===DIAG_TITLE===", JSON.stringify(title));
  console.log("===DIAG_TABCOUNT===", tabCount);
  console.log("===DIAG_PERFILCOUNT===", perfilCount);
  console.log("===DIAG_BODYTEXT_START===");
  console.log(bodyText);
  console.log("===DIAG_BODYTEXT_END===");
  console.log("===DIAG_PAGELOGS_START===");
  console.log(logs.length ? logs.join("\n") : "(nenhum log/erro capturado)");
  console.log("===DIAG_PAGELOGS_END===");
  console.log("===DIAG_HTML_START===");
  console.log(html);
  console.log("===DIAG_HTML_END===");
});
