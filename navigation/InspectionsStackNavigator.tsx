import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import InspectionsListScreen from "@/screens/InspectionsListScreen";
import InspectionDetailScreen from "@/screens/InspectionDetailScreen";
import InspectionFormScreen from "@/screens/InspectionFormScreen";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { InspectionType } from "@/contexts/InspectionContext";

export type InspectionsStackParamList = {
  InspectionsList: undefined;
  InspectionDetail: { inspectionId: string };
  InspectionForm: { type: InspectionType; inspectionId?: string };
};

const Stack = createNativeStackNavigator<InspectionsStackParamList>();

export default function InspectionsStackNavigator() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="InspectionsList"
        component={InspectionsListScreen}
        options={{
          headerTitle: t.inspections.title,
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
        name="InspectionForm"
        component={InspectionFormScreen}
        options={{
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
          headerTitle: "Inspeção",
        }}
      />
    </Stack.Navigator>
  );
}
