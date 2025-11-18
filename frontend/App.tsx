import React, { useEffect } from "react";
import "./src/i18n";
import { ThemeProvider } from "./src/theme/ThemeProvider";
import RootNavigator from "./src/navigation/RootNavigator";
import { StoreProvider } from "./src/stores";

export default function App() {
  useEffect(() => {
    console.log("App started.");
  }, []);
  return (
    <ThemeProvider>
      <StoreProvider>
        <RootNavigator />
      </StoreProvider>
    </ThemeProvider>
  );
}
