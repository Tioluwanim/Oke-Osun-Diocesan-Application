import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import AppIcon from '../ui/AppIcon';

/**
 * ScreenHeader – reusable branded header used across all main screens.
 *
 * Props:
 *   title        – large title text (string)
 *   subtitle     – small subtitle below (string)
 *   showLogo     – show diocese logo left (bool, default true)
 *   rightElement – custom element rendered on right (ReactNode)
 *   onRightPress – if string icon name given, renders an icon button
 *   rightIcon    – AppIcon name for right button
 *   tabs         – [{key, label}] renders inline tab switcher
 *   activeTab    – currently active tab key
 *   onTabChange  – (key) => void
 */
export default function ScreenHeader({
  title,
  subtitle = 'Diocese of Oke-Osun',
  showLogo = true,
  rightElement,
  rightIcon,
  onRightPress,
  tabs,
  activeTab,
  onTabChange,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.top}>
        <View style={styles.left}>
          {showLogo && (
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        {(rightElement || rightIcon) && (
          <View style={styles.right}>
            {rightElement ?? (
              <TouchableOpacity style={styles.iconBtn} onPress={onRightPress} activeOpacity={0.7}>
                <AppIcon name={rightIcon} size={18} color={COLORS.gold} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {tabs && tabs.length > 0 && (
        <View style={styles.tabs}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => onTabChange?.(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 55 : 44,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  logo: { width: 38, height: 38, borderRadius: 19 },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
    color: COLORS.goldLight,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gold,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  right: { flexShrink: 0 },
  iconBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface2,
    borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.lg,
    padding: 3,
    alignSelf: 'flex-start',
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
  },
  tabActive: { backgroundColor: COLORS.gold },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textMuted,
  },
  tabTextActive: { color: COLORS.background },
});