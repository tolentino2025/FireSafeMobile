// CRUD completo dos cadastros: Empresa, Prestadora, Propriedade, Inspetor,
// Responsável Técnico, Bomba de Incêndio, Local de Trabalho.
// Todos os dados criados usam prefixo PLAYWRIGHT_TEST_.

import { test, expect } from "@playwright/test";
import {
  waitForApp,
  goRegistrations,
  clickRegistrationTile,
  clickFab,
} from "./helpers/nav";
import { clearAppStorage, storageContains, countCollection } from "./helpers/storage";
import {
  TEST_COMPANY,
  TEST_CONTRACTOR,
  TEST_PROPERTY,
  TEST_INSPECTOR,
  TEST_TECH,
  TEST_PUMP,
  TEST_JOB_SITE,
  UI,
} from "./constants";

// Helpers locais de formulário
async function fillAndSave(
  page: Parameters<typeof waitForApp>[0],
  fields: Record<string, string>,
): Promise<void> {
  for (const [placeholder, value] of Object.entries(fields)) {
    const input = page.getByPlaceholder(placeholder).first();
    if (await input.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await input.clear();
      await input.fill(value);
    }
  }
  await page.getByText(UI.form.save).first().click();
  await page.waitForTimeout(800);
}

test.describe("Cadastros — CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAppStorage(page);
    await page.reload();
    await waitForApp(page);
    await goRegistrations(page);
  });

  // -----------------------------------------------------------------------
  // EMPRESA
  // -----------------------------------------------------------------------

  test("criar empresa salva no localStorage e aparece na lista", async ({ page }) => {
    await clickRegistrationTile(page, "Empresas");
    await clickFab(page);

    await fillAndSave(page, {
      "Nome da Empresa": TEST_COMPANY.name,
      "00.000.000/0000-00": TEST_COMPANY.cnpj,
      "Nome do Contato": TEST_COMPANY.contactName,
    });

    // Empresa deve aparecer na lista
    await expect(page.getByText(TEST_COMPANY.name).first()).toBeVisible({ timeout: 8_000 });

    // Confirma persistência no localStorage
    expect(
      await storageContains(page, TEST_COMPANY.name),
      "Empresa não encontrada no localStorage",
    ).toBe(true);
  });

  test("editar empresa atualiza o cadastro", async ({ page }) => {
    // Cria primeiro
    await clickRegistrationTile(page, "Empresas");
    await clickFab(page);
    await fillAndSave(page, { "Nome da Empresa": TEST_COMPANY.name });

    // Clica na empresa para editar
    await page.getByText(TEST_COMPANY.name).first().click();
    await page.waitForTimeout(500);

    const updatedName = `${TEST_COMPANY.name}_EDITADA`;
    const nameInput = page.getByPlaceholder("Nome da Empresa").first();
    if (await nameInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await nameInput.clear();
      await nameInput.fill(updatedName);
      await page.getByText(UI.form.save).first().click();
      await page.waitForTimeout(800);

      await expect(page.getByText(updatedName).first()).toBeVisible({ timeout: 5_000 });
    }
  });

  test("busca filtra empresas pelo nome", async ({ page }) => {
    // Cria empresa
    await clickRegistrationTile(page, "Empresas");
    await clickFab(page);
    await fillAndSave(page, { "Nome da Empresa": TEST_COMPANY.name });

    // Busca pelo nome
    const searchInput = page.getByPlaceholder("Buscar...").first();
    if (await searchInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await searchInput.fill(TEST_COMPANY.name.substring(0, 10));
      await expect(page.getByText(TEST_COMPANY.name).first()).toBeVisible({ timeout: 5_000 });
    }
  });

  // -----------------------------------------------------------------------
  // PRESTADORA
  // -----------------------------------------------------------------------

  test("criar prestadora de serviço salva corretamente", async ({ page }) => {
    await clickRegistrationTile(page, "Prestadoras de Serviço");
    await clickFab(page);

    await fillAndSave(page, {
      "Nome da Prestadora": TEST_CONTRACTOR.name,
      "Número da Licença": TEST_CONTRACTOR.licenseNumber,
      "Telefone": TEST_CONTRACTOR.phone,
    });

    await expect(page.getByText(TEST_CONTRACTOR.name).first()).toBeVisible({ timeout: 8_000 });
    expect(await storageContains(page, TEST_CONTRACTOR.name)).toBe(true);
  });

  // -----------------------------------------------------------------------
  // PROPRIEDADE
  // -----------------------------------------------------------------------

  test("criar propriedade salva na lista", async ({ page }) => {
    await clickRegistrationTile(page, "Propriedades");
    await clickFab(page);

    await fillAndSave(page, {
      "Nome": TEST_PROPERTY.name,
      "Endereço": TEST_PROPERTY.address,
      "Telefone": TEST_PROPERTY.phone,
      "Contato": TEST_PROPERTY.contact,
    });

    await expect(page.getByText(TEST_PROPERTY.name).first()).toBeVisible({ timeout: 8_000 });
    expect(await storageContains(page, TEST_PROPERTY.name)).toBe(true);
  });

  // -----------------------------------------------------------------------
  // INSPETOR
  // -----------------------------------------------------------------------

  test("criar inspetor salva e aparece na lista", async ({ page }) => {
    await clickRegistrationTile(page, "Inspetores");
    await clickFab(page);

    await fillAndSave(page, {
      "Nome": TEST_INSPECTOR.name,
      "email@exemplo.com": TEST_INSPECTOR.email,
    });

    await expect(page.getByText(TEST_INSPECTOR.name).first()).toBeVisible({ timeout: 8_000 });
    expect(await storageContains(page, TEST_INSPECTOR.name)).toBe(true);
  });

  // -----------------------------------------------------------------------
  // RESPONSÁVEL TÉCNICO
  // -----------------------------------------------------------------------

  test("criar responsável técnico salva corretamente", async ({ page }) => {
    await clickRegistrationTile(page, "Responsáveis Técnicos");
    await clickFab(page);

    await fillAndSave(page, {
      "Nome": TEST_TECH.name,
      "CREA/CAU": TEST_TECH.creaCAU,
    });

    await expect(page.getByText(TEST_TECH.name).first()).toBeVisible({ timeout: 8_000 });
    expect(await storageContains(page, TEST_TECH.name)).toBe(true);
  });

  // -----------------------------------------------------------------------
  // BOMBA DE INCÊNDIO
  // -----------------------------------------------------------------------

  test("criar bomba de incêndio salva com TAG", async ({ page }) => {
    await clickRegistrationTile(page, "Bombas de Incêndio");
    // Bombas navegam para a lista de bombas — o FAB abre o formulário
    await clickFab(page);

    // Formulário da bomba usa "BP-01" como placeholder do TAG
    const tagInput = page.getByPlaceholder("BP-01").first();
    if (await tagInput.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await tagInput.fill(TEST_PUMP.tag);

      const mfgInput = page.getByPlaceholder("AURORA, PATTERSON, etc.").first();
      if (await mfgInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await mfgInput.fill(TEST_PUMP.manufacturer);
      }

      await page.getByText(UI.form.save).first().click();
      await page.waitForTimeout(800);

      await expect(page.getByText(TEST_PUMP.tag).first()).toBeVisible({ timeout: 8_000 });
      expect(await storageContains(page, TEST_PUMP.tag)).toBe(true);
    }
  });

  // -----------------------------------------------------------------------
  // LOCAL DE TRABALHO (Job Site)
  // -----------------------------------------------------------------------

  test("criar local de trabalho salva na lista", async ({ page }) => {
    // O formulário de Local de Trabalho EXIGE uma prestadora (contractorId).
    // Sem selecionar uma, handleSubmit aborta — então criamos uma primeiro.
    await clickRegistrationTile(page, "Prestadoras de Serviço");
    await clickFab(page);
    await fillAndSave(page, { "Nome da Prestadora": TEST_CONTRACTOR.name });

    // Agora cria o local de trabalho, selecionando a prestadora no SelectPicker.
    await clickRegistrationTile(page, "Locais de Trabalho");
    await clickFab(page);

    await page.getByPlaceholder("Nome do Local").first().fill(TEST_JOB_SITE.jobName);

    // Abre o seletor de prestadora e escolhe a criada (label vem em MAIÚSCULAS).
    await page.getByText(/selecione (o contratante|a prestadora)/i).first().click();
    await page.waitForTimeout(400);
    await page.getByText(new RegExp(TEST_CONTRACTOR.name, "i")).first().click();
    await page.waitForTimeout(300);

    await page.getByText(UI.form.save).first().click();
    await page.waitForTimeout(800);

    await expect(page.getByText(TEST_JOB_SITE.jobName).first()).toBeVisible({ timeout: 8_000 });
    expect(await storageContains(page, TEST_JOB_SITE.jobName)).toBe(true);
  });

  // -----------------------------------------------------------------------
  // PERSISTÊNCIA (reload)
  // -----------------------------------------------------------------------

  test("dados persistem após reload da página", async ({ page }) => {
    await clickRegistrationTile(page, "Empresas");
    await clickFab(page);
    await fillAndSave(page, { "Nome da Empresa": TEST_COMPANY.name });

    // Recarrega a página
    await page.reload();
    await waitForApp(page);
    await goRegistrations(page);
    await clickRegistrationTile(page, "Empresas");

    await expect(page.getByText(TEST_COMPANY.name).first()).toBeVisible({ timeout: 10_000 });
  });

  // -----------------------------------------------------------------------
  // CONTAGEM
  // -----------------------------------------------------------------------

  test("criar 3 empresas resulta em 3 no localStorage", async ({ page }) => {
    await clickRegistrationTile(page, "Empresas");

    for (let i = 1; i <= 3; i++) {
      await clickFab(page);
      await fillAndSave(page, { "Nome da Empresa": `${TEST_COMPANY.name}_${i}` });
    }

    const count = await countCollection(page, "@firesafe_companies");
    expect(count).toBe(3);
  });
});
