import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../constants/theme';
import { PAYMENT_TYPES } from '../../../utils/paymentTypes';

export default function PaymentTypeGrid({ selected, onSelect }) {
  return (
    <View style={styles.grid}>
      {PAYMENT_TYPES.map(t => {
        const active = selected === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.card,
              active && { borderColor: t.color, backgroundColor: `${t.color}16` },
            ]}
            onPress={() => onSelect(t.key)}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
          >
            <Text style={styles.icon}>{t.icon}</Text>
            <Text style={[styles.label, active && { color: t.color }]}>{t.label}</Text>
            {active && <View style={[styles.dot, { backgroundColor: t.color }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  card: {
    flexBasis: '22%', flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, paddingVertical: SPACING.md,
    alignItems: 'center', gap: 5, position: 'relative',
  },
  icon: { fontSize: 22 },
  label: {
    fontSize: 10, fontWeight: FONTS.weights.bold,
    color: COLORS.textMuted, textAlign: 'center',
  },
  dot: {
    position: 'absolute', top: 6, right: 6,
    width: 7, height: 7, borderRadius: 4,
  },
});