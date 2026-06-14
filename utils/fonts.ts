import { Platform } from "react-native";

// Injeta Archivo + IBM Plex Mono (padrao Instrument) no web via Google Fonts.
// No native as fontes do sistema sao usadas como fallback ate os arquivos
// serem empacotados via expo-font.
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

let injected = false;

export function ensureInstrumentFonts(): void {
  if (Platform.OS !== "web" || injected) return;
  if (typeof document === "undefined") return;
  injected = true;

  const preconnect1 = document.createElement("link");
  preconnect1.rel = "preconnect";
  preconnect1.href = "https://fonts.googleapis.com";
  document.head.appendChild(preconnect1);

  const preconnect2 = document.createElement("link");
  preconnect2.rel = "preconnect";
  preconnect2.href = "https://fonts.gstatic.com";
  preconnect2.crossOrigin = "anonymous";
  document.head.appendChild(preconnect2);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = GOOGLE_FONTS_HREF;
  document.head.appendChild(link);

  // Aplica Archivo como fonte base do documento.
  const style = document.createElement("style");
  style.textContent =
    "body,#root,#root *{font-family:'Archivo',system-ui,-apple-system,sans-serif}";
  document.head.appendChild(style);
}
