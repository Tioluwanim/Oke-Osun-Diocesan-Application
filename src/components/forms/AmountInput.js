import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { formatNaira } from '../../utils/format';
import { MIN_AMOUNT, QUICK_AMOUNTS } from '../../utils/paymentTypes';

export default function AmountInput({ value, onChange }) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const amount = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const belowMin = amount > 0 && amount < MIN_AMOUNT;

  return (
    <View>
      <Animated.View
        style={[styles.inputRow, belowMin && styles.inputRowError, { transform: [{ translateX: shakeAnim }] }]}
      >
        <Text style={styles.currency}>₦</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          maxLength={12}
        />
      </Animated.View>

      {belowMin && <Text style={styles.error}>Minimum amount is ₦{MIN_AMOUNT}</Text>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {QUICK_AMOUNTS.map(a => {
          const active = String(value) === String(a);
          return (
            <TouchableOpacity
              key={a}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(String(a))}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{formatNaira(a)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1.5, borderColor: COLORS.gold,
    borderRadius: RADIUS.xl, paddingHorizontal: SPACING.lg, height: 72,
    marginBottom: SPACING.xs,
  },
  inputRowError: { borderColor: COLORS.red },
  currency: { fontSize: 28, color: COLORS.gold, fontWeight: FONTS.weights.black, marginRight: SPACING.sm },
  input: { flex: 1, fontSize: 34, color: COLORS.text, fontWeight: FONTS.weights.black },
  error: { fontSize: FONTS.sizes.xs, color: COLORS.red, marginBottom: SPACING.sm },
  chips: { gap: SPACING.sm, paddingVertical: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.softGold, borderColor: COLORS.gold },
  chipText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  chipTextActive: { color: COLORS.gold, fontWeight: FONTS.weights.bold },
});