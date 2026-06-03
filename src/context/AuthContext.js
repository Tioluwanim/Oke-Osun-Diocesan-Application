import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS, API_ROUTES } from '../constants/config';
import { authApi, userApi, registerAuthHandlers } from '../lib/api';
import { translateAuthError } from '../utils/errorTranslator';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [token, setToken]         = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef(null);
  const refreshTokenRef = useRef(null);

  const updateStoredTokens = async (accessToken, refreshTokenValue) => {
    if (accessToken) {
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      accessTokenRef.current = accessToken;
      setToken(accessToken);
    }
    if (refreshTokenValue) {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshTokenValue);
      refreshTokenRef.current = refreshTokenValue;
      setRefreshToken(refreshTokenValue);
    }
  };

  const clearStoredSession = async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.ROLE,
      'authToken',
      'token',
      'userToken',
      'refreshToken',
    ]);
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  useEffect(() => {
    registerAuthHandlers({
      getAccessToken: async () => accessTokenRef.current,
      getRefreshToken: async () => refreshTokenRef.current,
      updateTokens: updateStoredTokens,
      onLogout: clearStoredSession,
    });
    loadStoredAuth();
  }, []);

  // ── Load stored session on app start ──
  const loadStoredAuth = async () => {
    try {
      let storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      if (!storedToken) {
        storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (storedToken) {
          await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, storedToken);
        }
      }
      await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, 'authToken', 'token', 'userToken', 'refreshToken']);
      const storedRefreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedToken) {
        accessTokenRef.current = storedToken;
        setToken(storedToken);
      }
      if (storedRefreshToken) {
        refreshTokenRef.current = storedRefreshToken;
        setRefreshToken(storedRefreshToken);
      }
      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.warn('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Save session after login ──
  const login = async (userData, accessToken, refreshTokenValue) => {
    try {
      await updateStoredTokens(accessToken, refreshTokenValue);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.warn('Error saving auth:', error);
    }
  };

  // ── Clear session on logout ──
  const logout = async () => {
    try {
      if (refreshTokenRef.current) {
        await authApi.logout(refreshTokenRef.current);
      }
    } catch (error) {
      console.warn('Error logging out remotely:', error);
    } finally {
      await clearStoredSession();
    }
  };

  // ── Register new user via API ──
  const registerUser = async (userData) => {
    try {
      const data = await authApi.register({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        parish: userData.parish || null,
      });

      return {
        success: true,
        user: data.user,
        accessToken: data.accessToken || data.token,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      console.warn('Register error:', error);
      return { success: false, message: translateAuthError(error.message || 'Registration failed') };
    }
  };

  const completeInvite = async (inviteToken, password) => {
    try {
      const data = await authApi.completeInvite({ invite_token: inviteToken, password });
      return {
        success: true,
        user: data.user,
        accessToken: data.accessToken || data.token,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      console.warn('Complete invite error:', error);
      return { success: false, message: translateAuthError(error.message || 'Failed to complete invite') };
    }
  };

  // ── Verify login via API ──
  const verifyLogin = async (email, password) => {
    try {
      const data = await authApi.login({ email, password });
      return {
        success: true,
        user: data.user,
        accessToken: data.accessToken || data.token,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      console.warn('Login error:', error);
      return { success: false, message: translateAuthError(error.message || 'Login failed') };
    }
  };

  // ── Update logged-in user profile via API ──
  const updateUser = async (updatedFields) => {
    try {
      const data = await authApi.updateProfile(updatedFields, token);
      if (data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (error) {
      console.warn('Error updating user:', error);
      return { success: false, message: translateAuthError(error.message || 'Network error. Check your connection.') };
    }
  };

  // ── Change password via API ──
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authApi.changePassword({ current_password: currentPassword, new_password: newPassword }, token);
      return { success: true };
    } catch (error) {
      console.warn('Error changing password:', error);
      return { success: false, message: translateAuthError(error.message || 'Network error. Check your connection.') };
    }
  };

  // ── Refresh latest user data from server ──
  const refreshUser = async () => {
    try {
      const data = await userApi.fetchMe(token);
      if (data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: 'Failed to refresh user data' };
    } catch (error) {
      console.warn('Error refreshing user:', error);
      return { success: false, message: error.message || 'Failed to refresh user data' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser,
        changePassword,
        registerUser,
        completeInvite,
        verifyLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
