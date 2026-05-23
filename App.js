import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import Navigation from './src/navigation';
import ErrorBoundary from './src/components/ui/ErrorBoundary';
import OfflineBanner from './src/components/ui/OfflineBanner';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [isOnline, setIsOnline] = useState(true);
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
        refetchOnReconnect: true,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  }), []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return unsubscribe;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <StatusBar style="light" backgroundColor="#0A0C10" />
          <Navigation />
          {!isOnline ? <OfflineBanner /> : null}
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}
