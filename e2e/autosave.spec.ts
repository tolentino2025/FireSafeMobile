// Salvamento automático do formulário de inspeção.
//
// O indicador "Salvo automaticamente" era decorativo: piscava sem gravar nada, e
// quem saía da tela confiando nele perdia o trabalho. Estes testes cobrem o que
// ele passou a prometer — e os dois casos em que ele NÃO pode agir.

import { test, expect, Page } from "@playwright/test";
import { waitForApp, goInspections } from "./helpers/nav";
import { clearAppStorage } from "./helpers/storage";

const INSPECTIONS_KEY = "@firesafe_inspections::u:guest";

async function savedInspections(page: Page): Promise<any[]> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "[]"), INSPECTIONS_KEY);
}

async function openNewWetPipeForm(page: Page): Promise<void> {
  await goInspections(page);
  await page.locator('[data-testid="fab-new-inspection"]').click();
  await page.waitForTimeout(600);
  await page.getByText(/tubo molhado/i).first().click();
  await page.getByPlaceholder(/nome da propriedade/i).first().waitFor({ timeout: 15_000 });
}

test.describe("Salvamento automático", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAppStorage(page);
    await page.reload();
    await waitForApp(page);
  });

  test("grava sozinho e o trabalho sobrevive a sair da tela sem salvar", async ({ page }) => {
    await openNewWetPipeForm(page);
    await page.getByPlaceholder(/nome da propriedade/i).first().fill("GALPAO AUTOSAVE");

    // Sem tocar em "Salvar": o indicador confirma uma gravação de verdade.
    await expect(page.getByText(/salvo automaticamente/i).first()).toBeVisible({ timeout: 20_000 });

    const saved = await savedInspections(page);
    expect(saved).toHaveLength(1);
    expect(saved[0].propertyName).toBe("GALPAO AUTOSAVE");
    expect(saved[0].status).toBe("draft");

    // E continua lá depois de sair da tela e recarregar o app.
    await page.getByRole("link", { name: /back/i }).first().click();
    await page.reload();
    await waitForApp(page);
    await goInspections(page);
    await expect(page.getByText("GALPAO AUTOSAVE").first()).toBeVisible({ timeout: 15_000 });
  });

  test("abrir e sair sem digitar não cria rascunho vazio", async ({ page }) => {
    await openNewWetPipeForm(page);
    await page.waitForTimeout(8_000); // mais que o tempo de espera do automático
    expect(await savedInspections(page)).toHaveLength(0);

    await page.getByRole("link", { name: /back/i }).first().click();
    await page.waitForTimeout(1_500);
    expect(await savedInspections(page)).toHaveLength(0);
  });

  test("não rebaixa uma inspeção concluída para rascunho", async ({ page }) => {
    await page.evaluate((key) => {
      localStorage.setItem(
        key,
        JSON.stringify([
          {
            id: "concluida-1",
            type: "wet_pipe",
            status: "completed",
            propertyName: "PREDIO CONCLUIDO",
            propertyAddress: "",
            propertyPhone: "",
            inspectorName: "Inspetor",
            contractNo: "",
            date: "2026-09-01",
            frequency: "weekly",
            checklist: [],
            observations: "",
            signature: null,
            photos: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]),
      );
    }, INSPECTIONS_KEY);
    await page.reload();
    await waitForApp(page);

    await goInspections(page);
    // A tab bar fixa cobre a lista na viewport de teste; o clique é despachado
    // direto no card.
    await page.getByText("PREDIO CONCLUIDO").first().dispatchEvent("click");
    await page.waitForTimeout(1_200);
    // Da tela de detalhe, entra em edição.
    await page.getByText(/^Editar$/).first().dispatchEvent("click");
    await page.waitForTimeout(1_500);

    // Edita um campo para disparar o salvamento automático.
    const observations = page.getByPlaceholder(/observações|observacoes/i).first();
    await observations.waitFor({ timeout: 15_000 });
    await observations.fill("anotação durante a revisão");
    await expect(page.getByText(/salvo automaticamente/i).first()).toBeVisible({ timeout: 20_000 });

    const saved = await savedInspections(page);
    expect(saved).toHaveLength(1);
    // O app põe o texto em maiúsculas ao digitar.
    expect(saved[0].observations.toLowerCase()).toBe("anotação durante a revisão");
    expect(saved[0].status).toBe("completed"); // continua concluída
  });
});
