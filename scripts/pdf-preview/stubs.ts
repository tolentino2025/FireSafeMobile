// Stubs para rodar os geradores de PDF fora do React Native (só tipos são usados).
export const Inspection = undefined;
export const InspectionPhoto = undefined;
export const Platform = { OS: "web" };
export default {};
export const printToFileAsync = async () => ({ uri: "" });
export const printAsync = async () => {};
export const isAvailableAsync = async () => false;
export const shareAsync = async () => {};
export const composeAsync = async () => {};
export const readAsStringAsync = async () => "";
export const Asset = { fromModule: () => ({ downloadAsync: async () => {}, localUri: null }) };
export const manipulateAsync = async () => ({ base64: undefined });
export const SaveFormat = { JPEG: "jpeg", PNG: "png" };
export const getLocales = () => [{ languageTag: "pt-BR", languageCode: "pt" }];
export const getCalendars = () => [{ timeZone: "America/Sao_Paulo" }];
