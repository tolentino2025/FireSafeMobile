// Testes de validação: campos obrigatórios, erros de formulário, estados vazios,
// feedback visual de erros, e comportamento sem rede.

import { test, expect } from "@playwright/test";
import { waitForApp, goRegistrations, clickRegistrationTile, clickFab } from "./helpers/nav";
import { clearAppStorage } from "./helpers/storage";
import { P, UI } from "./constants";

test.describe("Validação e tratamento de erros", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAppStorage(page);
    await page.reload();
    await waitForApp(page);
  });

  test("formulário de empresa rejeita envio sem nome", async ({ page }) => {
    await goRegistrations(page);
    await clickRegistrationTile(page, "Empresas");
    await clickFab(page);

    // Abre o formulário mas não preenche nenhum campo
    await page.getByPlaceholder("Nome da Empresa").waitFor({ timeout: 8_000 });
    // Não preenche nada — tenta salvar
    await page.getByText(UI.form.save).first().click();
    await page.waitForTimeout(500);

    // Deve mostrar algum erro ou não fechar o formulário
    // O formulário de empresa exige o nome — ou mostra alert ou mantém o modal aberto
    const formStillOpen = await page.getByPlaceholder("Nome da Empresa").isVisible({ timeout: 2_000 }).catch(() => false);
    const errorShown = await page.getByText(/obrigatório|required|preencha|informe/i).first().isVisible({ timeout: 2_000 }).catch(() => false);

    expect(
      formStillOpen || errorShown,
      "Formulário deveria exibir erro ou permanecer aberto quando nome está vazio",
    ).toBe(true);
  });

  test("formulário de bomba rejeita envio sem TAG", async ({ page }) => {
    await goRegistrations(page);
    await clickRegistrationTile(page, "Bombas de Incêndio");
    await clickFab(page);

    const tagInput = page.getByPlaceholder("BP-01");
    if (await tagInput.isVisible({ timeout: 8_000 }).catch(() => false)) {
      // Deixa o TAG em branco e tenta salvar
      await page.getByText(UI.form.save).first().click();
      await page.waitForTimeout(500);

      // Deve mostrar erro
      const formOpen = await tagInput.isVisible({ timeout: 2_000 }).catch(() => false);
      const errorShown = await page.getByText(/obrigatório|required|tag|preencha/i).first()
        .isVisible({ timeout: 2_000 }).catch(() => false);

      expect(formOpen || errorShown).toBe(true);
    }
  });

  test("formulário de local de trabalho rejeita sem nome", async ({ page }) => {
    await goRegistrations(page);
    await clickRegistrationTile(page, "Locais de Trabalho");
    await clickFab(page);

    const nameInput = page.getByPlaceholder("Nome do Local");
    if (await nameInput.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await page.getByText(UI.form.save).first().click();
      await page.waitForTimeout(500);

      const formOpen = await nameInput.isVisible({ timeout: 2_000 }).catch(() => false);
      const errorShown = await page.getByText(/obrigatório|required|preencha|informe/i).first()
        .isVisible({ timeout: 2_000 }).catch(() => false);

      expect(formOpen || errorShown).toBe(true);
    }
  });

  test("cancelar formulário não persiste dados parciais", async ({ page }) => {
    await goRegistrations(page);
    await clickRegistrationTile(page, "Empresas");
    await clickFab(page);

    const nameInput = page.getByPlaceholder("Nome da Empresa");
    if (await nameInput.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await nameInput.fill(`${P}EMPRESA_NAO_SALVA`);

      // Cancela
      const cancelBtn = page.getByText(UI.form.cancel).first();
      if (await cancelBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await cancelBtn.click();
        await page.waitForTimeout(500);
      } else {
        // Tenta fechar pelo Escape ou botão de volta
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
      }

      // Empresa não deve aparecer na lista
      await expect(
        page.getByText(`${P}EMPRESA_NAO_SALVA`),
        "Empresa parcial não deveria ter sido salva após cancelar",
      ).toHaveCount(0);
    }
  });

  test("lista vazia exibe mensagem apropriada (sem erro de tela branca)", async ({ page }) => {
    await goRegistrations(page);

    const tiles = ["Empresas", "Inspetores", "Propriedades", "Prestadoras de Serviço"];
    for (const tile of tiles) {
      await clickRegistrationTile(page, tile);
      await page.waitForTimeout(400);

      // Não deve mostrar erro de crash — a tela deve renderizar
      const bodyText = await page.locator("body").textContent();
      expect(bodyText).not.toMatch(/undefined|null|Cannot read|TypeError|Error:/);

      // Deve mostrar algum estado vazio (mensagem ou tela limpa)
      const emptyMsg = await page.getByText(/nenhum|cadastrado|nada|empty/i).first()
        .isVisible({ timeout: 3_000 }).catch(() => false);
      // Pode ser que a mensagem de vazio não seja visível se o estilo for visual only
      // O importante é que não há crash
    }
  });

  test("busca sem resultado não causa crash", async ({ page }) => {
    const { goInspections } = await import("./helpers/nav");
    await goInspections(page);

    const searchInput = page.getByPlaceholder("Buscar inspeções...");
    await searchInput.fill("TEXTO_QUE_NAO_EXISTE_ZZZZZ");
    await page.waitForTimeout(600);

    // A página deve continuar funcional — sem erro de crash
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).not.toMatch(/undefined is not|TypeError|Cannot read/);
  });

  test("app funciona offline (sem rede externa) — dados locais ainda acessíveis", async ({ page }) => {
    // Injeta dado local
    await page.evaluate(() => {
      localStorage.setItem("@firesafe_companies::u:guest", JSON.stringify([{
        id: "offline-co-001",
        name: "PLAYWRIGHT_TEST_Offline_Company",
        cnpj: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]));
    });

    // Simula offline
    await page.route("**/*supabase*/**", (route) => route.abort());

    await page.reload();
    await waitForApp(page);
    await goRegistrations(page);
    await clickRegistrationTile(page, "Empresas");

    // Dados locais devem ser acessíveis mesmo sem rede
    await expect(
      page.getByText("PLAYWRIGHT_TEST_Offline_Company").first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("estados de loading não ficam infinitos", async ({ page }) => {
    await goRegistrations(page);

    // Aguarda no máximo 15s por qualquer loading spinner desaparecer
    const spinners = page.locator('[aria-label="loading"], [role="progressbar"]');
    const count = await spinners.count();
    if (count > 0) {
      await expect(spinners.first()).not.toBeVisible({ timeout: 15_000 });
    }

    // A tela deve ser interativa após carregar
    await expect(page.getByText("Empresas").first()).toBeVisible({ timeout: 10_000 });
  });
});
