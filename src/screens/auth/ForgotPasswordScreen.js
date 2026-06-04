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
import React, { useRef, useState } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Animated,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { API_ROUTES } from '../../constants/config';
import { authApi } from '../../lib/api';
import { translateAuthError } from '../../utils/errorTranslator';
import AppIcon from '../../components/ui/AppIcon';
import PasswordStrengthBar, { getPasswordStrength } from '../../components/forms/PasswordStrengthBar';

// ── helpers ──────────────────────────────────────────────────
const translateError = (err) => {
  try { return translateAuthError(err.message || err.toString()); } catch { return 'Something went wrong. Try again.'; }
};

const STEP_LABELS = ['Email', 'Verify Code', 'New Password'];

// ── main component ────────────────────────────────────────────
export default function ForgotPasswordScreen({ navigation }) {
  const [step,        setStep]        = useState(1);   // 1 | 2 | 3
  const [email,       setEmail]       = useState('');
  const [otp,         setOtp]         = useState('');
  const [resetToken,  setResetToken]  = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [focused,     setFocused]     = useState(null);

  // OTP digit refs for auto-advance
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [otpDigits, setOtpDigits] = useState(['','','','','','']);
  const newPwdRef = useRef();
  const confirmPwdRef = useRef();

  // Shake animation for error
  const shake = useRef(new Animated.Value(0)).current;
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 8,  duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 5,  duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,  duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const fail = (msg) => { setError(msg); triggerShake(); };

  // ── Step 1 — send OTP ──
  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      fail('Please enter a valid email address'); return;
    }
    setError(''); setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      setStep(2);
      setResendCooldown(60);
    } catch (e) { fail(translateError(e)); }
    finally { setLoading(false); }
  };

  // ── Step 2 — verify OTP ──
  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) { fail('Enter all 6 digits'); return; }
    setError(''); setLoading(true);
    try {
      const data = await authApi.verifyResetOtp({ email: email.trim().toLowerCase(), otp: code });
      setResetToken(data.reset_token);
      setStep(3);
    } catch (e) {
      fail(translateError(e));
      // clear OTP on wrong code
      setOtpDigits(['','','','','','']);
      otpRefs[0].current?.focus();
    } finally { setLoading(false); }
  };

  // ── Step 3 — set new password ──
  const handleResetPassword = async () => {
    if (newPassword.length < 8)  { fail('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(newPassword)) { fail('Password must contain an uppercase letter'); return; }
    if (!/[0-9]/.test(newPassword)) { fail('Password must contain a number'); return; }
    if (newPassword !== confirmPwd)  { fail('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.resetPassword({ email: email.trim().toLowerCase(), reset_token: resetToken, new_password: newPassword });
      setSuccess(true);
    } catch (e) { fail(translateError(e)); }
    finally { setLoading(false); }
  };

  // Resend cooldown timer
  React.useEffect(() => {
    if (!resendCooldown) return;
    const t = setInterval(() => setResendCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // ── OTP digit input handler ──
  const handleOtpChange = (text, idx) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next  = [...otpDigits];
    next[idx]   = digit;
    setOtpDigits(next);
    if (digit && idx < 5) otpRefs[idx + 1].current?.focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  // ── Strength bar ──
  const strength = getPasswordStrength(newPassword);

  // ── Success screen ──
  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}><Text style={{ fontSize: 48 }}>✅</Text></View>
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

  // ── Step progress indicator ──
  const StepBar = () => (
    <View style={styles.stepBar}>
      {STEP_LABELS.map((label, i) => {
        const n       = i + 1;
        const done    = step > n;
        const current = step === n;
        return (
          <React.Fragment key={n}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                done    && styles.stepDone,
                current && styles.stepCurrent,
              ]}>
                {done
                  ? <AppIcon name="check" size={13} color={COLORS.background} />
                  : <Text style={[styles.stepNum, current && { color: COLORS.background }]}>{n}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, current && { color: COLORS.gold }]}>{label}</Text>
            </View>
            {i < 2 && (
              <View style={[styles.stepLine, step > n && styles.stepLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // ── Input wrapper ──
  const InputBox = ({ label, value, onChangeText, placeholder, keyboardType = 'default',
    secureTextEntry, right, id, autoFocus, inputRef, returnKeyType, onSubmitEditing }) => (
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
        />
        {right}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {/* Background circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        {/* Header */}
        <TouchableOpacity style={styles.backBtn} onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}>
          <AppIcon name="back" size={22} color={COLORS.gold} />
          <Text style={styles.backText}>{step > 1 ? 'Back' : 'Sign In'}</Text>
        </TouchableOpacity>

        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Diocese of Oke-Osun</Text>

        <StepBar />

        <Animated.View style={[styles.card, { transform: [{ translateX: shake }] }]}>

          {/* ── Error box ── */}
          {!!error && (
            <View style={styles.errorBox}>
              <AppIcon name="alert" size={16} color={COLORS.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ════════ STEP 1 — EMAIL ════════ */}
          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>Enter your email</Text>
              <Text style={styles.stepDesc}>
                We'll send a 6-digit reset code to your registered email address.
              </Text>
              <InputBox
                id="email" label="Email Address"
                value={email} onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoFocus
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

          {/* ════════ STEP 2 — OTP ════════ */}
          {step === 2 && (
            <>
              <Text style={styles.stepTitle}>Enter the code</Text>
              <Text style={styles.stepDesc}>
                A 6-digit code was sent to{' '}
                <Text style={{ color: COLORS.gold }}>{email}</Text>.
                {'\n'}Check your inbox (and spam folder).
              </Text>

              <View style={styles.otpRow}>
                {otpDigits.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={otpRefs[idx]}
                    style={[styles.otpBox, digit && styles.otpBoxFilled]}
                    value={digit}
                    onChangeText={t => handleOtpChange(t, idx)}
                    onKeyPress={e => handleOtpKey(e, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                    caretHidden
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.background} />
                  : <Text style={styles.primaryBtnText}>Verify Code</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resendBtn, resendCooldown > 0 && styles.resendBtnDisabled]}
                onPress={() => { if (resendCooldown === 0) { setOtpDigits(['','','','','','']); setError(''); handleSendOtp(); } }}
                accessibilityLabel={resendCooldown > 0 ? `Resend disabled for ${resendCooldown} seconds` : 'Resend code'}
              >
                <Text style={styles.resendText}>{resendCooldown > 0 ? `Try again in ${resendCooldown}s` : `Didn't receive it? Try again`}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ════════ STEP 3 — NEW PASSWORD ════════ */}
          {step === 3 && (
            <>
              <Text style={styles.stepTitle}>Set new password</Text>
              <Text style={styles.stepDesc}>
                Choose a strong password you haven't used before.
              </Text>

              <InputBox
                id="newpwd" label="New Password"
                value={newPassword} onChangeText={setNewPassword}
                placeholder="Min. 8 chars, uppercase, number"
                secureTextEntry={!showPwd}
                autoFocus
                inputRef={newPwdRef}
                returnKeyType="next"
                onSubmitEditing={() => confirmPwdRef.current?.focus()}
                right={
                  <TouchableOpacity onPress={() => setShowPwd(v => !v)}>
                    <AppIcon name={showPwd ? 'eyeOff' : 'eye'} size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                }
              />

              <PasswordStrengthBar password={newPassword} />

              <InputBox
                id="confirmpwd" label="Confirm Password"
                value={confirmPwd} onChangeText={setConfirmPwd}
                placeholder="Repeat new password"
                secureTextEntry={!showConfirm}
                inputRef={confirmPwdRef}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
                right={
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                    <AppIcon name={showConfirm ? 'eyeOff' : 'eye'} size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                }
              />

              {confirmPwd.length > 0 && (
                <View style={styles.matchRow}>
                  <AppIcon
                    name={newPassword === confirmPwd ? 'check' : 'alert'}
                    size={14}
                    color={newPassword === confirmPwd ? COLORS.teal : COLORS.red}
                  />
                  <Text style={{ fontSize: 12, color: newPassword === confirmPwd ? COLORS.teal : COLORS.red, marginLeft: 4 }}>
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

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  scroll:      { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: 48, paddingBottom: SPACING.xl },
  circle1:     { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(201,168,76,0.06)', top: -80, right: -80 },
  circle2:     { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(76,201,168,0.04)', bottom: 60, left: -60 },
  backBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.xl, alignSelf: 'flex-start' },
  backText:    { color: COLORS.gold, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  logo:        { width: 72, height: 72, alignSelf: 'center', marginBottom: SPACING.md },
  title:       { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.goldLight, textAlign: 'center', letterSpacing: 0.5 },
  subtitle:    { fontSize: FONTS.sizes.xs, color: COLORS.gold, textAlign: 'center', letterSpacing: 0.8, marginBottom: SPACING.lg },

  // Step bar
  stepBar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  stepItem:    { alignItems: 'center', gap: 4 },
  stepCircle:  { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  stepCurrent: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  stepDone:    { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  stepNum:     { fontSize: 12, fontWeight: FONTS.weights.bold, color: COLORS.textMuted },
  stepLabel:   { fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  stepLine:    { flex: 1, height: 2, backgroundColor: COLORS.border, marginBottom: 14, marginHorizontal: 4 },
  stepLineDone:{ backgroundColor: COLORS.teal },

  // Card
  card:        { backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, gap: SPACING.sm },
  stepTitle:   { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.text },
  stepDesc:    { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: 20 },

  // Error
  errorBox:    { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.xs, backgroundColor: 'rgba(201,76,76,0.1)', borderWidth: 1, borderColor: COLORS.red, borderRadius: RADIUS.md, padding: SPACING.md },
  errorText:   { color: COLORS.red, fontSize: FONTS.sizes.sm, flex: 1 },

  // Inputs
  inputGroup:  { gap: 6 },
  label:       { fontSize: FONTS.sizes.sm, color: COLORS.textLight, fontWeight: FONTS.weights.semibold, letterSpacing: 0.4 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, height: 54 },
  inputRowFocused: { borderColor: COLORS.gold },
  input:       { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md, height: '100%' },

  // OTP
  otpRow:      { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm },
  otpBox:      { flex: 1, height: 54, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text, textAlign: 'center' },
  otpBoxFilled:{ borderColor: COLORS.gold, backgroundColor: 'rgba(201,168,76,0.08)' },

  // Strength
  strengthWrap:  { gap: 6 },
  strengthTrack: { flexDirection: 'row', gap: 5 },
  strengthSeg:   { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: FONTS.weights.bold },

  // Match row
  matchRow: { flexDirection: 'row', alignItems: 'center' },

  // Buttons
  primaryBtn:     { backgroundColor: COLORS.gold, borderRadius: RADIUS.xl, height: 56, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: COLORS.gold, shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  btnDisabled:    { opacity: 0.5 },
  primaryBtnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, letterSpacing: 0.5 },
  resendBtn:      { alignItems: 'center', paddingVertical: SPACING.sm },
  resendText:     { color: COLORS.gold, fontSize: FONTS.sizes.sm },

  // Success
  successWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, gap: SPACING.md },
  successIcon:  { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(76,201,168,0.12)', borderWidth: 1, borderColor: COLORS.teal, justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.teal },
  successMsg:   { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },

  footer: { textAlign: 'center', color: COLORS.textMuted, fontSize: FONTS.sizes.xs, letterSpacing: 0.8, marginTop: SPACING.xl },
});