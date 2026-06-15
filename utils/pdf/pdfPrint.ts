// Helper unificado de impressão/compartilhamento de PDF.
// WEB: expo-print NÃO gera o relatório (printAsync imprime a própria tela do app).
//      Por isso, no web abrimos o HTML formatado em uma nova aba e disparamos a impressão.
// NATIVE: usa expo-print (printToFileAsync) + expo-sharing/printAsync normalmente.
import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

function openHtmlInNewTabAndPrint(html: string): void {
  if (typeof window === "undefined" || !window.open) return;
  const win = window.open("", "_blank");
  if (!win) {
    // Pop-up bloqueado: cai para impressão da própria janela com o HTML embutido.
    return;
  }
  const printCss = `<style>@media print{body{margin:0}}</style>`;
  const withPrint = html.includes("</head>")
    ? html.replace("</head>", `${printCss}</head>`)
    : `<!DOCTYPE html><html><head>${printCss}</head><body>${html}</body></html>`;
  win.document.open();
  win.document.write(withPrint);
  win.document.close();
  // Aguarda o layout/imagens renderizarem antes de imprimir.
  win.onload = () => {
    win.focus();
    try {
      win.print();
    } catch {
      /* usuário pode imprimir manualmente */
    }
  };
  // Fallback caso onload não dispare (HTML já completo).
  setTimeout(() => {
    try {
      win.focus();
      win.print();
    } catch {
      /* noop */
    }
  }, 800);
}

// Imprime o HTML do relatório. Web: nova aba + print. Native: arquivo + printAsync.
export async function printHtml(html: string): Promise<void> {
  if (Platform.OS === "web") {
    openHtmlInNewTabAndPrint(html);
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  await Print.printAsync({ uri });
}

// Compartilha (ou imprime) o HTML do relatório. Web: nova aba + print.
// Native: gera arquivo PDF e abre a folha de compartilhamento.
export async function shareOrPrintHtml(
  html: string,
  title?: string,
): Promise<void> {
  if (Platform.OS === "web") {
    openHtmlInNewTabAndPrint(html);
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: title,
      UTI: "com.adobe.pdf",
    });
  } else {
    await Print.printAsync({ uri });
  }
}
