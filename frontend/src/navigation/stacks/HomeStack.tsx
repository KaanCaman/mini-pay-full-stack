import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TransactionDetailScreen from "../../screen/home/TransactionDetailScreen";
import HomeScreen from "../../screen/home/HomeScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
      />
    </Stack.Navigator>
  );
}
