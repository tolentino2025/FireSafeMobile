// Helpers para inspecionar e manipular o localStorage do app.
// O app usa AsyncStorage (que mapeia para localStorage na web) com chaves
// prefixadas por @firesafe_ e sufixadas pelo escopo ativo (::u:userId ou ::c:companyId).

import { Page } from "@playwright/test";

const FS_PREFIX = "@firesafe_";
const SB_PREFIX = "sb-"; // chaves do Supabase Auth

// Preferências de DISPOSITIVO que são globais POR DESIGN (não escopadas):
// tema, idioma e assinatura. Ver utils/scopedStorage.ts:
// "Dados de DISPOSITIVO (tema, idioma, assinatura) continuam globais".
// Essas chaves não carregam dados de usuário, então não violam o isolamento.
const GLOBAL_DEVICE_KEYS = new Set<string>([
  "@firesafe_language",
  "@firesafe_theme_preference",
  "@firesafe_subscription",
]);

/** Remove todas as chaves do FireSafe ITM e do Supabase do localStorage. */
export async function clearAppStorage(page: Page): Promise<void> {
  await page.evaluate(
    ([fs, sb]) => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(fs) || k.startsWith(sb))
        .forEach((k) => localStorage.removeItem(k));
    },
    [FS_PREFIX, SB_PREFIX],
  );
}

/** Retorna todos os pares {chave, tamanho} das chaves @firesafe_*. */
export async function getAppStorageKeys(page: Page): Promise<{ key: string; size: number }[]> {
  return page.evaluate((prefix) => {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .map((k) => ({ key: k, size: (localStorage.getItem(k) ?? "").length }));
  }, FS_PREFIX);
}

/**
 * Retorna o sufixo de escopo ativo, ex: "u:guest", "u:abc123", "c:xyz456".
 * Derivado das chaves existentes no localStorage.
 */
export async function getActiveScopeSuffix(page: Page): Promise<string | null> {
  const keys = await getAppStorageKeys(page);
  if (keys.length === 0) return null;
  const m = keys[0].key.match(/::(.+)$/);
  return m ? m[1] : null;
}

/**
 * Lê uma coleção (array) do localStorage pelo baseKey.
 * Procura a primeira chave que comece com o baseKey.
 */
export async function readCollection(page: Page, baseKey: string): Promise<unknown[]> {
  return page.evaluate((key) => {
    const found = Object.keys(localStorage).find((k) => k.startsWith(key));
    if (!found) return [];
    try {
      return JSON.parse(localStorage.getItem(found) ?? "[]");
    } catch {
      return [];
    }
  }, baseKey);
}

/**
 * Retorna true se algum valor no localStorage contiver o texto fornecido.
 * Útil para verificar se dados de outro usuário vazaram.
 */
export async function storageContains(page: Page, text: string): Promise<boolean> {
  return page.evaluate((t) => {
    return Object.values(localStorage).some(
      (v) => typeof v === "string" && v.includes(t),
    );
  }, text);
}

/**
 * Verifica se as chaves do @firesafe_ seguem o padrão correto de escopo.
 * Chaves sem sufixo ::u: ou ::c: indicam bug de isolamento.
 */
export async function assertScopedKeys(page: Page): Promise<{ ok: boolean; badKeys: string[] }> {
  const keys = await getAppStorageKeys(page);
  const globalKeys = Array.from(GLOBAL_DEVICE_KEYS);
  const badKeys = keys
    .map((k) => k.key)
    // Ignora preferências globais de dispositivo (idioma, tema, assinatura).
    .filter((k) => !globalKeys.includes(k))
    // O que sobra DEVE ter sufixo de escopo ::u: ou ::c:.
    .filter((k) => !k.match(/::(u:|c:)/));
  return { ok: badKeys.length === 0, badKeys };
}

/**
 * Injeta uma coleção em um escopo específico para simular dados de outro usuário.
 * Usado nos testes de isolamento para verificar se os dados aparecem indevidamente.
 */
export async function injectScopedData(
  page: Page,
  baseKey: string,
  scopeSuffix: string,
  data: unknown[],
): Promise<void> {
  await page.evaluate(
    ([key, scope, payload]) => {
      localStorage.setItem(`${key}::${scope}`, JSON.stringify(payload));
    },
    [baseKey, scopeSuffix, data] as const,
  );
}

/** Conta itens em uma coleção no localStorage. */
export async function countCollection(page: Page, baseKey: string): Promise<number> {
  const items = await readCollection(page, baseKey);
  return items.length;
}
