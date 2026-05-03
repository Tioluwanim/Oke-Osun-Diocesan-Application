import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS, API_ROUTES } from '../constants/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [token, setToken]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        }
      }
      const storedUser  = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.warn('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Save session after login ──
  const login = async (userData, authToken) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, authToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.warn('Error saving auth:', error);
    }
  };

  // ── Clear session on logout ──
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.warn('Error clearing auth:', error);
    }
  };

  // ── Register new user via API ──
  // Members → auto-approved (status: 'active')
  // Clergy  → requires admin approval (status: 'pending')
  // Admins  → only set manually, never self-registered
  const registerUser = async (userData) => {
    try {
      const response = await fetch(API_ROUTES.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userData.fullName,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          parish: userData.parish || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, user: data.user, token: data.token };
      } else {
        return { success: false, message: data.detail || 'Registration failed' };
      }
    } catch (error) {
      console.warn('Register error:', error);
      return { success: false, message: 'Network error. Check your connection.' };
    }
  };

  const completeInvite = async (inviteToken, password) => {
    try {
      const response = await fetch(API_ROUTES.completeInvite, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invite_token: inviteToken,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, user: data.user, token: data.token };
      }

      return { success: false, message: data.detail || 'Failed to complete invite' };
    } catch (error) {
      console.warn('Complete invite error:', error);
      return { success: false, message: 'Network error. Check your connection.' };
    }
  };

  // ── Verify login via API ──
  // Clergy with pending status can log in but will see PendingApprovalScreen
  const verifyLogin = async (email, password) => {
    try {
      const response = await fetch(API_ROUTES.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, user: data.user, token: data.token };
      } else {
        return { success: false, message: data.detail || 'Login failed' };
      }
    } catch (error) {
      console.warn('Login error:', error);
      return { success: false, message: 'Network error. Check your connection.' };
    }
  };

  // ── Update logged-in user profile via API ──
  const updateUser = async (updatedFields) => {
    try {
      const response = await fetch(API_ROUTES.updateProfile, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(data.user)
        );
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.detail || 'Failed to update profile' };
      }
    } catch (error) {
      console.warn('Error updating user:', error);
      return { success: false, message: 'Network error. Check your connection.' };
    }
  };

  // ── Change password via API ──
  // Note: backend expects snake_case (current_password, new_password)
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(API_ROUTES.changePassword, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, message: data.detail || 'Failed to change password' };
      }
    } catch (error) {
      console.warn('Error changing password:', error);
      return { success: false, message: 'Network error. Check your connection.' };
    }
  };

  // ── Refresh user data from storage ──
  // Useful after admin approves a clergy account
  const refreshUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        return { success: true, user: parsed };
      }
      return { success: false, message: 'User not found' };
    } catch (error) {
      console.warn('Error refreshing user:', error);
      return { success: false, message: 'Failed to refresh user data' };
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
