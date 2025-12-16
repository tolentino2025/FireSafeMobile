import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import NewInspectionScreen from "@/screens/NewInspectionScreen";
import InspectionFormScreen from "@/screens/InspectionFormScreen";
import InspectionDetailScreen from "@/screens/InspectionDetailScreen";
import PerformanceTestScreen from "@/screens/PerformanceTestScreen";
import DieselPerformanceTestScreen from "@/screens/DieselPerformanceTestScreen";
import PumpCurveChartScreen from "@/screens/PumpCurveChartScreen";
import FM85AFormScreen from "@/screens/FM85AFormScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { InspectionType } from "@/contexts/InspectionContext";
import { DieselTestReading } from "@/types/performanceTest";

export type HomeStackParamList = {
  Home: undefined;
  NewInspection: undefined;
  InspectionForm: { type: InspectionType; inspectionId?: string };
  InspectionDetail: { inspectionId: string };
  PerformanceTest: { testId?: string };
  DieselPerformanceTest: { testId?: string };
  PumpCurveChart: { readings: DieselTestReading[]; pumpTag: string; ratedFlowGpm: string; ratedPressurePsi: string };
  FM85AForm: { certificateId?: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="FireSafe ITM" />,
        }}
      />
      <Stack.Screen
        name="NewInspection"
        component={NewInspectionScreen}
        options={{
          presentation: "modal",
          headerTitle: "Nova Inspeção",
        }}
      />
      <Stack.Screen
        name="InspectionForm"
        component={InspectionFormScreen}
        options={{
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
          headerTitle: "Inspeção",
        }}
      />
      <Stack.Screen
        name="InspectionDetail"
        component={InspectionDetailScreen}
        options={{
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
          headerTitle: "Detalhes",
        }}
      />
      <Stack.Screen
        name="PerformanceTest"
        component={PerformanceTestScreen}
        options={{
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
          headerTitle: "Performance Test",
        }}
      />
      <Stack.Screen
        name="DieselPerformanceTest"
        component={DieselPerformanceTestScreen}
        options={{
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
          headerTitle: "Diesel Performance Test",
        }}
      />
      <Stack.Screen
        name="PumpCurveChart"
        component={PumpCurveChartScreen}
        options={{
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
          headerTitle: "Pump Curve",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="FM85AForm"
        component={FM85AFormScreen}
        options={{
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
          headerTitle: "FM85A Certificate",
        }}
      />
    </Stack.Navigator>
  );
}
