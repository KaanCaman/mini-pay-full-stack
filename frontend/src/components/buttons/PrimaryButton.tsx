import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

export default function PrimaryButton({
  title,
  onPress,
  loading,
}: {
  title: string;
  onPress: () => void;
  loading: boolean;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.accent.primary,
          shadowColor: colors.accent.glow,
        },
      ]}
      onPress={onPress}
      disabled={loading}
    >
      <Text style={styles.text}>{loading ? "..." : title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
