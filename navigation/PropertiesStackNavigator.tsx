import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PropertiesScreen from "@/screens/PropertiesScreen";
import PropertyFormScreen from "@/screens/PropertyFormScreen";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type PropertiesStackParamList = {
  PropertiesList: undefined;
  PropertyForm: { propertyId?: string; companyId?: string; mode: "property" | "company" };
};

const Stack = createNativeStackNavigator<PropertiesStackParamList>();

export default function PropertiesStackNavigator() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="PropertiesList"
        component={PropertiesScreen}
        options={{
          headerTitle: t.properties.title,
        }}
      />
      <Stack.Screen
        name="PropertyForm"
        component={PropertyFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "",
        }}
      />
    </Stack.Navigator>
  );
}
