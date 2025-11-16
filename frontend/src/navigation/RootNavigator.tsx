import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";
import { useStores } from "../stores";

// creates a new stack navigator instance
// yeni bir stack navigator instance'ı oluşturur
const Root = createNativeStackNavigator();

// defines the base navigator component that switches between Auth/App
// Auth/App arasında geçiş yapan ana navigator bileşenini tanımlar
const RootNavigatorBase = () => {
  // reads authStore from MobX root store
  // MobX root store'dan authStore'u çeker
  const { authStore } = useStores();

  // waits for hydration before rendering anything
  // hydration tamamlanmadan hiçbir şey render etmez
  if (!authStore.hydrated) {
    return null; // ileride SplashScreen gösterebilirsin
  }

  // chooses navigation stack based on authentication state
  // authentication durumuna göre uygun navigation stack'i seçer
  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!authStore.isAuthenticated ? (
          // user not authenticated → show login/register flow
          // kullanıcı giriş yapmamışsa → login/register flow'u gösterilir
          <Root.Screen name="Auth" component={AuthStack} />
        ) : (
          // user logged in → show main app tabs
          // kullanıcı giriş yaptıysa → ana uygulama sekmeleri gösterilir
          <Root.Screen name="App" component={AppTabs} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
};

// wraps navigator base with observer so MobX state changes re-render UI
// MobX durum değişikliklerinde UI'ın yeniden render olması için navigator observer ile sarılır
const RootNavigator = observer(RootNavigatorBase);

// exports final navigator for usage in App.tsx
// App.tsx içinde kullanılacak son navigator export edilir
export default RootNavigator;
