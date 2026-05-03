import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function Spinner({ size = 'small', color = COLORS.gold, style }) {
  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
});
