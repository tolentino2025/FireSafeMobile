import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ITMPlansScreen from "@/screens/ITMPlansScreen";
import ITMPlanFormScreen from "@/screens/ITMPlanFormScreen";
import ITMPlanSystemsScreen from "@/screens/ITMPlanSystemsScreen";
import ITMScheduleScreen from "@/screens/ITMScheduleScreen";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type ITMStackParamList = {
  ITMPlans: undefined;
  ITMPlanForm: undefined;
  ITMPlanSystems: { planId: string };
  ITMSchedule: { planId: string; systemKey: string };
};

const Stack = createNativeStackNavigator<ITMStackParamList>();

export default function ITMStackNavigator() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="ITMPlans"
        component={ITMPlansScreen}
        options={{
          headerTitle: t.itm.plans.title,
        }}
      />
      <Stack.Screen
        name="ITMPlanForm"
        component={ITMPlanFormScreen}
        options={{
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
          headerTitle: t.itm.form.title,
        }}
      />
      <Stack.Screen
        name="ITMPlanSystems"
        component={ITMPlanSystemsScreen}
        options={{
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
          headerTitle: t.itm.systems.title,
        }}
      />
      <Stack.Screen
        name="ITMSchedule"
        component={ITMScheduleScreen}
        options={{
          ...getCommonScreenOptions({ theme, isDark, transparent: false }),
          headerTitle: t.itm.schedule.title,
        }}
      />
    </Stack.Navigator>
  );
}
