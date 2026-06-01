import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import LoadingButton from '../../components/ui/LoadingButton';
import SkeletonList from '../../components/ui/SkeletonList';
import EmptyState from '../../components/ui/EmptyState';
import { adminApi, liveApi, queryKeys, queryFns } from '../../lib/api';

const formatDate = (value) => {
  if (!value) return 'Now';
  try {
    return new Date(value).toDateString();
  } catch {
    return value;
  }
};

export default function AdminHomeScreen({ navigation }) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [liveModal, setLiveModal] = useState(false);
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDescription, setLiveDescription] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [liveDate, setLiveDate] = useState('');
  const [liveTime, setLiveTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: userResponse, isLoading: usersLoading } = useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: () => adminApi.fetchUsers(token),
    enabled: !!token,
  });
  const { data: parishes = [], isLoading: parishesLoading } = useQuery({
    queryKey: queryKeys.parishes,
    queryFn: queryFns.parishes,
  });
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: queryKeys.events,
    queryFn: queryFns.events,
  });
  const { data: liveStream, isLoading: liveLoading } = useQuery({
    queryKey: queryKeys.live,
    queryFn: queryFns.live,
  });
  const { data: auditResponse, isLoading: auditLoading } = useQuery({
    queryKey: queryKeys.auditLogs,
    queryFn: () => adminApi.fetchAuditLogs(token),
    enabled: !!token,
  });

  const users = userResponse?.users || [];
  const auditLogs = auditResponse?.logs || [];
  const stats = useMemo(() => {
    const clergyCount = users.filter((item) => item.role === 'clergy').length;
    const memberCount = users.filter((item) => item.role === 'member').length;
    return [
      { label: 'Parishes', value: String(parishes.length), color: COLORS.gold, icon: 'church' },
      { label: 'Clergy', value: String(clergyCount), color: COLORS.teal, icon: 'church' },
      { label: 'Members', value: String(memberCount), color: COLORS.blue, icon: 'people-outline' },
      { label: 'Events', value: String(events.length), color: COLORS.red, icon: 'calendar' },
    ];
  }, [parishes.length, users, events.length]);

  const pendingClergy = useMemo(
    () => users.filter((item) => item.role === 'clergy' && item.status === 'pending'),
    [users]
  );

  const parishOverview = useMemo(() => {
    const counts = users.reduce((acc, current) => {
      const key = current.parish || 'Unassigned';
      acc[key] = acc[key] || { members: 0, clergy: 0 };
      if (current.role === 'clergy') acc[key].clergy += 1;
      if (current.role === 'member') acc[key].members += 1;
      return acc;
    }, {});

    return parishes.map((parish) => ({
      ...parish,
      memberCount: counts[parish.name]?.members || 0,
      clergyCount: counts[parish.name]?.clergy || 0,
    })).slice(0, 5);
  }, [parishes, users]);

  const recentActivity = useMemo(() => {
    const items = auditLogs.slice(0, 4).map((log) => ({
      id: log.id,
      title: log.action?.replaceAll('_', ' ') || 'Admin action',
      body: log.details || log.targetEmail || 'Recent update',
      time: formatDate(log.timestamp),
      color: COLORS.red,
    }));

    if (liveStream?.updatedAt) {
      items.unshift({
        id: 'live-status',
        title: liveStream.isLive ? 'Live stream is active' : 'Live stream is offline',
        body: liveStream.title || 'Sunday Service',
        time: formatDate(liveStream.updatedAt),
        color: liveStream.isLive ? COLORS.teal : COLORS.gold,
      });
    }

    return items.slice(0, 4);
  }, [auditLogs, liveStream]);

  const isLoading = usersLoading || parishesLoading || eventsLoading || liveLoading || auditLoading;

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers }),
      queryClient.invalidateQueries({ queryKey: queryKeys.parishes }),
      queryClient.invalidateQueries({ queryKey: queryKeys.events }),
      queryClient.invalidateQueries({ queryKey: queryKeys.live }),
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs }),
    ]);
    setRefreshing(false);
  };

  const handleApprove = async (userId) => {
    try {
      await adminApi.approveUser(userId, token);
      await refreshAll();
      Alert.alert('Approved', 'Clergy account has been approved.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to approve user');
    }
  };

  const openLiveModal = () => {
    setLiveTitle(liveStream?.title || '');
    setLiveDescription(liveStream?.description || '');
    setLiveUrl(liveStream?.youtubeUrl || '');
    setLiveDate(liveStream?.scheduledDate || '');
    setLiveTime(liveStream?.scheduledTime || '');
    setLiveModal(true);
  };

  const handleSaveLive = async () => {
    if (!liveTitle.trim() || !liveUrl.trim()) {
      Alert.alert('Error', 'Title and YouTube URL are required.');
      return;
    }

    setSubmitting(true);
    try {
      await liveApi.updateLive({
        title: liveTitle.trim(),
        description: liveDescription.trim() || null,
        youtubeUrl: liveUrl.trim(),
        scheduledDate: liveDate.trim() || null,
        scheduledTime: liveTime.trim() || null,
      }, token);
      await refreshAll();
      setLiveModal(false);
      Alert.alert('Updated', 'Live stream details saved successfully.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to update live stream');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLive = async () => {
    try {
      await liveApi.toggleLive(token);
      await refreshAll();
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to update live status');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={styles.headerGreeting}>Welcome, {user?.fullName?.split(' ')[0] || 'Admin'} 👋</Text>
            <Text style={styles.headerSubtitle}>Admin Control Panel</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor={COLORS.red}
            colors={[COLORS.red]}
          />
        )}
      >
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Admin Actions" />
        <View style={styles.quickActionsGrid}>
          <QuickAction label="Manage Users" icon="👥" onPress={() => navigation.navigate('UserManagement')} />
          <QuickAction label="Manage Content" icon="🛡" onPress={() => navigation.navigate('Manage')} />
          <QuickAction label="Live Setup" icon="📺" onPress={openLiveModal} />
          <QuickAction label={liveStream?.isLive ? 'Stop Live' : 'Go Live'} icon="🔴" onPress={handleToggleLive} />
        </View>

        <SectionHeader title="Pending Clergy Approvals" badge={pendingClergy.length ? String(pendingClergy.length) : null} />
        {isLoading ? (
          <SkeletonList count={3} itemHeight={90} lines={3} />
        ) : pendingClergy.length ? (
          pendingClergy.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.fullName}</Text>
                  <Text style={styles.cardMeta}>{item.email}</Text>
                  <Text style={styles.cardMeta}>{item.parish || 'No parish assigned'}</Text>
                </View>
                <TouchableOpacity style={styles.primaryChip} onPress={() => handleApprove(item.id)}>
                  <Text style={styles.primaryChipText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon="✅" title="No pending approvals" description="All clergy registrations are up to date." />
        )}

        <SectionHeader title="Parish Overview" />
        {isLoading ? (
          <SkeletonList count={3} itemHeight={82} lines={3} />
        ) : parishOverview.length ? (
          parishOverview.map((parish) => (
            <View key={parish.id} style={styles.card}>
              <Text style={styles.cardTitle}>{parish.name}</Text>
              <Text style={styles.cardMeta}>{parish.location || 'Location pending'}</Text>
              <Text style={styles.cardMeta}>{parish.memberCount} members • {parish.clergyCount} clergy • {parish.status || 'active'}</Text>
            </View>
          ))
        ) : (
          <EmptyState icon="⛪" title="No parishes yet" description="Create parish records to populate this dashboard." />
        )}

        <SectionHeader title="Recent Activity" />
        {isLoading ? (
          <SkeletonList count={3} itemHeight={82} lines={3} />
        ) : recentActivity.length ? (
          recentActivity.map((item) => (
            <View key={item.id} style={styles.activityCard}>
              <View style={[styles.activityAccent, { backgroundColor: item.color }]} />
              <View style={styles.activityBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>{item.body}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon="📝" title="No recent activity" description="Admin actions will appear here as they happen." />
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      <Modal visible={liveModal} transparent animationType="slide" onRequestClose={() => setLiveModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setLiveModal(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Live Stream Setup</Text>
            <TextInput style={styles.input} placeholder="Stream title" placeholderTextColor={COLORS.textMuted} value={liveTitle} onChangeText={setLiveTitle} />
            <TextInput style={styles.input} placeholder="YouTube URL" placeholderTextColor={COLORS.textMuted} value={liveUrl} onChangeText={setLiveUrl} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Description" placeholderTextColor={COLORS.textMuted} value={liveDescription} onChangeText={setLiveDescription} multiline />
            <TextInput style={styles.input} placeholder="Scheduled date (YYYY-MM-DD)" placeholderTextColor={COLORS.textMuted} value={liveDate} onChangeText={setLiveDate} />
            <TextInput style={styles.input} placeholder="Scheduled time" placeholderTextColor={COLORS.textMuted} value={liveTime} onChangeText={setLiveTime} />
            <LoadingButton title="Save Live Details" loading={submitting} onPress={handleSaveLive} style={styles.modalButton} />
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setLiveModal(false)}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const QuickAction = ({ label, icon, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.quickActionIcon}>{icon}</Text>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const SectionHeader = ({ title, badge }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {badge ? <Text style={styles.sectionBadge}>{badge}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerLogo: { width: 42, height: 42, borderRadius: 21 },
  headerGreeting: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  headerSubtitle: { color: COLORS.red, fontSize: FONTS.sizes.xs, letterSpacing: 0.5 },
  scrollContent: { paddingBottom: SPACING.lg },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  sectionHeader: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  sectionBadge: {
    color: COLORS.red,
    borderColor: COLORS.red,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingHorizontal: SPACING.lg },
  quickAction: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  quickActionIcon: { fontSize: 24 },
  quickActionLabel: { color: COLORS.text, fontWeight: FONTS.weights.semibold, textAlign: 'center' },
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cardTitle: { color: COLORS.text, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm, marginBottom: 4 },
  cardMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  primaryChip: {
    backgroundColor: COLORS.red,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  primaryChipText: { color: '#fff', fontWeight: FONTS.weights.bold },
  activityCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  activityAccent: { width: 4 },
  activityBody: { flex: 1, padding: SPACING.md },
  activityTime: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 6 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  modalTitle: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, marginBottom: SPACING.sm },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  modalButton: { backgroundColor: COLORS.red, marginTop: SPACING.sm },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  secondaryButtonText: { color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
});