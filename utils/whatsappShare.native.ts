// Compartilhamento direto para o WhatsApp — versão NATIVA (iOS/Android).
//
// O Metro escolhe este arquivo (.native.ts) no app nativo. Aqui é seguro importar
// react-native-share, que abre o WhatsApp diretamente com o PDF anexado:
//   - iOS: UIDocumentInteractionController (sem share sheet genérico)
//   - Android: intent explícito direcionado ao pacote com.whatsapp
//
// Requer build nativo (EAS Build ou custom dev client). Em Expo Go o módulo nativo
// não está linkado e shareSingle falha → retornamos "unavailable" p/ o fallback.
import { Linking, Alert } from "react-native";
import RNShare, { Social } from "react-native-share";

export async function shareToWhatsAppNative(
  uri: string,
  fileName: string,
  message: string,
): Promise<"ok" | "no_whatsapp" | "unavailable"> {
  // Verifica instalação do WhatsApp antes de tentar abrir.
  let canOpen = false;
  try {
    canOpen = await Linking.canOpenURL("whatsapp://send");
  } catch {
    canOpen = false;
  }

  if (!canOpen) {
    Alert.alert(
      "WhatsApp não encontrado",
      "WhatsApp não está instalado neste dispositivo.",
    );
    return "no_whatsapp";
  }

  try {
    await RNShare.shareSingle({
      social: Social.Whatsapp,
      url: uri,
      type: "application/pdf",
      filename: fileName,
      message,
    });
    return "ok";
  } catch (e: any) {
    const msg = (e?.error?.message || e?.message || "").toLowerCase();
    // Usuário cancelou — não é um erro.
    if (
      msg.includes("cancel") ||
      msg.includes("dismiss") ||
      msg.includes("user did not share")
    ) {
      return "ok";
    }
    // Módulo nativo não linkado (Expo Go) ou erro inesperado → fallback.
    return "unavailable";
  }
}
