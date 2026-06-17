// Teste de DIAGNÓSTICO INTERATIVO (gated por E2E_DIAGNOSE=1).
// Executa o fluxo Cadastros → Empresas → Adicionar e despeja o estado da tela
// em cada passo, para descobrir os seletores reais do React Native Web.

import { test } from "@playwright/test";

async function dumpInteractives(page: import("@playwright/test").Page, tag: string) {
  const info = await page.evaluate(() => {
    const out: Array<{ tag: string; role: string | null; tabindex: string | null; text: string }> = [];
    const all = Array.from(document.querySelectorAll("*")) as HTMLElement[];
    for (const el of all) {
      const role = el.getAttribute("role");
      const tabindex = el.getAttribute("tabindex");
      const clickable =
        role === "button" ||
        tabindex === "0" ||
        el.tagName === "BUTTON" ||
        (typeof el.onclick === "function");
      if (!clickable) continue;
      const text = (el.innerText || el.textContent || "").trim().slice(0, 40);
      if (!text && role !== "button") continue;
      out.push({ tag: el.tagName, role, tabindex, text });
    }
    // dedup por texto
    const seen = new Set<string>();
    return out.filter((o) => {
      const k = o.tag + o.role + o.text;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 40);
  });
  const inputs = await page.locator("input, textarea").count();
  console.log(`===STEP[${tag}] inputs=${inputs} interactives=${info.length}`);
  for (const i of info) {
    console.log(`   <${i.tag}> role=${i.role} tabindex=${i.tabindex} text="${i.text}"`);
  }
}

test("diag interativo: Cadastros → Empresas → Adicionar", async ({ page }) => {
  test.skip(!process.env.E2E_DIAGNOSE, "diagnóstico só roda sob demanda (E2E_DIAGNOSE=1)");

  page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));

  await page.goto("/", { waitUntil: "load" });
  await page.getByText("Perfil").first().waitFor({ timeout: 90_000 });
  console.log("===APP READY (Perfil visível)===");

  // 1) Cadastros
  await page.getByText("Cadastros").last().click();
  await page.waitForTimeout(1200);
  await dumpInteractives(page, "apos-click-Cadastros");

  // 2) Empresas (tile)
  await page.getByText("Empresas").first().click();
  await page.waitForTimeout(1500);
  await dumpInteractives(page, "apos-click-Empresas");

  // 3) Tentar achar e clicar o botão Adicionar
  const add = page.getByText(/adicionar/i).first();
  const addVisible = await add.isVisible({ timeout: 4000 }).catch(() => false);
  console.log(`===ADICIONAR visivel? ${addVisible}===`);
  if (addVisible) {
    await add.click();
    await page.waitForTimeout(1500);
    await dumpInteractives(page, "apos-click-Adicionar");
    // placeholders disponíveis no form
    const phs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input, textarea"))
        .map((e) => (e as HTMLInputElement).placeholder)
        .filter(Boolean),
    );
    console.log("===FORM placeholders===", JSON.stringify(phs));
  }
});
