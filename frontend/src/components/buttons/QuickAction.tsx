import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../providers/ThemeProvider";

interface QuickActionProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  icon: React.ReactNode;
}

export const QuickAction = ({
  label,
  onPress,
  variant = "secondary",
  icon,
}: QuickActionProps) => {
  const { colors } = useTheme();
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={styles.actionBtnContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.actionIconCircle,
          {
            backgroundColor: isPrimary
              ? colors.accent.primary
              : colors.background.tertiary,
          },
        ]}
      >
        {icon}
      </View>
      <Text
        style={[
          styles.actionLabel,
          { color: colors.text.secondary, fontWeight: "500" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionBtnContainer: {
    flex: 1, // Distribute equal width
    alignItems: "center",
    gap: 8,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28, // Circle
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 13,
  },
});
