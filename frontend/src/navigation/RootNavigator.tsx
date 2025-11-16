import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";

// NOTE: authStore ileride MobX'ten gelecek
const isAuthenticated = false;

const Root = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Root.Screen name="Auth" component={AuthStack} />
        ) : (
          <Root.Screen name="App" component={AppTabs} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
