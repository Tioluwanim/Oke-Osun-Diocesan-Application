import React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import PageLoader from '../components/ui/PageLoader';

import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PendingApprovalScreen from '../screens/auth/PendingApprovalScreen';

import MemberTabs from './MemberTabs';
import ClergyTabs from './ClergyTabs';
import AdminTabs from './AdminTabs';

const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
  <PageLoader text="Preparing your workspace..." skeleton />
);

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade',
      animationDuration: 300,
    }}
  >
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} options={{ animation: 'slide_from_right' }} />
  </Stack.Navigator>
);

const MemberStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MemberMain" component={MemberTabs} />
  </Stack.Navigator>
);

const ClergyStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ClergyMain" component={ClergyTabs} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminMain" component={AdminTabs} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <AuthStack />;
  if (user?.role === 'admin') return <AdminStack />;
  if (user?.role === 'clergy') return <ClergyStack />;
  return <MemberStack />;
};

export default function Navigation() {
  return (
    <NavigationContainer onReady={() => SplashScreen.hideAsync().catch(() => {})}>
      <RootNavigator />
    </NavigationContainer>
  );
}
