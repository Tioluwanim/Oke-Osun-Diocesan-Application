import React from 'react';
import {
  View, Text, TouchableOpacity, Modal, ActivityIndicator, StyleSheet,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../constants/theme';
import { formatNaira } from '../../../utils/format';
import { PAYMENT_TYPE_MAP } from '../../../utils/paymentTypes';

export default function ConfirmSheet({ visible, onClose, onConfirm, loading, data, user }) {
  const typeObj = PAYMENT_TYPE_MAP[data?.type] || {};
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Confirm Giving</Text>
          <Text style={styles.subtitle}>Review your offering before proceeding to payment.</Text>

          {[
            ['Type',        `${typeObj.icon || ''} ${typeObj.label || data?.type || ''}`],
            ['Amount',      formatNaira(data?.amount), true],
            ['Giver',       data?.anonymous ? 'Anonymous' : user?.fullName || '—'],
            ...(data?.description ? [['Description', data.description]] : []),
            ['Payment via', 'Paystack (Card / Bank Transfer / USSD)'],
          ].map(([label, value, highlight]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={[styles.rowValue, highlight && styles.rowValueHL]} numberOfLines={2}>
                {value}
              </Text>
            </View>
          ))}

          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              🔒 You'll be taken to a secure Paystack checkout. Money goes directly to the Diocese of Oke-Osun.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, loading && styles.btnDisabled]}
            onPress={onConfirm}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={COLORS.background} />
              : <Text style={styles.confirmBtnText}>Proceed to Payment →</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: SPACING.xl, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.lg },
  title: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.goldLight, marginBottom: 4 },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  rowLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, flex: 1 },
  rowValue: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: FONTS.weights.semibold, flex: 2, textAlign: 'right' },
  rowValueHL: { fontSize: FONTS.sizes.xl, color: COLORS.goldLight, fontWeight: FONTS.weights.black },
  notice: {
    backgroundColor: 'rgba(201,168,76,0.07)', borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: SPACING.md, marginVertical: SPACING.lg,
  },
  noticeText: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, lineHeight: 18 },
  confirmBtn: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.xl,
    height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm,
  },
  btnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, letterSpacing: 0.5 },
  cancelBtn: { height: 46, justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
});