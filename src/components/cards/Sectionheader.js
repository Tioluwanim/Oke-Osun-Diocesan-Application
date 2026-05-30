import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function SectionHeader({ title, onSeeAll, seeAllLabel = 'See All' }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.link}>{seeAllLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl, marginBottom: SPACING.sm,
  },
  title: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  link: { fontSize: FONTS.sizes.sm, color: COLORS.gold, fontWeight: FONTS.weights.semibold },
});