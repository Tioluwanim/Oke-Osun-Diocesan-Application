import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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

const INNER_TABS = [
  { key: 'overview', label: 'Overview', icon: '⛪' },
  { key: 'members', label: 'Members', icon: '🙏' },
  { key: 'groups', label: 'Groups', icon: '👥' },
  { key: 'notices', label: 'Notices', icon: '📢' },
];

const formatDate = (value) => {
  if (!value) return 'TBA';
  try {
    return new Date(value).toDateString();
  } catch {
    return value;
  }
};

export default function ParishScreen() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [noticeModalVisible, setNoticeModalVisible] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [noticePriority, setNoticePriority] = useState('normal');
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

  const parish = parishResponse?.parish || null;
  const members = membersResponse?.members || [];
  const notices = noticesResponse?.notices || [];
  const parishEvents = useMemo(
    () => events.filter((event) => event.isAllParishes || event.parish === parish?.name),
    [events, parish?.name]
  );
  const groups = parish?.groups || [];
  const isLoading = parishLoading || membersLoading || noticesLoading || eventsLoading;

  const filteredMembers = members.filter((member) =>
    member.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Members', value: String(members.filter((item) => item.role === 'member').length), icon: '🙏' },
    { label: 'Clergy', value: String(members.filter((item) => item.role === 'clergy').length), icon: '✝' },
    { label: 'Events', value: String(parishEvents.length), icon: '📅' },
    { label: 'Groups', value: String(groups.length), icon: '👥' },
  ];

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
        priority: noticePriority,
      }, token);
      await queryClient.invalidateQueries({ queryKey: queryKeys.myParishNotices });
      setNoticeModalVisible(false);
      setNoticeTitle('');
      setNoticeBody('');
      setNoticePriority('normal');
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
        <View>
          <Text style={styles.headerTitle}>My Parish</Text>
          <Text style={styles.headerSubtitle}>{parish?.name || 'Parish not assigned'}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Clergy</Text>
        </View>
      </View>

      <View style={styles.innerTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.innerTabsRow}>
          {INNER_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.innerTab, active && styles.innerTabActive]}
                onPress={() => { setActiveTab(tab.key); setSearchQuery(''); }}
                activeOpacity={0.75}
              >
                <Text style={styles.innerTabIcon}>{tab.icon}</Text>
                <Text style={[styles.innerTabLabel, active && styles.innerTabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && (
          <>
            {isLoading ? (
              <SkeletonList count={3} itemHeight={90} lines={3} />
            ) : parish ? (
              <>
                <View style={styles.parishCard}>
                  <Text style={styles.parishName}>{parish.name}</Text>
                  <Text style={styles.parishMeta}>{parish.location || 'Location pending'}</Text>
                  <Text style={styles.parishMeta}>
                    {parish.deanery || 'Deanery pending'} • {parish.archdeaconry || 'Archdeaconry pending'}
                  </Text>
                  <Text style={styles.parishMeta}>Established: {parish.established || 'Not set'}</Text>
                </View>

                <View style={styles.statsGrid}>
                  {stats.map((stat) => (
                    <View key={stat.label} style={styles.statCard}>
                      <Text style={styles.statIcon}>{stat.icon}</Text>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>

                <SectionHeader title="Recent Notices" actionLabel="Post Notice" onAction={() => setNoticeModalVisible(true)} />
                {notices.slice(0, 2).length ? notices.slice(0, 2).map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                )) : (
                  <EmptyState icon="📢" title="No notices yet" description="Post a notice to keep your parish informed." />
                )}
              </>
            ) : (
              <EmptyState icon="⛪" title="No parish assigned" description="Ask an administrator to link your parish account." />
            )}
          </>
        )}

        {activeTab === 'members' && (
          <>
            <View style={styles.searchContainer}>
              <View style={styles.searchWrapper}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search members..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
            {isLoading ? (
              <SkeletonList count={4} itemHeight={72} lines={2} />
            ) : filteredMembers.length ? (
              filteredMembers.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <Text style={styles.cardTitle}>{member.fullName}</Text>
                  <Text style={styles.cardMeta}>{member.role} • {member.email}</Text>
                  <Text style={styles.cardMeta}>{member.status}</Text>
                </View>
              ))
            ) : (
              <EmptyState icon="👥" title="No matching members" description="Try a different search term." />
            )}
          </>
        )}

        {activeTab === 'groups' && (
          <>
            <SectionHeader title={`${groups.length} Groups`} />
            {groups.length ? groups.map((group, index) => (
              <View key={`${group.name}-${index}`} style={styles.memberCard}>
                <Text style={styles.cardTitle}>{group.icon || '👥'} {group.name}</Text>
                <Text style={styles.cardMeta}>{group.members || 0} members</Text>
                <Text style={styles.cardMeta}>{group.leader || 'Leader not set'}</Text>
              </View>
            )) : (
              <EmptyState icon="👥" title="No parish groups configured" description="Groups can be added to the parish record by the admin team." />
            )}
          </>
        )}

        {activeTab === 'notices' && (
          <>
            <SectionHeader title={`${notices.length} Notices`} actionLabel="Post Notice" onAction={() => setNoticeModalVisible(true)} />
            {isLoading ? (
              <SkeletonList count={3} itemHeight={90} lines={3} />
            ) : notices.length ? (
              notices.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
            ) : (
              <EmptyState icon="📢" title="No notices yet" description="Post a notice to keep your parish informed." />
            )}
          </>
        )}

        <SectionHeader title="Parish Events" />
        {parishEvents.slice(0, 3).length ? parishEvents.slice(0, 3).map((event) => (
          <View key={event.id} style={styles.memberCard}>
            <Text style={styles.cardTitle}>{event.title}</Text>
            <Text style={styles.cardMeta}>{formatDate(event.date)} {event.time ? `• ${event.time}` : ''}</Text>
            <Text style={styles.cardMeta}>{event.location || event.parish || 'Parish event'}</Text>
          </View>
        )) : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={noticeModalVisible} animationType="slide" transparent onRequestClose={() => setNoticeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setNoticeModalVisible(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Post Parish Notice</Text>
            <TextInput style={styles.input} placeholder="Notice title" placeholderTextColor={COLORS.textMuted} value={noticeTitle} onChangeText={setNoticeTitle} />
            <TextInput style={[styles.input, styles.multilineInput]} placeholder="Write your notice" placeholderTextColor={COLORS.textMuted} value={noticeBody} onChangeText={setNoticeBody} multiline />
            <View style={styles.priorityRow}>
              {['normal', 'high'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[styles.priorityChip, noticePriority === priority && styles.priorityChipActive]}
                  onPress={() => setNoticePriority(priority)}
                >
                  <Text style={[styles.priorityChipText, noticePriority === priority && styles.priorityChipTextActive]}>{priority}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <LoadingButton title="Post Notice" loading={submitting} onPress={handlePostNotice} style={styles.modalButton} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const SectionHeader = ({ title, actionLabel, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionLabel ? (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const NoticeCard = ({ notice }) => (
  <View style={styles.noticeCard}>
    <View style={[styles.noticeAccent, { backgroundColor: notice.priority === 'high' ? COLORS.red : COLORS.teal }]} />
    <View style={styles.noticeBody}>
      <Text style={styles.cardTitle}>{notice.title}</Text>
      <Text style={styles.cardMeta}>{notice.body}</Text>
      <Text style={styles.noticeDate}>{formatDate(notice.createdAt)}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold },
  headerSubtitle: { color: COLORS.teal, fontSize: FONTS.sizes.sm },
  headerBadge: {
    borderWidth: 1,
    borderColor: COLORS.teal,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  headerBadgeText: { color: COLORS.teal, fontWeight: FONTS.weights.bold },
  innerTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  innerTabsRow: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm },
  innerTab: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  innerTabActive: { borderColor: COLORS.teal, backgroundColor: 'rgba(76,201,168,0.08)' },
  innerTabIcon: { fontSize: 14 },
  innerTabLabel: { color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  innerTabLabelActive: { color: COLORS.teal },
  scrollContent: { paddingBottom: SPACING.lg },
  parishCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 4,
  },
  parishName: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  parishMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: { fontSize: 18 },
  statValue: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  sectionHeader: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  sectionAction: { color: COLORS.teal, fontWeight: FONTS.weights.semibold },
  searchContainer: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, color: COLORS.text, paddingVertical: SPACING.md },
  memberCard: {
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
  modalTitle: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold },
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
  priorityRow: { flexDirection: 'row', gap: SPACING.sm },
  priorityChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  priorityChipActive: { borderColor: COLORS.teal, backgroundColor: 'rgba(76,201,168,0.08)' },
  priorityChipText: { color: COLORS.textMuted, textTransform: 'capitalize' },
  priorityChipTextActive: { color: COLORS.teal, fontWeight: FONTS.weights.bold },
  modalButton: { backgroundColor: COLORS.teal },
});
