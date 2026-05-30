/**
 * PaymentDashboardScreen  (Admin)
 * ──────────────────────────────
 * Real-time offering dashboard. Auto-refreshes every 60 s.
 * Uses ScreenHeader, shared formatNaira/formatDateTime.
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { paymentApi } from '../../utils/paymentApi';
import { PAYMENT_TYPE_MAP } from '../../utils/paymentTypes';
import { formatNaira, formatDateTime } from '../../utils/format';
import ScreenHeader from '../../components/layout/ScreenHeader';

const TYPE_FILTERS   = ['All', 'tithe', 'offering', 'first_fruit', 'seed', 'building_fund', 'welfare', 'gift', 'other'];
const STATUS_FILTERS = ['All', 'success', 'pending', 'failed'];
const STATUS_COLOR   = { success: COLORS.teal, pending: COLORS.gold, failed: COLORS.red };

export default function PaymentDashboardScreen() {
  const { token } = useAuth();
  const [typeFilter,   setTypeFilter]   = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const params = {};
  if (typeFilter   !== 'All') params.type   = typeFilter;
  if (statusFilter !== 'All') params.status = statusFilter;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['payments', 'admin', typeFilter, statusFilter],
    queryFn:  () => paymentApi.adminAll(token, params),
    enabled:  !!token,
    staleTime: 30_000,
    refetchInterval: 60_000,   // church sees money in real time
  });

  const summary  = data?.summary  || {};
  const byType   = data?.by_type  || [];
  const payments = data?.payments || [];

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Offerings"
        subtitle="Financial Dashboard"
        rightIcon={isFetching ? 'notification' : 'refresh'}
        onRightPress={refetch}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch}
            tintColor={COLORS.gold} colors={[COLORS.gold]} />
        }
      >
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Confirmed</Text>
            <Text style={styles.summaryAmount}>{formatNaira(summary.totalAmount)}</Text>
            <Text style={styles.summaryCount}>{summary.totalCount || 0} transactions</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Showing</Text>
            <Text style={styles.summaryAmount}>{payments.filter(p => p.status === 'success').length}</Text>
            <Text style={styles.summaryCount}>confirmed</Text>
          </View>
        </View>

        {/* Breakdown by type */}
        {byType.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>BY TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breakdownRow}>
              {byType.map(b => {
                const t = PAYMENT_TYPE_MAP[b.type] || { icon: '💛', label: b.type, color: COLORS.gold };
                return (
                  <View key={b.type} style={styles.breakdownCard}>
                    <Text style={styles.bIcon}>{t.icon}</Text>
                    <Text style={[styles.bAmt, { color: t.color }]}>{formatNaira(b.amount)}</Text>
                    <Text style={styles.bLabel}>{t.label}</Text>
                    <Text style={styles.bCount}>{b.count}×</Text>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Type filter */}
        <Text style={styles.sectionLabel}>FILTER BY TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {TYPE_FILTERS.map(f => {
            const active = typeFilter === f;
            const t = f !== 'All' ? PAYMENT_TYPE_MAP[f] : null;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setTypeFilter(f)}
              >
                {t && <Text style={styles.chipIcon}>{t.icon}</Text>}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {t ? t.label : 'All'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Status filter */}
        <View style={styles.statusRow}>
          {STATUS_FILTERS.map(s => {
            const active = statusFilter === s;
            const c = STATUS_COLOR[s] || COLORS.textMuted;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.statusChip, active && { borderColor: c, backgroundColor: `${c}15` }]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[styles.statusChipText, active && { color: c }]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transactions */}
        <Text style={styles.sectionLabel}>TRANSACTIONS ({payments.length})</Text>

        {isLoading
          ? <ActivityIndicator color={COLORS.gold} size="large" style={{ marginTop: 40 }} />
          : payments.length === 0
          ? <View style={styles.empty}><Text style={styles.emptyIcon}>💳</Text><Text style={styles.emptyText}>No transactions found</Text></View>
          : payments.map(p => {
              const t  = PAYMENT_TYPE_MAP[p.type] || { icon: '💛', label: p.type, color: COLORS.gold };
              const sc = STATUS_COLOR[p.status] || COLORS.gold;
              return (
                <View key={p.id} style={styles.txCard}>
                  <View style={[styles.txAccent, { backgroundColor: t.color }]} />
                  <View style={styles.txBody}>
                    <View style={styles.txTop}>
                      <View style={styles.txLeft}>
                        <Text style={styles.txIcon}>{t.icon}</Text>
                        <View>
                          <Text style={styles.txName}>{p.userName || 'Unknown'}</Text>
                          <Text style={styles.txParish}>{p.parish || 'No parish'}</Text>
                        </View>
                      </View>
                      <View style={styles.txRight}>
                        <Text style={[styles.txAmt, p.status === 'success' && { color: COLORS.goldLight }]}>
                          {formatNaira(p.amount)}
                        </Text>
                        <View style={[styles.txBadge, { backgroundColor: `${sc}15`, borderColor: sc }]}>
                          <Text style={[styles.txBadgeText, { color: sc }]}>{p.status}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.txMeta}>
                      <Text style={styles.txType}>{t.label}</Text>
                      {!!p.description && <Text style={styles.txDesc} numberOfLines={1}> · {p.description}</Text>}
                    </View>
                    <View style={styles.txFooter}>
                      <Text style={styles.txDate}>{formatDateTime(p.paidAt || p.createdAt)}</Text>
                      {!!p.channel && <Text style={styles.txChannel}>via {p.channel}</Text>}
                      <Text style={styles.txRef} numberOfLines={1}>{p.reference}</Text>
                    </View>
                  </View>
                </View>
              );
            })
        }
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  sectionLabel: {
    fontSize: 10, color: COLORS.gold, fontWeight: FONTS.weights.black,
    letterSpacing: 1.5, marginBottom: SPACING.sm, marginTop: SPACING.md,
  },
  summaryRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, padding: SPACING.md,
  },
  summaryLabel:  { fontSize: 10, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  summaryAmount: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.goldLight },
  summaryCount:  { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  breakdownRow: { gap: SPACING.sm, paddingBottom: SPACING.sm },
  breakdownCard: {
    width: 96, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: 'center', gap: 2,
  },
  bIcon:  { fontSize: 20 },
  bAmt:   { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black },
  bLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weights.bold, textAlign: 'center' },
  bCount: { fontSize: 10, color: COLORS.textMuted },
  filterRow: { gap: SPACING.sm, paddingBottom: SPACING.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: 8,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  chipIcon: { fontSize: 12 },
  chipText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  chipTextActive: { color: COLORS.background, fontWeight: FONTS.weights.bold },
  statusRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', marginBottom: SPACING.sm },
  statusChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 7,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  statusChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  txCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: RADIUS.xl, marginBottom: SPACING.sm, overflow: 'hidden',
  },
  txAccent: { width: 4 },
  txBody:   { flex: 1, padding: SPACING.md, gap: SPACING.xs },
  txTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  txLeft:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  txIcon:   { fontSize: 20 },
  txName:   { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text },
  txParish: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  txRight:  { alignItems: 'flex-end', gap: 4 },
  txAmt:    { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.text },
  txBadge:  { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  txBadgeText: { fontSize: 9, fontWeight: FONTS.weights.black, textTransform: 'uppercase' },
  txMeta:   { flexDirection: 'row', alignItems: 'center' },
  txType:   { fontSize: FONTS.sizes.xs, color: COLORS.gold, fontWeight: FONTS.weights.bold },
  txDesc:   { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, flex: 1 },
  txFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  txDate:   { fontSize: 10, color: COLORS.textMuted },
  txChannel: { fontSize: 10, color: COLORS.teal },
  txRef:    { fontSize: 9, color: COLORS.textMuted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', flex: 1 },
  empty:    { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  emptyIcon: { fontSize: 52 },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textMuted },
});