import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Spinner from './Spinner';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function LoadingButton({
  title,
  loading,
  onPress,
  style,
  textStyle,
  disabled,
  spinnerColor = COLORS.background,
  loadingText,
  rightIcon,
  ...props
}) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      activeOpacity={0.85}
      {...props}
    >
      <View style={styles.content}>
        {loading ? <Spinner size="small" color={spinnerColor} /> : null}
        <Text style={[styles.text, textStyle]}>{loading ? loadingText || title : title}</Text>
        {!loading && rightIcon ? <Text style={styles.icon}>{rightIcon}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  disabled: { opacity: 0.65 },
  text: {
    color: COLORS.background,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.5,
  },
  icon: {
    color: COLORS.background,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});
