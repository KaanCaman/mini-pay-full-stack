import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
        padding: 24,
      }}
    >
      <Text style={{ color: colors.text.primary, fontSize: 22 }}>
        {t("history.title")}
      </Text>
    </View>
  );
}
