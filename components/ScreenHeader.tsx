import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";

interface ScreenHeaderProps {
  title: string;
  /** Eyebrow mono em CAIXA ALTA (ex.: "06 registros · NFPA 25"). */
  subtitle?: string;
  /** Acao a esquerda (ex.: botao voltar). */
  left?: ReactNode;
  /** Acao a direita (ex.: botao de busca). */
  right?: ReactNode;
  /** Aplica o safe-area top (telas raiz). Padrao: true. */
  withInset?: boolean;
}

// Header de tela no conteudo — padrao Instrument (spec 03):
// titulo Archivo 22/800, eyebrow IBM Plex Mono 10/600 uppercase, borda inferior 1px.
export function ScreenHeader({
  title,
  subtitle,
  left,
  right,
  withInset = true,
}: ScreenHeaderProps) {
  const { fullTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: (withInset ? insets.top : 0) + 12,
          borderBottomColor: fullTheme.colors.border,
          backgroundColor: fullTheme.colors.background,
        },
      ]}
    >
      {left ? <View style={styles.left}>{left}</View> : null}
      <View style={styles.textBlock}>
        <ThemedText type="h1" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText mono secondary style={styles.eyebrow}>
            {subtitle.toUpperCase()}
          </ThemedText>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  left: {
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginTop: 3,
  },
  right: {
    marginLeft: 12,
  },
});
