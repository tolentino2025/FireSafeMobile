import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  View,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DatePickerField } from "@/components/DatePickerField";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useITM,
  ItmOccurrence,
  ItmResult,
} from "@/contexts/ITMContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { parseLocalYMD } from "@/utils/dateUtils";
import {
  rotuloSistema,
  rotuloFrequencia,
  ordemFrequencia,
} from "@/utils/itm/labels";
import {
  classificar,
  resumir,
  hojeISO,
  type AgendaStatus,
} from "@/utils/itm/agenda";
import { ITMStackParamList } from "@/navigation/ITMStackNavigator";

type Props = NativeStackScreenProps<ITMStackParamList, "ITMSchedule">;

type FiltroKey = "all" | "overdue" | "due_soon" | "future" | "completed";
// "all" = todas as periodicidades; senao a chave de frequencia (daily, monthly, ...).
type FreqKey = string;

const ORDEM_GRUPOS: AgendaStatus[] = [
  "overdue",
  "due_soon",
  "future",
  "completed",
];

export default function ITMScheduleScreen({ route, navigation }: Props) {
  const { planId, systemKey } = route.params;
  const { fullTheme } = useTheme();
  const { t, language } = useLanguage();
  const { getOcorrenciasDoSistema, concluirOcorrencia, reabrirOcorrencia } =
    useITM();
  const insets = useSafeAreaInsets();

  const [filtro, setFiltro] = useState<FiltroKey>("all");
  const [freq, setFreq] = useState<FreqKey>("all");

  // Estado do modal de conclusao.
  const [alvo, setAlvo] = useState<ItmOccurrence | null>(null);
  const [execDate, setExecDate] = useState<string>(hojeISO());
  const [responsavel, setResponsavel] = useState("");
  const [nota, setNota] = useState("");
  const [resultado, setResultado] = useState<ItmResult>("approved");

  const ocorrencias = getOcorrenciasDoSistema(planId, systemKey);
  const today = hojeISO();
  const locale = language === "pt-BR" ? "pt-BR" : "en-US";

  const formatDate = (s: string) =>
    parseLocalYMD(s).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // Navega o header para mostrar o nome do sistema.
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: rotuloSistema(systemKey, language) });
  }, [navigation, systemKey, language]);

  const filtros: { key: FiltroKey; label: string }[] = [
    { key: "all", label: t.itm.filters.all },
    { key: "overdue", label: t.itm.filters.overdue },
    { key: "due_soon", label: t.itm.filters.due_soon },
    { key: "future", label: t.itm.filters.future },
    { key: "completed", label: t.itm.filters.completed },
  ];

  // Resumo do SISTEMA inteiro (todas as periodicidades), para o cabecalho.
  const resumoSistema = useMemo(() => resumir(ocorrencias, today), [
    ocorrencias,
    today,
  ]);

  // Periodicidades presentes neste sistema (dinamico), com contagem que
  // respeita o filtro de STATUS atual. Periodicidades vazias nao aparecem.
  const frequenciasDisponiveis = useMemo(() => {
    const contagem = new Map<string, number>();
    for (const occ of ocorrencias) {
      const status = classificar(occ, today);
      if (filtro !== "all" && status !== filtro) continue;
      contagem.set(occ.frequency, (contagem.get(occ.frequency) ?? 0) + 1);
    }
    return Array.from(contagem.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => ordemFrequencia(a.key) - ordemFrequencia(b.key));
  }, [ocorrencias, filtro, today]);

  // Total de itens da periodicidade selecionada (respeitando status), para o chip "Todas".
  const totalTodasFreq = frequenciasDisponiveis.reduce(
    (acc, f) => acc + f.count,
    0,
  );

  // Agrupa por status, respeitando filtro de STATUS + filtro de PERIODICIDADE.
  const grupos = useMemo(() => {
    const map = new Map<AgendaStatus, ItmOccurrence[]>();
    for (const occ of ocorrencias) {
      if (freq !== "all" && occ.frequency !== freq) continue;
      const status = classificar(occ, today);
      if (filtro !== "all" && status !== filtro) continue;
      if (!map.has(status)) map.set(status, []);
      map.get(status)!.push(occ);
    }
    return map;
  }, [ocorrencias, filtro, freq, today]);

  const totalFiltrado = Array.from(grupos.values()).reduce(
    (acc, arr) => acc + arr.length,
    0,
  );

  const statusColor = (status: AgendaStatus): string => {
    switch (status) {
      case "completed":
        return fullTheme.colors.success;
      case "overdue":
        return fullTheme.colors.error;
      case "due_soon":
        return fullTheme.colors.warning;
      case "future":
      default:
        return fullTheme.colors.textSecondary;
    }
  };

  const statusLabel = (status: AgendaStatus): string => {
    switch (status) {
      case "completed":
        return t.itm.status.completed;
      case "overdue":
        return t.itm.status.overdue;
      case "due_soon":
        return t.itm.status.due_soon;
      case "future":
      default:
        return t.itm.status.future;
    }
  };

  const resultColor = (r?: ItmResult): string => {
    switch (r) {
      case "approved":
        return fullTheme.colors.success;
      case "nonconforming":
        return fullTheme.colors.error;
      case "pending":
        return fullTheme.colors.warning;
      default:
        return fullTheme.colors.textSecondary;
    }
  };

  const abrirModal = (occ: ItmOccurrence) => {
    setAlvo(occ);
    setExecDate(hojeISO());
    setResponsavel("");
    setNota("");
    setResultado("approved");
  };

  const confirmarConclusao = async () => {
    if (!alvo) return;
    await concluirOcorrencia(alvo.id, {
      completedAt: execDate,
      result: resultado,
      note: nota.trim() || undefined,
      completedBy: responsavel.trim() || undefined,
    });
    setAlvo(null);
  };

  const resultados: ItmResult[] = ["approved", "nonconforming", "pending"];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.topArea, { paddingTop: insets.top + 56 }]}>
        {/* Resumo do sistema */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText type="h4">{resumoSistema.total}</ThemedText>
            <ThemedText type="small" secondary>
              {t.itm.summary.total}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText
              type="h4"
              style={{
                color:
                  resumoSistema.vencidas > 0
                    ? fullTheme.colors.error
                    : fullTheme.colors.textPrimary,
              }}
            >
              {resumoSistema.vencidas}
            </ThemedText>
            <ThemedText type="small" secondary>
              {t.itm.summary.overdue}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText type="h4">{resumoSistema.proximas}</ThemedText>
            <ThemedText type="small" secondary>
              {t.itm.summary.soon}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText type="h4">{resumoSistema.concluidas}</ThemedText>
            <ThemedText type="small" secondary>
              {t.itm.summary.completed}
            </ThemedText>
          </View>
        </View>
        {resumoSistema.proximoVencimento ? (
          <ThemedText type="small" secondary style={styles.nextDue}>
            {t.itm.summary.nextDue}: {formatDate(resumoSistema.proximoVencimento)}
          </ThemedText>
        ) : null}

        {/* Linha 1 — Periodicidade (dinamica) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          <Pressable
            onPress={() => setFreq("all")}
            style={[
              styles.chip,
              {
                backgroundColor:
                  freq === "all"
                    ? fullTheme.colors.primary
                    : fullTheme.colors.cardBackground,
                borderColor:
                  freq === "all"
                    ? fullTheme.colors.primary
                    : fullTheme.colors.border,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: freq === "all" ? "#FFFFFF" : fullTheme.colors.textPrimary,
                fontWeight: "600",
              }}
            >
              {t.itm.freq.all} ({totalTodasFreq})
            </ThemedText>
          </Pressable>
          {frequenciasDisponiveis.map((f) => {
            const ativo = freq === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFreq(f.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: ativo
                      ? fullTheme.colors.primary
                      : fullTheme.colors.cardBackground,
                    borderColor: ativo
                      ? fullTheme.colors.primary
                      : fullTheme.colors.border,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: ativo ? "#FFFFFF" : fullTheme.colors.textPrimary,
                    fontWeight: "600",
                  }}
                >
                  {rotuloFrequencia(f.key, language)} ({f.count})
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Linha 2 — Status */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {filtros.map((f) => {
            const ativo = filtro === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFiltro(f.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: ativo
                      ? fullTheme.colors.primary
                      : fullTheme.colors.cardBackground,
                    borderColor: ativo
                      ? fullTheme.colors.primary
                      : fullTheme.colors.border,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: ativo ? "#FFFFFF" : fullTheme.colors.textPrimary,
                    fontWeight: "600",
                  }}
                >
                  {f.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing["5xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {totalFiltrado === 0 ? (
          <View style={styles.empty}>
            <Feather
              name="calendar"
              size={48}
              color={fullTheme.colors.textSecondary}
            />
            <ThemedText type="h3" style={styles.emptyTitle}>
              {ocorrencias.length === 0
                ? t.itm.schedule.emptyTitle
                : t.itm.schedule.emptyFiltered}
            </ThemedText>
            {ocorrencias.length === 0 ? (
              <ThemedText type="body" secondary style={styles.emptySubtitle}>
                {t.itm.schedule.emptySubtitle}
              </ThemedText>
            ) : null}
          </View>
        ) : (
          ORDEM_GRUPOS.filter((g) => grupos.has(g)).map((grupo) => (
            <View key={grupo} style={styles.group}>
              <View style={styles.groupHeader}>
                <View
                  style={[styles.dot, { backgroundColor: statusColor(grupo) }]}
                />
                <ThemedText type="h4">
                  {t.itm.schedule.groups[grupo]} ({grupos.get(grupo)!.length})
                </ThemedText>
              </View>

              {grupos.get(grupo)!.map((occ) => {
                const status = classificar(occ, today);
                return (
                  <View
                    key={occ.id}
                    style={[
                      styles.card,
                      {
                        backgroundColor: fullTheme.colors.cardBackground,
                        borderColor: fullTheme.colors.border,
                        ...fullTheme.shadows.small,
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <ThemedText type="body" style={styles.cardTitle}>
                        {occ.description}
                      </ThemedText>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: statusColor(status) },
                        ]}
                      >
                        <ThemedText type="small" style={styles.badgeText}>
                          {statusLabel(status)}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.cardRow}>
                      <ThemedText type="small" secondary>
                        {t.itm.schedule.frequency}:{" "}
                        {rotuloFrequencia(occ.frequency, language)}
                      </ThemedText>
                      <ThemedText type="small" secondary>
                        {t.itm.schedule.dueDate}: {formatDate(occ.dueDate)}
                      </ThemedText>
                    </View>

                    {occ.completedAt ? (
                      <View style={styles.completedBlock}>
                        <ThemedText
                          type="small"
                          style={{ color: fullTheme.colors.success }}
                        >
                          {t.itm.schedule.completedOn}:{" "}
                          {formatDate(occ.completedAt)}
                        </ThemedText>
                        {occ.result ? (
                          <View
                            style={[
                              styles.resultBadge,
                              { borderColor: resultColor(occ.result) },
                            ]}
                          >
                            <ThemedText
                              type="small"
                              style={{ color: resultColor(occ.result) }}
                            >
                              {t.itm.result[occ.result]}
                            </ThemedText>
                          </View>
                        ) : null}
                        <Pressable
                          onPress={() => reabrirOcorrencia(occ.id)}
                          style={styles.reopenButton}
                        >
                          <Feather
                            name="rotate-ccw"
                            size={14}
                            color={fullTheme.colors.primary}
                          />
                          <ThemedText
                            type="small"
                            style={{
                              color: fullTheme.colors.primary,
                              fontWeight: "600",
                            }}
                          >
                            {t.itm.schedule.reopen}
                          </ThemedText>
                        </Pressable>
                      </View>
                    ) : status === "future" ? (
                      // Tarefa futura: sem acao de concluir (evita conclusao inconsistente).
                      <ThemedText type="small" secondary>
                        {t.itm.schedule.scheduledDate}:{" "}
                        {formatDate(occ.scheduledDate)}
                      </ThemedText>
                    ) : (
                      <Pressable
                        onPress={() => abrirModal(occ)}
                        style={[
                          styles.completeButton,
                          { backgroundColor: fullTheme.colors.primary },
                        ]}
                      >
                        <Feather name="check" size={16} color="#FFFFFF" />
                        <ThemedText type="small" style={styles.completeButtonText}>
                          {t.itm.schedule.complete}
                        </ThemedText>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de conclusao */}
      <Modal
        visible={alvo !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setAlvo(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: fullTheme.colors.background,
                paddingBottom: insets.bottom + Spacing.lg,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">{t.itm.complete.title}</ThemedText>
              <Pressable onPress={() => setAlvo(null)} hitSlop={10}>
                <Feather name="x" size={24} color={fullTheme.colors.textPrimary} />
              </Pressable>
            </View>

            {alvo ? (
              <ThemedText type="small" secondary style={styles.modalSubtitle}>
                {alvo.description}
              </ThemedText>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText type="small" style={styles.label}>
                {t.itm.complete.date}
              </ThemedText>
              <DatePickerField value={execDate} onChange={setExecDate} />

              <ThemedText type="small" style={styles.label}>
                {t.itm.complete.responsible}
              </ThemedText>
              <TextInput
                value={responsavel}
                onChangeText={setResponsavel}
                placeholder={t.itm.complete.responsiblePlaceholder}
                placeholderTextColor={fullTheme.colors.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: fullTheme.colors.cardBackground,
                    borderColor: fullTheme.colors.border,
                    color: fullTheme.colors.textPrimary,
                  },
                ]}
              />

              <ThemedText type="small" style={styles.label}>
                {t.itm.complete.result}
              </ThemedText>
              <View style={styles.resultRow}>
                {resultados.map((r) => {
                  const ativo = resultado === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setResultado(r)}
                      style={[
                        styles.resultOption,
                        {
                          borderColor: ativo
                            ? resultColor(r)
                            : fullTheme.colors.border,
                          backgroundColor: ativo
                            ? resultColor(r) + "22"
                            : fullTheme.colors.cardBackground,
                        },
                      ]}
                    >
                      <ThemedText
                        type="small"
                        style={{
                          color: ativo
                            ? resultColor(r)
                            : fullTheme.colors.textPrimary,
                          fontWeight: ativo ? "700" : "400",
                        }}
                      >
                        {t.itm.result[r]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              <ThemedText type="small" style={styles.label}>
                {t.itm.complete.note}
              </ThemedText>
              <TextInput
                value={nota}
                onChangeText={setNota}
                placeholder={t.itm.complete.notePlaceholder}
                placeholderTextColor={fullTheme.colors.textSecondary}
                multiline
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: fullTheme.colors.cardBackground,
                    borderColor: fullTheme.colors.border,
                    color: fullTheme.colors.textPrimary,
                  },
                ]}
              />

              <Pressable
                onPress={confirmarConclusao}
                style={[
                  styles.confirmButton,
                  { backgroundColor: fullTheme.colors.primary },
                ]}
              >
                <Feather name="check" size={18} color="#FFFFFF" />
                <ThemedText type="h4" style={styles.confirmButtonText}>
                  {t.itm.complete.confirm}
                </ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topArea: { paddingBottom: Spacing.sm, gap: Spacing.sm },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
  },
  summaryItem: { alignItems: "center", flex: 1, gap: 2 },
  nextDue: { paddingHorizontal: Spacing.lg },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
    gap: Spacing.md,
  },
  emptyTitle: { textAlign: "center" },
  emptySubtitle: { textAlign: "center", paddingHorizontal: Spacing.xl },
  group: { marginBottom: Spacing.xl },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  cardTitle: { flex: 1 },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: { color: "#FFFFFF", fontWeight: "600" },
  completedBlock: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  resultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  reopenButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  completeButtonText: { color: "#FFFFFF", fontWeight: "600" },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalSubtitle: { marginTop: Spacing.xs, marginBottom: Spacing.md },
  label: { marginTop: Spacing.md, marginBottom: Spacing.xs, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  resultRow: { flexDirection: "row", gap: Spacing.sm },
  resultOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  confirmButtonText: { color: "#FFFFFF" },
});
