import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  StyleSheet,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useTheme } from "../../providers/ThemeProvider";
import { useStores } from "../../stores";
import { useTranslation } from "react-i18next";

import AuthHeader from "../../components/auth/AuthHeader";
import Input from "../../components/input/Input";
import PasswordInput from "../../components/input/PasswordInput";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import AlertDialog from "../../components/dialog/AlertDialog";
import SlidingTab from "../../components/auth/SlidingTab";

import { EnvelopeSimpleIcon, LockSimpleIcon } from "phosphor-react-native";
import { useToast } from "../../providers/ToastProvider";
import { ERROR_CODE_MAP } from "../../i18n/error_map";
import ValidationHelper from "../../util/validation_helper";

const AuthScreen = observer(() => {
  const { colors } = useTheme();
  const { authStore } = useStores();
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();

  // selected tab mode: 0 = login, 1 = register
  // seçili tab modu: 0 = giriş, 1 = kayıt
  const [mode, setMode] = useState<0 | 1>(0);

  // form input states
  // form input değerleri
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // error message for alert dialog
  // alert dialog için hata mesajı
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // clear all form inputs
  // tüm form inputlarını temizle
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  // listen to store errors and show toast
  // store hatalarını dinle ve toast göster
  useEffect(() => {
    if (authStore.error) {
      // get translated error message from error code
      // hata kodundan çevrilmiş hata mesajını al
      const key =
        authStore.errorCode && ERROR_CODE_MAP[authStore.errorCode]
          ? ERROR_CODE_MAP[authStore.errorCode]
          : "errors.general";

      const msg = t(key);
      setErrorMsg(msg);

      // show error toast
      // hata toast'unu göster
      // toastError(msg);
    }
  }, [authStore.error, authStore.errorCode, t, toastError]);

  // handle form submission for login and register
  // giriş ve kayıt için form gönderimini yönet
  const handleSubmit = async () => {
    // clear previous errors
    // önceki hataları temizle
    authStore.clearError();
    setErrorMsg(null);

    // validate required fields
    // gerekli alanları doğrula
    if (!email.trim() || !password.trim()) {
      toastError(t("auth.register_fill_fields"));
      return;
    }

    // validate email format
    if (!ValidationHelper.isValidEmail(email.trim())) {
      toastError(t("auth.invalid_email"));
      return;
    }

    if (password.length < 6) {
      toastError(t("auth.password_min_length"));
      return;
    }

    // validate password confirmation for register mode
    // kayıt modu için şifre onayını doğrula
    if (mode === 1 && password !== confirmPassword) {
      toastError(t("auth.register_password_mismatch"));
      return;
    }

    try {
      // LOGIN MODE
      // GİRİŞ MODU
      if (mode === 0) {
        // simulate processing time for better UX
        // daha iyi UX için işlem süresi simüle et
        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 2000)),
          authStore.login(email.toLowerCase().trim(), password),
        ]);
        return;
      }

      // REGISTER MODE
      // KAYIT MODU
      // simulate processing time for better UX
      // daha iyi UX için işlem süresi simüle et
      await authStore.register(email.toLowerCase().trim(), password);

      // show success toast
      // başarı toast'unu göster
      // after successful registration, switch to login tab
      // başarılı kayıt sonrası giriş tab'ına geç
      setTimeout(() => {
        resetForm();
        success(t("auth.register_success"), t("auth.go_login"));
        setMode(0);
      }, 50);
    } catch (err) {
      // error already handled by store and useEffect
      // hata zaten store ve useEffect tarafından yönetildi
      // TODO: remove log before production
      console.log("Form submission error handled by store");
    }
  };

  // close error dialog
  // hata dialogunu kapat
  const handleCloseDialog = () => {
    setErrorMsg(null);
    authStore.clearError();
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
        <AuthHeader
          subtitle={
            mode === 0 ? t("auth.welcome_back") : t("auth.create_account")
          }
        />

        <SlidingTab
          options={[t("auth.login"), t("auth.register")]}
          selectedIndex={mode}
          onSelect={(i) => {
            setMode(i as 0 | 1);
            resetForm();
            setErrorMsg(null);
            authStore.clearError();
          }}
        />

        {/* EMAIL INPUT */}
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
            editable={!authStore.loading}
            icon={<EnvelopeSimpleIcon size={20} color={colors.text.muted} />}
          />
        </View>

        {/* PASSWORD INPUT */}
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
          editable={!authStore.loading}
          icon={<LockSimpleIcon size={20} color={colors.text.muted} />}
        />

        {/* CONFIRM PASSWORD INPUT (only for register) */}
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
              editable={!authStore.loading}
              icon={<LockSimpleIcon size={20} color={colors.text.muted} />}
            />
          </>
        )}

        {/* SUBMIT BUTTON */}
        <PrimaryButton
          title={mode === 0 ? t("auth.login") : t("auth.register")}
          onPress={handleSubmit}
          loading={authStore.loading}
        />

        {/* SWITCH BETWEEN LOGIN AND REGISTER */}
        <View style={{ alignItems: "center", marginTop: 22 }}>
          <Text style={{ color: colors.text.secondary }}>
            {mode === 0 ? t("auth.no_account") : t("auth.already_have_account")}{" "}
            <Text
              style={{
                color: colors.accent.primary,
                fontWeight: "700",
              }}
              onPress={() => {
                if (!authStore.loading) {
                  setMode(mode === 0 ? 1 : 0);
                  resetForm();
                  authStore.clearError();
                  setErrorMsg(null);
                }
              }}
            >
              {mode === 0 ? t("auth.go_register") : t("auth.go_login")}
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* ERROR ALERT DIALOG */}
      {errorMsg && (
        <AlertDialog
          visible={!!errorMsg}
          message={errorMsg}
          type="error"
          onClose={handleCloseDialog}
        />
      )}
    </KeyboardAvoidingView>
  );
});

// display name for React DevTools
// React DevTools için görünen isim
AuthScreen.displayName = "AuthScreen";

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
export default AuthScreen;
