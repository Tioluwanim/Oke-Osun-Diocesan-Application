import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

/**
 * FeatureCard – accent-bar card used on HomeScreen for next event / sermon.
 */
export default function FeatureCard({ tag, tagColor = COLORS.gold, title, meta, description, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.accent, { backgroundColor: tagColor }]} />
      <View style={styles.body}>
        <Text style={[styles.tag, { color: tagColor }]}>{tag}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.meta} numberOfLines={1}>{meta}</Text>
        {!!description && <Text style={styles.desc} numberOfLines={1}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 18,
  },
  accent: { width: 5, backgroundColor: COLORS.gold },
  body: { flex: 1, padding: SPACING.md, gap: 5 },
  tag: {
    fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.black,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  title: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: FONTS.weights.bold, lineHeight: 22 },
  meta: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  desc: { fontSize: FONTS.sizes.sm, color: COLORS.textLight },
});