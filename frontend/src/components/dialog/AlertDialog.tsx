import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { BlurView } from "@react-native-community/blur";
import { useTheme } from "../../providers/ThemeProvider";

interface Props {
  visible: boolean;
  title?: string;
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
}

export default function AlertDialog({
  visible,
  title,
  message,
  type = "info",
  onClose,
}: Props) {
  const { colors } = useTheme();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 14,
          stiffness: 180,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  // icon + color mapping
  const icon = type === "error" ? "✕" : type === "success" ? "✓" : "ℹ";
  const iconColor =
    type === "error"
      ? colors.error
      : type === "success"
      ? colors.success
      : colors.accent.primary;

  return (
    <View style={styles.overlay}>
      {/* BACKDROP */}
      {Platform.OS === "ios" ? (
        <BlurView
          blurType="dark"
          blurAmount={14}
          style={styles.backdrop}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
        />
      ) : (
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: "rgba(0,0,0,0.55)", opacity: opacityAnim },
          ]}
        />
      )}

      {/* DIALOG */}
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.background.secondary,
            transform: [{ scale: scaleAnim }],
            borderColor:
              type === "error"
                ? colors.error
                : type === "success"
                ? colors.success
                : colors.accent.primary,
          },
        ]}
      >
        {/* Icon */}
        <View
          style={[styles.iconCircle, { backgroundColor: iconColor + "22" }]}
        >
          <Text style={[styles.iconText, { color: iconColor }]}>{icon}</Text>
        </View>

        {/* Title */}
        {title && (
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {title}
          </Text>
        )}

        {/* Message */}
        <Text style={[styles.message, { color: colors.text.secondary }]}>
          {message}
        </Text>

        {/* Button */}
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          style={[styles.button, { backgroundColor: colors.accent.primary }]}
        >
          <Text style={styles.buttonText}>Tamam</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  container: {
    width: "82%",
    maxWidth: 360,
    padding: 26,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
  },

  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 30,
    fontWeight: "700",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },

  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 22,
  },

  button: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
