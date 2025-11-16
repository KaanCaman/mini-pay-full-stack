import React from "react";
import "./src/i18n";
import { ThemeProvider } from "./src/theme/ThemeProvider";
import { View } from "react-native";

export default function App() {
  return (
    <ThemeProvider>
      <View></View>
    </ThemeProvider>
  );
}
