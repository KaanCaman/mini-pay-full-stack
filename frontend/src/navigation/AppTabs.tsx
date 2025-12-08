import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeStack from "./stacks/HomeStack";
import PaymentStack from "./stacks/PaymentStack";
import HistoryStack from "./stacks/HistoryStack";
import ProfileStack from "./stacks/ProfileStack";
import { useTheme } from "../providers/ThemeProvider";
import { View, StyleSheet } from "react-native";
import { HouseIcon } from "phosphor-react-native";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {},
        tabBarActiveTintColor: theme.colors.accent.primary,
        tabBarInactiveTintColor: theme.colors.text.muted,
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: theme.colors.background.tertiary,
              },
            ]}
          />
        ),
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <HouseIcon
              color={
                focused ? theme.colors.accent.primary : theme.colors.text.muted
              }
            />
          ),
        }}
      />
      <Tab.Screen
        name="PaymentTab"
        component={PaymentStack}
        options={{ title: "Payment" }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{ title: "History" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}
