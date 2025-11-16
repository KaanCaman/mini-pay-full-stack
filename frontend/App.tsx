import React from "react";
import "./src/i18n";
import { ThemeProvider } from "./src/theme/ThemeProvider";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
