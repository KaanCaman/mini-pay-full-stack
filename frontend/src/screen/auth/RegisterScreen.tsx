import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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
import ValidationHelper from "../../util/validation_helper";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { authStore } = useStores();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log(authStore.error);
    if (authStore.error) {

      setErrorMessage(authStore.error);
    }
  }, [authStore.error]);

  const onRegisterPress = () => {
    if (!email || !password || !confirmPassword) {
      setErrorMessage(t("auth.register_fill_fields"));
      return;
    }
    if (!ValidationHelper.isValidEmail(email)) {
      setErrorMessage(t("auth.register_invalid_email"));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t("auth.register_password_mismatch"));
      return;
    }

    authStore.register(email, password).then(() => {
      navigation.replace("Login");
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
          show={showPassword}
          setShow={setShowPassword}
        />

        <Text
          style={{
            color: colors.text.secondary,
            marginBottom: 6,
            marginTop: 12,
          }}
        >
          {t("auth.confirm_password")}
        </Text>
        <PasswordInput
          icon={<LockSimpleIcon size={20} color={colors.text.muted} />}
          placeholder={t("auth.confirm_password_placeholder")}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          show={showPassword}
          setShow={setShowPassword}
        />

        <PrimaryButton
          title={t("auth.register")}
          onPress={onRegisterPress}
          loading={authStore.loading}
        />

        <View style={{ alignItems: "center", marginTop: 24 }}>
          <Text style={{ color: colors.text.secondary }}>
            {t("auth.already_have_account")}{" "}
            <Text
              onPress={() => navigation.replace("Login")}
              style={{ color: colors.accent.primary, fontWeight: "700" }}
            >
              {t("auth.go_login")}
            </Text>
          </Text>
        </View>
      </ScrollView>

      {errorMessage && (
        <AlertDialog
          visible={!!errorMessage}
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
