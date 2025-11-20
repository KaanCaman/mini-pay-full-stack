import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from "react-native";
import { useTheme } from "../../providers/ThemeProvider";

interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  errorMessage?: string | null;
  containerStyle?: StyleProp<ViewStyle>;
  renderRightComponent?: () => React.ReactNode;
}

export default function Input({
  icon,
  errorMessage,
  containerStyle,
  renderRightComponent,
  style,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const activeBorderColor = errorMessage
    ? colors.error
    : focused
    ? colors.accent.primary
    : colors.border;

  return (
    <View style={containerStyle}>
      <View
        style={[
          styles.container,
          {
            borderColor: activeBorderColor,
            backgroundColor: colors.background.secondary,
          },
        ]}
      >
        {icon && <View style={styles.iconWrapper}>{icon}</View>}

        <TextInput
          style={[styles.input, { color: colors.text.primary }, style]}
          placeholderTextColor={colors.text.muted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {/* SAĞ BİLEŞEN */}
        {renderRightComponent && (
          <View style={styles.rightWrapper}>{renderRightComponent()}</View>
        )}
      </View>

      {!!errorMessage && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  iconWrapper: {
    marginRight: 10,
  },
  rightWrapper: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
});
