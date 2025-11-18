import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegisterScreen from "../screen/auth/RegisterScreen";
import LoginScreen from "../screen/auth/LoginScreen";
import { AuthStackParamList } from "./types";
import AuthScreen from "../screen/auth/AuthScreen";

// creates the stack instance which controls screen transitions
// ekran geçişlerini yöneten stack instance'ı oluşturulur
const Stack = createNativeStackNavigator<AuthStackParamList>();

// defines the authentication navigation flow (Login → Register)
// authentication navigasyon akışını tanımlar (Login → Register)
export default function AuthStack() {
  return (
    // stack container that manages screen history and animations
    // ekran geçmişini ve animasyonlarını yöneten stack container
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // hide headers for custom UI
        animation: "fade", // smooth transition for auth screens
        gestureEnabled: true, // allow swipe gestures on iOS
      }}
    >
      <Stack.Screen name="AuthScreen" component={AuthScreen} />
      {/* login screen is the entry point */}
      {/* giriş noktası login ekranıdır */}
      {/* <Stack.Screen name="Login" component={LoginScreen} /> */}

      {/* register screen used when user creates a new account */}
      {/* kullanıcı yeni hesap oluşturmak istediğinde kullanılan ekran */}
      {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
    </Stack.Navigator>
  );
}

// extend React Navigation's RootParamList with AuthStackParamList
// React Navigation'ın RootParamList'ini AuthStackParamList ile genişlet
declare global {
  namespace ReactNavigation {
    interface RootParamList extends AuthStackParamList {}
  }
}
