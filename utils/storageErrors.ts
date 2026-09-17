// Reconhece falha por armazenamento local cheio, para dar ao usuário uma
// mensagem que diga o que houve em vez do genérico "Erro ao salvar".
//   web:     DOMException QuotaExceededError (Firefox: NS_ERROR_DOM_QUOTA_REACHED)
//   Android: SQLite "database or disk is full" (SQLITE_FULL)
export function isStorageFullError(error: unknown): boolean {
  if (!error) return false;
  const name = (error as { name?: unknown }).name;
  if (name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED") return true;
  const message = String((error as { message?: unknown }).message ?? error);
  return /quota|disk is full|SQLITE_FULL/i.test(message);
}
