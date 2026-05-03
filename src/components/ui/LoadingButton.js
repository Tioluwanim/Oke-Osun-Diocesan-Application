import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Spinner from './Spinner';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';

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
}) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
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
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabled: { opacity: 0.6 },
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
