import React, { useEffect, useRef } from 'react';
import {
  View, Text, Image, StyleSheet,
  Animated, Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { API_BASE_URL } from '../../constants/config';

const { width, height } = Dimensions.get('window');

/**
 * Pings the backend /health endpoint while the splash plays.
 * This wakes Render.com's free-tier server (cold start ~30-50s)
 * so by the time the user reaches login, the API is ready.
 */
async function wakeUpBackend() {
  try {
    await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(55000),
    });
  } catch {
    // Silently ignore — app still works, just might be slow on first login
  }
}

export default function AuthSplashScreen({ navigation }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const dotAnim1  = useRef(new Animated.Value(0.3)).current;
  const dotAnim2  = useRef(new Animated.Value(0.3)).current;
  const dotAnim3  = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Wake backend immediately, don't wait for result
    wakeUpBackend();

    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Loading dots animation
    const dotLoop = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dotAnim1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
      ])
    );
    dotLoop.start();

    const timer = setTimeout(() => {
      dotLoop.stop();
      navigation.replace('Login');
    }, 3000);

    return () => {
      clearTimeout(timer);
      dotLoop.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <Animated.View
        style={[styles.logoContainer, {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }]}
      >
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

      <Animated.View style={[styles.bottomContainer, {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }]}>
        {/* Connecting dots — shows server is waking up */}
        <View style={styles.dotsRow}>
          {[dotAnim1, dotAnim2, dotAnim3].map((dot, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
          ))}
        </View>
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
    position: 'absolute', width: 400, height: 400, borderRadius: 200,
    backgroundColor: 'rgba(201,168,76,0.04)', top: -100, right: -100,
  },
  circle2: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(201,168,76,0.03)', bottom: -50, left: -80,
  },
  logoContainer: { alignItems: 'center' },
  logoWrapper: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(201,168,76,0.05)',
  },
  logo: { width: 110, height: 110 },
  divider: {
    width: 160, height: 1,
    backgroundColor: COLORS.gold,
    marginVertical: SPACING.md, opacity: 0.4,
  },
  dioceseTitle: {
    fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold,
    color: COLORS.goldLight, letterSpacing: 1,
    textAlign: 'center', marginBottom: SPACING.xs,
  },
  churchName: {
    fontSize: FONTS.sizes.md, color: COLORS.text,
    letterSpacing: 1, textAlign: 'center', marginBottom: SPACING.xs,
  },
  communion: {
    fontSize: FONTS.sizes.sm, color: COLORS.textMuted,
    letterSpacing: 2, textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute', bottom: 50, alignItems: 'center',
  },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.gold,
  },
  tagline: {
    fontSize: FONTS.sizes.sm, color: COLORS.textMuted,
    letterSpacing: 3, marginBottom: SPACING.sm,
  },
  version: {
    fontSize: FONTS.sizes.xs, color: COLORS.goldDim, letterSpacing: 1,
  },
});