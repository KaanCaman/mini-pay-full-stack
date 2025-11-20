import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../providers/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function ConfirmScreen() {
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
      <Text style={{ color: colors.text.primary }}>{t("tabs.payment")}</Text>
    </View>
  );
}
