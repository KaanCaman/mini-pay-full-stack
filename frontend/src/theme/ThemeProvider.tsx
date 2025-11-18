import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import { darkColors } from "./colors.dark";
import { lightColors } from "./colors.light";

type ThemeMode = "light" | "dark";

const ThemeContext = createContext({
  mode: "dark" as ThemeMode,
  colors: darkColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(useColorScheme() ?? "dark");

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setMode(colorScheme === "dark" ? "dark" : "light");
    });

    return () => subscription.remove(); // Cleanup
  }, []);

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
