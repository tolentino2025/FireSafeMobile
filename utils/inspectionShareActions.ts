// Ações padronizadas de Compartilhar (WhatsApp) e Enviar (E-mail) das inspeções,
// SEMPRE com o PDF completo do relatório em anexo quando tecnicamente possível.
//
// Nativo (iOS/Android):
//   - WhatsApp (Compartilhar): usa react-native-share → Share.shareSingle() com
//     social: Social.WHATSAPP. No iOS abre o WhatsApp diretamente via
//     UIDocumentInteractionController (sem share sheet genérico). No Android usa
//     intent explícito direcionado ao pacote com.whatsapp.
//     Se WhatsApp não estiver instalado: exibe alerta claro ao usuário.
//     Se react-native-share não estiver linkado (Expo Go / dev sem native build):
//     cai para expo-sharing como fallback (share sheet genérico).
//   - E-mail: compositor de e-mail com o PDF anexado (fallback: mailto).
//
// Web (navegador):
//   - Gera o PDF no cliente (html2pdf.js) e usa a Web Share API com arquivo
//     (navigator.share({ files })) — assim o WhatsApp/e-mail recebem o PDF.
//     Em navegadores sem suporte a compartilhar arquivos (ex.: desktop), baixa
//     o PDF e abre o WhatsApp (wa.me) / e-mail (mailto) para anexar manualmente.
//
// IMPORTANTE – build nativo obrigatório para compartilhamento direto:
//   react-native-share requer módulo nativo linkado. Funciona em:
//     - EAS Build (production/preview)
//     - Custom dev client criado com eas build --profile development
//   NÃO funciona em Expo Go (neste caso usa fallback via expo-sharing).
import { Platform, Linking, Alert } from "react-native";
import * as Sharing from "expo-sharing";
import * as MailComposer from "expo-mail-composer";
import RNShare, { Social } from "react-native-share";

interface ShareOpts {
  message: string;
  fileName?: string;
  getPdfUri?: () => Promise<string>; // nativo (uri de arquivo)
  getPdfHtml?: () => Promise<string>; // web (HTML do relatório)
}

interface EmailOpts {
  subject: string;
  body: string;
  recipient?: string;
  fileName?: string;
  getPdfUri?: () => Promise<string>;
  getPdfHtml?: () => Promise<string>;
}

function safeFileName(name?: string): string {
  const base = (name || "relatorio-inspecao").replace(/[^\w.-]+/g, "_");
  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
}

function triggerDownload(blob: Blob, fileName: string): void {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Web: tenta compartilhar o PDF como arquivo via Web Share API.
// Retorna true se compartilhou; false se não há suporte (cabe ao chamador
// fazer o fallback de texto). Lança erro só em falhas inesperadas de geração.
async function shareFileOnWeb(
  getPdfHtml: () => Promise<string>,
  fileName: string,
  shareData: { text?: string; title?: string },
): Promise<boolean> {
  const { htmlToPdfBlobWeb } = await import("@/utils/htmlToPdfWeb");
  const blob = await htmlToPdfBlobWeb(await getPdfHtml());
  const file = new File([blob], fileName, { type: "application/pdf" });

  const nav = typeof navigator !== "undefined" ? (navigator as any) : undefined;
  if (nav?.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], ...shareData });
      return true;
    } catch (e: any) {
      // Usuário cancelou: consideramos resolvido (não cair no fallback).
      if (e && (e.name === "AbortError" || e.name === "NotAllowedError")) return true;
      throw e;
    }
  }

  // Sem Web Share API com arquivos: baixa o PDF para anexar manualmente.
  triggerDownload(blob, fileName);
  return false;
}

// Nativo: tenta abrir o WhatsApp diretamente com o PDF via react-native-share.
// Retorna:
//   "ok"          – WhatsApp aberto (ou cancelado pelo usuário, ambos resolvidos)
//   "no_whatsapp" – WhatsApp não instalado (alerta já exibido)
//   "unavailable" – react-native-share não linkado (Expo Go); cabe ao chamador
//                   usar o fallback (expo-sharing)
async function tryWhatsAppDirect(
  uri: string,
  fileName: string,
  message: string,
): Promise<"ok" | "no_whatsapp" | "unavailable"> {
  // Verifica instalação do WhatsApp antes de tentar qualquer coisa.
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

export async function shareViaWhatsApp(opts: ShareOpts): Promise<void> {
  const { message, getPdfUri, getPdfHtml } = opts;
  const fileName = safeFileName(opts.fileName);
  const webUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  if (Platform.OS === "web") {
    if (getPdfHtml) {
      try {
        const shared = await shareFileOnWeb(getPdfHtml, fileName, { text: message });
        if (shared) return;
      } catch {
        // falha ao gerar/compartilhar o PDF → segue para o WhatsApp só com texto
      }
    }
    if (typeof window !== "undefined") window.open(webUrl, "_blank");
    return;
  }

  // Nativo: gera o PDF e tenta abrir o WhatsApp diretamente.
  if (getPdfUri) {
    try {
      const uri = await getPdfUri();

      const result = await tryWhatsAppDirect(uri, fileName, message);

      if (result === "ok" || result === "no_whatsapp") return;

      // "unavailable" (Expo Go / native module not linked): fallback para share sheet.
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: message,
          UTI: "com.adobe.pdf",
        });
        return;
      }
    } catch {
      // falha ao gerar o PDF → cai para WhatsApp só com texto
    }
  }

  // Último recurso: abre o WhatsApp apenas com o texto.
  const appUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
  const canOpenApp = await Linking.canOpenURL(appUrl);
  await Linking.openURL(canOpenApp ? appUrl : webUrl);
}

export async function sendViaEmail(opts: EmailOpts): Promise<void> {
  const { subject, body, recipient, getPdfUri, getPdfHtml } = opts;
  const fileName = safeFileName(opts.fileName);
  const mailto = `mailto:${recipient ?? ""}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  if (Platform.OS === "web") {
    if (getPdfHtml) {
      try {
        const shared = await shareFileOnWeb(getPdfHtml, fileName, {
          title: subject,
          text: body,
        });
        if (shared) return;
      } catch {
        // falha ao gerar/compartilhar → segue para o mailto (sem anexo)
      }
    }
    if (typeof window !== "undefined") window.location.href = mailto;
    return;
  }

  // Nativo: compositor de e-mail com o PDF anexado.
  if (!(await MailComposer.isAvailableAsync())) {
    await Linking.openURL(mailto);
    return;
  }

  let attachments: string[] | undefined;
  if (getPdfUri) {
    try {
      attachments = [await getPdfUri()];
    } catch {
      attachments = undefined;
    }
  }

  await MailComposer.composeAsync({
    subject,
    body,
    recipients: recipient ? [recipient] : undefined,
    attachments,
  });
}
