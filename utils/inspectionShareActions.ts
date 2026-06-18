// Ações padronizadas de Compartilhar (WhatsApp) e Enviar (E-mail) das inspeções.
// Funciona tanto no app nativo (iOS/Android) quanto no build web (Vercel):
//
// WhatsApp:
//   - Web: abre o WhatsApp Web/app via https://wa.me/?text=... (não há como
//     anexar arquivos pelo WhatsApp, então enviamos um resumo em texto).
//   - Nativo: gera o PDF e abre a folha de compartilhamento — o WhatsApp aparece
//     como destino e recebe o relatório em anexo. Sem PDF, cai no whatsapp://.
//
// E-mail:
//   - Web: abre o cliente de e-mail via mailto: (sem anexo — limitação do
//     navegador), já com assunto e corpo preenchidos.
//   - Nativo: usa o compositor de e-mail com o PDF anexado.
import { Platform, Linking } from "react-native";
import * as Sharing from "expo-sharing";
import * as MailComposer from "expo-mail-composer";

export async function shareViaWhatsApp(opts: {
  message: string;
  getPdfUri?: () => Promise<string>;
}): Promise<void> {
  const { message, getPdfUri } = opts;
  const webUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.open(webUrl, "_blank");
    return;
  }

  // Nativo: tenta enviar o PDF pela folha de compartilhamento (WhatsApp incluso).
  if (getPdfUri) {
    try {
      const uri = await getPdfUri();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: message,
          UTI: "com.adobe.pdf",
        });
        return;
      }
    } catch {
      // Sem PDF/compartilhamento: cai para abrir o WhatsApp só com o texto.
    }
  }

  const appUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
  const canOpenApp = await Linking.canOpenURL(appUrl);
  await Linking.openURL(canOpenApp ? appUrl : webUrl);
}

export async function sendViaEmail(opts: {
  subject: string;
  body: string;
  recipient?: string;
  getPdfUri?: () => Promise<string>;
}): Promise<void> {
  const { subject, body, recipient, getPdfUri } = opts;
  const mailto = `mailto:${recipient ?? ""}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.location.href = mailto;
    return;
  }

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
