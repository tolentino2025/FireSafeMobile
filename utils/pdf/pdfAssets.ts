import { readAsStringAsync } from "expo-file-system/legacy";
import { Asset } from "expo-asset";

let cachedLogoDataUri: string | null = null;
let logoLoadAttempted = false;

export const getLogoDataUri = async (): Promise<string | null> => {
  if (logoLoadAttempted) {
    return cachedLogoDataUri;
  }

  logoLoadAttempted = true;

  try {
    const logoAsset = Asset.fromModule(
      require("@/assets/branding/firesafeitm-logo.png")
    );
    await logoAsset.downloadAsync();

    if (!logoAsset.localUri) {
      console.warn("Logo asset has no localUri");
      return null;
    }

    const base64 = await readAsStringAsync(logoAsset.localUri, {
      encoding: "base64",
    });

    cachedLogoDataUri = `data:image/png;base64,${base64}`;
    return cachedLogoDataUri;
  } catch (error) {
    console.warn("Failed to load logo for PDF:", error);
    return null;
  }
};

export const clearLogoCache = (): void => {
  cachedLogoDataUri = null;
  logoLoadAttempted = false;
};
