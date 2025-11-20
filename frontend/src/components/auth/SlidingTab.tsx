import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { useTheme } from "../../providers/ThemeProvider";

interface Props {
  // array of tab option labels
  // tab seçenek etiketleri dizisi
  options: string[];

  // currently selected tab index
  // şu an seçili tab indeksi
  selectedIndex: number;

  // callback when tab is selected
  // tab seçildiğinde çağrılan fonksiyon
  onSelect: (index: number) => void;
}

export default function SlidingTab({
  options,
  selectedIndex,
  onSelect,
}: Props) {
  const { colors } = useTheme();

  // animated value for sliding indicator position
  // kayan gösterge pozisyonu için animasyon değeri
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  // width of each individual tab (calculated from layout)
  // her bir tab'ın genişliği (layout'tan hesaplanır)
  const [tabWidth, setTabWidth] = useState(0);

  // flag to ensure indicator renders only after layout calculation
  // göstergenin sadece layout hesaplamasından sonra render edilmesini sağlayan bayrak
  const [layoutReady, setLayoutReady] = useState(false);

  // animate indicator when selected tab changes
  // seçili tab değiştiğinde göstergeyi animasyonla kaydır
  useEffect(() => {
    // only animate if tab width has been calculated
    // sadece tab genişliği hesaplandıysa animasyon yap
    if (tabWidth > 0) {
      Animated.spring(indicatorAnim, {
        toValue: selectedIndex * tabWidth,
        useNativeDriver: true,
        damping: 14,
        stiffness: 160,
      }).start();
    }
  }, [selectedIndex, tabWidth, indicatorAnim]);

  // calculate tab width when component layout is measured
  // component layout'u ölçüldüğünde tab genişliğini hesapla
  const onLayout = (e: LayoutChangeEvent) => {
    const totalWidth = e.nativeEvent.layout.width;
    const calculatedWidth = totalWidth / options.length;

    // update tab width state to trigger re-render
    // re-render tetiklemek için tab genişliği state'ini güncelle
    setTabWidth(calculatedWidth);
    setLayoutReady(true);

    // set initial position without animation
    // animasyon olmadan başlangıç pozisyonunu ayarla
    indicatorAnim.setValue(selectedIndex * calculatedWidth);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background.secondary },
      ]}
      onLayout={onLayout}
    >
      {/* SLIDING INDICATOR - only render after layout is ready */}
      {/* KAYAN GÖSTERGESİ - sadece layout hazır olduğunda render et */}
      {layoutReady && (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: tabWidth,
              backgroundColor: colors.accent.primary,
              transform: [{ translateX: indicatorAnim }],
            },
          ]}
        />
      )}

      {/* TAB BUTTONS */}
      {/* TAB BUTONLARI */}
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
                // selected tab has primary color and bold weight
                // seçili tab birincil renk ve kalın yazı tipi kullanır
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
    // indicator behind text for proper layering
    // doğru katmanlama için gösterge text'in arkasında
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // text above indicator for proper layering
    // doğru katmanlama için text göstergenin üstünde
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
  },
});
