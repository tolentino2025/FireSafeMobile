// Garante que um usuário novo (sem dados) vê listas vazias — sem dados de demo,
// sem dados de outros usuários, sem mocks. Roda sem Supabase (guest mode).

import { test, expect } from "@playwright/test";
import { waitForApp, goRegistrations, goInspections, goSchedule, clickRegistrationTile } from "./helpers/nav";
import { clearAppStorage, countCollection } from "./helpers/storage";

test.describe("Estado vazio — novo usuário não vê dados indevidos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Limpa TUDO antes de cada teste → simula primeiro acesso
    await clearAppStorage(page);
    await page.reload();
    await waitForApp(page);
  });

  test("tela de Inspeções mostra lista vazia sem dados de demo", async ({ page }) => {
    await goInspections(page);

    // Não deve aparecer nenhuma inspeção com dados reais de outros usuários
    const fakePropNames = ["Petrobras", "Hospital Einstein", "Shopping", "sample", "demo"];
    for (const name of fakePropNames) {
      const count = await page.getByText(new RegExp(name, "i")).count();
      expect(count, `Dado indevido encontrado: "${name}"`).toBe(0);
    }

    // Coleção de inspeções no localStorage deve estar vazia
    const inspCount = await countCollection(page, "@firesafe_inspections");
    expect(inspCount, "Novo usuário deve ter 0 inspeções").toBe(0);
  });

  test("tela Cadastros > Empresas mostra lista vazia", async ({ page }) => {
    await goRegistrations(page);
    await clickRegistrationTile(page, "Empresas");

    // Dados de demo que NÃO devem aparecer
    const demoNames = ["Petrobras", "Shopping Center", "Hospital Albert", "Empresa Demo"];
    for (const name of demoNames) {
      await expect(
        page.getByText(new RegExp(name, "i")),
        `Dado de demo vazou: "${name}"`,
      ).toHaveCount(0);
    }

    // Coleção no localStorage deve estar vazia ou inexistente
    const count = await countCollection(page, "@firesafe_companies");
    expect(count, "Novo usuário deve ter 0 empresas cadastradas").toBe(0);
  });

  test("Cadastros > Prestadoras mostra lista vazia", async ({ page }) => {
    await goRegistrations(page);
    await clickRegistrationTile(page, "Prestadoras de Serviço");

    const count = await countCollection(page, "@firesafe_contractors");
    expect(count, "Novo usuário deve ter 0 prestadoras").toBe(0);
  });

  test("Cadastros > Propriedades mostra lista vazia", async ({ page }) => {
    await goRegistrations(page);
    await clickRegistrationTile(page, "Propriedades");

    const count = await countCollection(page, "@firesafe_properties");
    expect(count, "Novo usuário deve ter 0 propriedades").toBe(0);
  });

  test("Cadastros > Inspetores mostra lista vazia", async ({ page }) => {
    await goRegistrations(page);
    await clickRegistrationTile(page, "Inspetores");

    const count = await countCollection(page, "@firesafe_app_users");
    expect(count, "Novo usuário deve ter 0 inspetores").toBe(0);
  });

  test("Cadastros > Bombas mostra lista vazia", async ({ page }) => {
    await goRegistrations(page);
    await clickRegistrationTile(page, "Bombas de Incêndio");

    const count = await countCollection(page, "@firesafe_fire_pumps");
    expect(count, "Novo usuário deve ter 0 bombas").toBe(0);
  });

  test("Agenda ITM mostra lista vazia", async ({ page }) => {
    await goSchedule(page);

    const count = await countCollection(page, "@firesafe_itm_plans");
    expect(count, "Novo usuário deve ter 0 planos ITM").toBe(0);

    // Não deve mostrar ocorrências de outros usuários
    const demoPlans = ["Petrobras", "Shopping", "Hospital"];
    for (const name of demoPlans) {
      await expect(page.getByText(new RegExp(name, "i"))).toHaveCount(0);
    }
  });

  test("EXPO_PUBLIC_DEMO_MODE desativado não injeta dados de amostra", async ({ page }) => {
    // Verifica no runtime que o modo demo NÃO está ativo
    const demoMode = await page.evaluate(
      () => (globalThis as unknown as Record<string, unknown>).__EXPO_PUBLIC_DEMO_MODE__ ?? null,
    );
    // Em produção, DEMO_MODE deve ser false/undefined
    if (demoMode === "1" || demoMode === true) {
      test.fail(
        true,
        "EXPO_PUBLIC_DEMO_MODE=1 está ativo — dados de demo podem ser visíveis para usuários reais!",
      );
    }

    // Confirma ausência de dados de demo mesmo com a flag
    const demoCompanies = ["Petrobras", "Hospital Einstein", "Shopping Center Norte"];
    for (const company of demoCompanies) {
      await expect(
        page.getByText(new RegExp(company, "i")),
        `Empresa demo visível: "${company}"`,
      ).toHaveCount(0);
    }
  });
});
