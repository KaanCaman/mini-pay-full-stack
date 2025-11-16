import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AmountInputScreen from "../../screen/payment/AmountInputScreen";
import ConfirmScreen from "../../screen/payment/ConfrimScreen";


const Stack = createNativeStackNavigator();

export default function PaymentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AmountInput" component={AmountInputScreen} />
      <Stack.Screen name="Confirm" component={ConfirmScreen} />
    </Stack.Navigator>
  );
}
