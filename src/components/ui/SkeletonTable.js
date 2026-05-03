import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function SkeletonTable({ rows = 5, columns = 3 }) {
  const pulse = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.65, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View style={[styles.table, { opacity: pulse }]}>
      {Array.from({ length: rows }).map((_, r) => (
        <View key={`row-${r}`} style={[styles.row, r < rows - 1 && styles.rowBorder]}>
          {Array.from({ length: columns }).map((__, c) => (
            <View key={`cell-${r}-${c}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  cell: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.surface2,
  },
});
