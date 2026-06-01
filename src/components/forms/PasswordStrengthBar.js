import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

/**
 * PasswordStrengthBar
 * Shows a 4-segment strength indicator for a password input.
 * Used in RegisterScreen and ForgotPasswordScreen.
 *
 * Props:
 *   password (string) — the current password value
 */
export function getPasswordStrength(password) {
  if (!password) return 0;
  let s = 0;
  if (password.length >= 8)                s++;
  if (/[A-Z]/.test(password))             s++;
  if (/[0-9]/.test(password))             s++;
  if (/[^A-Za-z0-9]/.test(password))      s++;
  return s;
}

const STRENGTH_COLORS = ['transparent', COLORS.red, COLORS.gold, COLORS.gold, COLORS.teal];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export default function PasswordStrengthBar({ password }) {
  if (!password) return null;
  const strength = getPasswordStrength(password);
  const color    = STRENGTH_COLORS[strength];
  const label    = STRENGTH_LABELS[strength];

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[
              styles.seg,
              { backgroundColor: i <= strength ? color : COLORS.border },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 6, marginBottom: 4 },
  track: { flexDirection: 'row', flex: 1, gap: 5 },
  seg:   { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, minWidth: 36, textAlign: 'right' },
});