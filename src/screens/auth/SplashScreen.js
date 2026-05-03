import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>

      {/* Background circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      {/* Logo area */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* LOGO — place your image at src/assets/logo.png */}
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.dioceseTitle}>Diocese of Oke-Osun</Text>
        <Text style={styles.churchName}>Church of Nigeria</Text>
        <Text style={styles.communion}>Anglican Communion</Text>
      </Animated.View>

      {/* Bottom */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.tagline}>Connecting the Diocese</Text>
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(201, 168, 76, 0.04)',
    top: -100,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(201, 168, 76, 0.03)',
    bottom: -50,
    left: -80,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(201, 168, 76, 0.05)',
  },
  logo: {
    width: 110,
    height: 110,
  },
  divider: {
    width: 160,
    height: 1,
    backgroundColor: COLORS.gold,
    marginVertical: SPACING.md,
    opacity: 0.4,
  },
  dioceseTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.goldLight,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  churchName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  communion: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  tagline: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    letterSpacing: 3,
    marginBottom: SPACING.sm,
  },
  version: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.goldDim,
    letterSpacing: 1,
  },
});
