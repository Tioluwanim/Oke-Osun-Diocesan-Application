import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../constants/theme';

const CONFIG = {
  success: { icon: '✅', title: 'Payment Received!', color: COLORS.teal, btn: 'View History' },
  failed:  { icon: '❌', title: 'Payment Failed',    color: COLORS.red,  btn: 'Close' },
  pending: { icon: '⏳', title: 'Awaiting Confirmation', color: COLORS.gold, btn: 'Close' },
};

export default function ResultModal({ visible, status, reference, onClose }) {
  const cfg = CONFIG[status] || CONFIG.pending;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>{cfg.icon}</Text>
          <Text style={[styles.title, { color: cfg.color }]}>{cfg.title}</Text>
          <Text style={styles.msg}>
            {status === 'success'
              ? 'Your offering has been received. The church can see it now. God bless your giving.'
              : status === 'failed'
              ? 'Your payment did not go through. Please try again.'
              : 'Your payment is being confirmed. Check your history in a moment.'}
          </Text>
          {reference && <Text style={styles.ref}>Ref: {reference}</Text>}
          <TouchableOpacity style={[styles.btn, { backgroundColor: cfg.color }]} onPress={onClose}>
            <Text style={styles.btnText}>{cfg.btn}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', padding: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xxl,
    padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, width: '100%',
    borderWidth: 1, borderColor: COLORS.border,
  },
  icon: { fontSize: 56 },
  title: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black },
  msg: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  ref: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 4 },
  btn: {
    borderRadius: RADIUS.xl, paddingHorizontal: SPACING.xl,
    height: 52, justifyContent: 'center', alignItems: 'center',
    marginTop: SPACING.sm, width: '100%',
  },
  btnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black },
});