import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

interface Props {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function SlidingTab({ options, selectedIndex, onSelect }: Props) {
  const { colors } = useTheme();

  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const tabWidth = useRef(0);

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: selectedIndex * tabWidth.current,
      useNativeDriver: true,
      damping: 14,
      stiffness: 160,
    }).start();
  }, [selectedIndex]);

  const onLayout = (e: LayoutChangeEvent) => {
    const totalWidth = e.nativeEvent.layout.width;
    tabWidth.current = totalWidth / options.length;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background.secondary },
      ]}
      onLayout={onLayout}
    >
      {/* Slide Indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth.current,
            backgroundColor: colors.accent.primary,
            transform: [{ translateX: indicatorAnim }],
          },
        ]}
      />

      {/* Buttons */}
      {options.map((opt, i) => (
        <TouchableOpacity
          key={i}
          style={styles.tabButton}
          activeOpacity={0.7}
          onPress={() => onSelect(i)}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  selectedIndex === i
                    ? colors.text.primary
                    : colors.text.secondary,
                fontWeight: selectedIndex === i ? "700" : "500",
              },
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    overflow: "hidden",
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: 14,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 15,
  },
});
