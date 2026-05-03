import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon || ''}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 60, paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  icon: { fontSize: 48 },
  title: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  desc: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center' },
  button: { marginTop: SPACING.sm, backgroundColor: COLORS.gold, borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  buttonText: { color: COLORS.background, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm },
});
