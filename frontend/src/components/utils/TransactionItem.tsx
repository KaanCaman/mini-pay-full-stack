import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { observer } from "mobx-react-lite";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  PaperPlaneTiltIcon,
  ArrowsLeftRightIcon,
} from "phosphor-react-native";

interface TransactionItemProps {
  item: any;
}

export const TransactionItem = observer(({ item }: TransactionItemProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Helper to determine Icon and Title based on type
  const getTxDetails = () => {
    // Convert cents to unit
    const amountVal = item.amount / 100;

    switch (item.type) {
      case "deposit":
        return {
          title: t("transaction.deposit", "Para Yükleme"),
          icon: <ArrowUpIcon size={20} color={colors.success} weight="bold" />,
          amount: amountVal,
          isPositive: true,
        };
      case "withdraw":
        return {
          title: t("transaction.withdraw", "Para Çekme"),
          icon: <ArrowDownIcon size={20} color={colors.error} weight="bold" />,
          amount: -amountVal, // Visual negative
          isPositive: false,
        };
      case "transfer_sent":
        return {
          title: t("transaction.sent", "Para Gönderimi"),
          icon: (
            <PaperPlaneTiltIcon size={20} color={colors.error} weight="fill" />
          ),
          amount: -amountVal,
          isPositive: false,
        };
      case "transfer_received":
        return {
          title: t("transaction.received", "Para Transferi"),
          icon: (
            <ArrowDownIcon size={20} color={colors.success} weight="bold" />
          ),
          amount: amountVal,
          isPositive: true,
        };
      default:
        return {
          title: "İşlem",
          icon: (
            <ArrowsLeftRightIcon
              size={20}
              color={colors.text.muted}
              weight="regular"
            />
          ),
          amount: amountVal,
          isPositive: true,
        };
    }
  };

  const { title, icon, amount, isPositive } = getTxDetails();

  // Format Date
  const dateStr = format(new Date(item.createdAt), "d MMMM yyyy, HH:mm", {
    locale: tr,
  });

  return (
    <View style={[styles.txItem, { borderBottomColor: colors.border + "44" }]}>
      {/* Icon Circle */}
      <View
        style={[
          styles.txIconCircle,
          { backgroundColor: colors.background.tertiary },
        ]}
      >
        {icon}
      </View>

      {/* Info */}
      <View style={styles.txInfo}>
        <Text style={[styles.txTitle, { color: colors.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.txDate, { color: colors.text.muted }]}>
          {dateStr}
        </Text>
      </View>

      {/* Amount */}
      <Text
        style={[
          styles.txAmount,
          { color: isPositive ? colors.success : colors.error },
        ]}
      >
        {isPositive ? "+" : ""}${Math.abs(amount).toFixed(2)}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
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
