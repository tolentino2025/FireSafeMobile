// Gera os PDFs dos relatórios para revisão visual.
//
//   npm run pdf:preview            # todos
//   npm run pdf:preview -- hidrostatico
//
// Saída em .pdf-preview/: um PDF por relatório e um PNG por página (renderizado
// com pdf.js, então mostra a paginação real — cabeçalho repetido inclusive).
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../..");
const outDir = resolve(repo, ".pdf-preview");
mkdirSync(outDir, { recursive: true });

const only = process.argv[2];
const specs = readdirSync(here)
  .filter((f) => f.endsWith(".spec.ts"))
  .map((f) => f.replace(".spec.ts", ""))
  .filter((name) => !only || name === only);

if (specs.length === 0) {
  console.error(`Nenhum relatório chamado "${only}".`);
  process.exit(1);
}

const browser = await chromium.launch();
try {
  for (const name of specs) {
    const htmlPath = resolve(outDir, `${name}.html`);
    execFileSync(
      "npx",
      ["vitest", "run", "--config", resolve(here, "vitest.config.ts"), resolve(here, `${name}.spec.ts`)],
      { cwd: repo, env: { ...process.env, PDF_OUT: htmlPath }, stdio: "pipe" },
    );

    const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
    await page.setContent(readFileSync(htmlPath, "utf8"), { waitUntil: "networkidle" });
    const pdfPath = resolve(outDir, `${name}.pdf`);
    await page.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true });
    await page.close();

    const pages = await renderPages(browser, pdfPath, resolve(outDir, name));
    console.log(`${name}: ${pages} página(s) → ${pdfPath}`);
  }
} finally {
  await browser.close();
}

// Renderiza cada página do PDF em PNG (pdf.js), mostrando a paginação real.
async function renderPages(browser, pdfPath, outPrefix) {
  const PDFJS = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build";
  const data = readFileSync(pdfPath).toString("base64");
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  try {
    await page.setContent(`<!doctype html><html><body style="margin:0"><div id="out"></div></body></html>`);
    const count = await page.evaluate(
      async ([b64, cdn]) => {
        const pdfjs = await import(`${cdn}/pdf.min.mjs`);
        pdfjs.GlobalWorkerOptions.workerSrc = `${cdn}/pdf.worker.min.mjs`;
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const doc = await pdfjs.getDocument({ data: bytes }).promise;
        const out = document.getElementById("out");
        for (let i = 1; i <= doc.numPages; i++) {
          const p = await doc.getPage(i);
          const viewport = p.getViewport({ scale: 1.4 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.id = `pg${i}`;
          canvas.style.display = "block";
          out.appendChild(canvas);
          await p.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        }
        return doc.numPages;
      },
      [data, PDFJS],
    );
    for (let i = 1; i <= count; i++) {
      await page.locator(`#pg${i}`).screenshot({ path: `${outPrefix}-p${i}.png` });
    }
    return count;
  } catch {
    // Sem rede o pdf.js não carrega; o PDF já está gerado, só não sai o PNG.
    return "?";
  } finally {
    await page.close();
  }
}
