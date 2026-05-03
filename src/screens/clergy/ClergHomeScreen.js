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
import { queryKeys, queryFns, userApi } from '../../lib/api';

const formatDate = (value) => {
  if (!value) return 'TBA';
  try {
    return new Date(value).toDateString();
  } catch {
    return value;
  }
};

export default function ClergyHomeScreen({ navigation }) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [noticeModal, setNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: parishResponse, isLoading: parishLoading } = useQuery({
    queryKey: queryKeys.myParish,
    queryFn: () => userApi.fetchMyParish(token),
    enabled: !!token,
  });
  const { data: membersResponse, isLoading: membersLoading } = useQuery({
    queryKey: queryKeys.myParishMembers,
    queryFn: () => userApi.fetchMyParishMembers(token),
    enabled: !!token,
  });
  const { data: noticesResponse, isLoading: noticesLoading } = useQuery({
    queryKey: queryKeys.myParishNotices,
    queryFn: () => userApi.fetchMyParishNotices(token),
    enabled: !!token,
  });
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: queryKeys.events,
    queryFn: queryFns.events,
  });
  const { data: liveResponse, isLoading: liveLoading } = useQuery({
    queryKey: queryKeys.live,
    queryFn: queryFns.live,
  });

  const parish = parishResponse?.parish || null;
  const members = membersResponse?.members || [];
  const notices = noticesResponse?.notices || [];
  const liveStream = liveResponse?.stream || liveResponse || null;

  const parishEvents = useMemo(
    () => events.filter((event) => event.isAllParishes || event.parish === parish?.name).slice(0, 4),
    [events, parish?.name]
  );

  const clergyCount = members.filter((item) => item.role === 'clergy').length;
  const memberCount = members.filter((item) => item.role === 'member').length;

  const stats = [
    { label: 'Members', value: String(memberCount), icon: '🙏', color: COLORS.teal },
    { label: 'Clergy', value: String(clergyCount), icon: '✝', color: COLORS.gold },
    { label: 'Events', value: String(parishEvents.length), icon: '📅', color: COLORS.blue },
    { label: 'Notices', value: String(notices.length), icon: '📢', color: COLORS.red },
  ];

  const isLoading = parishLoading || membersLoading || noticesLoading || eventsLoading || liveLoading;

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.myParish }),
      queryClient.invalidateQueries({ queryKey: queryKeys.myParishMembers }),
      queryClient.invalidateQueries({ queryKey: queryKeys.myParishNotices }),
      queryClient.invalidateQueries({ queryKey: queryKeys.events }),
      queryClient.invalidateQueries({ queryKey: queryKeys.live }),
    ]);
    setRefreshing(false);
  };

  const handlePostNotice = async () => {
    if (!noticeTitle.trim() || !noticeBody.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await userApi.createMyParishNotice({
        title: noticeTitle.trim(),
        body: noticeBody.trim(),
        priority: 'normal',
      }, token);
      await queryClient.invalidateQueries({ queryKey: queryKeys.myParishNotices });
      setNoticeModal(false);
      setNoticeTitle('');
      setNoticeBody('');
      Alert.alert('Posted', 'Notice has been posted to your parish.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to post notice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={styles.headerGreeting}>Welcome, Rev. {user?.fullName?.split(' ')[0] || 'Clergy'} 👋</Text>
            <Text style={styles.headerSubtitle}>{parish?.name || user?.parish || 'Parish not assigned'}</Text>
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
            tintColor={COLORS.teal}
            colors={[COLORS.teal]}
          />
        )}
      >
        {liveStream?.isLive && (
          <TouchableOpacity style={styles.liveBanner} onPress={() => navigation.navigate('Live')} activeOpacity={0.85}>
            <Text style={styles.liveBannerText}>LIVE NOW • {liveStream.title || 'Sunday Service'}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActionsGrid}>
          <QuickAction label="Post Notice" icon="📢" onPress={() => setNoticeModal(true)} />
          <QuickAction label="Add Event" icon="📅" onPress={() => navigation.navigate('Events')} />
          <QuickAction label="Upload Sermon" icon="🎙" onPress={() => navigation.navigate('UploadSermon')} />
          <QuickAction label="Open Parish" icon="⛪" onPress={() => navigation.navigate('Parish')} />
        </View>

        <SectionHeader title="Upcoming Services" onSeeAll={() => navigation.navigate('Events')} />
        {isLoading ? (
          <SkeletonList count={3} itemHeight={84} lines={3} />
        ) : parishEvents.length ? (
          parishEvents.map((event) => (
            <View key={event.id} style={styles.card}>
              <Text style={styles.cardTitle}>{event.title}</Text>
              <Text style={styles.cardMeta}>{formatDate(event.date)} {event.time ? `• ${event.time}` : ''}</Text>
              <Text style={styles.cardMeta}>{event.location || event.parish || 'Diocese event'}</Text>
            </View>
          ))
        ) : (
          <EmptyState icon="📅" title="No upcoming parish events" description="Create new events to populate this section." />
        )}

        <SectionHeader title="Recent Members" onSeeAll={() => navigation.navigate('Parish')} />
        {isLoading ? (
          <SkeletonList count={3} itemHeight={72} lines={2} />
        ) : members.length ? (
          members.slice(0, 4).map((member) => (
            <View key={member.id} style={styles.card}>
              <Text style={styles.cardTitle}>{member.fullName}</Text>
              <Text style={styles.cardMeta}>{member.role} • {member.status}</Text>
            </View>
          ))
        ) : (
          <EmptyState icon="👥" title="No parish members yet" description="Assigned parish members will appear here." />
        )}

        <SectionHeader title="Parish Notices" onSeeAll={() => navigation.navigate('Parish')} />
        {isLoading ? (
          <SkeletonList count={2} itemHeight={90} lines={3} />
        ) : notices.length ? (
          notices.slice(0, 3).map((notice) => (
            <View key={notice.id} style={styles.noticeCard}>
              <View style={[styles.noticeAccent, { backgroundColor: notice.priority === 'high' ? COLORS.red : COLORS.teal }]} />
              <View style={styles.noticeBody}>
                <Text style={styles.cardTitle}>{notice.title}</Text>
                <Text style={styles.cardMeta}>{notice.body}</Text>
                <Text style={styles.noticeDate}>{formatDate(notice.createdAt)}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon="📢" title="No notices yet" description="Post a notice to keep your parish informed." />
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      <Modal visible={noticeModal} transparent animationType="slide" onRequestClose={() => setNoticeModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setNoticeModal(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Post Parish Notice</Text>
            <TextInput style={styles.input} placeholder="Notice title" placeholderTextColor={COLORS.textMuted} value={noticeTitle} onChangeText={setNoticeTitle} />
            <TextInput style={[styles.input, styles.multilineInput]} placeholder="Notice details" placeholderTextColor={COLORS.textMuted} value={noticeBody} onChangeText={setNoticeBody} multiline />
            <LoadingButton title="Post Notice" loading={submitting} onPress={handlePostNotice} style={styles.modalButton} />
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setNoticeModal(false)}>
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

const SectionHeader = ({ title, onSeeAll }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll ? (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    ) : null}
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
  headerSubtitle: { color: COLORS.teal, fontSize: FONTS.sizes.xs },
  scrollContent: { paddingBottom: SPACING.lg },
  liveBanner: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(201,76,76,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201,76,76,0.3)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  liveBannerText: { color: COLORS.red, fontWeight: FONTS.weights.bold, textAlign: 'center' },
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
  seeAll: { color: COLORS.teal, fontWeight: FONTS.weights.semibold },
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
  quickActionLabel: { color: COLORS.text, fontWeight: FONTS.weights.semibold },
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  cardTitle: { color: COLORS.text, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm, marginBottom: 4 },
  cardMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  noticeCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  noticeAccent: { width: 4 },
  noticeBody: { flex: 1, padding: SPACING.md },
  noticeDate: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 6 },
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
  multilineInput: { minHeight: 120, textAlignVertical: 'top' },
  modalButton: { backgroundColor: COLORS.teal },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  secondaryButtonText: { color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
});
