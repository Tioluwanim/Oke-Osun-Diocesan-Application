import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback } from 'react-native';

/**
 * PressableCard — wraps any card with a spring scale-down on press.
 * Replaces activeOpacity={0.85} with a physical press feel.
 *
 * Usage:
 *   <PressableCard onPress={...} style={styles.card}>
 *     ...card content...
 *   </PressableCard>
 */
export default function PressableCard({ onPress, style, children, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}