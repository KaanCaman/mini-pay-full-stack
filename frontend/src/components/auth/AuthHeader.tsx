import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useTheme } from "../../providers/ThemeProvider";

interface Props {
  title?: string;
  subtitle?: string;
  showSubtitle?: boolean;
}

export default function AuthHeader({
  title = "Mini Pay",
  subtitle = "",
  showSubtitle = true,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Logo + Text */}
      <View style={styles.row}>
        {/* Logo */}
        <View
          style={[
            styles.logoWrapper,
            { backgroundColor: colors.accent.primary + "22" },
          ]}
        >
          <Image
            source={require("../../../assets/logo/mini-pay-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Brand Text */}
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {title}
          </Text>
          {showSubtitle && (
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  logo: {
    width: 40,
    height: 40,
  },

  textCol: {
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "400",
  },
});
