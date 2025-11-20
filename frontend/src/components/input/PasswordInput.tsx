import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Input from "./Input";
import { useTheme } from "../../providers/ThemeProvider";
import { EyeIcon, EyeSlashIcon } from "phosphor-react-native";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  errorMessage?: string | null;
  icon?: React.ReactNode;
  editable?: boolean;
}

export default function PasswordInput({
  value,
  onChangeText,
  placeholder,
  errorMessage,
  icon,
  editable,
}: PasswordInputProps) {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);

  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={!show}
      icon={icon}
      errorMessage={errorMessage}
      editable={editable}
      // custom right element (eye icon)
      // özel sağ ikon alanı
      style={{ paddingRight: 40 }} // right icon için boşluk
      renderRightComponent={() => (
        <TouchableOpacity
          onPress={() => setShow((prev) => !prev)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {show ? (
            <EyeSlashIcon size={20} color={colors.text.muted} />
          ) : (
            <EyeIcon size={20} color={colors.text.muted} />
          )}
        </TouchableOpacity>
      )}
    />
  );
}
