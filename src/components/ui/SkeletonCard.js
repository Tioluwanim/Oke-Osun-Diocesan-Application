import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function SkeletonCard({ height = 120, lines = 3, style }) {
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View style={[styles.card, { height, opacity: pulse }, style]}>
      <View style={styles.topBar} />
      <View style={styles.body}>
        {Array.from({ length: lines }).map((_, index) => (
          <View
            key={`line-${index}`}
            style={[
              styles.line,
              index === lines - 2 && styles.lineShort,
              index === lines - 1 && styles.lineTiny,
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  topBar: { height: 3, backgroundColor: COLORS.border },
  body: { padding: SPACING.md, gap: SPACING.sm },
  line: { height: 12, borderRadius: 6, backgroundColor: COLORS.surface2 },
  lineShort: { width: '70%' },
  lineTiny: { width: '40%' },
});
