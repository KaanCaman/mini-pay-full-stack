import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useTheme } from "../../providers/ThemeProvider";

const { width } = Dimensions.get("window");

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastItemProps extends ToastConfig {
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  action,
  onDismiss,
}) => {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Enter animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 150,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(id);
    });
  };

  const getConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "✓",
          color: colors.success,
          backgroundColor: colors.success + "15",
        };
      case "error":
        return {
          icon: "✕",
          color: colors.error,
          backgroundColor: colors.error + "15",
        };
      case "warning":
        return {
          icon: "⚠",
          color: colors.warning,
          backgroundColor: colors.warning + "15",
        };
      case "info":
        return {
          icon: "ℹ",
          color: colors.accent.primary,
          backgroundColor: colors.accent.primary + "15",
        };
    }
  };

  const config = getConfig();
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: colors.card,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {/* Progress Bar */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: config.color,
            width: progressWidth,
          },
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: config.backgroundColor },
          ]}
        >
          <Text style={[styles.icon, { color: config.color }]}>
            {config.icon}
          </Text>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, { color: colors.text.primary }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {message && (
            <Text
              style={[styles.message, { color: colors.text.secondary }]}
              numberOfLines={2}
            >
              {message}
            </Text>
          )}
        </View>

        {/* Action Button or Close */}
        {action ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: config.backgroundColor },
            ]}
            onPress={() => {
              action.onPress();
              dismiss();
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, { color: config.color }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={dismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.closeIcon, { color: colors.text.muted }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

interface ToastProps {
  toasts: ToastConfig[];
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <View
          key={toast.id}
          style={[
            styles.toastWrapper,
            { top: Platform.OS === "ios" ? 60 + index * 10 : 20 + index * 10 },
          ]}
        >
          <ToastItem {...toast} onDismiss={onDismiss} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
  },
  toastWrapper: {
    position: "absolute",
    width: width - 32,
    maxWidth: 500,
  },
  toastContainer: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: 3,
    position: "absolute",
    top: 0,
    left: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 19,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
    fontWeight: "700",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  message: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Toast;
