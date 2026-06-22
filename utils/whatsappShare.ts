// Compartilhamento direto para o WhatsApp — versão WEB / fallback (padrão).
//
// react-native-share é um módulo NATIVO e não possui implementação web; importá-lo
// no bundle web quebra o app inteiro (tela branca). Por isso este arquivo base (.ts)
// é o escolhido pelo Metro no web e NÃO importa react-native-share. A versão real
// fica em whatsappShare.native.ts (escolhida pelo Metro no iOS/Android).
//
// Retorna sempre "unavailable" para que o chamador use o fallback adequado
// (Web Share API / wa.me no web).
export async function shareToWhatsAppNative(
  _uri: string,
  _fileName: string,
  _message: string,
): Promise<"ok" | "no_whatsapp" | "unavailable"> {
  return "unavailable";
}
