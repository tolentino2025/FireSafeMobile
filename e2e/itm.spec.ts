// Agenda ITM: criar plano, listar, verificar persistência.
// O ITM planner requer ao menos uma propriedade cadastrada.

import { test, expect } from "@playwright/test";
import { waitForApp, goSchedule, goRegistrations, clickRegistrationTile, clickFab } from "./helpers/nav";
import { clearAppStorage, storageContains } from "./helpers/storage";
import { P, UI } from "./constants";

const TEST_PLAN_PROPERTY = `${P}Prop_ITM`;

test.describe("Agenda ITM", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAppStorage(page);
    await page.reload();
    await waitForApp(page);
  });

  test("aba Agenda mostra título e botão Novo Plano", async ({ page }) => {
    await goSchedule(page);
    await expect(page.getByText(UI.itm.title).first()).toBeVisible();
    await expect(page.getByText(UI.itm.newPlan).first()).toBeVisible({ timeout: 8_000 });
  });

  test("sem propriedades cadastradas, o formulário de novo plano requer propriedade", async ({ page }) => {
    await goSchedule(page);

    const newPlanBtn = page.getByText(UI.itm.newPlan).first();
    await newPlanBtn.click();
    await page.waitForTimeout(600);

    // Formulário deve aparecer com seleção de propriedade
    await expect(
      page.getByText(/propriedade|selecione/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("cria propriedade e usa no plano ITM", async ({ page }) => {
    // Cria uma propriedade primeiro
    await goRegistrations(page);
    await clickRegistrationTile(page, "Propriedades");
    await clickFab(page);

    const propInput = page.getByPlaceholder("Nome").first();
    if (await propInput.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await propInput.fill(TEST_PLAN_PROPERTY);
      await page.getByText(UI.form.save).first().click();
      await page.waitForTimeout(800);
    }

    // Confirma que propriedade foi criada
    expect(await storageContains(page, TEST_PLAN_PROPERTY)).toBe(true);

    // Vai para Agenda ITM
    await goSchedule(page);
    const newPlanBtn = page.getByText(UI.itm.newPlan).first();
    await newPlanBtn.click();
    await page.waitForTimeout(600);

    // Tenta selecionar a propriedade no formulário
    const propSelector = page.getByText(TEST_PLAN_PROPERTY).first();
    if (await propSelector.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await propSelector.click();
      await page.waitForTimeout(400);

      // Deve aparecer seleção de sistemas
      await expect(
        page.getByText(/sistema|sprinkler|bomba|selecione/i).first(),
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test("plano ITM criado aparece na lista", async ({ page }) => {
    // Injeta plano diretamente no localStorage
    await page.evaluate((propName) => {
      const planKey = "@firesafe_itm_plans::u:guest";
      const plan = [{
        id: "pw-plan-001",
        propertyId: "pw-prop-001",
        propertyName: propName,
        systems: ["wet_pipe"],
        startDate: "2025-01-01",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }];
      localStorage.setItem(planKey, JSON.stringify(plan));

      const propKey = "@firesafe_properties::u:guest";
      const props = [{
        id: "pw-prop-001",
        name: propName,
        address: "Rua Teste, 1",
        phone: "",
        contact: "",
        companyId: "",
      }];
      localStorage.setItem(propKey, JSON.stringify(props));
    }, TEST_PLAN_PROPERTY);

    await page.reload();
    await waitForApp(page);
    await goSchedule(page);

    await expect(page.getByText(TEST_PLAN_PROPERTY).first()).toBeVisible({ timeout: 8_000 });
  });

  test("planos ITM persistem após reload", async ({ page }) => {
    // Injeta plano
    await page.evaluate((propName) => {
      localStorage.setItem("@firesafe_itm_plans::u:guest", JSON.stringify([{
        id: "pw-plan-002",
        propertyId: "pw-prop-002",
        propertyName: propName,
        systems: ["wet_pipe"],
        startDate: "2025-01-01",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]));
      localStorage.setItem("@firesafe_properties::u:guest", JSON.stringify([{
        id: "pw-prop-002",
        name: propName,
        address: "",
        phone: "",
        contact: "",
        companyId: "",
      }]));
    }, TEST_PLAN_PROPERTY);

    await page.reload();
    await waitForApp(page);
    await goSchedule(page);

    await expect(page.getByText(TEST_PLAN_PROPERTY).first()).toBeVisible({ timeout: 8_000 });

    // Reload novamente — dado deve persistir
    await page.reload();
    await waitForApp(page);
    await goSchedule(page);
    await expect(page.getByText(TEST_PLAN_PROPERTY).first()).toBeVisible({ timeout: 8_000 });
  });
});
