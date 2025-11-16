import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <Text style={[styles.title, { color: colors.text.primary }]}>
        {t("auth.login")}
      </Text>

      <Text style={[styles.label, { color: colors.text.secondary }]}>
        {t("auth.email")}
      </Text>
      <TextInput
        style={[
          styles.input,
          { color: colors.text.primary, borderColor: colors.border },
        ]}
        placeholder={t("auth.email")}
        placeholderTextColor={colors.text.muted}
      />

      <Text style={[styles.label, { color: colors.text.secondary }]}>
        {t("auth.password")}
      </Text>
      <TextInput
        secureTextEntry
        style={[
          styles.input,
          { color: colors.text.primary, borderColor: colors.border },
        ]}
        placeholder={t("auth.password")}
        placeholderTextColor={colors.text.muted}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.accent.primary }]}
      >
        <Text style={{ color: "#000", fontWeight: "600" }}>
          {t("auth.login")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={{ color: colors.text.secondary, marginTop: 10 }}>
          {t("auth.forgotPassword")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  label: { marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
});
