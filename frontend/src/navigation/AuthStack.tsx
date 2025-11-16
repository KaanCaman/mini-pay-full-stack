import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// imports authentication screens
// authentication ekranlarını içe aktarır
import RegisterScreen from "../screen/auth/RegisterScreen";
import LoginScreen from "../screen/auth/LoginScreen";

// creates the stack instance which controls screen transitions
// ekran geçişlerini yöneten stack instance'ı oluşturulur
const Stack = createNativeStackNavigator();

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
      {/* login screen is the entry point */}
      {/* giriş noktası login ekranıdır */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* register screen used when user creates a new account */}
      {/* kullanıcı yeni hesap oluşturmak istediğinde kullanılan ekran */}
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
