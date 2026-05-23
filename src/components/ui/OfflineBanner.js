import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import AppIcon from './AppIcon';

export default function OfflineBanner() {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <AppIcon name="alert" size={16} color={COLORS.background} />
      <Text style={styles.text}>Offline. Showing saved content where available.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: 92,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.gold,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  text: {
    color: COLORS.background,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
});
