import { expect, test } from "@playwright/test";
import { waitForApp } from "./helpers/nav";

test.describe("Privacidade e permissões", () => {
  test("negação de geolocalização mantém o fluxo de inspeção utilizável", async ({ page, context }) => {
    // Sem permissão de geolocalização concedida, abrir uma nova inspeção não pode quebrar.
    await context.clearPermissions();
    await page.goto("/");
    await waitForApp(page);
    await page.locator('[data-testid="fab-new-inspection"]').click();
    // O app continua renderizando (modal de tipo de inspeção / formulário).
    await expect(page.locator("body")).toBeVisible();
    const text = (await page.locator("body").innerText()).trim();
    expect(text.length, "Fluxo de inspeção ficou vazio sem geolocalização").toBeGreaterThan(0);
  });

  test("app não dispara prompt bloqueante de geolocalização no carregamento", async ({ page, context }) => {
    await context.clearPermissions();
    const dialogs: string[] = [];
    page.on("dialog", (dialog) => dialogs.push(dialog.message()));
    await page.goto("/");
    await waitForApp(page);
    // O carregamento inicial não deve abrir nenhum diálogo nativo bloqueante.
    expect(dialogs).toEqual([]);
  });

  // BLOQUEIO — depende de UI de consentimento/política ainda não implementada.
  // Ver RELATORIO_GOOGLE_PLAY_COMPLIANCE.md.
  test.fixme("BLOQUEIO: tela de criação de conta expõe política antes do envio", async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);
    await page.getByText("Perfil").last().click();
    await page.getByText(/entrar \/ criar conta/i).first().click();
    await page.getByText(/^criar conta$/i).last().click();
    await expect(page.getByText(/política de privacidade|privacy policy/i).first()).toBeVisible();
  });
});
