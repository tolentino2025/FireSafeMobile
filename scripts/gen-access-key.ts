/**
 * Gera chaves de acesso do FireSafe ITM.
 *
 *   npx tsx scripts/gen-access-key.ts --label "Jonel Incêndio" --months 12 --count 1
 *
 * Imprime a chave em texto puro (entregue ao cliente) e o SQL de INSERT com o
 * SHA-256 (rode no SQL Editor do Supabase). A chave em texto puro não é
 * guardada em lugar nenhum — se perder, revogue e emita outra.
 */
import { createHash, randomInt } from "node:crypto";

// Sem I, O, 0 e 1: evita erro de digitação ao ditar a chave por telefone.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const GROUPS = 4;
const GROUP_LEN = 5;

function generateKey(): string {
  const groups: string[] = [];
  for (let g = 0; g < GROUPS; g++) {
    let group = "";
    for (let i = 0; i < GROUP_LEN; i++) {
      group += ALPHABET[randomInt(ALPHABET.length)];
    }
    groups.push(group);
  }
  return groups.join("-");
}

/** Mesma normalização da RPC redeem_access_key: maiúsculas, só A-Z0-9. */
function canonical(key: string): string {
  return key.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function hashKey(key: string): string {
  return createHash("sha256").update(canonical(key)).digest("hex");
}

function argValue(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const label = argValue("label", "");
const months = Number(argValue("months", "12"));
const count = Number(argValue("count", "1"));

if (!Number.isInteger(months) || months < 1 || months > 120) {
  console.error("--months precisa ser um inteiro entre 1 e 120");
  process.exit(1);
}
if (!Number.isInteger(count) || count < 1 || count > 100) {
  console.error("--count precisa ser um inteiro entre 1 e 100");
  process.exit(1);
}

const keys = Array.from({ length: count }, generateKey);

console.log("\n── CHAVES (entregue ao cliente; não ficam salvas em lugar nenhum) ──");
for (const key of keys) console.log(`  ${key}`);

const values = keys
  .map((key) => `  ('${hashKey(key)}', ${label ? `'${label.replace(/'/g, "''")}'` : "null"}, ${months})`)
  .join(",\n");

console.log("\n── SQL (rode no SQL Editor do Supabase) ──");
console.log("insert into public.access_keys (key_hash, label, validity_months) values");
console.log(`${values};\n`);
