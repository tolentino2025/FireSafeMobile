// Links legais exigidos pela Google Play (política de privacidade, termos de uso
// e canal de solicitação de exclusão de conta/dados — LGPD / User Data policy).
//
// ⚠️ AÇÃO NECESSÁRIA: as três URLs abaixo precisam apontar para páginas HTML
// públicas, ativas, não geobloqueadas e NÃO em PDF. Hospede-as (site da Jonel,
// Vercel, etc.) e/ou defina as variáveis de ambiente EXPO_PUBLIC_* no build.
// A mesma URL de privacidade deve ser cadastrada no Play Console.

// Domínio público hospedado no Replit (deploy estático) — serve as páginas em
// public/ (privacidade, termos, excluir-conta).
const LEGAL_SITE = process.env.EXPO_PUBLIC_LEGAL_SITE ?? "https://firesafeitm.com";

export const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_URL ?? `${LEGAL_SITE}/privacidade/`;

export const TERMS_OF_USE_URL =
  process.env.EXPO_PUBLIC_TERMS_URL ?? `${LEGAL_SITE}/termos/`;

// Página para solicitar exclusão de conta e dados sem precisar abrir o app
// (exigido pela política de exclusão de conta do Google Play). Também usada como
// fallback quando a exclusão automática in-app não está disponível.
export const ACCOUNT_DELETION_URL =
  process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL ?? `${LEGAL_SITE}/excluir-conta/`;

// E-mail de contato para privacidade/exclusão (fallback humano).
export const PRIVACY_CONTACT_EMAIL =
  process.env.EXPO_PUBLIC_PRIVACY_EMAIL ?? "suporte@firesafeitm.com";
