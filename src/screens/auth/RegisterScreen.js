import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { ROLES } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';
import LoadingButton from '../../components/ui/LoadingButton';
import AppIcon from '../../components/ui/AppIcon';
import PasswordStrengthBar from '../../components/forms/PasswordStrengthBar';

export default function RegisterScreen({ navigation }) {
  const [mode, setMode] = useState('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [selectedRole, setSelectedRole] = useState(ROLES.MEMBER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { registerUser, completeInvite, login } = useAuth();

  const roles = [
    { key: ROLES.MEMBER, label: 'Member', icon: 'person', desc: 'Congregation' },
    { key: ROLES.CLERGY, label: 'Clergy', icon: 'church', desc: 'Pastor / Minister' },
  ];

  const handleRegister = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'invite') {
        if (!inviteToken.trim()) {
          setError('Please enter your invite code');
          setIsLoading(false);
          return;
        }

        const inviteResult = await completeInvite(inviteToken.trim(), password);
        if (inviteResult.success) {
          if (inviteResult.user?.status === 'pending') {
            navigation.replace('PendingApproval', { user: inviteResult.user });
            return;
          }
          await login(inviteResult.user, inviteResult.accessToken, inviteResult.refreshToken);
          return;
        }

        setError(inviteResult.message || 'Failed to activate invite');
        setIsLoading(false);
        return;
      }

      if (!fullName || !email || !password || !confirmPassword) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email');
        setIsLoading(false);
        return;
      }

      const result = await registerUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: selectedRole,
        parish: null,
        phone: phone.trim() || null,
      });

      if (result.success) {
        const user = result.user;

        if (user.status === 'pending') {
          navigation.replace('PendingApproval', { user });
          return;
        }

        await login(user, result.accessToken, result.refreshToken);
        return;
      }

      setError(result.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    } catch (err) {
      console.warn('Register error:', err);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.header}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>
            {mode === 'invite' ? 'Activate Invite' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'invite' ? 'Finish your invited account setup' : 'Join the Diocese of Oke-Osun'}
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.form}>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeChip, mode === 'register' && styles.modeChipActive]}
                onPress={() => { setMode('register'); setError(''); }}
              >
              <Text style={[styles.modeChipText, mode === 'register' && styles.modeChipTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeChip, mode === 'invite' && styles.modeChipActive]}
              onPress={() => { setMode('invite'); setError(''); }}
            >
              <Text style={[styles.modeChipText, mode === 'invite' && styles.modeChipTextActive]}>
                Activate Invite
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {mode === 'register' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>I am a</Text>
                <View style={styles.rolesRow}>
                  {roles.map((role) => (
                    <TouchableOpacity
                      key={role.key}
                      style={[
                        styles.roleCard,
                        selectedRole === role.key && styles.roleCardActive,
                      ]}
                      onPress={() => setSelectedRole(role.key)}
                    >
                      <AppIcon name={role.icon} size={24} color={selectedRole === role.key ? COLORS.background : COLORS.gold} style={styles.roleIcon} />
                      <Text style={[
                        styles.roleLabel,
                        selectedRole === role.key && styles.roleLabelActive,
                      ]}>
                        {role.label}
                      </Text>
                      <Text style={styles.roleDesc}>{role.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={[styles.inputWrapper, focusedInput === 'fullName' && styles.inputWrapperFocused]}>
                  <AppIcon name="person" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    onFocus={() => setFocusedInput('fullName')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
                  <AppIcon name="email" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={[styles.inputWrapper, focusedInput === 'phone' && styles.inputWrapperFocused]}>
                  <AppIcon name="phone" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+234 000 000 0000"
                    placeholderTextColor={COLORS.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    onFocus={() => setFocusedInput('phone')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </>
          )}

          {mode === 'invite' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Invite Code *</Text>
              <View style={[styles.inputWrapper, focusedInput === 'inviteToken' && styles.inputWrapperFocused]}>
                <AppIcon name="link-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Paste the invite code from your admin"
                  placeholderTextColor={COLORS.textMuted}
                  value={inviteToken}
                  onChangeText={setInviteToken}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('inviteToken')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
              <AppIcon name="lock" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Min. 8 characters"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <AppIcon name={showPassword ? 'eyeOff' : 'eye'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
          <PasswordStrengthBar password={password} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={[styles.inputWrapper, focusedInput === 'confirmPassword' && styles.inputWrapperFocused]}>
              <AppIcon name="lock" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Repeat your password"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <AppIcon name={showConfirmPassword ? 'eyeOff' : 'eye'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <LoadingButton
            title={mode === 'invite' ? 'Activate Account' : 'Create Account'}
            loading={isLoading}
            loadingText={mode === 'invite' ? 'Activating Account' : 'Creating Account'}
            onPress={handleRegister}
            style={styles.registerButton}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>

        <Text style={styles.footer}>Diocese of Oke-Osun · Anglican Communion</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
  },
  circle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(201, 168, 76, 0.04)',
    top: -80,
    right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(201, 168, 76, 0.03)',
    bottom: 50,
    left: -60,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: SPACING.md,
  },
  welcomeText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.goldLight,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: SPACING.lg,
  },
  form: {
    flex: 1,
    gap: SPACING.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modeChip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  modeChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
  },
  modeChipText: {
    color: COLORS.textMuted,
    fontWeight: FONTS.weights.semibold,
  },
  modeChipTextActive: {
    color: COLORS.gold,
  },
  errorBox: {
    backgroundColor: 'rgba(201, 76, 76, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.red,
    fontSize: FONTS.sizes.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    fontWeight: FONTS.weights.semibold,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  roleCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
  },
  roleIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  roleLabelActive: {
    color: COLORS.gold,
  },
  roleDesc: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    minHeight: 56,
  },
  inputWrapperFocused: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.surface,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    color: COLORS.textMuted,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    height: '100%',
  },
  registerButton: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.sm,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: COLORS.goldLight,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    letterSpacing: 0.5,
  },
  footer: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    letterSpacing: 1,
    marginTop: SPACING.xl,
  },
});