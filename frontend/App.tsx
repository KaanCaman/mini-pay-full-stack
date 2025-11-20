import React, { useEffect } from "react";
import "./src/i18n";
import { ThemeProvider } from "./src/providers/ThemeProvider";
import RootNavigator from "./src/navigation/RootNavigator";
import { StoreProvider } from "./src/stores";
import { ToastProvider } from "./src/providers/ToastProvider";

export default function App() {
  useEffect(() => {
    console.log("App started.");
  }, []);
  return (
    <ThemeProvider>
      <ToastProvider>
        <StoreProvider>
          <RootNavigator />
        </StoreProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
