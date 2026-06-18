// Stub nativo: a geração de PDF no cliente (html2pdf.js) é exclusiva do web.
// No app nativo o PDF é gerado pelo expo-print e anexado via Sharing/MailComposer,
// então esta função nunca é chamada — Metro escolhe este arquivo (.native) e não
// inclui o html2pdf.js no bundle do app.
export async function htmlToPdfBlobWeb(_html: string): Promise<Blob> {
  throw new Error("htmlToPdfBlobWeb não é suportado no nativo");
}
