// Gera um Blob de PDF a partir do HTML do relatório, no NAVEGADOR.
// O expo-print não gera arquivo no web (apenas window.print()), então usamos
// html2pdf.js (html2canvas + jsPDF). O HTML completo é renderizado dentro de um
// iframe oculto para preservar o CSS do <head>, e então capturado para PDF.
// Só deve ser chamado no web (há guarda por typeof document).

async function waitForImages(doc: Document): Promise<void> {
  const imgs = Array.from(doc.images || []);
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
          }),
    ),
  );
}

export async function htmlToPdfBlobWeb(html: string): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("htmlToPdfBlobWeb só pode rodar no navegador");
  }

  // Renderiza o documento completo num iframe oculto (CSS do <head> vale aqui).
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "794px"; // ~A4 a 96dpi
  iframe.style.height = "1123px";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    if (!doc) throw new Error("iframe sem contentDocument");
    doc.open();
    doc.write(html);
    doc.close();

    await new Promise<void>((resolve) => {
      if (doc.readyState === "complete") resolve();
      else iframe.onload = () => resolve();
      setTimeout(resolve, 1500);
    });
    await waitForImages(doc);

    // html2pdf.js não tem tipos próprios (ver types/html2pdf.d.ts).
    const html2pdf = (await import("html2pdf.js")).default;
    const blob: Blob = await html2pdf()
      .set({
        margin: 0,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: 794,
        },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(doc.body)
      .outputPdf("blob");
    return blob;
  } finally {
    document.body.removeChild(iframe);
  }
}
