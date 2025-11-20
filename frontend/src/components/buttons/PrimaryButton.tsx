import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Animated,
} from "react-native";
import { useTheme } from "../../providers/ThemeProvider";

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
}: {
  // button label text
  // buton etiketi metni
  title: string;

  // callback when button is pressed
  // butona basıldığında çağrılan fonksiyon
  onPress: () => void;

  // loading state - disables button and shows spinner
  // yükleme durumu - butonu devre dışı bırakır ve spinner gösterir
  loading?: boolean;
}) {
  const { colors } = useTheme();

  // animated scale value for loading state visual feedback
  // yükleme durumu görsel geri bildirimi için animasyonlu ölçek değeri
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // animate button scale when loading state changes
  // yükleme durumu değiştiğinde buton ölçeğini animasyonla değiştir
  useEffect(() => {
    if (loading) {
      // slightly shrink button when loading starts
      // yükleme başladığında butonu hafifçe küçült
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        damping: 10,
      }).start();
    } else {
      // restore normal size when loading ends
      // yükleme bittiğinde normal boyuta dön
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 10,
      }).start();
    }
  }, [loading, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            // use secondary accent color when loading
            // yükleme sırasında ikincil vurgu rengini kullan
            backgroundColor: loading
              ? colors.accent.secondary
              : colors.accent.primary,
            shadowColor: colors.accent.glow,
            // reduce opacity when loading for visual feedback
            // görsel geri bildirim için yükleme sırasında opaklığı azalt
            opacity: loading ? 0.7 : 1,
          },
        ]}
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          // LOADING STATE - show spinner and processing text
          // YÜKLEME DURUMU - spinner ve işleniyor metni göster
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#000" />
            <Text style={[styles.text, { marginLeft: 10 }]}>İşleniyor...</Text>
          </View>
        ) : (
          // NORMAL STATE - show button title
          // NORMAL DURUM - buton başlığını göster
          <Text style={styles.text}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    // fixed height prevents layout shift when loading
    // sabit yükseklik yükleme sırasında layout kaymasını önler
    minHeight: 50,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
