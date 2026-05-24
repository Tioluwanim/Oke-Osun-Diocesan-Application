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
import AppIcon from '../components/ui/AppIcon';

// ── Screen Imports ──
import ClergyHomeScreen from '../screens/clergy/ClergHomeScreen';
import UploadSermonScreen from '../screens/clergy/UploadSermonScreen';
import EventsScreen from '../screens/main/EventsScreen';
import LiveScreen from '../screens/main/LiveScreen';
import ResourcesScreen from '../screens/main/SermonsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ParishScreen from '../screens/clergy/ParishScreen';
import GiveScreen from '../screens/main/GiveScreen';
import GiveScreen from '../screens/main/GiveScreen';

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
const TabIcon = ({ icon, label, focused, color }) => (
  <View style={styles.tabIconContainer}>
    {focused ? <View style={[styles.activeDot, { backgroundColor: color }]} /> : null}
    <View style={[
      styles.tabIconWrapper,
      focused && { backgroundColor: `${color}18` },
    ]}>
      <AppIcon name={icon} size={20} color={focused ? color : COLORS.textMuted} />
    </View>
    <Text style={[styles.tabLabel, focused && { color }]}>{label}</Text>
  </View>
);

// ── Tabs Config ──
const TABS = [
  { name: 'Home',      icon: 'home', label: 'Home',      component: HomeStack,       color: COLORS.gold },
  { name: 'Events',    icon: 'calendar', label: 'Events',    component: EventsScreen,    color: COLORS.gold },
  { name: 'Live',      icon: 'live', label: 'Live',      component: LiveScreen,      color: COLORS.red  },
  { name: 'Resources', icon: 'resources', label: 'Resources', component: ResourcesScreen, color: COLORS.gold },
  { name: 'Parish',    icon: 'church', label: 'Parish',    component: ParishScreen,    color: COLORS.teal },
  { name: 'Give',      icon: 'give',   label: 'Give',      component: GiveScreen,      color: COLORS.gold },
  { name: 'Profile',   icon: 'person', label: 'Profile',   component: ProfileScreen,   color: COLORS.gold },
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
                icon={tab.icon}
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
    minWidth: 44,
  },
  activeDot: {
    position: 'absolute',
    top: -5,
    width: 18,
    height: 3,
    borderRadius: 2,
  },
  tabIconWrapper: {
    width: 40,
    height: 32,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: COLORS.textMuted,
  },
});