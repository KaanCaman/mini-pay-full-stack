import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text style={{ color: colors.text.primary, fontSize: 20 }}>
        {t("auth.register")}
      </Text>
    </View>
  );
}
