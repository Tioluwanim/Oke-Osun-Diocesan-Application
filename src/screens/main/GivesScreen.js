/**
 * GiveScreen
 * ──────────
 * Refactored to use:
 *   - useGivePayment hook  (all async logic)
 *   - PaymentTypeGrid      (type selector)
 *   - AmountInput          (amount + quick chips)
 *   - ConfirmSheet         (confirm modal)
 *   - ResultModal          (success/fail/pending)
 *   - GivingHistory        (history tab)
 *   - ScreenHeader         (branded header)
 *
 * The screen itself is < 120 lines of JSX — easy to read, easy to extend.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Switch, StyleSheet, StatusBar,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { MIN_AMOUNT } from '../../utils/paymentTypes';

import ScreenHeader       from '../../components/layout/ScreenHeader';
import PaymentTypeGrid    from '../../features/give/components/PaymentTypeGrid';
import AmountInput        from '../../components/forms/AmountInput';
import ConfirmSheet       from '../../features/give/components/ConfirmSheet';
import ResultModal        from '../../features/give/components/ResultModal';
import GivingHistory      from '../../features/give/components/GivingHistory';
import { useGivePayment } from '../../features/give/hooks/useGivePayment';

const TABS = [{ key: 'give', label: 'Give' }, { key: 'history', label: 'History' }];

const SCRIPTURES = [
  { verse: '"Bring the whole tithe into the storehouse…"', ref: '— Malachi 3:10' },
  { verse: '"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."', ref: '— 2 Corinthians 9:7' },
  { verse: '"Give, and it will be given to you. A good measure, pressed down, shaken together and running over…"', ref: '— Luke 6:38' },
  { verse: '"One person gives freely, yet gains even more; another withholds unduly, but comes to poverty."', ref: '— Proverbs 11:24' },
];

export default function GiveScreen() {
  const { user } = useAuth();

  const [activeTab,    setActiveTab]    = useState('give');
  const [verseIdx,     setVerseIdx]     = useState(0);
  const verseFade = useRef(new Animated.Value(1)).current;
  const [selectedType, setSelectedType] = useState('tithe');
  const [amountText,   setAmountText]   = useState('');
  const [description,  setDescription]  = useState('');
  const [anonymous,    setAnonymous]    = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(verseFade, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setVerseIdx(i => (i + 1) % SCRIPTURES.length);
        Animated.timing(verseFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [verseFade]);

  const {
    historyQuery,
    initiateMutation,
    confirmVisible, setConfirmVisible,
    resultVisible,  setResultVisible,
    resultStatus,
    currentRef,
  } = useGivePayment();

  const amount = parseFloat(String(amountText).replace(/[^0-9.]/g, '')) || 0;
  const canPay = amount >= MIN_AMOUNT;

  const handlePay = () => {
    if (!canPay) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setConfirmVisible(true);
  };

  const handleConfirm = () => {
    initiateMutation.mutate({ amount, type: selectedType, description, anonymous });
  };

  const handleResultClose = () => {
    setResultVisible(false);
    if (resultStatus === 'success') {
      setActiveTab('history');
      setAmountText('');
      setDescription('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScreenHeader
        title="Give"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={tab => { Haptics.selectionAsync().catch(() => {}); setActiveTab(tab); }}
      />

      {activeTab === 'give' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardDismissMode="on-drag"
        >
          {/* Rotating Scripture */}
          <Animated.View style={[styles.scripture, { opacity: verseFade }]}>
            <Text style={styles.quote}>{SCRIPTURES[verseIdx].verse}</Text>
            <Text style={styles.ref}>{SCRIPTURES[verseIdx].ref}</Text>
          </Animated.View>

          <Text style={styles.sectionLabel}>I AM GIVING AS A</Text>
          <PaymentTypeGrid selected={selectedType} onSelect={setSelectedType} />

          <Text style={styles.sectionLabel}>DESCRIPTION (OPTIONAL)</Text>
          <TextInput
            style={styles.descInput}
            placeholder="e.g. Thanksgiving for a new job, birthday offering…"
            placeholderTextColor={COLORS.textMuted}
            value={description}
            onChangeText={setDescription}
            maxLength={300}
            multiline
            numberOfLines={2}
          />
          <Text style={styles.charCount}>{description.length}/300</Text>

          <Text style={styles.sectionLabel}>AMOUNT (₦)</Text>
          <AmountInput value={amountText} onChange={setAmountText} />

          {/* Anonymous toggle */}
          <View style={styles.anonRow}>
            <View style={styles.anonInfo}>
              <Text style={styles.anonLabel}>Give anonymously</Text>
              <Text style={styles.anonSub}>Your name won't appear in church records</Text>
            </View>
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              trackColor={{ false: COLORS.border, true: COLORS.goldDim }}
              thumbColor={anonymous ? COLORS.gold : COLORS.textMuted}
            />
          </View>

          {/* Pay button */}
          <TouchableOpacity
            style={[styles.payBtn, !canPay && styles.payBtnDisabled]}
            onPress={handlePay}
            disabled={!canPay || initiateMutation.isPending}
            activeOpacity={0.85}
          >
            <Text style={styles.payBtnText}>
              {canPay ? `Give ₦${Number(amount).toLocaleString('en-NG')}` : 'Enter an amount'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.secure}>🔒 Secured by Paystack · Money goes directly to the Diocese</Text>
          <View style={{ height: 120 }} />
        </ScrollView>

      ) : (
        /* ── History tab ── */
        <View style={styles.historyWrapper}>
          <GivingHistory data={historyQuery.data} isLoading={historyQuery.isLoading} />
        </View>
      )}

      <ConfirmSheet
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={handleConfirm}
        loading={initiateMutation.isPending}
        data={{ amount, type: selectedType, description, anonymous }}
        user={user}
      />

      <ResultModal
        visible={resultVisible}
        status={resultStatus}
        reference={currentRef}
        onClose={handleResultClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  scripture: {
    backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.lg,
    borderLeftWidth: 3, borderLeftColor: COLORS.gold,
  },
  quote: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontStyle: 'italic', lineHeight: 20, marginBottom: 4 },
  ref:   { fontSize: FONTS.sizes.xs, color: COLORS.gold, fontWeight: FONTS.weights.bold },
  sectionLabel: {
    fontSize: 10, color: COLORS.gold, fontWeight: FONTS.weights.black,
    letterSpacing: 1.5, marginBottom: SPACING.sm, marginTop: SPACING.md,
  },
  descInput: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: SPACING.md, color: COLORS.text,
    fontSize: FONTS.sizes.sm, minHeight: 68, textAlignVertical: 'top',
  },
  charCount: { fontSize: 10, color: COLORS.textMuted, textAlign: 'right', marginTop: 3 },
  anonRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.md, marginBottom: SPACING.md,
  },
  anonInfo: { flex: 1 },
  anonLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text },
  anonSub: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  payBtn: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.xl,
    height: 58, justifyContent: 'center', alignItems: 'center',
    marginTop: SPACING.sm, marginBottom: SPACING.xs,
    elevation: 8, shadowColor: COLORS.gold, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },
  payBtnDisabled: { opacity: 0.45 },
  payBtnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, letterSpacing: 0.5 },
  secure: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted, letterSpacing: 0.3 },
  historyWrapper: { flex: 1, paddingHorizontal: SPACING.lg },
});