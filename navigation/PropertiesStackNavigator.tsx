import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PropertiesScreen from "@/screens/PropertiesScreen";
import PropertyFormScreen from "@/screens/PropertyFormScreen";
import CompaniesScreen from "@/screens/CompaniesScreen";
import CompanyFormScreen from "@/screens/CompanyFormScreen";
import UsersScreen from "@/screens/UsersScreen";
import UserFormScreen from "@/screens/UserFormScreen";
import FirePumpListScreen from "@/screens/FirePumpListScreen";
import FirePumpFormScreen from "@/screens/FirePumpFormScreen";
import FirePumpPanelFormScreen from "@/screens/FirePumpPanelFormScreen";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type PropertiesStackParamList = {
  PropertiesList: undefined;
  PropertyForm: { propertyId?: string; companyId?: string; mode: "property" | "company" };
  Companies: undefined;
  CompanyForm: { companyId?: string };
  Users: undefined;
  UserForm: { userId?: string };
  FirePumpList: undefined;
  FirePumpForm: { pumpId?: string; companyId?: string };
  FirePumpPanelForm: { pumpId: string; panelId?: string };
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
      <Stack.Screen
        name="Companies"
        component={CompaniesScreen}
        options={{
          headerTitle: t.properties.companies,
        }}
      />
      <Stack.Screen
        name="CompanyForm"
        component={CompanyFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="Users"
        component={UsersScreen}
        options={{
          headerTitle: t.profile.inspector + "es",
        }}
      />
      <Stack.Screen
        name="UserForm"
        component={UserFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="FirePumpList"
        component={FirePumpListScreen}
        options={{
          headerTitle: t.firePumps.title,
        }}
      />
      <Stack.Screen
        name="FirePumpForm"
        component={FirePumpFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="FirePumpPanelForm"
        component={FirePumpPanelFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "",
        }}
      />
    </Stack.Navigator>
  );
}
