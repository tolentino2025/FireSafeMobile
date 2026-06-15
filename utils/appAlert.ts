// Alerta/confirmação cross-platform.
// react-native-web NÃO implementa Alert.alert (vira no-op silencioso) — então no
// web usamos window.alert/window.confirm. No nativo usamos Alert.alert normal.
import { Alert, Platform } from "react-native";

export function showAlert(title: string, message?: string): void {
  if (Platform.OS === "web") {
    const text = message ? `${title}\n\n${message}` : title;
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(text);
    }
    return;
  }
  Alert.alert(title, message);
}

interface ConfirmOptions {
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export function showConfirm(
  title: string,
  message: string | undefined,
  onConfirm: () => void,
  options: ConfirmOptions = {},
): void {
  if (Platform.OS === "web") {
    const text = message ? `${title}\n\n${message}` : title;
    if (
      typeof window !== "undefined" &&
      typeof window.confirm === "function" &&
      window.confirm(text)
    ) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: options.cancelText ?? "Cancelar", style: "cancel" },
    {
      text: options.confirmText ?? "OK",
      style: options.destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}
