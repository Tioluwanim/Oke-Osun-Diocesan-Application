import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Spinner from './Spinner';
import SkeletonList from './SkeletonList';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function PageLoader({ text = 'Loading...', skeleton = false }) {
  return (
    <View style={styles.container}>
      {skeleton ? (
        <View style={styles.skeletonWrap}>
          <SkeletonList count={3} itemHeight={96} />
        </View>
      ) : (
        <>
          <Spinner size="large" color={COLORS.gold} />
          <Text style={styles.text}>{text}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.md,
  },
  skeletonWrap: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  text: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
});
