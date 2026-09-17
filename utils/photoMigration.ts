// Migração dos dados já gravados: tira as fotos embutidas em base64 de TODAS as
// chaves do app (qualquer usuário/empresa, fila de sync incluída) e as move para
// o armazenamento de fotos. Roda ao abrir o app, antes de os contextos lerem os
// dados. Idempotente: sem fotos embutidas, não grava nada.
//
// Funciona com o armazenamento LOTADO: o binário vai primeiro para o IndexedDB
// (cota separada) e só então a chave é regravada, MENOR que antes.
import AsyncStorage from "@react-native-async-storage/async-storage";

import { externalizeInlinePhotos, requestPersistentStorage } from "@/utils/photoStore";
import { mightContainInlinePhotos } from "@/utils/photoRefs";

// Rascunhos dos testes de desempenho não usam o prefixo @firesafe.
const APP_KEY_PREFIXES = ["@firesafe", "performance_test_draft", "diesel_performance_test_draft"];

export async function migrateInlinePhotos(): Promise<{ rewrittenKeys: number; unreadableKeys: number }> {
  await requestPersistentStorage();

  let rewrittenKeys = 0;
  let unreadableKeys = 0;
  const keys = (await AsyncStorage.getAllKeys()).filter((k) =>
    APP_KEY_PREFIXES.some((prefix) => k.startsWith(prefix)),
  );

  for (const key of keys) {
    let raw: string | null;
    try {
      raw = await AsyncStorage.getItem(key);
    } catch (e) {
      // Android: um item acima de ~2 MB pode nem ser legível pelo SQLite. Esse
      // registro já estava inacessível para o app antes desta migração — não há
      // como recuperá-lo daqui, então só contabilizamos.
      console.warn("[photos] migração: não foi possível ler", key, e);
      unreadableKeys++;
      continue;
    }
    if (!raw || !mightContainInlinePhotos(raw)) continue;

    const migrated = await externalizeInlinePhotos(raw);
    if (migrated === raw) continue;

    try {
      // Compare-and-set: se algo gravou nesta chave enquanto as fotos eram
      // movidas, não sobrescreve com a leitura antiga. A próxima abertura (ou o
      // próprio salvamento, que também tira as fotos do JSON) resolve.
      if ((await AsyncStorage.getItem(key)) !== raw) continue;
      await AsyncStorage.setItem(key, migrated);
      rewrittenKeys++;
    } catch (e) {
      console.warn("[photos] migração: não foi possível regravar", key, e);
    }
  }

  if (rewrittenKeys > 0 || unreadableKeys > 0) {
    console.log(
      `[photos] migração concluída: ${rewrittenKeys} chave(s) sem fotos embutidas, ` +
        `${unreadableKeys} ilegível(is)`,
    );
  }
  return { rewrittenKeys, unreadableKeys };
}
