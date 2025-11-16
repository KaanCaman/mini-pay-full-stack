import React, { createContext, useContext, useState, useMemo } from "react";
import { darkColors } from "./colors.dark";
import { lightColors } from "./colors.light";

type ThemeMode = "light" | "dark";

const ThemeContext = createContext({
  mode: "dark" as ThemeMode,
  colors: darkColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("dark");

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const colors = useMemo(() => {
    return mode === "dark" ? darkColors : lightColors;
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
