// Fotos fora do JSON: migração dos dados antigos e salvamento repetido.
//
// Reproduz a falha relatada em produção: com o armazenamento do navegador
// lotado por fotos embutidas em base64, o segundo teste hidrostático não salvava
// e aparecia "Erro ao salvar. Tente novamente.".
//
// Roda em guest mode (sem auth), como o restante da suíte.

import { test, expect, Page } from "@playwright/test";
import { waitForApp, goInspections } from "./helpers/nav";
import { clearAppStorage } from "./helpers/storage";

const INSPECTIONS_KEY = "@firesafe_inspections::u:guest";

/** JPEG real de ~`targetKb` KB (ruído não comprime; o lado é calibrado). */
async function makeJpegDataUri(page: Page, targetKb: number): Promise<string> {
  return page.evaluate((kb) => {
    const targetBytes = kb * 1024;
    const render = (side: number): string => {
      const canvas = document.createElement("canvas");
      canvas.width = side;
      canvas.height = side;
      const ctx = canvas.getContext("2d")!;
      const img = ctx.createImageData(side, side);
      for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = Math.random() * 255;
        img.data[i + 1] = Math.random() * 255;
        img.data[i + 2] = Math.random() * 255;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.8);
    };
    let side = 600;
    let out = render(side);
    // Converge o tamanho: ruído rende ~1,5 byte por pixel, mas varia.
    for (let i = 0; i < 4; i++) {
      const bytes = (out.length - out.indexOf(",") - 1) * 0.75;
      if (Math.abs(bytes - targetBytes) / targetBytes < 0.15) break;
      side = Math.max(120, Math.round(side * Math.sqrt(targetBytes / bytes)));
      out = render(side);
    }
    return out;
  }, targetKb);
}

/** Total de caracteres em localStorage (a cota do navegador é ~5 milhões). */
async function localStorageSize(page: Page): Promise<number> {
  return page.evaluate(() =>
    Object.keys(localStorage).reduce((sum, k) => sum + k.length + (localStorage.getItem(k) ?? "").length, 0),
  );
}

async function inspectionsJson(page: Page): Promise<string> {
  return page.evaluate((key) => localStorage.getItem(key) ?? "", INSPECTIONS_KEY);
}

/** Quantas fotos existem no IndexedDB do app. */
async function storedPhotoCount(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const open = indexedDB.open("firesafe-photos");
        open.onsuccess = () => {
          const db = open.result;
          if (!db.objectStoreNames.contains("photos")) return resolve(0);
          const req = db.transaction("photos", "readonly").objectStore("photos").count();
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        };
        open.onerror = () => reject(open.error);
      }),
  );
}

/** Semeia inspeções no formato ANTIGO (fotos em base64 dentro do registro). */
async function seedLegacyInspections(
  page: Page,
  opts: { inspections: number; photosEach: number; photo: string },
): Promise<void> {
  await page.evaluate(
    ({ key, inspections, photosEach, photo }) => {
      const list = Array.from({ length: inspections }, (_, i) => ({
        id: `legacy-${i}`,
        type: "hydrostatic_test",
        status: "completed",
        propertyName: `TESTE ANTIGO ${i}`,
        propertyAddress: "",
        propertyPhone: "",
        inspectorName: "Inspetor",
        contractNo: "",
        date: "2026-09-01",
        frequency: "annually",
        checklist: [],
        observations: "",
        signature: null,
        photos: Array.from({ length: photosEach }, (_, p) => ({
          id: `legacy-${i}-photo-${p}`,
          uri: `blob:http://localhost/${i}-${p}`,
          base64: photo,
          caption: "initialGaugePhotoIds",
          timestamp: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      localStorage.setItem(key, JSON.stringify(list));
    },
    { key: INSPECTIONS_KEY, inspections: opts.inspections, photosEach: opts.photosEach, photo: opts.photo },
  );
}

test.describe("Fotos fora do JSON", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAppStorage(page);
    // Espera a exclusão concluir: um delete pendente que só completa depois do
    // reload deixaria a conexão do app apontando para um banco já removido.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase("firesafe-photos");
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
        }),
    );
  });

  test("migra fotos antigas e libera o armazenamento lotado", async ({ page }) => {
    // 2 inspeções × 4 fotos deixam o armazenamento quase cheio. (Com 500 KB por
    // foto nem cabem: é exatamente a falha relatada em produção.)
    const photo = await makeJpegDataUri(page, 300);
    await seedLegacyInspections(page, { inspections: 2, photosEach: 4, photo });

    const before = await localStorageSize(page);
    expect(before).toBeGreaterThan(3_000_000);

    await page.reload();
    await waitForApp(page);

    // As fotos saíram do JSON e foram para o IndexedDB.
    const json = await inspectionsJson(page);
    expect(json).not.toContain("data:image");
    expect(json).toContain('"stored":true');
    expect(await storedPhotoCount(page)).toBe(8);

    const after = await localStorageSize(page);
    expect(after).toBeLessThan(before / 50);

    // A imagem guardada continua íntegra e decodificável (não é só texto salvo).
    const decoded = await page.evaluate(
      () =>
        new Promise<{ width: number; height: number }>((resolve, reject) => {
          const open = indexedDB.open("firesafe-photos");
          open.onsuccess = () => {
            const req = open.result
              .transaction("photos", "readonly")
              .objectStore("photos")
              .get("legacy-0-photo-0");
            req.onsuccess = () => {
              const img = new Image();
              img.onload = () => resolve({ width: img.width, height: img.height });
              img.onerror = () => reject(new Error("imagem inválida"));
              img.src = req.result as string;
            };
            req.onerror = () => reject(req.error);
          };
          open.onerror = () => reject(open.error);
        }),
    );
    expect(decoded.width).toBeGreaterThan(0);

    // E as inspeções continuam na lista, sem perder registro.
    await goInspections(page);
    await expect(page.getByText("TESTE ANTIGO 0").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("TESTE ANTIGO 1").first()).toBeVisible();
  });

  test("não perde a foto se o IndexedDB estiver indisponível", async ({ page }) => {
    // Navegador que bloqueia IndexedDB (modo privado restrito): a foto precisa
    // continuar embutida, como antes — degradar, nunca sumir.
    await page.addInitScript(() => {
      Object.defineProperty(window, "indexedDB", { get: () => undefined });
    });
    const photo = await makeJpegDataUri(page, 80);
    await seedLegacyInspections(page, { inspections: 1, photosEach: 1, photo });

    await page.reload();
    await waitForApp(page);

    const json = await inspectionsJson(page);
    expect(json).toContain("data:image");
    await goInspections(page);
    await expect(page.getByText("TESTE ANTIGO 0").first()).toBeVisible({ timeout: 15_000 });
  });

  test("salva vários testes hidrostáticos com fotos sem estourar o armazenamento", async ({ page }) => {
    await page.reload();
    await waitForApp(page);

    const dialogs: string[] = [];
    page.on("dialog", async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.accept();
    });

    const jpeg = await makeJpegDataUri(page, 500);
    const fileBytes = await page.evaluate((dataUri) => {
      const bin = atob(dataUri.split(",")[1]);
      return Array.from(bin, (c) => c.charCodeAt(0));
    }, jpeg);
    const buffer = Buffer.from(fileBytes);

    for (let round = 1; round <= 3; round++) {
      await goInspections(page);
      await page.locator('[data-testid="fab-new-inspection"]').click();
      await page.waitForTimeout(600);
      await page.getByText(/teste hidrost/i).first().click();
      await page.waitForTimeout(800);

      // 4 fotos, uma em cada grupo obrigatório de evidência.
      const addButtons = page.getByText("Adicionar Foto");
      await addButtons.first().waitFor({ timeout: 15_000 });
      const thumbnails = page.locator('img[src^="data:image"]');
      for (let i = 0; i < 4; i++) {
        const [chooser] = await Promise.all([
          page.waitForEvent("filechooser"),
          addButtons.nth(i).click(),
        ]);
        await chooser.setFiles({ name: `foto-${round}-${i}.jpg`, mimeType: "image/jpeg", buffer });
        // A miniatura só aparece depois de reduzir a foto e gravá-la no
        // armazenamento local — esperar por ela é o sinal de que terminou.
        await expect(thumbnails).toHaveCount(i + 1, { timeout: 30_000 });
      }

      if (round === 1) {
        // O PDF (nova aba na web) sai com as 4 fotos embutidas.
        const [pdfTab] = await Promise.all([
          page.waitForEvent("popup"),
          page.getByText("PDF", { exact: true }).first().click(),
        ]);
        await expect(pdfTab.locator('img[src^="data:image"]')).toHaveCount(4, { timeout: 20_000 });
        await pdfTab.close();
      }

      await page.getByText("Salvar", { exact: true }).first().click();

      // O app usa window.alert na web; o resultado do salvamento chega como diálogo.
      // O que falhava em produção: a partir do 2º teste vinha "Erro ao salvar".
      await expect.poll(() => dialogs.join("\n"), { timeout: 20_000 }).toMatch(
        /rascunho salvo com sucesso/i,
      );
      expect(dialogs.join("\n")).not.toMatch(/erro ao salvar/i);
      dialogs.length = 0;
      await page.waitForTimeout(400);
      // Volta pelo botão do cabeçalho: o formulário continua aberto após salvar.
      await page.getByRole("link", { name: /back/i }).first().click();
      await page.waitForTimeout(800);
    }

    // 3 testes × 4 fotos guardadas fora do JSON, com o localStorage folgado.
    expect(await storedPhotoCount(page)).toBeGreaterThanOrEqual(12);
    const total = await localStorageSize(page);
    expect(total).toBeLessThan(1_000_000);
    const json = await inspectionsJson(page);
    expect(json).not.toContain("data:image");
  });
});
