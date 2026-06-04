/**
 * ForgotPasswordScreen
 * ────────────────────
 * 3-step password reset flow:
 *   Step 1 — Enter email → backend sends 6-digit OTP
 *   Step 2 — Enter OTP  → backend returns a reset_token
 *   Step 3 — Enter new password + confirm → password updated
 *
 * Navigation: Auth stack → ForgotPassword (slide_from_bottom)
 */
import React, { useEffect, useRef, useState } from 'react';
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
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { authApi } from '../../lib/api';
import { translateAuthError } from '../../utils/errorTranslator';
import AppIcon from '../../components/ui/AppIcon';
import PasswordStrengthBar from '../../components/forms/PasswordStrengthBar';

const STEP_LABELS = ['Email', 'Verify Code', 'New Password'];
const RESEND_COOLDOWN_SECONDS = 60;

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const translateError = (err) => {
  try {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      err?.toString?.() ||
      'Something went wrong. Try again.';
    return translateAuthError(message);
  } catch {
    return 'Something went wrong. Try again.';
  }
};

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [focused, setFocused] = useState(null);

  const otpInputRef = useRef(null);
  const newPwdRef = useRef(null);
  const confirmPwdRef = useRef(null);

  const shake = useRef(new Animated.Value(0)).current;
  const resendProgress =
    resendCooldown > 0
      ? (RESEND_COOLDOWN_SECONDS - resendCooldown) / RESEND_COOLDOWN_SECONDS
      : 0;

  useEffect(() => {
    if (!resendCooldown) return;
    const timer = setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 5, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const fail = (msg) => {
    setError(msg);
    triggerShake();
  };

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      fail('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword({ email: normalizedEmail });
      setEmail(normalizedEmail);
      setOtp('');
      setResetToken('');
      setStep(2);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);

      setTimeout(() => {
        otpInputRef.current?.focus?.();
      }, 100);
    } catch (e) {
      fail(translateError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.trim();

    if (code.length !== 6) {
      fail('Enter all 6 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await authApi.verifyResetOtp({
        email: email.trim().toLowerCase(),
        otp: code,
      });

      setResetToken(data.reset_token);
      setStep(3);

      setTimeout(() => {
        newPwdRef.current?.focus?.();
      }, 100);
    } catch (e) {
      fail(translateError(e));
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      fail('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      fail('Password must contain an uppercase letter');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      fail('Password must contain a number');
      return;
    }

    if (newPassword !== confirmPwd) {
      fail('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        reset_token: resetToken,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (e) {
      fail(translateError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError('');

    if (step === 1) {
      navigation.goBack();
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }

    setStep(2);
    setTimeout(() => {
      otpInputRef.current?.focus?.();
    }, 100);
  };

  const StepBar = () => (
    <View style={styles.stepBar}>
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const current = step === n;

        return (
          <React.Fragment key={n}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  done && styles.stepDone,
                  current && styles.stepCurrent,
                ]}
              >
                {done ? (
                  <AppIcon name="check" size={13} color={COLORS.background} />
                ) : (
                  <Text style={[styles.stepNum, current && styles.stepNumActive]}>
                    {n}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  current && styles.stepLabelActive,
                  done && styles.stepLabelDone,
                ]}
              >
                {label}
              </Text>
            </View>
            {i < STEP_LABELS.length - 1 && (
              <View style={[styles.stepLine, step > n && styles.stepLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  const InputBox = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    secureTextEntry,
    right,
    id,
    autoFocus,
    inputRef,
    returnKeyType,
    onSubmitEditing,
    maxLength,
    textContentType,
    autoComplete,
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[styles.inputRow, focused === id && styles.inputRowFocused]}
        pointerEvents="auto"
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          accessibilityLabel={label}
          accessibilityHint={`Enter your ${label.toLowerCase()}`}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          autoFocus={autoFocus}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          textContentType={textContentType}
          autoComplete={autoComplete}
        />
        {right}
      </View>
    </View>
  );

  const OtpInput = () => {
    const digits = Array.from({ length: 6 }, (_, index) => otp[index] || '');

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Reset Code</Text>

        <View
          style={[
            styles.otpContainer,
            focused === 'otp' && styles.inputRowFocused,
          ]}
          pointerEvents="auto"
        >
          <TouchableOpacity
            activeOpacity={0.95}
            style={styles.otpTouchArea}
            onPress={() => otpInputRef.current?.focus?.()}
          >
            {digits.map((digit, index) => {
              const isActive = otp.length === index;
              const isFilled = !!digit;

              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    isFilled && styles.otpBoxFilled,
                    isActive && styles.otpBoxActive,
                  ]}
                >
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              );
            })}
          </TouchableOpacity>

          <TextInput
            ref={otpInputRef}
            value={otp}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
              setOtp(cleaned);
            }}
            style={styles.hiddenOtpInput}
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={6}
            autoCorrect={false}
            autoCapitalize="none"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            importantForAutofill="yes"
            onFocus={() => setFocused('otp')}
            onBlur={() => setFocused(null)}
            onSubmitEditing={handleVerifyOtp}
          />
        </View>

        <Text style={styles.otpHelp}>
          Enter the 6-digit code sent to your email.
        </Text>
      </View>
    );
  };

  if (success) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View pointerEvents="none" style={styles.circle1} />
        <View pointerEvents="none" style={styles.circle2} />

        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Password Reset!</Text>
          <Text style={styles.successMsg}>
            Your password has been updated. You can now sign in with your new password.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.replace('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        nestedScrollEnabled
      >
        <View pointerEvents="none" style={styles.circle1} />
        <View pointerEvents="none" style={styles.circle2} />

        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={step > 1 ? 'Back' : 'Sign In'}
          accessibilityHint={step > 1 ? 'Go back to previous step' : 'Return to the login screen'}
          activeOpacity={0.8}
        >
          <AppIcon name="back" size={22} color={COLORS.gold} />
          <Text style={styles.backText}>{step > 1 ? 'Back' : 'Sign In'}</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Secure reset flow</Text>
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Diocese of Oke-Osun</Text>
          <Text style={styles.stepCounter}>Step {step} of 3</Text>
        </View>

        <StepBar />

        <Animated.View style={[styles.card, { transform: [{ translateX: shake }] }]}>
          {!!error && (
            <View style={styles.errorBox}>
              <AppIcon name="alert" size={16} color={COLORS.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>Enter your email</Text>
              <Text style={styles.stepDesc}>
                We&apos;ll send a 6-digit reset code to your registered email address.
              </Text>

              <InputBox
                id="email"
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoFocus
                autoComplete="email"
                textContentType="emailAddress"
              />

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.stepTitle}>Enter the code</Text>
              <Text style={styles.stepDesc}>
                A 6-digit code was sent to{' '}
                <Text style={styles.highlightText}>{email}</Text>.
                {'\n'}Check your inbox and spam folder.
              </Text>

              <OtpInput />

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify Code</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <TouchableOpacity
                  style={[
                    styles.resendBtn,
                    resendCooldown > 0 && styles.resendBtnDisabled,
                  ]}
                  onPress={() => {
                    if (resendCooldown === 0 && !loading) {
                      setOtp('');
                      setError('');
                      handleSendOtp();
                    }
                  }}
                  disabled={resendCooldown > 0 || loading}
                  accessibilityRole="button"
                  accessibilityLabel={
                    resendCooldown > 0
                      ? `Resend code in ${resendCooldown} seconds`
                      : 'Resend verification code'
                  }
                  accessibilityHint="Resend the reset code to your email"
                  activeOpacity={0.85}
                >
                  <Text style={styles.resendText}>
                    {resendCooldown > 0
                      ? `Try again in ${resendCooldown}s`
                      : `Didn't receive it? Tap to resend`}
                  </Text>
                </TouchableOpacity>

                {resendCooldown > 0 && (
                  <View style={styles.progressBase}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.round(resendProgress * 100)}%` },
                      ]}
                    />
                  </View>
                )}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.stepTitle}>Set new password</Text>
              <Text style={styles.stepDesc}>
                Choose a strong password you haven&apos;t used before.
              </Text>

              <InputBox
                id="newpwd"
                label="New Password"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (error) setError('');
                }}
                placeholder="Min. 8 chars, uppercase, number"
                secureTextEntry={!showPwd}
                autoFocus
                inputRef={newPwdRef}
                returnKeyType="next"
                onSubmitEditing={() => confirmPwdRef.current?.focus?.()}
                right={
                  <TouchableOpacity
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => setShowPwd((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={showPwd ? 'Hide password' : 'Show password'}
                    activeOpacity={0.8}
                  >
                    <AppIcon
                      name={showPwd ? 'eyeOff' : 'eye'}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                }
                textContentType="newPassword"
                autoComplete="password-new"
              />

              <View style={styles.strengthBlock} pointerEvents="none">
                <PasswordStrengthBar password={newPassword} />
              </View>

              <InputBox
                id="confirmpwd"
                label="Confirm Password"
                value={confirmPwd}
                onChangeText={(text) => {
                  setConfirmPwd(text);
                  if (error) setError('');
                }}
                placeholder="Repeat new password"
                secureTextEntry={!showConfirm}
                inputRef={confirmPwdRef}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
                right={
                  <TouchableOpacity
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => setShowConfirm((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    activeOpacity={0.8}
                  >
                    <AppIcon
                      name={showConfirm ? 'eyeOff' : 'eye'}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                }
                textContentType="newPassword"
                autoComplete="password-new"
              />

              {confirmPwd.length > 0 && (
                <View style={styles.matchRow}>
                  <AppIcon
                    name={newPassword === confirmPwd ? 'check' : 'alert'}
                    size={14}
                    color={newPassword === confirmPwd ? COLORS.teal : COLORS.red}
                  />
                  <Text
                    style={[
                      styles.matchText,
                      { color: newPassword === confirmPwd ? COLORS.teal : COLORS.red },
                    ]}
                  >
                    {newPassword === confirmPwd
                      ? 'Passwords match'
                      : 'Passwords do not match'}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.primaryBtnText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

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

  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 24,
    paddingBottom: 120,
  },

  circle1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(201,168,76,0.06)',
    top: -80,
    right: -80,
  },

  circle2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(76,201,168,0.04)',
    bottom: 60,
    left: -60,
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    alignSelf: 'flex-start',
    zIndex: 2,
  },

  backText: {
    color: COLORS.gold,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    marginLeft: 6,
  },

  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  logo: {
    width: 76,
    height: 76,
    marginBottom: SPACING.sm,
  },

  headerBadge: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.22)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
  },

  headerBadgeText: {
    color: COLORS.gold,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.7,
  },

  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black,
    color: COLORS.goldLight,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gold,
    textAlign: 'center',
    letterSpacing: 0.8,
    marginTop: 6,
  },

  stepCounter: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    letterSpacing: 0.6,
  },

  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },

  stepItem: {
    alignItems: 'center',
    width: 82,
  },

  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepCurrent: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },

  stepDone: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },

  stepNum: {
    fontSize: 12,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textMuted,
  },

  stepNumActive: {
    color: COLORS.background,
  },

  stepLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: FONTS.weights.semibold,
    marginTop: 5,
    textAlign: 'center',
  },

  stepLabelActive: {
    color: COLORS.gold,
  },

  stepLabelDone: {
    color: COLORS.teal,
  },

  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginBottom: 14,
    marginHorizontal: 2,
  },

  stepLineDone: {
    backgroundColor: COLORS.teal,
  },

  card: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    zIndex: 3,
  },

  stepTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
    color: COLORS.text,
  },

  stepDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: SPACING.md,
  },

  highlightText: {
    color: COLORS.gold,
    fontWeight: FONTS.weights.semibold,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(201,76,76,0.1)',
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },

  errorText: {
    color: COLORS.red,
    fontSize: FONTS.sizes.sm,
    flex: 1,
    marginLeft: 8,
  },

  inputGroup: {
    marginBottom: SPACING.md,
  },

  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    fontWeight: FONTS.weights.semibold,
    letterSpacing: 0.4,
    marginBottom: 6,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 54,
    zIndex: 1,
  },

  inputRowFocused: {
    borderColor: COLORS.gold,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    height: '100%',
    paddingRight: SPACING.sm,
    minWidth: 0,
  },

  otpContainer: {
    position: 'relative',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 12,
    zIndex: 1,
  },

  otpTouchArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  otpBox: {
    width: 42,
    height: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },

  otpBoxFilled: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(201,168,76,0.08)',
  },

  otpBoxActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(201,168,76,0.12)',
  },

  otpDigit: {
    fontSize: 22,
    fontWeight: FONTS.weights.black,
    color: COLORS.text,
  },

  hiddenOtpInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },

  otpHelp: {
    marginTop: 8,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },

  strengthBlock: {
    marginTop: 2,
    marginBottom: SPACING.md,
    zIndex: 0,
  },

  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  matchText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: FONTS.weights.semibold,
  },

  primaryBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.xl,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    marginTop: SPACING.xs,
  },

  btnDisabled: {
    opacity: 0.5,
  },

  primaryBtnText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.black,
    letterSpacing: 0.5,
  },

  resendContainer: {
    marginTop: SPACING.md,
  },

  resendBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },

  resendBtnDisabled: {
    opacity: 0.5,
  },

  resendText: {
    color: COLORS.gold,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
  },

  progressBase: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    marginTop: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },

  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },

  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76,201,168,0.12)',
    borderWidth: 1,
    borderColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  successEmoji: {
    fontSize: 48,
  },

  successTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black,
    color: COLORS.teal,
    textAlign: 'center',
  },

  successMsg: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: SPACING.lg,
  },

  footer: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    letterSpacing: 0.8,
    marginTop: SPACING.xl,
  },
});