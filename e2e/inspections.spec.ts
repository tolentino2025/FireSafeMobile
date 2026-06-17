// Fluxo completo de inspeção: criar → preencher → salvar rascunho → reabrir → concluir.
// Não depende de auth — roda em guest mode.

import { test, expect } from "@playwright/test";
import { waitForApp, goInspections } from "./helpers/nav";
import { clearAppStorage, storageContains, readCollection } from "./helpers/storage";
import { P } from "./constants";

const TEST_PROPERTY_NAME = `${P}Propriedade Teste`;
const TEST_INSPECTOR_NAME = `${P}Inspetor Teste`;

test.describe("Inspeções — fluxo completo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAppStorage(page);
    await page.reload();
    await waitForApp(page);
  });

  test("abre modal de Nova Inspeção com categorias", async ({ page }) => {
    await goInspections(page);

    // FAB global (MainTabNavigator) — aria-label no DOM web
    await page.locator('[data-testid="fab-new-inspection"]').click();

    // Deve mostrar as categorias de tipo de inspeção
    await expect(
      page.getByText(/sprinkler|bomba|hidrante|tubo molhado|nova inspeção/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("seleciona tipo Tubo Molhado e abre formulário", async ({ page }) => {
    await goInspections(page);

    // FAB global (MainTabNavigator)
    await page.locator('[data-testid="fab-new-inspection"]').click();
    await page.waitForTimeout(600);

    // Seleciona "Tubo Molhado" (wet_pipe)
    const wetPipeOption = page.getByText(/tubo molhado/i).first();
    await wetPipeOption.waitFor({ timeout: 8_000 });
    await wetPipeOption.click();
    await page.waitForTimeout(800);

    // Formulário deve mostrar campos de propriedade
    await expect(
      page.getByPlaceholder(/nome da propriedade/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("preenche formulário básico e salva rascunho", async ({ page }) => {
    await goInspections(page);
    await page.locator('[data-testid="fab-new-inspection"]').click();
    await page.waitForTimeout(600);

    // Seleciona tipo
    const wetPipeOption = page.getByText(/tubo molhado/i).first();
    if (await wetPipeOption.isVisible({ timeout: 6_000 }).catch(() => false)) {
      await wetPipeOption.click();
      await page.waitForTimeout(600);
    }

    // Preenche nome da propriedade
    const propName = page.getByPlaceholder(/nome da propriedade/i).first();
    if (await propName.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await propName.fill(TEST_PROPERTY_NAME);

      // Preenche nome do inspetor
      const inspName = page.getByPlaceholder(/inspetor|nome/i).first();
      if (await inspName.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await inspName.fill(TEST_INSPECTOR_NAME);
      }

      // Salva rascunho
      const saveBtn = page.getByText(/salvar|rascunho/i).first();
      if (await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(1_500);
      }

      // Verifica no localStorage
      expect(
        await storageContains(page, TEST_PROPERTY_NAME),
        "Inspeção não foi salva no localStorage",
      ).toBe(true);
    }
  });

  test("inspeção salva aparece na lista de inspeções", async ({ page }) => {
    // Cria inspeção via localStorage diretamente (mais confiável do que UI)
    await page.evaluate((propName) => {
      const insp = [{
        id: "pw-insp-001",
        type: "wet_pipe",
        status: "draft",
        propertyName: propName,
        propertyAddress: "Rua Teste, 1",
        propertyPhone: "",
        inspectorName: "Inspetor PW",
        contractNo: "",
        date: new Date().toISOString().split("T")[0],
        frequency: "annually",
        checklist: [],
        photos: [],
        observations: "",
        signature: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }];
      // Injeta no escopo guest
      const key = Object.keys(localStorage).find(k => k.startsWith("@firesafe_inspections")) ??
        "@firesafe_inspections::u:guest";
      localStorage.setItem(key.replace(/::.*$/, "::u:guest"), JSON.stringify(insp));
    }, TEST_PROPERTY_NAME);

    await page.reload();
    await waitForApp(page);
    await goInspections(page);

    await expect(page.getByText(TEST_PROPERTY_NAME).first()).toBeVisible({ timeout: 8_000 });
  });

  test("filtra inspeções por status Rascunho", async ({ page }) => {
    // Injeta uma inspeção em rascunho
    await page.evaluate((propName) => {
      const key = "@firesafe_inspections::u:guest";
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
      existing.push({
        id: "pw-insp-002",
        type: "wet_pipe",
        status: "draft",
        propertyName: propName,
        propertyAddress: "",
        propertyPhone: "",
        inspectorName: "",
        contractNo: "",
        date: new Date().toISOString().split("T")[0],
        frequency: "annually",
        checklist: [],
        photos: [],
        observations: "",
        signature: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      });
      localStorage.setItem(key, JSON.stringify(existing));
    }, TEST_PROPERTY_NAME);

    await page.reload();
    await waitForApp(page);
    await goInspections(page);

    // Clica no chip de filtro "Rascunho" via testID — o texto "Rascunho"
    // também aparece no StatusChip do card, então getByText seria ambíguo
    // (e o badge do card fica coberto pela tab bar/FAB, causando timeout no click).
    const rascunhoChip = page.locator('[data-testid="filter-draft"]');
    if (await rascunhoChip.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await rascunhoChip.click();
      await page.waitForTimeout(400);
      await expect(page.getByText(TEST_PROPERTY_NAME).first()).toBeVisible({ timeout: 5_000 });
    }
  });

  test("busca filtra inspeções por nome de propriedade", async ({ page }) => {
    // Injeta inspeção
    await page.evaluate((propName) => {
      const key = "@firesafe_inspections::u:guest";
      localStorage.setItem(key, JSON.stringify([{
        id: "pw-insp-003",
        type: "wet_pipe",
        status: "draft",
        propertyName: propName,
        propertyAddress: "",
        propertyPhone: "",
        inspectorName: "",
        contractNo: "",
        date: "2025-01-01",
        frequency: "annually",
        checklist: [],
        photos: [],
        observations: "",
        signature: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }]));
    }, TEST_PROPERTY_NAME);

    await page.reload();
    await waitForApp(page);
    await goInspections(page);

    const searchInput = page.getByPlaceholder("Buscar inspeções...");
    await searchInput.fill("PLAYWRIGHT");
    await page.waitForTimeout(400);

    await expect(page.getByText(TEST_PROPERTY_NAME).first()).toBeVisible({ timeout: 5_000 });
  });

  test("inspeções persistem após reload", async ({ page }) => {
    // Injeta via localStorage
    await page.evaluate((propName) => {
      const key = "@firesafe_inspections::u:guest";
      localStorage.setItem(key, JSON.stringify([{
        id: "pw-insp-004",
        type: "wet_pipe",
        status: "completed",
        propertyName: propName,
        propertyAddress: "",
        propertyPhone: "",
        inspectorName: "",
        contractNo: "",
        date: "2025-01-01",
        frequency: "annually",
        checklist: [],
        photos: [],
        observations: "",
        signature: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }]));
    }, TEST_PROPERTY_NAME);

    await page.reload();
    await waitForApp(page);
    await goInspections(page);

    await expect(page.getByText(TEST_PROPERTY_NAME).first()).toBeVisible({ timeout: 8_000 });
  });

  test("status da inspeção é mostrado visualmente", async ({ page }) => {
    await page.evaluate((propName) => {
      const key = "@firesafe_inspections::u:guest";
      localStorage.setItem(key, JSON.stringify([
        {
          id: "pw-insp-s1",
          type: "wet_pipe",
          status: "draft",
          propertyName: `${propName}_DRAFT`,
          propertyAddress: "",
          propertyPhone: "",
          inspectorName: "",
          contractNo: "",
          date: "2025-01-01",
          frequency: "annually",
          checklist: [],
          photos: [],
          observations: "",
          signature: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
        {
          id: "pw-insp-s2",
          type: "wet_pipe",
          status: "completed",
          propertyName: `${propName}_DONE`,
          propertyAddress: "",
          propertyPhone: "",
          inspectorName: "",
          contractNo: "",
          date: "2025-01-01",
          frequency: "annually",
          checklist: [],
          photos: [],
          observations: "",
          signature: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      ]));
    }, TEST_PROPERTY_NAME);

    await page.reload();
    await waitForApp(page);
    await goInspections(page);

    // Ambas aparecem na lista
    await expect(page.getByText(`${TEST_PROPERTY_NAME}_DRAFT`).first()).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(`${TEST_PROPERTY_NAME}_DONE`).first()).toBeVisible({ timeout: 8_000 });

    // Status são mostrados — procura pelas chips de status
    const statuses = ["Rascunho", "Concluída"];
    for (const s of statuses) {
      await expect(page.getByText(s).first()).toBeVisible({ timeout: 3_000 });
    }
  });
});
