import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Svg, { Line, Circle, Text as SvgText, Path, G, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";

type PumpCurveChartScreenProps = NativeStackScreenProps<HomeStackParamList, "PumpCurveChart">;

const CHART_PADDING = 50;
const CHART_HEIGHT = 300;

export default function PumpCurveChartScreen({ route }: PumpCurveChartScreenProps) {
  const { readings, pumpTag, ratedFlowGpm, ratedPressurePsi } = route.params;
  const { fullTheme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - (Spacing.md * 2) - (CHART_PADDING * 2);

  const chartData = useMemo(() => {
    const validPoints = readings
      .filter(r => r.flowGpm && r.netPressurePsi)
      .map(r => ({
        flow: parseFloat(r.flowGpm),
        pressure: parseFloat(r.netPressurePsi),
        flowPercent: r.flowPercent,
      }))
      .filter(p => !isNaN(p.flow) && !isNaN(p.pressure))
      .sort((a, b) => a.flow - b.flow);

    if (validPoints.length === 0) return null;

    const flows = validPoints.map(p => p.flow);
    const pressures = validPoints.map(p => p.pressure);
    
    const maxFlow = Math.max(...flows) * 1.1;
    const minFlow = 0;
    const maxPressure = Math.max(...pressures) * 1.1;
    const minPressure = Math.min(...pressures) * 0.9;

    return {
      points: validPoints,
      maxFlow,
      minFlow,
      maxPressure,
      minPressure,
      ratedFlow: parseFloat(ratedFlowGpm) || 0,
      ratedPressure: parseFloat(ratedPressurePsi) || 0,
    };
  }, [readings, ratedFlowGpm, ratedPressurePsi]);

  const scaleX = (flow: number) => {
    if (!chartData) return 0;
    const range = chartData.maxFlow - chartData.minFlow;
    if (range === 0) return CHART_PADDING + chartWidth / 2;
    return CHART_PADDING + ((flow - chartData.minFlow) / range) * chartWidth;
  };

  const scaleY = (pressure: number) => {
    if (!chartData) return 0;
    const range = chartData.maxPressure - chartData.minPressure;
    if (range === 0) return CHART_PADDING + CHART_HEIGHT / 2;
    return CHART_PADDING + CHART_HEIGHT - ((pressure - chartData.minPressure) / range) * CHART_HEIGHT;
  };

  const generateCurvePath = () => {
    if (!chartData || chartData.points.length < 2) return "";
    
    const points = chartData.points;
    let path = `M ${scaleX(points[0].flow)} ${scaleY(points[0].pressure)}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      const cpX1 = scaleX(prev.flow) + (scaleX(curr.flow) - scaleX(prev.flow)) / 3;
      const cpY1 = scaleY(prev.pressure);
      const cpX2 = scaleX(curr.flow) - (scaleX(curr.flow) - scaleX(prev.flow)) / 3;
      const cpY2 = scaleY(curr.pressure);
      
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${scaleX(curr.flow)} ${scaleY(curr.pressure)}`;
    }
    
    return path;
  };

  const generateGridLines = () => {
    if (!chartData) return { horizontal: [], vertical: [] };
    
    const horizontal = [];
    const vertical = [];
    const numLines = 5;
    
    for (let i = 0; i <= numLines; i++) {
      const pressure = chartData.minPressure + (chartData.maxPressure - chartData.minPressure) * (i / numLines);
      horizontal.push({ y: scaleY(pressure), value: Math.round(pressure) });
      
      const flow = chartData.minFlow + (chartData.maxFlow - chartData.minFlow) * (i / numLines);
      vertical.push({ x: scaleX(flow), value: Math.round(flow) });
    }
    
    return { horizontal, vertical };
  };

  const gridLines = generateGridLines();

  if (!chartData) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText type="h2" style={styles.title}>
          {t.performanceTest?.pumpCurve?.noData || "No Data Available"}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScreenScrollView>
      <View style={[styles.card, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
        <ThemedText type="h3" style={styles.title}>
          {t.performanceTest?.pumpCurve?.title || "Pump Performance Curve"}
        </ThemedText>
        {pumpTag ? (
          <ThemedText type="body" style={{ color: fullTheme.colors.textSecondary, textAlign: "center" }}>
            {pumpTag}
          </ThemedText>
        ) : null}
        
        <Spacer height={Spacing.lg} />
        
        <Svg width={screenWidth - Spacing.md * 2} height={CHART_HEIGHT + CHART_PADDING * 2}>
          <Rect
            x={CHART_PADDING}
            y={CHART_PADDING}
            width={chartWidth}
            height={CHART_HEIGHT}
            fill={fullTheme.colors.background}
            stroke={fullTheme.colors.border}
            strokeWidth={1}
          />
          
          {gridLines.horizontal.map((line, i) => (
            <G key={`h-${i}`}>
              <Line
                x1={CHART_PADDING}
                y1={line.y}
                x2={CHART_PADDING + chartWidth}
                y2={line.y}
                stroke={fullTheme.colors.border}
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />
              <SvgText
                x={CHART_PADDING - 8}
                y={line.y + 4}
                fontSize={10}
                fill={fullTheme.colors.textSecondary}
                textAnchor="end"
              >
                {line.value}
              </SvgText>
            </G>
          ))}
          
          {gridLines.vertical.map((line, i) => (
            <G key={`v-${i}`}>
              <Line
                x1={line.x}
                y1={CHART_PADDING}
                x2={line.x}
                y2={CHART_PADDING + CHART_HEIGHT}
                stroke={fullTheme.colors.border}
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />
              <SvgText
                x={line.x}
                y={CHART_PADDING + CHART_HEIGHT + 16}
                fontSize={10}
                fill={fullTheme.colors.textSecondary}
                textAnchor="middle"
              >
                {line.value}
              </SvgText>
            </G>
          ))}
          
          {chartData.ratedFlow > 0 ? (
            <Line
              x1={scaleX(chartData.ratedFlow)}
              y1={CHART_PADDING}
              x2={scaleX(chartData.ratedFlow)}
              y2={CHART_PADDING + CHART_HEIGHT}
              stroke={fullTheme.colors.success}
              strokeWidth={2}
              strokeDasharray="6,3"
            />
          ) : null}
          
          {chartData.ratedPressure > 0 ? (
            <Line
              x1={CHART_PADDING}
              y1={scaleY(chartData.ratedPressure)}
              x2={CHART_PADDING + chartWidth}
              y2={scaleY(chartData.ratedPressure)}
              stroke={fullTheme.colors.success}
              strokeWidth={2}
              strokeDasharray="6,3"
            />
          ) : null}
          
          <Path
            d={generateCurvePath()}
            stroke={fullTheme.colors.primary}
            strokeWidth={3}
            fill="none"
          />
          
          {chartData.points.map((point, i) => (
            <G key={i}>
              <Circle
                cx={scaleX(point.flow)}
                cy={scaleY(point.pressure)}
                r={6}
                fill={fullTheme.colors.primary}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <SvgText
                x={scaleX(point.flow)}
                y={scaleY(point.pressure) - 12}
                fontSize={9}
                fill={fullTheme.colors.textPrimary}
                textAnchor="middle"
                fontWeight="600"
              >
                {point.flowPercent}%
              </SvgText>
            </G>
          ))}
          
          <SvgText
            x={CHART_PADDING + chartWidth / 2}
            y={CHART_PADDING + CHART_HEIGHT + 35}
            fontSize={12}
            fill={fullTheme.colors.textPrimary}
            textAnchor="middle"
            fontWeight="600"
          >
            {t.performanceTest?.flow || "Flow"} (GPM)
          </SvgText>
          
          <SvgText
            x={15}
            y={CHART_PADDING + CHART_HEIGHT / 2}
            fontSize={12}
            fill={fullTheme.colors.textPrimary}
            textAnchor="middle"
            fontWeight="600"
            rotation={-90}
            origin={`15, ${CHART_PADDING + CHART_HEIGHT / 2}`}
          >
            {t.performanceTest?.netPressure || "Net Pressure"} (PSI)
          </SvgText>
        </Svg>
      </View>

      <Spacer height={Spacing.md} />

      <View style={[styles.card, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
        <ThemedText type="h4" style={styles.legendTitle}>
          {t.performanceTest?.pumpCurve?.legend || "Legend"}
        </ThemedText>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: fullTheme.colors.primary }]} />
          <ThemedText type="body">{t.performanceTest?.pumpCurve?.testCurve || "Test Curve"}</ThemedText>
        </View>
        {chartData.ratedFlow > 0 || chartData.ratedPressure > 0 ? (
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: fullTheme.colors.success, borderStyle: "dashed" }]} />
            <ThemedText type="body">{t.performanceTest?.pumpCurve?.ratedPoint || "Rated Point"}</ThemedText>
          </View>
        ) : null}
      </View>

      <Spacer height={Spacing.md} />

      <View style={[styles.card, { backgroundColor: fullTheme.colors.cardBackground, borderColor: fullTheme.colors.border }]}>
        <ThemedText type="h4" style={styles.legendTitle}>
          {t.performanceTest?.pumpCurve?.dataPoints || "Data Points"}
        </ThemedText>
        <View style={styles.dataTable}>
          <View style={[styles.dataRow, styles.dataHeader, { borderBottomColor: fullTheme.colors.border }]}>
            <ThemedText type="small" style={[styles.dataCell, { fontWeight: "600" }]}>%</ThemedText>
            <ThemedText type="small" style={[styles.dataCell, { fontWeight: "600" }]}>GPM</ThemedText>
            <ThemedText type="small" style={[styles.dataCell, { fontWeight: "600" }]}>PSI</ThemedText>
          </View>
          {chartData.points.map((point, i) => (
            <View key={i} style={[styles.dataRow, { borderBottomColor: fullTheme.colors.border }]}>
              <ThemedText type="body" style={styles.dataCell}>{point.flowPercent}%</ThemedText>
              <ThemedText type="body" style={styles.dataCell}>{point.flow}</ThemedText>
              <ThemedText type="body" style={styles.dataCell}>{point.pressure}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <Spacer height={Spacing.xl} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  card: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  legendTitle: {
    marginBottom: Spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  legendLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  dataTable: {
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  dataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
  },
  dataHeader: {
    paddingVertical: Spacing.md,
  },
  dataCell: {
    flex: 1,
    textAlign: "center",
  },
});
