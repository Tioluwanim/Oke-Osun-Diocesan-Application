import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

// ── Screen Imports ──
import ClergyHomeScreen from '../screens/clergy/ClergHomeScreen';
import UploadSermonScreen from '../screens/clergy/UploadSermonScreen';
import EventsScreen from '../screens/main/EventsScreen';
import LiveScreen from '../screens/main/LiveScreen';
import ResourcesScreen from '../screens/main/SermonsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ParishScreen from '../screens/clergy/ParishScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Home Stack (so UploadSermon can push on top) ──
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClergyHome" component={ClergyHomeScreen} />
      <Stack.Screen name="UploadSermon" component={UploadSermonScreen} />
    </Stack.Navigator>
  );
}

// ── Tab Bar Button ──
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

// ── Tab Icon ──
const TabIcon = ({ emoji, label, focused, color }) => (
  <View style={styles.tabIconContainer}>
    <View style={[
      styles.tabIconWrapper,
      focused && { backgroundColor: `${color}18` },
    ]}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.5 }]}>{emoji}</Text>
    </View>
    <Text style={[styles.tabLabel, focused && { color }]}>{label}</Text>
  </View>
);

// ── Tabs Config ──
const TABS = [
  { name: 'Home',      emoji: '⛪', label: 'Home',      component: HomeStack,       color: COLORS.gold },
  { name: 'Events',    emoji: '📅', label: 'Events',    component: EventsScreen,    color: COLORS.gold },
  { name: 'Live',      emoji: '📺', label: 'Live',      component: LiveScreen,      color: COLORS.red  },
  { name: 'Resources', emoji: '📖', label: 'Resources', component: ResourcesScreen, color: COLORS.gold },
  { name: 'Parish',    emoji: '🏛️', label: 'Parish',    component: ParishScreen,    color: COLORS.teal },
  { name: 'Profile',   emoji: '👤', label: 'Profile',   component: ProfileScreen,   color: COLORS.gold },
];

export default function ClergyTabs() {
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
              <TabIcon
                emoji={tab.emoji}
                label={tab.label}
                focused={focused}
                color={tab.color}
              />
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
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76,201,168,0.2)',
    flexDirection: 'row',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  tabBarButtonActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.teal,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabIconWrapper: {
    width: 40,
    height: 32,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: COLORS.textMuted,
  },
});