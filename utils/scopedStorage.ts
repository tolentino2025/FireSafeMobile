// Isolamento de dados locais por usuário/empresa + ponte para o sync.
//
// PROBLEMA original: chaves globais (@firesafe_*) vazavam dados entre logins.
// SOLUÇÃO: todo dado OPERACIONAL é escopado:
//   - com empresa ativa  -> @chave::c:<companyId>   (membros compartilham)
//   - logado sem empresa -> @chave::u:<userId>
//   - sem login          -> @chave::u:guest
//
// Fase 2C: ao escrever uma coleção operacional sob escopo de EMPRESA, disparamos
// um "write hook" que espelha no Supabase (company_data). O pull usa setItemRaw
// (sem hook) para hidratar o local sem reempurrar.
//
// Dados de DISPOSITIVO (tema, idioma, assinatura) continuam globais (AsyncStorage direto).
import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST = "guest";
let activeUserId: string | null = null;
let activeCompanyId: string | null = null;

type WriteHook = (baseKey: string, value: string) => void;
let onWrite: WriteHook | null = null;

// Coleções operacionais que pertencem à empresa (sincronizam no servidor).
export const OPERATIONAL_KEYS = [
  "@firesafe_inspections",
  "@firesafe_properties",
  "@firesafe_companies",
  "@firesafe_app_users",
  "@firesafe_technical_responsibles",
  "@firesafe_fire_pumps",
  "@firesafe_fire_pump_panels",
  "@firesafe_schedules",
  "@firesafe_contractors",
  "@firesafe_job_sites",
  "@firesafe_diesel_performance_tests",
  "@firesafe_electric_performance_tests",
  "@firesafe_itm_plans",
  "@firesafe_itm_occurrences",
];
const OPERATIONAL = new Set(OPERATIONAL_KEYS);

export function setStorageScope(userId: string | null): void {
  activeUserId = userId && userId.length > 0 ? userId : null;
}

// Define a empresa ativa (precede o usuário no escopo). null = volta ao usuário.
export function setCompanyScope(companyId: string | null): void {
  activeCompanyId = companyId && companyId.length > 0 ? companyId : null;
}

// Registra o hook de escrita (o companyDataSync usa para empurrar ao servidor).
export function setWriteHook(hook: WriteHook | null): void {
  onWrite = hook;
}

export function getActiveCompanyId(): string | null {
  return activeCompanyId;
}

function scopeSuffix(): string {
  if (activeCompanyId) return `::c:${activeCompanyId}`;
  return `::u:${activeUserId ?? GUEST}`;
}

export function scopedKey(baseKey: string): string {
  return `${baseKey}${scopeSuffix()}`;
}

export const scopedStorage = {
  getItem(baseKey: string) {
    return AsyncStorage.getItem(scopedKey(baseKey));
  },
  setItem(baseKey: string, value: string) {
    const p = AsyncStorage.setItem(scopedKey(baseKey), value);
    // Espelha no servidor apenas coleções operacionais sob escopo de empresa.
    if (activeCompanyId && OPERATIONAL.has(baseKey) && onWrite) {
      try {
        onWrite(baseKey, value);
      } catch {
        /* noop */
      }
    }
    return p;
  },
  // Escrita "crua": não dispara o hook (usada pelo pull para hidratar o local).
  setItemRaw(baseKey: string, value: string) {
    return AsyncStorage.setItem(scopedKey(baseKey), value);
  },
  removeItem(baseKey: string) {
    return AsyncStorage.removeItem(scopedKey(baseKey));
  },
  multiGet(baseKeys: string[]) {
    return AsyncStorage.multiGet(baseKeys.map((k) => scopedKey(k)));
  },
};
