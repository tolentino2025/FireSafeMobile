// Isolamento de dados locais por usuário.
// PROBLEMA: as chaves do AsyncStorage eram globais (@firesafe_*), então no mesmo
// navegador/dispositivo um usuário via os dados de quem usou antes.
// SOLUÇÃO: todo dado OPERACIONAL é escopado pelo id do usuário ativo:
//   @firesafe_inspections  ->  @firesafe_inspections::u:<userId>  (ou ::u:guest)
//
// Dados de DISPOSITIVO (tema, idioma, assinatura) continuam globais — são
// preferências do aparelho, não dados de cliente. Use AsyncStorage direto para eles.
import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST = "guest";
let activeUserId: string | null = null;

// Define o usuário ativo (chamado pelo AuthContext quando o login muda).
export function setStorageScope(userId: string | null): void {
  activeUserId = userId && userId.length > 0 ? userId : null;
}

export function getStorageScope(): string {
  return activeUserId ?? GUEST;
}

// Constrói a chave escopada. Aceita um userId explícito (evita corrida em efeitos).
export function scopedKey(baseKey: string, userId?: string | null): string {
  const scope = userId !== undefined ? userId || GUEST : getStorageScope();
  return `${baseKey}::u:${scope}`;
}

export const scopedStorage = {
  getItem(baseKey: string, userId?: string | null) {
    return AsyncStorage.getItem(scopedKey(baseKey, userId));
  },
  setItem(baseKey: string, value: string, userId?: string | null) {
    return AsyncStorage.setItem(scopedKey(baseKey, userId), value);
  },
  removeItem(baseKey: string, userId?: string | null) {
    return AsyncStorage.removeItem(scopedKey(baseKey, userId));
  },
  multiGet(baseKeys: string[], userId?: string | null) {
    return AsyncStorage.multiGet(baseKeys.map((k) => scopedKey(k, userId)));
  },
};
