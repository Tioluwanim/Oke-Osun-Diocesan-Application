import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../constants/theme';
import { formatNaira, formatDate } from '../../../utils/format';
import { PAYMENT_TYPE_MAP } from '../../../utils/paymentTypes';

const STATUS_COLOR = {
  success: COLORS.teal,
  failed:  COLORS.red,
  pending: COLORS.gold,
};

export default function GivingHistory({ data, isLoading }) {
  if (isLoading) return <ActivityIndicator color={COLORS.gold} style={{ marginTop: 48 }} />;

  const payments  = data?.payments  || [];
  const breakdown = data?.breakdown || [];

  if (!payments.length) return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🙏</Text>
      <Text style={styles.emptyTitle}>No giving records yet</Text>
      <Text style={styles.emptyDesc}>Your offering history will appear here.</Text>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {breakdown.length > 0 && (
        <View style={styles.summaryRow}>
          {breakdown.slice(0, 3).map(b => {
            const t = PAYMENT_TYPE_MAP[b._id] || { icon: '💛', label: b._id, color: COLORS.gold };
            return (
              <View key={b._id} style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>{t.icon}</Text>
                <Text style={styles.summaryAmt}>{formatNaira(b.total)}</Text>
                <Text style={styles.summaryLabel}>{t.label}</Text>
                <Text style={styles.summaryCount}>{b.count}×</Text>
              </View>
            );
          })}
        </View>
      )}

      {payments.map(p => {
        const t  = PAYMENT_TYPE_MAP[p.type] || { icon: '💛', label: p.type, color: COLORS.gold };
        const sc = STATUS_COLOR[p.status] || COLORS.gold;
        return (
          <View key={p.id} style={styles.row}>
            <View style={[styles.iconBg, { backgroundColor: `${t.color}15` }]}>
              <Text style={styles.rowIcon}>{t.icon}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.type}>{t.label}</Text>
              {!!p.description && <Text style={styles.desc} numberOfLines={1}>{p.description}</Text>}
              <Text style={styles.date}>{formatDate(p.paidAt || p.createdAt)}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.amount}>{formatNaira(p.amount)}</Text>
              <View style={[styles.badge, { backgroundColor: `${sc}15`, borderColor: sc }]}>
                <Text style={[styles.badgeText, { color: sc }]}>{p.status}</Text>
              </View>
            </View>
          </View>
        );
      })}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: SPACING.md },
  summaryRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, padding: SPACING.sm, alignItems: 'center', gap: 2,
  },
  summaryIcon:  { fontSize: 18 },
  summaryAmt:   { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black, color: COLORS.goldLight },
  summaryLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weights.bold },
  summaryCount: { fontSize: 10, color: COLORS.textMuted },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.sm,
  },
  iconBg:  { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  rowIcon: { fontSize: 22 },
  info:    { flex: 1 },
  type:    { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text },
  desc:    { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  date:    { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  right:   { alignItems: 'flex-end', gap: 4 },
  amount:  { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, color: COLORS.goldLight },
  badge:   { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  badgeText: { fontSize: 9, fontWeight: FONTS.weights.black, textTransform: 'uppercase' },
  empty:     { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  emptyIcon:  { fontSize: 52 },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  emptyDesc:  { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
});