import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { authApi } from '../../lib/api';
import AppIcon from '../../components/ui/AppIcon';

export default function PendingApprovalScreen({ navigation, route }) {
  const user = route?.params?.user;
  const email = user?.email;
  const { data, isFetching, error } = useQuery({
    queryKey: ['approval-status', email],
    queryFn: () => authApi.approvalStatus(email),
    enabled: Boolean(email),
    refetchInterval: 15000,
    staleTime: 0,
  });

  useEffect(() => {
    if (data?.approved) navigation.replace('Login', { approvedEmail: email });
  }, [data?.approved, email, navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Approval Required</Text>
        <Text style={styles.subtitle}>Your clergy account has been created successfully.</Text>

        <View style={styles.card}>
          <View style={styles.statusIcon}>
            <AppIcon name={data?.approved ? 'check' : 'time'} size={34} color={data?.approved ? COLORS.teal : COLORS.gold} />
          </View>
          <Text style={styles.statusTitle}>Waiting for Administrator Approval</Text>
          <Text style={styles.message}>
            A diocesan administrator must review and approve your clergy account before you can access the platform.
          </Text>
          {email ? <Text style={styles.email}>Account: {email}</Text> : null}
          <Text style={styles.smallText}>
            {isFetching ? 'Checking approval status...' : 'You will be able to sign in once your account has been approved.'}
          </Text>
          {isFetching ? <ActivityIndicator color={COLORS.gold} /> : null}
          {error ? <Text style={styles.errorText}>Unable to refresh right now. We will keep trying.</Text> : null}
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.replace('Login')} accessibilityRole="button">
          <Text style={styles.loginButtonText}>Return to Login</Text>
        </TouchableOpacity>
        <Text style={styles.footer}>Diocese of Oke-Osun - Anglican Communion</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: 70, paddingBottom: SPACING.xl },
  circle1: { position: 'absolute', width: 340, height: 340, borderRadius: 170, backgroundColor: 'rgba(201,168,76,0.06)', top: -110, right: -100 },
  circle2: { position: 'absolute', width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(76,201,168,0.05)', bottom: 80, left: -80 },
  logo: { width: 96, height: 96, marginBottom: SPACING.lg },
  title: { fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.black, color: COLORS.goldLight, textAlign: 'center' },
  subtitle: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.xl },
  card: { width: '100%', backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  statusIcon: { width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  statusTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, textAlign: 'center' },
  message: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, textAlign: 'center', lineHeight: 21 },
  email: { color: COLORS.gold, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, marginTop: SPACING.sm },
  smallText: { color: COLORS.textLight, fontSize: FONTS.sizes.xs, textAlign: 'center', lineHeight: 18 },
  errorText: { color: COLORS.red, fontSize: FONTS.sizes.xs, textAlign: 'center' },
  loginButton: { width: '100%', height: 54, borderRadius: RADIUS.lg, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  loginButtonText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  footer: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: SPACING.xl, textAlign: 'center' },
});
