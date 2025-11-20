import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../providers/ThemeProvider";

export default function TransactionDetailScreen() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
        padding: 24,
      }}
    >
      <Text style={{ color: colors.text.primary }}>Transaction Detail</Text>
    </View>
  );
}
