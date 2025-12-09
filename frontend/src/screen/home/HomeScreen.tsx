import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useTheme } from "../../providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { rootStore } from "../../stores/RootStore";

// Icons
import {
  BellSimpleIcon,
  GearIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  WalletIcon,
  ArrowsLeftRightIcon,
} from "phosphor-react-native";

import { QuickAction } from "../../components/buttons/QuickAction";
import { TransactionItem } from "../../components/utils/TransactionItem";

// --- MAIN SCREEN ---
const HomeScreen = observer(() => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { walletStore, authStore } = rootStore;

  // Local state for UI toggles
  // UI geçişleri için yerel durum
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    walletStore.refreshAll();
  }, []);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await walletStore.refreshAll();
    setRefreshing(false);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoPlaceholder}>
            <WalletIcon size={24} color={colors.accent.primary} weight="fill" />
          </View>
          <View>
            <Text style={[styles.greeting, { color: colors.text.secondary }]}>
              {t("home.hello")},
            </Text>
            <Text style={[styles.username, { color: colors.text.primary }]}>
              {/* Could fetch user name if available in AuthStore or Me Endpoint */}
              User {authStore.userId}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <BellSimpleIcon size={24} color={colors.text.primary} />
            {/* Notification Dot */}
            <View style={[styles.dot, { backgroundColor: colors.error }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("ProfileTab")}
          >
            <GearIcon size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
          />
        }
      >
        {/* BALANCE CARD */}
        <View style={[styles.balanceCard, { backgroundColor: colors.card }]}>
          {/* Top Row: Label & Eye Icon */}
          <View style={styles.balanceHeader}>
            <Text
              style={[styles.balanceLabel, { color: colors.text.secondary }]}
            >
              {t("home.balance")}
            </Text>
            <TouchableOpacity
              onPress={() => setBalanceVisible(!balanceVisible)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {balanceVisible ? (
                <EyeSlashIcon size={20} color={colors.text.muted} />
              ) : (
                <EyeIcon size={20} color={colors.text.muted} />
              )}
            </TouchableOpacity>
          </View>

          {/* Amount Display */}
          <Text style={[styles.balanceAmount, { color: colors.text.primary }]}>
            {balanceVisible ? `$${walletStore.formattedBalance}` : "••••••"}
          </Text>

          {/* Action Buttons Row */}
          <View style={styles.actionsRow}>
            <QuickAction
              variant="primary"
              label={t("actions.pay", "Yükle")}
              icon={<ArrowUpIcon size={22} color="#000" weight="bold" />}
              onPress={() => navigation.navigate("PaymentTab")}
            />
            <QuickAction
              label={t("actions.withdraw", "Çek")}
              icon={
                <ArrowDownIcon
                  size={22}
                  color={colors.text.primary}
                  weight="bold"
                />
              }
              onPress={() => {}}
            />
            <QuickAction
              label={t("actions.transfer", "Transfer")}
              icon={
                <ArrowsLeftRightIcon
                  size={22}
                  color={colors.text.primary}
                  weight="regular"
                />
              }
              onPress={() => navigation.navigate("PaymentTab")}
            />
          </View>
        </View>

        {/* TRANSACTIONS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t("home.recentTransactions")}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("HistoryTab")}>
            <Text style={{ color: colors.accent.primary, fontWeight: "600" }}>
              {t("home.seeAll")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.txList}>
          {walletStore.transactions.length === 0 ? (
            <Text
              style={{
                color: colors.text.muted,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              {t("history.noTransactions", "No transactions yet")}
            </Text>
          ) : (
            walletStore.transactions
              .slice(0, 5)
              .map((tx) => <TransactionItem key={tx.id} item={tx} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 40 : 60, // Adjust for status bar
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0, 230, 118, 0.1)", // Light green tint
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "400",
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  iconBtn: {
    position: "relative",
    padding: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    top: 4,
    right: 4,
    borderWidth: 1,
    borderColor: "#0D1B12", // Match background
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  // Balance Card Styles
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  // Quick Action Styles
  actionBtnContainer: {
    flex: 1, // Distribute equal width
    alignItems: "center",
    gap: 8,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28, // Circle
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 13,
  },
  // Section Header Styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  // Transaction Item Styles
  txList: {
    gap: 16,
  },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  txIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  txInfo: {
    flex: 1,
    justifyContent: "center",
  },
  txTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  txDate: {
    fontSize: 12,
    fontWeight: "400",
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
});

export default HomeScreen;
