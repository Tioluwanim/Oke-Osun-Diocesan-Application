import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import AppIcon from './AppIcon';

export default function EmptyState({ icon = 'resources', title, description, text, subText, actionLabel, onAction, onReset }) {
  const resolvedTitle = title || text;
  const resolvedDescription = description || subText;
  const resolvedAction = actionLabel || (onReset ? 'Reset Filters' : null);
  const resolvedHandler = onAction || onReset;

  return (
    <View style={styles.container}>
      <View style={styles.illustration} accessible accessibilityLabel="Empty state illustration">
        <View style={styles.illustrationRing} />
        <AppIcon name={icon} size={34} color={COLORS.gold} />
      </View>
      <Text style={styles.title}>{resolvedTitle}</Text>
      {resolvedDescription ? <Text style={styles.desc}>{resolvedDescription}</Text> : null}
      {resolvedAction && resolvedHandler ? (
        <TouchableOpacity
          style={styles.button}
          onPress={resolvedHandler}
          accessibilityRole="button"
          accessibilityLabel={resolvedAction}
        >
          <Text style={styles.buttonText}>{resolvedAction}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingBottom: SPACING.lg,
    marginHorizontal: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 7,
  },
  illustration: {
    width: 78,
    height: 58,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  illustrationRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(76,201,168,0.16)',
    top: 18,
    right: -34,
  },
  title: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text, textAlign: 'center' },
  desc: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  button: { marginTop: SPACING.sm, backgroundColor: COLORS.gold, borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  buttonText: { color: COLORS.background, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm },
});
