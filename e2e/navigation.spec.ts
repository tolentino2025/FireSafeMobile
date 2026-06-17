// Verifica que todas as abas e sub-telas do app são acessíveis.
// Sem criação de dados — apenas navegação e verificação de conteúdo de tela.

import { test, expect } from "@playwright/test";
import { waitForApp, goInspections, goSchedule, goRegistrations, goProfile } from "./helpers/nav";
import { clearAppStorage } from "./helpers/storage";

test.describe("Navegação — tabs e sub-telas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAppStorage(page);
    await page.reload();
    await waitForApp(page);
  });

  test("aba Inspeções carrega com campo de busca", async ({ page }) => {
    await goInspections(page);
    await expect(page.getByPlaceholder("Buscar inspeções...")).toBeVisible();
    await expect(page.getByText("Inspeções").first()).toBeVisible();
  });

  test("aba Agenda ITM carrega", async ({ page }) => {
    await goSchedule(page);
    await expect(page.getByText("Agenda ITM").first()).toBeVisible();
  });

  test("aba Cadastros carrega o grid de categorias", async ({ page }) => {
    await goRegistrations(page);
    // Grid com os tiles de categoria
    await expect(page.getByText("Empresas").first()).toBeVisible();
    await expect(page.getByText("Propriedades").first()).toBeVisible();
  });

  test("aba Perfil carrega", async ({ page }) => {
    await goProfile(page);
    await expect(page.getByText("Perfil").first()).toBeVisible();
  });

  test("todos os tiles da tela Cadastros são clicáveis", async ({ page }) => {
    await goRegistrations(page);

    const tiles = [
      "Empresas",
      "Inspetores",
      "Responsáveis Técnicos",
      "Bombas de Incêndio",
      "Prestadoras de Serviço",
      "Locais de Trabalho",
      "Propriedades",
    ];

    for (const tile of tiles) {
      await page.getByText(tile).first().click();
      await page.waitForTimeout(400);
      // Deve continuar na tela Cadastros sem erro
      await expect(page.getByText("Cadastros").first()).toBeVisible();
    }
  });

  test("Nova Inspeção modal abre ao clicar no botão +", async ({ page }) => {
    await goInspections(page);

    // O botão Nova Inspeção pode aparecer como FAB ou no header
    const newBtn = page.getByText(/nova inspeção/i).first();
    if (await newBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await newBtn.click();
    } else {
      // FAB no app — clica no botão flutuante
      await page.getByRole("button").last().click();
    }

    await page.waitForTimeout(600);
    // Modal de nova inspeção deve mostrar categorias de tipo
    await expect(
      page.getByText(/sprinkler|bomba|hidrante|tubo molhado/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("ITM — botão Novo Plano existe na aba Agenda", async ({ page }) => {
    await goSchedule(page);
    await expect(page.getByText("Novo Plano").first()).toBeVisible({ timeout: 8_000 });
  });
});
