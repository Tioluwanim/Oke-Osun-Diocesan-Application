/**
 * SplashScreen — Diocese of Oke-Osun
 * ─────────────────────────────────────
 * Cinematic 4-phase animation sequence:
 *   Phase 1 (0–600ms)   → Dark screen, cross draws in from centre
 *   Phase 2 (600–1400ms)→ Logo scales up with gold ring expanding
 *   Phase 3 (1400–2200ms)→ Diocese name and details slide up, staggered
 *   Phase 4 (2200–3200ms)→ Verse fades in, shimmer on divider, dots pulse
 *   Phase 5 (3200ms+)   → Navigate to Login
 *
 * Also pings /health immediately to warm up Render.com backend.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { API_BASE_URL } from '../../constants/config';

const { width, height } = Dimensions.get('window');
const GOLD   = COLORS.gold;
const GOLD_L = COLORS.goldLight;
const GOLD_D = COLORS.goldDim;

// Warm up Render.com free-tier backend silently
async function wakeUpBackend() {
  try {
    await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(55000),
    });
  } catch { /* silent — app continues regardless */ }
}

// ── Reusable easing ─────────────────────────────────────────────
const easeOut  = Easing.out(Easing.cubic);
const easeBack = Easing.out(Easing.back(1.8));

export default function SplashScreen({ navigation }) {
  // ── Animation values ─────────────────────────────────────────
  const bgOpacity       = useRef(new Animated.Value(0)).current;

  // Cross / watermark
  const crossScale      = useRef(new Animated.Value(0)).current;
  const crossOpacity    = useRef(new Animated.Value(0)).current;

  // Outer ring
  const ring1Scale      = useRef(new Animated.Value(0.4)).current;
  const ring1Opacity    = useRef(new Animated.Value(0)).current;
  const ring2Scale      = useRef(new Animated.Value(0.2)).current;
  const ring2Opacity    = useRef(new Animated.Value(0)).current;

  // Logo
  const logoScale       = useRef(new Animated.Value(0.3)).current;
  const logoOpacity     = useRef(new Animated.Value(0)).current;

  // Text lines — staggered
  const titleOpacity    = useRef(new Animated.Value(0)).current;
  const titleY          = useRef(new Animated.Value(24)).current;
  const sub1Opacity     = useRef(new Animated.Value(0)).current;
  const sub1Y           = useRef(new Animated.Value(20)).current;
  const sub2Opacity     = useRef(new Animated.Value(0)).current;
  const sub2Y           = useRef(new Animated.Value(16)).current;

  // Divider shimmer
  const dividerWidth    = useRef(new Animated.Value(0)).current;
  const shimmerX        = useRef(new Animated.Value(-160)).current;

  // Verse at bottom
  const verseOpacity    = useRef(new Animated.Value(0)).current;
  const verseY          = useRef(new Animated.Value(12)).current;

  // Loading dots
  const dot1            = useRef(new Animated.Value(0.2)).current;
  const dot2            = useRef(new Animated.Value(0.2)).current;
  const dot3            = useRef(new Animated.Value(0.2)).current;

  // Bottom bar
  const barOpacity      = useRef(new Animated.Value(0)).current;
  const barY            = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    wakeUpBackend();

    // ── Phase 1: background + cross ─────────────────────────
    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(crossOpacity, {
            toValue: 0.07, duration: 500, easing: easeOut, useNativeDriver: true,
          }),
          Animated.spring(crossScale, {
            toValue: 1, tension: 30, friction: 8, useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // ── Phase 2: rings + logo ───────────────────────────────
    setTimeout(() => {
      Animated.parallel([
        // Outer ring 1
        Animated.parallel([
          Animated.timing(ring1Scale, {
            toValue: 1, duration: 700, easing: easeBack, useNativeDriver: true,
          }),
          Animated.timing(ring1Opacity, {
            toValue: 1, duration: 400, useNativeDriver: true,
          }),
        ]),
        // Outer ring 2 (delayed)
        Animated.sequence([
          Animated.delay(120),
          Animated.parallel([
            Animated.timing(ring2Scale, {
              toValue: 1, duration: 700, easing: easeBack, useNativeDriver: true,
            }),
            Animated.timing(ring2Opacity, {
              toValue: 1, duration: 400, useNativeDriver: true,
            }),
          ]),
        ]),
        // Logo
        Animated.sequence([
          Animated.delay(80),
          Animated.parallel([
            Animated.spring(logoScale, {
              toValue: 1, tension: 50, friction: 7, useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
              toValue: 1, duration: 500, useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    }, 500);

    // ── Phase 3: text stagger ───────────────────────────────
    setTimeout(() => {
      // Divider expands
      Animated.timing(dividerWidth, {
        toValue: 180, duration: 500, easing: easeOut, useNativeDriver: false,
      }).start();

      // Shimmer on divider
      setTimeout(() => {
        Animated.loop(
          Animated.timing(shimmerX, {
            toValue: 160, duration: 1600, easing: Easing.linear, useNativeDriver: true,
          })
        ).start();
      }, 500);

      Animated.stagger(140, [
        // Diocese title
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1, duration: 500, easing: easeOut, useNativeDriver: true,
          }),
          Animated.timing(titleY, {
            toValue: 0, duration: 500, easing: easeOut, useNativeDriver: true,
          }),
        ]),
        // Church of Nigeria
        Animated.parallel([
          Animated.timing(sub1Opacity, {
            toValue: 1, duration: 450, easing: easeOut, useNativeDriver: true,
          }),
          Animated.timing(sub1Y, {
            toValue: 0, duration: 450, easing: easeOut, useNativeDriver: true,
          }),
        ]),
        // Anglican Communion
        Animated.parallel([
          Animated.timing(sub2Opacity, {
            toValue: 1, duration: 400, easing: easeOut, useNativeDriver: true,
          }),
          Animated.timing(sub2Y, {
            toValue: 0, duration: 400, easing: easeOut, useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 1200);

    // ── Phase 4: verse + bottom bar ────────────────────────
    setTimeout(() => {
      Animated.parallel([
        Animated.parallel([
          Animated.timing(verseOpacity, {
            toValue: 1, duration: 600, easing: easeOut, useNativeDriver: true,
          }),
          Animated.timing(verseY, {
            toValue: 0, duration: 600, easing: easeOut, useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(barOpacity, {
            toValue: 1, duration: 500, useNativeDriver: true,
          }),
          Animated.timing(barY, {
            toValue: 0, duration: 500, easing: easeOut, useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Pulsing dots
      const dotLoop = Animated.loop(
        Animated.stagger(180, [
          Animated.sequence([
            Animated.timing(dot1, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(dot1, { toValue: 0.2, duration: 350, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(dot2, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(dot2, { toValue: 0.2, duration: 350, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(dot3, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(dot3, { toValue: 0.2, duration: 350, useNativeDriver: true }),
          ]),
        ])
      );
      dotLoop.start();

      const nav = setTimeout(() => {
        dotLoop.stop();
        navigation.replace('Login');
      }, 1800);

      return () => {
        clearTimeout(nav);
        dotLoop.stop();
      };
    }, 2000);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>

      {/* ── Decorative background orbs ── */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />
      <View style={styles.orb4} />

      {/* ── Large background cross watermark ── */}
      <Animated.View style={[styles.crossWrap, {
        opacity: crossOpacity,
        transform: [{ scale: crossScale }],
      }]}>
        <View style={styles.crossV} />
        <View style={styles.crossH} />
      </Animated.View>

      {/* ── Centre: rings + logo ── */}
      <View style={styles.centreGroup}>

        {/* Outer decorative ring 2 (larger, dimmer) */}
        <Animated.View style={[styles.ring2, {
          opacity: ring2Opacity,
          transform: [{ scale: ring2Scale }],
        }]} />

        {/* Outer decorative ring 1 */}
        <Animated.View style={[styles.ring1, {
          opacity: ring1Opacity,
          transform: [{ scale: ring1Scale }],
        }]}>
          {/* Gold tick marks around the ring */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <View
              key={i}
              style={[styles.tick, {
                transform: [
                  { rotate: `${deg}deg` },
                  { translateY: -84 },
                ],
              }]}
            />
          ))}
        </Animated.View>

        {/* Logo */}
        <Animated.View style={[styles.logoWrap, {
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }]}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

      </View>

      {/* ── Divider ── */}
      <View style={styles.dividerContainer}>
        <Animated.View style={[styles.divider, { width: dividerWidth }]}>
          {/* Shimmer highlight */}
          <Animated.View style={[styles.shimmer, {
            transform: [{ translateX: shimmerX }],
          }]} />
        </Animated.View>
      </View>

      {/* ── Diocese name + details ── */}
      <View style={styles.textBlock}>
        <Animated.Text style={[styles.dioceseName, {
          opacity: titleOpacity,
          transform: [{ translateY: titleY }],
        }]}>
          DIOCESE OF OKE-OSUN
        </Animated.Text>

        <Animated.Text style={[styles.churchName, {
          opacity: sub1Opacity,
          transform: [{ translateY: sub1Y }],
        }]}>
          Church of Nigeria
        </Animated.Text>

        <Animated.Text style={[styles.communion, {
          opacity: sub2Opacity,
          transform: [{ translateY: sub2Y }],
        }]}>
          Anglican Communion
        </Animated.Text>
      </View>

      {/* ── Scripture verse ── */}
      <Animated.View style={[styles.verseWrap, {
        opacity: verseOpacity,
        transform: [{ translateY: verseY }],
      }]}>
        <Text style={styles.verseText}>
          "Shine the Light"
        </Text>
        <Text style={styles.verseRef}>Matthew 5:16</Text>
      </Animated.View>

      {/* ── Bottom bar: dots + version ── */}
      <Animated.View style={[styles.bottomBar, {
        opacity: barOpacity,
        transform: [{ translateY: barY }],
      }]}>
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
          ))}
        </View>
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>

    </Animated.View>
  );
}

const RING1_SIZE = 188;
const RING2_SIZE = 228;
const LOGO_SIZE  = 148;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Background orbs ──────────────────────────────────────
  orb1: {
    position: 'absolute', borderRadius: 9999,
    width: 500, height: 500,
    top: -180, right: -160,
    backgroundColor: 'rgba(201,168,76,0.045)',
  },
  orb2: {
    position: 'absolute', borderRadius: 9999,
    width: 380, height: 380,
    bottom: -120, left: -130,
    backgroundColor: 'rgba(201,168,76,0.03)',
  },
  orb3: {
    position: 'absolute', borderRadius: 9999,
    width: 200, height: 200,
    top: height * 0.35, left: -60,
    backgroundColor: 'rgba(201,168,76,0.025)',
  },
  orb4: {
    position: 'absolute', borderRadius: 9999,
    width: 160, height: 160,
    top: height * 0.2, right: -40,
    backgroundColor: 'rgba(201,168,76,0.02)',
  },

  // ── Background cross watermark ──────────────────────────
  crossWrap: {
    position: 'absolute',
    width: 280, height: 280,
    justifyContent: 'center', alignItems: 'center',
  },
  crossV: {
    position: 'absolute',
    width: 3, height: 280,
    backgroundColor: GOLD,
    borderRadius: 2,
  },
  crossH: {
    position: 'absolute',
    width: 280, height: 3,
    backgroundColor: GOLD,
    borderRadius: 2,
    top: '30%',
  },

  // ── Centre group ─────────────────────────────────────────
  centreGroup: {
    width: RING2_SIZE,
    height: RING2_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },

  // Outer ring 2 — large faint
  ring2: {
    position: 'absolute',
    width: RING2_SIZE, height: RING2_SIZE,
    borderRadius: RING2_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.18)',
    borderStyle: 'dashed',
  },

  // Outer ring 1 — medium gold
  ring1: {
    position: 'absolute',
    width: RING1_SIZE, height: RING1_SIZE,
    borderRadius: RING1_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tick marks on ring
  tick: {
    position: 'absolute',
    width: 2, height: 10,
    backgroundColor: GOLD,
    borderRadius: 1,
    opacity: 0.6,
  },

  // Logo circle
  logoWrap: {
    width: LOGO_SIZE, height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: 'rgba(10,12,16,0.9)',
    borderWidth: 2,
    borderColor: 'rgba(201,168,76,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    // Inner glow
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  logo: {
    width: LOGO_SIZE * 0.78,
    height: LOGO_SIZE * 0.78,
  },

  // ── Divider ──────────────────────────────────────────────
  dividerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  divider: {
    height: 1.5,
    backgroundColor: 'rgba(201,168,76,0.35)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 1,
  },

  // ── Text block ───────────────────────────────────────────
  textBlock: {
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xl,
  },
  dioceseName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
    color: GOLD_L,
    letterSpacing: 3,
    textAlign: 'center',
  },
  churchName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  communion: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    letterSpacing: 2.5,
    textAlign: 'center',
  },

  // ── Scripture verse ──────────────────────────────────────
  verseWrap: {
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xxl + SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  verseText: {
    fontSize: FONTS.sizes.sm,
    color: GOLD,
    fontStyle: 'italic',
    letterSpacing: 0.8,
    textAlign: 'center',
    opacity: 0.85,
  },
  verseRef: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textAlign: 'center',
  },

  // ── Bottom bar ───────────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 5, height: 5,
    borderRadius: 2.5,
    backgroundColor: GOLD,
  },
  version: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.goldDim,
    letterSpacing: 1.5,
  },
});