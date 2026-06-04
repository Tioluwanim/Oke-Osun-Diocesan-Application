/**
 * ForgotPasswordScreen
 * ────────────────────
 * 3-step password reset flow:
 *   Step 1 — Enter email → backend sends 6-digit OTP
 *   Step 2 — Enter OTP  → backend returns a reset_token
 *   Step 3 — Enter new password + confirm → password updated
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { authApi } from '../../lib/api';
import { translateAuthError } from '../../utils/errorTranslator';
import AppIcon from '../../components/ui/AppIcon';
import PasswordStrengthBar from '../../components/forms/PasswordStrengthBar';

// ─────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────
const STEP_LABELS        = ['Email', 'Verify Code', 'New Password'];
const RESEND_COOLDOWN_S  = 60;
const OTP_LENGTH         = 6;

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** Normalize a backend error into a human-readable string.
 *  The backend returns { detail: "..." } — not { message } or { error }. */
const parseError = (e) => {
  try {
    // Fetch-based errors from api.js throw { message, status, data }
    const detail =
      e?.data?.detail ||          // { detail: "..." }  ← FastAPI standard
      e?.data?.message ||
      e?.data?.error ||
      e?.message ||
      '';
    if (detail) return translateAuthError(detail);
    return 'Something went wrong. Please try again.';
  } catch {
    return 'Something went wrong. Please try again.';
  }
};

// ─────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────
export default function ForgotPasswordScreen({ navigation }) {
  // ── Core flow state ──
  const [step,        setStep]        = useState(1);
  const [email,       setEmail]       = useState('');
  const [otp,         setOtp]         = useState(Array(OTP_LENGTH).fill(''));
  const [resetToken,  setResetToken]  = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');

  // ── UI state ──
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);
  const [cooldown,    setCooldown]    = useState(0);
  const [focused,     setFocused]     = useState(null);

  // ── Refs ──
  const otpRefs      = useRef(Array(OTP_LENGTH).fill(null).map(() => React.createRef()));
  const newPwdRef    = useRef(null);
  const confirmRef   = useRef(null);
  const shake        = useRef(new Animated.Value(0)).current;

  // ── Cooldown timer ──
  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // ── Helpers ──
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shake, { toValue:  8, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue:  5, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue:  0, duration: 55, useNativeDriver: true }),
    ]).start();
  }, [shake]);

  const fail = useCallback((msg) => {
    setError(msg);
    triggerShake();
  }, [triggerShake]);

  const clearError = () => { if (error) setError(''); };

  // Full OTP string from array
  const otpString = otp.join('');

  // ─────────────────────────────────────────
  //  STEP HANDLERS
  // ─────────────────────────────────────────

  // Step 1 — send OTP
  const handleSendOtp = useCallback(async () => {
    const normalised = email.trim().toLowerCase();
    if (!isValidEmail(normalised)) { fail('Please enter a valid email address'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: normalised });
      setEmail(normalised);
      setOtp(Array(OTP_LENGTH).fill(''));
      setStep(2);
      setCooldown(RESEND_COOLDOWN_S);
      setTimeout(() => otpRefs.current[0]?.current?.focus?.(), 150);
    } catch (e) {
      fail(parseError(e));
    } finally {
      setLoading(false);
    }
  }, [email, fail]);

  // Step 2 — resend (reuse step 1 handler, just don't advance step)
  const handleResend = useCallback(async () => {
    if (cooldown > 0 || loading) return;
    const normalised = email.trim().toLowerCase();
    if (!isValidEmail(normalised)) {
      fail('Please enter a valid email address');
      return;
    }
    setError('');
    setOtp(Array(OTP_LENGTH).fill(''));
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: normalised });
      setCooldown(RESEND_COOLDOWN_S);
      setTimeout(() => otpRefs.current[0]?.current?.focus?.(), 150);
    } catch (e) {
      fail(parseError(e));
    } finally {
      setLoading(false);
    }
  }, [cooldown, loading, email, fail]);

  // Step 2 — verify OTP
  const handleVerifyOtp = useCallback(async () => {
    if (otpString.length !== OTP_LENGTH) { fail(`Enter all ${OTP_LENGTH} digits`); return; }
    setError('');
    setLoading(true);
    try {
      const data = await authApi.verifyResetOtp({
        email: email.trim().toLowerCase(),
        otp:   otpString,
      });
      setResetToken(data.reset_token);
      setStep(3);
      setTimeout(() => newPwdRef.current?.focus?.(), 150);
    } catch (e) {
      fail(parseError(e));
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => otpRefs.current[0]?.current?.focus?.(), 150);
    } finally {
      setLoading(false);
    }
  }, [otpString, email, fail]);

  // Step 3 — reset password
  const handleResetPassword = useCallback(async () => {
    if (newPassword.length < 8)           { fail('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(newPassword))       { fail('Password must contain an uppercase letter'); return; }
    if (!/[0-9]/.test(newPassword))       { fail('Password must contain a number'); return; }
    if (newPassword !== confirmPwd)        { fail('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword({
        email:        email.trim().toLowerCase(),
        reset_token:  resetToken,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (e) {
      fail(parseError(e));
    } finally {
      setLoading(false);
    }
  }, [newPassword, confirmPwd, email, resetToken, fail]);

  // Back button
  const handleBack = () => {
    setError('');
    if (step === 1) { navigation.goBack(); return; }
    if (step === 2) { setStep(1); return; }
    setStep(2);
    setTimeout(() => otpRefs.current[0]?.current?.focus?.(), 150);
  };

  // ─────────────────────────────────────────
  //  OTP BOX HANDLER
  // ─────────────────────────────────────────
  const handleOtpChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);
    clearError();
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.current?.focus?.();
    }
    // Auto-submit when all filled
    if (digit && index === OTP_LENGTH - 1 && next.every((d) => d !== '')) {
      Keyboard.dismiss();
      setTimeout(handleVerifyOtp, 100);
    }
  };

  const handleOtpKeyPress = (key, index) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
      otpRefs.current[index - 1]?.current?.focus?.();
    }
  };

  // ─────────────────────────────────────────
  //  SUCCESS SCREEN
  // ─────────────────────────────────────────
  if (success) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View pointerEvents="none" style={styles.circle1} />
        <View pointerEvents="none" style={styles.circle2} />
        <View style={styles.successWrap}>
          <View style={styles.successIconCircle}>
            <AppIcon name="check" size={44} color={COLORS.teal} />
          </View>
          <Text style={styles.successTitle}>Password Reset!</Text>
          <Text style={styles.successMsg}>
            Your password has been updated successfully.{'\n'}Sign in with your new password.
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

  // ─────────────────────────────────────────
  //  MAIN RENDER
  // ─────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View pointerEvents="none" style={styles.circle1} />
        <View pointerEvents="none" style={styles.circle2} />

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.8}>
          <AppIcon name="back" size={22} color={COLORS.gold} />
          <Text style={styles.backText}>{step > 1 ? 'Back' : 'Sign In'}</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Secure Reset Flow</Text>
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Diocese of Oke-Osun</Text>
        </View>

        {/* Step bar */}
        <StepBar step={step} />

        {/* Card */}
        <Animated.View style={[styles.card, { transform: [{ translateX: shake }] }]}>

          {/* Error box */}
          {!!error && (
            <View style={styles.errorBox}>
              <AppIcon name="alert" size={16} color={COLORS.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── STEP 1: Email ── */}
          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>Enter your email</Text>
              <Text style={styles.stepDesc}>
                We'll send a 6-digit reset code to your registered email address.
              </Text>
              <InputBox
                id="email"
                label="Email Address"
                value={email}
                onChangeText={(t) => { setEmail(t); clearError(); }}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoFocus
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
                focused={focused}
                setFocused={setFocused}
              />
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.background} />
                  : <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                }
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 2 && (
            <>
              <Text style={styles.stepTitle}>Check your email</Text>
              <Text style={styles.stepDesc}>
                A 6-digit code was sent to{' '}
                <Text style={styles.highlight}>{email}</Text>.
                {'\n'}Check your inbox and spam folder.
              </Text>

              {/* 6-box OTP input */}
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={otpRefs.current[i]}
                    style={[
                      styles.otpBox,
                      digit            && styles.otpBoxFilled,
                      focused === `otp${i}` && styles.otpBoxFocused,
                    ]}
                    value={digit}
                    onChangeText={(t) => handleOtpChange(t, i)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                    onFocus={() => setFocused(`otp${i}`)}
                    onBlur={() => setFocused(null)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    textContentType="oneTimeCode"
                    autoComplete={i === 0 ? 'sms-otp' : 'off'}
                    caretHidden
                  />
                ))}
              </View>

              {/* Verify button */}
              <TouchableOpacity
                style={[styles.primaryBtn, (loading || otpString.length < OTP_LENGTH) && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading || otpString.length < OTP_LENGTH}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.background} />
                  : <Text style={styles.primaryBtnText}>Verify Code</Text>
                }
              </TouchableOpacity>

              {/* Resend */}
              <View style={styles.resendWrap}>
                <TouchableOpacity
                  style={[styles.resendBtn, (cooldown > 0 || loading) && styles.resendDisabled]}
                  onPress={handleResend}
                  disabled={cooldown > 0 || loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resendText}>
                    {cooldown > 0
                      ? `Resend code in ${cooldown}s`
                      : "Didn't receive it? Resend"
                    }
                  </Text>
                </TouchableOpacity>
                {cooldown > 0 && (
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(cooldown / RESEND_COOLDOWN_S) * 100}%` },
                      ]}
                    />
                  </View>
                )}
              </View>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 3 && (
            <>
              <Text style={styles.stepTitle}>Set new password</Text>
              <Text style={styles.stepDesc}>
                Choose a strong password you haven't used before.
              </Text>

              <InputBox
                id="newpwd"
                label="New Password"
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); clearError(); }}
                placeholder="Min. 8 chars, uppercase + number"
                secureTextEntry={!showPwd}
                autoFocus
                inputRef={newPwdRef}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus?.()}
                textContentType="newPassword"
                autoComplete="password-new"
                focused={focused}
                setFocused={setFocused}
                right={
                  <TouchableOpacity
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    onPress={() => setShowPwd((v) => !v)}
                    activeOpacity={0.8}
                  >
                    <AppIcon name={showPwd ? 'eyeOff' : 'eye'} size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                }
              />
              <View style={styles.strengthWrap} pointerEvents="none">
                <PasswordStrengthBar password={newPassword} />
              </View>

              <InputBox
                id="confirmpwd"
                label="Confirm Password"
                value={confirmPwd}
                onChangeText={(t) => { setConfirmPwd(t); clearError(); }}
                placeholder="Repeat new password"
                secureTextEntry={!showConfirm}
                inputRef={confirmRef}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
                textContentType="newPassword"
                autoComplete="password-new"
                focused={focused}
                setFocused={setFocused}
                right={
                  <TouchableOpacity
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    onPress={() => setShowConfirm((v) => !v)}
                    activeOpacity={0.8}
                  >
                    <AppIcon name={showConfirm ? 'eyeOff' : 'eye'} size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                }
              />

              {/* Match indicator */}
              {confirmPwd.length > 0 && (
                <View style={styles.matchRow}>
                  <AppIcon
                    name={newPassword === confirmPwd ? 'check' : 'alert'}
                    size={14}
                    color={newPassword === confirmPwd ? COLORS.teal : COLORS.red}
                  />
                  <Text style={[styles.matchText, { color: newPassword === confirmPwd ? COLORS.teal : COLORS.red }]}>
                    {newPassword === confirmPwd ? 'Passwords match' : 'Passwords do not match'}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.background} />
                  : <Text style={styles.primaryBtnText}>Reset Password</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        <Text style={styles.footer}>Diocese of Oke-Osun · Anglican Communion</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────

function StepBar({ step }) {
  return (
    <View style={styles.stepBar}>
      {STEP_LABELS.map((label, i) => {
        const n       = i + 1;
        const done    = step > n;
        const current = step === n;
        return (
          <React.Fragment key={n}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, done && styles.stepDone, current && styles.stepCurrent]}>
                {done
                  ? <AppIcon name="check" size={13} color={COLORS.background} />
                  : <Text style={[styles.stepNum, current && styles.stepNumActive]}>{n}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, current && styles.stepLabelActive, done && styles.stepLabelDone]}>
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
}

function InputBox({
  id, label, value, onChangeText, placeholder, keyboardType = 'default',
  secureTextEntry, right, autoFocus, inputRef, returnKeyType, onSubmitEditing,
  textContentType, autoComplete, focused, setFocused,
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, focused === id && styles.inputRowFocused]}>
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
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          autoFocus={autoFocus}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          textContentType={textContentType}
          autoComplete={autoComplete}
          underlineColorAndroid="transparent"
        />
        {right && <View style={{ paddingLeft: SPACING.sm }}>{right}</View>}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background },
  scroll:     { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: 24, paddingBottom: 120 },

  circle1: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(201,168,76,0.06)', top: -80, right: -80 },
  circle2: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(76,201,168,0.04)', bottom: 60, left: -60 },

  backBtn:  { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, alignSelf: 'flex-start', zIndex: 2 },
  backText: { color: COLORS.gold, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, marginLeft: 6 },

  header:          { alignItems: 'center', marginBottom: SPACING.md },
  logo:            { width: 76, height: 76, marginBottom: SPACING.sm },
  headerBadge:     { backgroundColor: 'rgba(201,168,76,0.12)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.22)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginBottom: SPACING.sm },
  headerBadgeText: { color: COLORS.gold, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, letterSpacing: 0.7 },
  title:           { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.goldLight, textAlign: 'center', letterSpacing: 0.5 },
  subtitle:        { fontSize: FONTS.sizes.xs, color: COLORS.gold, textAlign: 'center', letterSpacing: 0.8, marginTop: 6 },

  // Step bar
  stepBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  stepItem:        { alignItems: 'center', width: 82 },
  stepCircle:      { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  stepCurrent:     { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  stepDone:        { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  stepNum:         { fontSize: 12, fontWeight: FONTS.weights.bold, color: COLORS.textMuted },
  stepNumActive:   { color: COLORS.background },
  stepLabel:       { fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold, marginTop: 5, textAlign: 'center' },
  stepLabelActive: { color: COLORS.gold },
  stepLabelDone:   { color: COLORS.teal },
  stepLine:        { flex: 1, height: 2, backgroundColor: COLORS.border, marginBottom: 14, marginHorizontal: 2 },
  stepLineDone:    { backgroundColor: COLORS.teal },

  // Card
  card: { backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, zIndex: 3 },

  stepTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.text },
  stepDesc:  { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: 20, marginTop: 6, marginBottom: SPACING.md },
  highlight: { color: COLORS.gold, fontWeight: FONTS.weights.semibold },

  // Error
  errorBox:  { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(201,76,76,0.1)', borderWidth: 1, borderColor: COLORS.red, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, gap: 8 },
  errorText: { color: COLORS.red, fontSize: FONTS.sizes.sm, flex: 1 },

  // Input
  inputGroup:      { marginBottom: SPACING.md },
  label:           { fontSize: FONTS.sizes.sm, color: COLORS.textLight, fontWeight: FONTS.weights.semibold, letterSpacing: 0.4, marginBottom: 6 },
  inputRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, height: 54 },
  inputRowFocused: { borderColor: COLORS.gold },
  input:           { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md, height: '100%', minWidth: 0 },

  // OTP boxes
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg, gap: 8 },
  otpBox: {
    flex: 1, height: 56, borderRadius: RADIUS.lg, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.surface,
    textAlign: 'center', fontSize: 22, fontWeight: FONTS.weights.black,
    color: COLORS.text,
  },
  otpBoxFocused: { borderColor: COLORS.gold, backgroundColor: 'rgba(201,168,76,0.06)' },
  otpBoxFilled:  { borderColor: COLORS.teal, backgroundColor: 'rgba(76,201,168,0.06)' },

  // Primary button
  primaryBtn:     { backgroundColor: COLORS.gold, borderRadius: RADIUS.xl, height: 56, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: COLORS.gold, shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, marginTop: SPACING.xs },
  btnDisabled:    { opacity: 0.5 },
  primaryBtnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, letterSpacing: 0.5 },

  // Resend
  resendWrap:    { marginTop: SPACING.md, alignItems: 'center' },
  resendBtn:     { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  resendDisabled:{ opacity: 0.5 },
  resendText:    { color: COLORS.gold, fontSize: FONTS.sizes.sm, textAlign: 'center' },
  progressTrack: { width: '100%', height: 4, borderRadius: 2, backgroundColor: COLORS.surface, overflow: 'hidden', marginTop: 8 },
  progressFill:  { height: '100%', backgroundColor: COLORS.gold, borderRadius: 2 },

  // Password step
  strengthWrap: { marginTop: 2, marginBottom: SPACING.md },
  matchRow:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.md },
  matchText:    { fontSize: 12, fontWeight: FONTS.weights.semibold },

  // Success
  successWrap:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(76,201,168,0.12)', borderWidth: 1, borderColor: COLORS.teal, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  successTitle:      { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.teal, textAlign: 'center' },
  successMsg:        { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: SPACING.lg },

  footer: { textAlign: 'center', color: COLORS.textMuted, fontSize: FONTS.sizes.xs, letterSpacing: 0.8, marginTop: SPACING.xl },
});
