import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import EventsScreen from '../screens/main/EventsScreen';
import LiveScreen from '../screens/main/LiveScreen';
import ResourcesScreen from '../screens/main/SermonsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ManageScreen from '../screens/admin/ManageScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';

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

const TABS = [
  { name: 'Home', emoji: '✝', label: 'Home', component: AdminHomeScreen, color: COLORS.gold },
  { name: 'Events', emoji: '📅', label: 'Events', component: EventsScreen, color: COLORS.gold },
  { name: 'Live', emoji: '📺', label: 'Live', component: LiveScreen, color: COLORS.red },
  { name: 'Resources', emoji: '📖', label: 'Sermons', component: ResourcesScreen, color: COLORS.gold },
  { name: 'Manage', emoji: '🛡', label: 'Manage', component: ManageScreen, color: COLORS.red },
  { name: 'UserManagement', emoji: '👥', label: 'Users', component: UserManagementScreen, color: COLORS.red },
  { name: 'Profile', emoji: '👤', label: 'Profile', component: ProfileScreen, color: COLORS.gold },
];

export default function AdminTabs() {
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
    bottom: 12,
    left: 12,
    right: 12,
    height: TAB_BAR_HEIGHT - 10,
    backgroundColor: COLORS.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderRadius: RADIUS.xxl,
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
  },
  tabIconWrapper: {
    width: 44,
    height: 36,
    borderRadius: RADIUS.lg,
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
