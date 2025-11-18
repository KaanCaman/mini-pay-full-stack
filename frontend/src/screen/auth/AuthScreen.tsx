import React, { useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  StyleSheet,
} from "react-native";

import { useTheme } from "../../theme/ThemeProvider";
import { useStores } from "../../stores";
import { useTranslation } from "react-i18next";

import AuthHeader from "../../components/auth/AuthHeader";
import Input from "../../components/input/Input";
import PasswordInput from "../../components/input/PasswordInput";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import AlertDialog from "../../components/dialog/AlertDialog";

import { EnvelopeSimpleIcon, LockSimpleIcon } from "phosphor-react-native";
import SlidingTab from "../../components/auth/SlidingTab";

export default function AuthScreen() {
  const { colors } = useTheme();
  const { authStore } = useStores();
  const { t } = useTranslation();

  // 0 = login , 1 = register
  const [mode, setMode] = useState<0 | 1>(0);

  // form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ui-level error dialog
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = () => {
    if (email.trim() === "" || password.trim() === "") {
      setErrorMsg(t("auth.fill_fields"));
      return;
    }

    // REGISTER VALIDATION
    if (mode === 1) {
      if (password !== confirmPassword) {
        setErrorMsg(t("auth.register_password_mismatch"));
        return;
      }
    }

    // --- LOGIN MODE ---
    if (mode === 0) {
      authStore.login(email, password).catch((err) => {
        const msg = err?.response?.data?.error || t("auth.login_error");
        setErrorMsg(msg);
      });
      return;
    }

    // --- REGISTER MODE ---
    authStore
      .register(email, password)
      .then(() => {
        setMode(0);
        resetForm();
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || t("auth.register_error");
        setErrorMsg(msg);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
      }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <AuthHeader
          subtitle={
            mode === 0 ? t("auth.welcome_back") : t("auth.create_account")
          }
        />

        {/* SLIDING TAB */}
        <SlidingTab
          options={[t("auth.login"), t("auth.register")]}
          selectedIndex={mode}
          onSelect={(i: number) => {
            setMode(i as 0 | 1);
            resetForm();
          }}
        />

        {/* EMAIL */}
        <View style={{ marginTop: 26 }}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>
            {t("auth.email")}
          </Text>

          <Input
            placeholder={t("auth.email_placeholder")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            icon={<EnvelopeSimpleIcon size={20} color={colors.text.muted} />}
          />
        </View>

        {/* PASSWORD */}
        <Text
          style={[
            styles.label,
            { marginTop: 16, color: colors.text.secondary },
          ]}
        >
          {t("auth.password")}
        </Text>
        <PasswordInput
          placeholder={t("auth.password_placeholder")}
          value={password}
          onChangeText={setPassword}
          icon={<LockSimpleIcon size={20} color={colors.text.muted} />}
        />

        {/* CONFIRM PASSWORD (ONLY REGISTER) */}
        {mode === 1 && (
          <>
            <Text
              style={[
                styles.label,
                { marginTop: 16, color: colors.text.secondary },
              ]}
            >
              {t("auth.confirm_password")}
            </Text>

            <PasswordInput
              placeholder={t("auth.confirm_password_placeholder")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon={<LockSimpleIcon size={20} color={colors.text.muted} />}
            />
          </>
        )}

        {/* SUBMIT BUTTON */}
        <PrimaryButton
          title={mode === 0 ? t("auth.login") : t("auth.register")}
          onPress={handleSubmit}
          loading={authStore.loading}
          //   style={{ marginTop: 32 }}
        />

        {/* SWITCH MODE */}
        <View style={{ alignItems: "center", marginTop: 22 }}>
          <Text style={{ color: colors.text.secondary }}>
            {mode === 0 ? t("auth.no_account") : t("auth.already_have_account")}{" "}
            <Text
              style={{
                color: colors.accent.primary,
                fontWeight: "700",
              }}
              onPress={() => {
                setMode(mode === 0 ? 1 : 0);
                resetForm();
              }}
            >
              {mode === 0 ? t("auth.go_register") : t("auth.go_login")}
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* ERROR DIALOG */}
      {errorMsg && (
        <AlertDialog
          visible={!!errorMsg}
          message={errorMsg}
          type="error"
          onClose={() => setErrorMsg(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 60,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
});
