// Parser do documento-fonte NFPA 25 eForms (docs/normas/nfpa25-eforms.md).
// O OCR tem ruido (Backfow, fre service, fow, SNPIECTION). NAO fazemos matching
// textual semantico: rastreamos sistema corrente + secao atividade:frequencia e
// extraimos linhas-item (contem Yes + No + N/A + descricao).
// O confiavel eh a CONTAGEM por (sistema x frequencia x atividade).
import { readFileSync } from "node:fs";

export type Frequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual"
  | "3year"
  | "5year"
  | "unknown";

export type Activity = "inspection" | "test" | "maintenance" | "unknown";

export interface SourceItem {
  system: string;
  frequency: Frequency;
  activity: Activity;
  text: string;
  rawLine: string;
}

// Cabecalhos de sistema. As chaves do mapa sao testadas como prefixo (apos limpeza)
// para tolerar variacoes "(Continued)", numeros de pagina, etc.
const SISTEMAS: { prefixo: string; nome: string }[] = [
  { prefixo: "WET PIPE", nome: "Wet Pipe" },
  { prefixo: "DRY PIPE", nome: "Dry Pipe" },
  { prefixo: "PREACTION/DELUGE", nome: "Preaction/Deluge" },
  { prefixo: "PREACTION / DELUGE", nome: "Preaction/Deluge" },
  { prefixo: "STANDPIPE AND HOSE", nome: "Standpipe and Hose" },
  { prefixo: "WATER SPRAY", nome: "Water Spray" },
  { prefixo: "WATER MIST", nome: "Water Mist" },
  { prefixo: "FOAM-WATER", nome: "Foam-Water" },
  { prefixo: "FOAM WATER", nome: "Foam-Water" },
  { prefixo: "PRIVATE FIRE SERVICE MAINS", nome: "Private Fire Service Mains" },
  { prefixo: "WATER STORAGE TANK", nome: "Water Storage Tank" },
  { prefixo: "FIRE PUMP", nome: "Fire Pump" },
];

// Faixas de frequencia das secoes de Fire Pump (cinco faixas).
const FIRE_PUMP_FREQ: { token: string; freq: Frequency }[] = [
  { token: "WEEKLY", freq: "weekly" },
  { token: "MONTHLY", freq: "monthly" },
  { token: "QUARTERLY", freq: "quarterly" },
  { token: "SEMIANNUAL", freq: "semiannual" },
  { token: "ANNUAL", freq: "annual" },
];

// Mapeia rotulo textual -> frequencia normalizada.
function normalizarFrequencia(raw: string): Frequency {
  const s = raw.toLowerCase();
  if (/\bdaily\b/.test(s)) return "daily";
  if (/\bweekly\b/.test(s)) return "weekly";
  if (/\bquarterly\b/.test(s)) return "quarterly";
  if (/\bsemiannual\b/.test(s) || /\bsemi-annual\b/.test(s)) return "semiannual";
  if (/\bmonthly\b/.test(s)) return "monthly";
  // "Three Years" / "3 Year" antes de annual para nao colidir.
  if (/three\s*year/.test(s) || /\b3\s*year/.test(s)) return "3year";
  if (/five\s*year/.test(s) || /\b5\s*year/.test(s)) return "5year";
  if (/\bannual(ly)?\b/.test(s)) return "annual";
  return "unknown";
}

// Mapeia rotulo textual -> atividade normalizada.
function normalizarAtividade(raw: string): Activity {
  const s = raw.toLowerCase();
  if (/routine maintenance|maintenance/.test(s)) return "maintenance";
  if (/inspection|inspections/.test(s)) return "inspection";
  if (/\btest(s|ing)?\b/.test(s)) return "test";
  return "unknown";
}

// Remove marcas markdown (**, ##, |, <br>, espacos) de um cabecalho.
function limparCabecalho(linha: string): string {
  return linha
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/[#*|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Detecta se a linha eh um cabecalho de sistema; retorna o nome normalizado ou null.
function detectarSistema(linhaLimpa: string): string | null {
  const up = linhaLimpa.toUpperCase();
  // Exige mencao a INSPECTION/TESTING/MAINTENANCE ou INSPECTION (titulo de form),
  // para nao confundir com referencias soltas.
  const ehTituloForm =
    up.includes("INSPECTION, TESTING, AND MAINTENANCE") ||
    up.includes("INSPECTION, TESTING AND MAINTENANCE") ||
    /\bINSPECTION\b/.test(up);
  if (!ehTituloForm) return null;
  for (const s of SISTEMAS) {
    if (up.startsWith(s.prefixo)) {
      return s.nome;
    }
  }
  return null;
}

// Detecta secao "Atividade: Frequencia" (ex.: Inspections: Weekly, Test: Quarterly,
// Routine Maintenance, Frequency: Monthly).
function detectarSecao(
  linhaLimpa: string,
): { activity: Activity; frequency: Frequency } | null {
  const s = linhaLimpa;
  // Routine Maintenance (sem frequencia explicita -> annual por convencao do form).
  if (/^routine maintenance/i.test(s)) {
    return { activity: "maintenance", frequency: "annual" };
  }
  // Inspections: X / Inspection: X / Test: X / Tests: X / Frequency: X
  const m = s.match(
    /^(inspections?|tests?|frequency|inspection frequency)\s*:?\s*(daily|weekly|monthly|quarterly|semiannual|semi-annual|annual(?:ly)?|three years?|five years?|3\s*years?|5\s*years?)/i,
  );
  if (m) {
    const activity = normalizarAtividade(m[1]);
    const frequency = normalizarFrequencia(m[2]);
    return { activity, frequency };
  }
  return null;
}

// Extrai a descricao de uma linha-item de tabela que contem Yes/No/N/A.
// Remove as celulas Yes/No/N/A e marcas markdown, devolvendo a descricao limpa.
function extrairDescricao(linha: string): string | null {
  // Normaliza separadores e marcas.
  const semBr = linha.replace(/<br\s*\/?>/gi, " ");
  // Precisa conter os tres marcadores para ser linha-item.
  if (
    !/\bYes\b/i.test(semBr) ||
    !/\bNo\b/i.test(semBr) ||
    !/\bN\/A\b/i.test(semBr)
  ) {
    return null;
  }
  let desc = semBr
    // remove caracteres de controle remanescentes do OCR.
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/\|/g, " ")
    .replace(/[#*]/g, " ")
    // remove tokens Yes / No / N/A isolados.
    .replace(/\bN\/A\b/gi, " ")
    .replace(/\bYes\b/gi, " ")
    .replace(/\bNo\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Remove rodapes/ruido comuns.
  desc = desc.replace(/NFPA 25 Handbook.*$/i, "").trim();
  desc = desc.replace(/\(p\.\s*\d+\s*of\s*\d+\).*$/i, "").trim();
  if (desc.length < 4) return null;
  return desc;
}

// Faz o parse do arquivo e retorna a lista de SourceItem.
export function parseMd(path: string): SourceItem[] {
  const conteudo = readFileSync(path, "utf8");
  const linhas = conteudo.split(/\r?\n/);

  const itens: SourceItem[] = [];
  let sistemaAtual = "unknown";
  let atividadeAtual: Activity = "unknown";
  let frequenciaAtual: Frequency = "unknown";
  // Para Fire Pump, a frequencia vem do titulo da secao do form.
  let firePumpFreq: Frequency | null = null;

  for (const linha of linhas) {
    const limpa = limparCabecalho(linha);
    if (!limpa) continue;

    // 1) Cabecalho de sistema?
    const sis = detectarSistema(limpa);
    if (sis) {
      sistemaAtual = sis;
      atividadeAtual = "unknown";
      frequenciaAtual = "unknown";
      firePumpFreq = null;
      if (sis === "Fire Pump") {
        const up = limpa.toUpperCase();
        for (const fp of FIRE_PUMP_FREQ) {
          if (up.includes(fp.token)) {
            firePumpFreq = fp.freq;
            break;
          }
        }
        // Para Fire Pump definimos a atividade pela natureza do form:
        // - "WEEKLY INSPECTION" -> inspection
        // - "OPERATING TESTS" / "PERFORMANCE TEST" -> test
        // - forms combinados "INSPECTION, TESTING, AND MAINTENANCE" -> maintenance
        if (/OPERATING TEST|PERFORMANCE TEST/.test(up)) {
          atividadeAtual = "test";
        } else if (up.includes("INSPECTION, TESTING")) {
          atividadeAtual = "maintenance";
        } else if (/INSPECTION/.test(up)) {
          atividadeAtual = "inspection";
        }
        frequenciaAtual = firePumpFreq ?? "unknown";
      }
      continue;
    }

    // 2) Secao atividade:frequencia?
    const sec = detectarSecao(limpa);
    if (sec) {
      // Em Fire Pump preservamos a atividade derivada do titulo do form quando a
      // secao for apenas "Frequency: X" (que normaliza a atividade unknown).
      if (sistemaAtual === "Fire Pump" && sec.activity === "unknown") {
        // mantem atividadeAtual herdada do titulo do form.
      } else {
        atividadeAtual = sec.activity;
      }
      frequenciaAtual = sec.frequency;
      // Em Fire Pump, se a secao nao trouxer frequencia, usa a do titulo.
      if (sistemaAtual === "Fire Pump" && sec.frequency === "unknown") {
        frequenciaAtual = firePumpFreq ?? "unknown";
      }
      continue;
    }

    // 3) Linha-item (tabela com Yes/No/N/A). Pode haver multiplos itens empacotados
    // em uma unica celula separados por <br>.
    if (/\bYes\b/i.test(linha) && /\bNo\b/i.test(linha) && /N\/A/i.test(linha)) {
      // Tenta dividir celulas empacotadas: padrao "Yes No N/A <desc>" repetido.
      const blob = linha.replace(/<br\s*\/?>/gi, "\n");
      const partes = dividirItensEmpacotados(blob);
      for (const parte of partes) {
        const desc = extrairDescricao(parte);
        if (!desc) continue;
        itens.push({
          system: sistemaAtual,
          frequency: frequenciaAtual,
          activity: atividadeAtual,
          text: desc,
          rawLine: linha.trim(),
        });
      }
    }
  }

  return itens;
}

// Divide um blob que pode conter varios "Yes No N/A <desc>" em itens individuais.
// Quando ha apenas um marcador conjunto, devolve o proprio blob.
function dividirItensEmpacotados(blob: string): string[] {
  // Conta ocorrencias de N/A; se <= 1, eh um item unico.
  const ocorrencias = (blob.match(/N\/A/gi) || []).length;
  if (ocorrencias <= 1) {
    return [blob];
  }
  // Divide antes de cada "Yes ... No ... N/A". Usamos um regex global que captura
  // a partir de "Yes" ate antes do proximo "Yes" seguido (eventualmente) de No/N/A.
  const regex = /Yes[\s\S]*?N\/A[\s\S]*?(?=(?:Yes[\s\S]*?No[\s\S]*?N\/A)|$)/gi;
  const matches = blob.match(regex);
  if (!matches || matches.length === 0) {
    return [blob];
  }
  return matches;
}
