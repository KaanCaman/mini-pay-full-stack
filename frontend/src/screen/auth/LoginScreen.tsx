import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";

import { useTranslation } from "react-i18next";
import { EnvelopeSimpleIcon, LockSimpleIcon } from "phosphor-react-native";
import { useStores } from "../../stores";
import { useTheme } from "../../theme/ThemeProvider";
import AuthHeader from "../../components/auth/AuthHeader";
import Input from "../../components/input/Input";
import PasswordInput from "../../components/input/PasswordInput";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import AlertDialog from "../../components/dialog/AlertDialog";
import { AuthStackParamList } from "../../navigation/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { authStore } = useStores();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const [errorVisible, setErrorVisible] = useState(false);

  const onLoginPress = () => {
    if (!email || !password) {
      setErrorVisible(true);
      return;
    }

    authStore.login(email, password).catch(() => {
      setErrorVisible(true);
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 28,
          paddingTop: 40,
          paddingBottom: 60,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader />

        <Text style={{ color: colors.text.secondary, marginBottom: 6 }}>
          {t("auth.email")}
        </Text>

        <Input
          icon={<EnvelopeSimpleIcon size={20} color={colors.text.muted} />}
          placeholder={t("auth.email_placeholder")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text
          style={{
            color: colors.text.secondary,
            marginBottom: 6,
            marginTop: 12,
          }}
        >
          {t("auth.password")}
        </Text>

        <PasswordInput
          icon={<LockSimpleIcon size={20} color={colors.text.muted} />}
          placeholder={t("auth.password_placeholder")}
          value={password}
          onChangeText={setPassword}
          show={show}
          setShow={setShow}
        />

        <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
          <Text style={{ color: colors.accent.primary, fontWeight: "500" }}>
            {t("auth.forgot_password")}
          </Text>
        </View>

        <PrimaryButton
          title={t("auth.login")}
          onPress={onLoginPress}
          loading={authStore.loading}
        />

        {/* Register geçişi */}
        <View style={{ alignItems: "center", marginTop: 24 }}>
          <Text style={{ color: colors.text.secondary }}>
            {t("auth.no_account")}{" "}
            <Text
              onPress={() => navigation.replace("Register")}
              style={{ color: colors.accent.primary, fontWeight: "700" }}
            >
              {t("auth.go_register")}
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* Alert Dialog */}
      <AlertDialog
        visible={errorVisible}
        message={t("auth.login_error")}
        onClose={() => setErrorVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
