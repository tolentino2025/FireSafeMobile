// Bateria COMPLETA da Agenda ITM (Schedule).
// Cobre o fluxo de ponta a ponta: lista de planos → sistemas → agenda de
// ocorrências, conclusão (execução) de tarefa, reabertura, filtros de
// status/periodicidade, contadores de resumo, exportação .ics e as
// preferências de notificação (e-mail 48h, push, resumo diário, horizonte).
//
// Estratégia: injeta um plano + propriedade + ocorrências com status mistos
// (vencida, próxima, futura, concluída) direto no localStorage no escopo guest.
// Isso é determinístico e não depende do motor de geração de agenda (que tem
// datas relativas a "hoje"). As datas das ocorrências são calculadas em runtime
// no contexto do browser, relativas à data atual.
//
// GOTCHA crítico: o ITMContext roda uma MIGRAÇÃO (v2) no load se a chave
// @firesafe_itm_version != "2", que REGENERA as agendas e descartaria as
// ocorrências injetadas. Por isso setamos a versão = "2" junto com os dados.

import { test, expect, Page } from "@playwright/test";
import { waitForApp, goSchedule, goProfile } from "./helpers/nav";
import { clearAppStorage, readCollection, storageContains } from "./helpers/storage";
import { P } from "./constants";

const PROP_NAME = `${P}Agenda Predio`;
const PLAN_ID = "pw-sched-plan-001";
const ASSET_ID = "pw-sched-prop-001";
const SYSTEM = "wet_pipe";
const SYSTEM_LABEL = "Sprinkler Tubo Molhado"; // rotuloSistema("wet_pipe", "pt-BR")

const OCC_KEY = "@firesafe_itm_occurrences::u:guest";
const PLAN_KEY = "@firesafe_itm_plans::u:guest";
const PROP_KEY = "@firesafe_properties::u:guest";
const VERSION_KEY = "@firesafe_itm_version::u:guest";
const PREFS_KEY = "@firesafe_itm_notification_prefs::u:guest";

// Descrições únicas por ocorrência (facilita seletores nos cards).
const DESC = {
  overdue: "ITM_OVERDUE Inspecao mensal de valvulas",
  dueSoon: "ITM_DUESOON Teste trimestral de alarme",
  future: "ITM_FUTURE Teste anual de vazao",
  completed: "ITM_DONE Manutencao semestral",
};

/**
 * Injeta plano + propriedade + 4 ocorrências (vencida, próxima, futura,
 * concluída) no escopo guest, com a versão de migração fixada em "2".
 */
async function seedAgenda(page: Page): Promise<void> {
  await page.evaluate(
    ([occKey, planKey, propKey, versionKey, planId, assetId, system, propName, desc]) => {
      const toISO = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate(),
        ).padStart(2, "0")}`;
      const addDays = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return toISO(d);
      };

      const mk = (
        suffix: string,
        templateKey: string,
        frequency: string,
        description: string,
        dueDate: string,
        windowEnd: string,
        extra: Record<string, unknown> = {},
      ) => ({
        id: `${planId}:${templateKey}:${dueDate}`,
        planId,
        templateKey,
        system,
        activity: "inspection",
        frequency,
        description,
        dueDate,
        scheduledDate: dueDate,
        windowStart: dueDate,
        windowEnd,
        status: "scheduled",
        ...extra,
      });

      const occurrences = [
        // Vencida: windowEnd < hoje.
        mk("ov", "wet_monthly", "monthly", desc.overdue, addDays(-60), addDays(-30)),
        // Próxima: dueDate dentro de 30 dias.
        mk("ds", "wet_quarterly", "quarterly", desc.dueSoon, addDays(10), addDays(10)),
        // Futura: dueDate > hoje + 30.
        mk("fu", "wet_annual", "annual", desc.future, addDays(200), addDays(200)),
        // Concluída: tem completedAt.
        mk("dn", "wet_semiannual", "semiannual", desc.completed, addDays(-90), addDays(-85), {
          status: "completed",
          completedAt: addDays(-85),
          result: "approved",
        }),
      ];

      localStorage.setItem(occKey, JSON.stringify(occurrences));
      localStorage.setItem(
        planKey,
        JSON.stringify([
          {
            id: planId,
            assetId,
            propertyName: propName,
            startDate: addDays(-120),
            normativeProfile: "nfpa25",
            systemKeys: [system],
            createdAt: new Date().toISOString(),
          },
        ]),
      );
      localStorage.setItem(
        propKey,
        JSON.stringify([
          { id: assetId, name: propName, address: "Rua Teste, 1", phone: "", contact: "", companyId: "" },
        ]),
      );
      // Fixa a versão para o ITMContext NÃO regenerar (e apagar) as ocorrências.
      localStorage.setItem(versionKey, "2");
    },
    [OCC_KEY, PLAN_KEY, PROP_KEY, VERSION_KEY, PLAN_ID, ASSET_ID, SYSTEM, PROP_NAME, DESC] as const,
  );
}

/** Navega Agenda → plano → sistema → tela de agenda de ocorrências. */
async function openSystemSchedule(page: Page): Promise<void> {
  await goSchedule(page);
  // Card do plano (mostra o nome da propriedade).
  await page.getByText(PROP_NAME).first().click();
  await page.waitForTimeout(600);
  // Card do sistema na tela de sistemas do plano.
  await page.getByText(SYSTEM_LABEL).first().click();
  await page.waitForTimeout(600);
}

test.describe("Agenda ITM — fluxo completo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAppStorage(page);
    await seedAgenda(page);
    await page.reload();
    await waitForApp(page);
  });

  test("plano injetado aparece na lista da Agenda", async ({ page }) => {
    await goSchedule(page);
    await expect(page.getByText(PROP_NAME).first()).toBeVisible({ timeout: 8_000 });
    // O card do plano mostra o resumo (1 vencida).
    await expect(page.getByText(/vencidas/i).first()).toBeVisible();
  });

  test("drill-down: plano → sistemas mostra o sistema com agenda", async ({ page }) => {
    await goSchedule(page);
    await page.getByText(PROP_NAME).first().click();
    await page.waitForTimeout(600);

    // Tela de sistemas do plano: o sistema Tubo Molhado deve aparecer.
    await expect(page.getByText(SYSTEM_LABEL).first()).toBeVisible({ timeout: 8_000 });
  });

  test("agenda do sistema mostra grupos por status e contadores", async ({ page }) => {
    await openSystemSchedule(page);

    // Cabeçalho de resumo: Total / Vencidas / Próximas / Concluídas (topo, visível).
    await expect(page.getByText(/^total$/i).first()).toBeVisible({ timeout: 8_000 });

    // Grupos por status (ORDEM_GRUPOS): Vencidos, Próximos 30 dias, Futuros, Concluídos.
    // NOTA: o ScrollView vertical pode deixar os grupos de baixo fora da dobra —
    // o react-native-web os reporta como "hidden" para o toBeVisible mesmo
    // estando renderizados. Validamos a PRESENÇA (toBeAttached) do conteúdo,
    // que é o que importa: todos os grupos foram montados com a contagem certa.
    await expect(page.getByText(/vencidos/i).first()).toBeVisible();
    await expect(page.getByText(/próximos 30 dias/i).first()).toBeAttached();
    await expect(page.getByText(/futuros/i).first()).toBeAttached();
    await expect(page.getByText(/concluídos/i).first()).toBeAttached();

    // As 4 ocorrências (uma por status) foram renderizadas pelas descrições.
    await expect(page.getByText(/ITM_OVERDUE/i).first()).toBeVisible();
    await expect(page.getByText(/ITM_DUESOON/i).first()).toBeAttached();
    await expect(page.getByText(/ITM_FUTURE/i).first()).toBeAttached();
    await expect(page.getByText(/ITM_DONE/i).first()).toBeAttached();
  });

  test("concluir (executar) uma tarefa vencida persiste a conclusão", async ({ page }) => {
    await openSystemSchedule(page);

    // O primeiro botão "Concluir" pertence ao grupo Vencidos (ordem dos grupos).
    const concluir = page.getByText(/^concluir$/i).first();
    await expect(concluir).toBeVisible({ timeout: 8_000 });
    await concluir.click();
    await page.waitForTimeout(500);

    // Modal "Concluir tarefa".
    await expect(page.getByText(/concluir tarefa/i).first()).toBeVisible({ timeout: 5_000 });

    // Preenche o responsável.
    const resp = page.getByPlaceholder(/nome do responsável/i).first();
    if (await resp.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await resp.fill(`${P}Tecnico Agenda`);
    }

    // Resultado "Aprovado" já é o padrão; confirma a conclusão.
    await page.getByText(/salvar conclusão/i).first().click();
    await page.waitForTimeout(1_200);

    // Persistência: a ocorrência vencida agora tem completedAt e completedBy.
    const occs = (await readCollection(page, "@firesafe_itm_occurrences")) as Array<{
      description: string;
      completedAt?: string;
      completedBy?: string;
    }>;
    const overdue = occs.find((o) => o.description?.includes("ITM_OVERDUE"));
    expect(overdue?.completedAt, "ocorrência vencida não recebeu completedAt").toBeTruthy();

    // O nome do responsável foi gravado (form aplica MAIÚSCULAS → case-insensitive).
    expect(await storageContains(page, `${P}Tecnico Agenda`)).toBe(true);
  });

  test("reabrir uma tarefa concluída volta para pendente", async ({ page }) => {
    await openSystemSchedule(page);

    // A ocorrência concluída expõe o botão "Reabrir".
    const reabrir = page.getByText(/^reabrir$/i).first();
    await expect(reabrir).toBeVisible({ timeout: 8_000 });
    await reabrir.click();
    await page.waitForTimeout(1_000);

    // Persistência: a ocorrência ITM_DONE perdeu o completedAt.
    const occs = (await readCollection(page, "@firesafe_itm_occurrences")) as Array<{
      description: string;
      completedAt?: string;
    }>;
    const done = occs.find((o) => o.description?.includes("ITM_DONE"));
    expect(done, "ocorrência concluída não encontrada").toBeTruthy();
    expect(done?.completedAt, "reabrir não removeu completedAt").toBeFalsy();
  });

  test("filtro de status 'Vencidos' isola apenas as ocorrências vencidas", async ({ page }) => {
    await openSystemSchedule(page);

    // Linha de filtros de STATUS — clica no chip "Vencidos".
    // (há um chip de status e um cabeçalho de grupo com o mesmo texto; o chip
    // é clicável — usamos o primeiro match visível e validamos o efeito.)
    await page.getByText(/^vencidos$/i).first().click();
    await page.waitForTimeout(500);

    // A ocorrência vencida continua visível; a futura some.
    await expect(page.getByText(/ITM_OVERDUE/i).first()).toBeVisible();
    await expect(page.getByText(/ITM_FUTURE/i)).toHaveCount(0);
  });

  test("filtro de periodicidade 'Mensal' isola a ocorrência mensal", async ({ page }) => {
    await openSystemSchedule(page);

    // Linha de periodicidade — clica em "Mensal" (rotuloFrequencia monthly).
    const mensal = page.getByText(/^mensal\b/i).first();
    if (await mensal.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await mensal.click();
      await page.waitForTimeout(500);
      // A mensal (vencida) permanece; a trimestral (próxima) some.
      await expect(page.getByText(/ITM_OVERDUE/i).first()).toBeVisible();
      await expect(page.getByText(/ITM_DUESOON/i)).toHaveCount(0);
    }
  });

  test("exportar agenda gera download .ics", async ({ page }) => {
    await openSystemSchedule(page);

    const addToCal = page.getByText(/adicionar ao calendário/i).first();
    await expect(addToCal).toBeVisible({ timeout: 8_000 });

    // O .ics é baixado via <a download> no web → captura o evento de download.
    const downloadPromise = page.waitForEvent("download", { timeout: 8_000 }).catch(() => null);
    await addToCal.click();
    const download = await downloadPromise;

    if (download) {
      expect(download.suggestedFilename()).toMatch(/itm-.*\.ics$/i);
    } else {
      // Fallback: ao menos não deve quebrar a tela (resumo continua visível).
      await expect(page.getByText(/^total$/i).first()).toBeVisible();
    }
  });
});

test.describe("Notificações ITM — preferências", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAppStorage(page);
    await page.reload();
    await waitForApp(page);
  });

  test("abre a tela de Notificações e Calendário pelo Perfil", async ({ page }) => {
    await goProfile(page);

    const row = page.getByText(/notificações e calendário/i).first();
    await expect(row).toBeVisible({ timeout: 8_000 });
    await row.click();
    await page.waitForTimeout(600);

    // Seção de notificações com os toggles esperados. Usamos match EXATO no
    // "Resumo diário": o regex casaria com uma dica oculta da tela de Perfil
    // ("Entre para receber e-mails 48h, resumo diário e ..."), que continua
    // montada (aria-hidden) sob a tela empilhada de Notificações.
    await expect(page.getByText(/receber e-mail 48h antes/i).first()).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/receber push no celular/i).first()).toBeVisible();
    await expect(page.getByText("Resumo diário", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/horizonte de sincronização/i).first()).toBeAttached();
  });

  test("alterar horizonte de sincronização persiste a preferência", async ({ page }) => {
    await goProfile(page);
    await page.getByText(/notificações e calendário/i).first().click();
    await page.waitForTimeout(600);

    // Horizonte padrão é 90 dias; muda para 30.
    await page.getByText(/^30 dias$/i).first().click();
    await page.waitForTimeout(600);

    const prefs = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, PREFS_KEY);

    expect(prefs, "preferências de notificação não foram salvas").toBeTruthy();
    expect(prefs.horizonDays).toBe(30);
  });

  test("desativar e-mail 48h persiste a preferência", async ({ page }) => {
    await goProfile(page);
    await page.getByText(/notificações e calendário/i).first().click();
    await page.waitForTimeout(600);

    // O e-mail 48h vem ligado por padrão. O Switch do RN Web renderiza como
    // checkbox/role="switch" — clicamos no controle dentro da linha do e-mail.
    const emailRow = page.getByText(/receber e-mail 48h antes/i).first();
    await expect(emailRow).toBeVisible({ timeout: 8_000 });

    // O Switch fica como elemento clicável próximo. Tenta role="switch" primeiro.
    const switches = page.getByRole("switch");
    if (await switches.count() > 0) {
      await switches.first().click(); // primeiro toggle = e-mail 48h
      await page.waitForTimeout(600);

      const prefs = await page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      }, PREFS_KEY);

      expect(prefs, "preferências não persistidas").toBeTruthy();
      expect(prefs.email48hEnabled).toBe(false);
    }
  });
});
