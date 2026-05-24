import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import AppIcon from '../components/ui/AppIcon';

import HomeScreen from '../screens/main/HomeScreen';
import EventsScreen from '../screens/main/EventsScreen';
import LiveScreen from '../screens/main/LiveScreen';
import ResourcesScreen from '../screens/main/SermonsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import GiveScreen from '../screens/main/GiveScreen';

const Tab = createBottomTabNavigator();

const TabBarButton = ({ children, onPress, accessibilityState }) => {
  const focused = accessibilityState?.selected;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.tabBarButton, focused && styles.tabBarButtonActive]}
    >
      {children}
    </TouchableOpacity>
  );
};

const TabIcon = ({ icon, label, focused }) => {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 90,
    }).start();
  }, [focused, progress]);

  return (
    <View style={styles.tabIconContainer}>
      <Animated.View
        style={[
          styles.activePill,
          {
            opacity: progress,
            transform: [{ scaleX: progress.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) }],
          },
        ]}
      />
      <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
        <AppIcon name={icon} size={22} color={focused ? COLORS.gold : COLORS.textMuted} />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
};

const TABS = [
  { name: 'Home', icon: 'home', label: 'Home', component: HomeScreen },
  { name: 'Events', icon: 'calendar', label: 'Events', component: EventsScreen },
  { name: 'Live', icon: 'live', label: 'Live', component: LiveScreen },
  { name: 'Resources', icon: 'resources', label: 'Resources', component: ResourcesScreen },
  { name: 'Give', icon: 'give', label: 'Give', component: GiveScreen },
  { name: 'Profile', icon: 'person', label: 'Profile', component: ProfileScreen },
];

export default function MemberTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarButton: (props) => <TabBarButton {...props} />,
            tabBarIcon: ({ focused }) => (
              <TabIcon icon={tab.icon} label={tab.label} focused={focused} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 70;

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    height: TAB_BAR_HEIGHT - 10,
    backgroundColor: COLORS.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderRadius: RADIUS.xxl,
    marginHorizontal: 0,
    flexDirection: 'row',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
  },
  tabBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  tabBarButtonActive: {
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 54,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
  },
  tabIconWrapper: {
    width: 44,
    height: 36,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  tabIconWrapperActive: {
    backgroundColor: COLORS.softGold,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.gold,
  },
});