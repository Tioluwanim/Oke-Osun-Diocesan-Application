import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
import usePrefetch from '../../hooks/usePrefetch';
import { prefetchHomeFeeds } from '../../lib/prefetch';
import { queryFns, queryKeys } from '../../lib/api';

const QUICK_ACTIONS = [
  { icon: '📺', label: 'Watch Live', screen: 'Live', color: 'rgba(201,76,76,0.12)' },
  { icon: '🎙', label: 'Sermons', screen: 'Resources', color: 'rgba(201,168,76,0.12)' },
  { icon: '📅', label: 'Events', screen: 'Events', color: 'rgba(76,138,201,0.12)' },
  { icon: '👤', label: 'Profile', screen: 'Profile', color: 'rgba(76,201,168,0.12)' },
];

const formatDate = (value) => {
  if (!value) return 'TBA';
  try {
    return new Date(value).toDateString();
  } catch {
    return value;
  }
};

const isFutureEvent = (event) => {
  if (!event?.date) return false;
  const eventDate = new Date(event.date);
  return !Number.isNaN(eventDate.getTime()) && eventDate >= new Date(new Date().setHours(0, 0, 0, 0));
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { prefetch } = usePrefetch();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: liveStream, isLoading: isLiveLoading } = useQuery({
    queryKey: queryKeys.live,
    queryFn: queryFns.live,
  });
  const { data: events = [], isLoading: isEventsLoading } = useQuery({
    queryKey: queryKeys.events,
    queryFn: queryFns.events,
  });
  const { data: sermons = [], isLoading: isSermonsLoading } = useQuery({
    queryKey: queryKeys.sermons,
    queryFn: queryFns.sermons,
  });
  const { data: parishes = [], isLoading: isParishesLoading } = useQuery({
    queryKey: queryKeys.parishes,
    queryFn: queryFns.parishes,
  });

  useEffect(() => {
    prefetchHomeFeeds(prefetch);
  }, [prefetch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.live }),
      queryClient.invalidateQueries({ queryKey: queryKeys.events }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sermons }),
      queryClient.invalidateQueries({ queryKey: queryKeys.parishes }),
      prefetchHomeFeeds(prefetch),
    ]);
    setRefreshing(false);
  };

  const nextEvent = useMemo(
    () => events.filter(isFutureEvent).sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null,
    [events]
  );

  const latestSermon = useMemo(
    () => sermons[0] || null,
    [sermons]
  );

  const updates = useMemo(() => {
    const eventUpdates = events.slice(0, 2).map((event) => ({
      id: `event-${event.id}`,
      tag: event.category || 'Event',
      color: COLORS.gold,
      title: event.title,
      body: event.location || event.parish || 'Diocesan event',
      date: formatDate(event.date),
    }));

    const sermonUpdates = sermons.slice(0, 1).map((sermon) => ({
      id: `sermon-${sermon.id}`,
      tag: 'Sermon',
      color: COLORS.teal,
      title: sermon.title,
      body: sermon.preacher || sermon.parish || 'New sermon available',
      date: formatDate(sermon.createdAt),
    }));

    return [...eventUpdates, ...sermonUpdates];
  }, [events, sermons]);

  const stats = useMemo(() => ([
    { label: 'Events', value: String(events.length), icon: '📅' },
    { label: 'Sermons', value: String(sermons.length), icon: '🎙' },
    { label: 'Parishes', value: String(parishes.length), icon: '⛪' },
    { label: 'Live', value: liveStream?.isLive ? 'On' : 'Off', icon: '📺' },
  ]), [events.length, sermons.length, parishes.length, liveStream?.isLive]);

  const isLoading = isLiveLoading || isEventsLoading || isSermonsLoading || isParishesLoading;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFirstName = () => {
    if (!user?.fullName) return 'Beloved';
    return user.fullName.split(' ')[0];
  };

  const navigateWithPrefetch = (screen) => {
    prefetchHomeFeeds(prefetch);
    if (screen) navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerGreeting}>{getGreeting()}, {getFirstName()} 👋</Text>
            <Text style={styles.headerSubtitle}>Diocese of Oke-Osun</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        )}
      >
        {liveStream?.isLive && (
          <TouchableOpacity
            style={styles.liveBanner}
            onPress={() => navigateWithPrefetch('Live')}
            activeOpacity={0.85}
          >
            <View style={styles.livePulse}>
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.liveBannerText}>
              LIVE NOW • {liveStream.title || 'Sunday Service'}
            </Text>
            <View style={styles.liveJoinBtn}>
              <Text style={styles.liveJoinText}>Join ›</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Next Event" onSeeAll={() => navigateWithPrefetch('Events')} />
        {isLoading ? (
          <SkeletonCard />
        ) : nextEvent ? (
          <TouchableOpacity style={styles.featureCard} onPress={() => navigateWithPrefetch('Events')} activeOpacity={0.85}>
            <View style={styles.featureAccent} />
            <View style={styles.featureBody}>
              <Text style={styles.featureTag}>{nextEvent.category || 'Event'}</Text>
              <Text style={styles.featureTitle}>{nextEvent.title}</Text>
              <Text style={styles.featureMeta}>{formatDate(nextEvent.date)} {nextEvent.time ? `• ${nextEvent.time}` : ''}</Text>
              <Text style={styles.featureDescription}>{nextEvent.location || nextEvent.parish || 'Diocesan calendar'}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <EmptyState
            icon="📅"
            title="No upcoming events"
            description="New diocesan events will appear here."
          />
        )}

        <SectionHeader title="Latest Sermon" onSeeAll={() => navigateWithPrefetch('Resources')} />
        {isLoading ? (
          <SkeletonCard />
        ) : latestSermon ? (
          <TouchableOpacity style={styles.featureCard} onPress={() => navigateWithPrefetch('Resources')} activeOpacity={0.85}>
            <View style={[styles.featureAccent, { backgroundColor: COLORS.teal }]} />
            <View style={styles.featureBody}>
              <Text style={[styles.featureTag, { color: COLORS.teal }]}>
                {latestSermon.type || 'Sermon'}
              </Text>
              <Text style={styles.featureTitle}>{latestSermon.title}</Text>
              <Text style={styles.featureMeta}>{latestSermon.preacher || 'Diocese clergy'}</Text>
              <Text style={styles.featureDescription}>
                {latestSermon.duration || 'Freshly uploaded'} {latestSermon.series ? `• ${latestSermon.series}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <EmptyState
            icon="🎙"
            title="No sermons yet"
            description="Uploaded sermons will appear here."
          />
        )}

        <SectionHeader title="Quick Access" />
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickAction, { backgroundColor: action.color }]}
              onPress={() => navigateWithPrefetch(action.screen)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionHeader title="Recent Updates" />
        {isLoading ? (
          <SkeletonCard />
        ) : updates.length ? (
          updates.map((item) => (
            <View key={item.id} style={styles.updateCard}>
              <View style={[styles.updateAccent, { backgroundColor: item.color }]} />
              <View style={styles.updateBody}>
                <View style={styles.updateTop}>
                  <Text style={[styles.updateTag, { color: item.color }]}>{item.tag}</Text>
                  <Text style={styles.updateDate}>{item.date}</Text>
                </View>
                <Text style={styles.updateTitle}>{item.title}</Text>
                <Text style={styles.updateText}>{item.body}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="📰"
            title="No updates yet"
            description="Events and sermons will show up here as they are published."
          />
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  headerGreeting: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  livePulse: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(201,76,76,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
  },
  liveBannerText: {
    flex: 1,
    color: COLORS.red,
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.sm,
  },
  liveJoinBtn: {
    backgroundColor: COLORS.red,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  liveJoinText: {
    color: '#fff',
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: SPACING.xs,
  },
  statIcon: {
    fontSize: 18,
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  seeAll: {
    color: COLORS.gold,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  featureCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  featureAccent: {
    width: 6,
    backgroundColor: COLORS.gold,
  },
  featureBody: {
    flex: 1,
    padding: SPACING.md,
    gap: 6,
  },
  featureTag: {
    color: COLORS.gold,
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.xs,
    textTransform: 'uppercase',
  },
  featureTitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    fontWeight: FONTS.weights.bold,
  },
  featureMeta: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
  },
  featureDescription: {
    color: COLORS.textLight,
    fontSize: FONTS.sizes.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  quickAction: {
    width: '48%',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 4,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionLabel: {
    color: COLORS.text,
    fontWeight: FONTS.weights.semibold,
  },
  updateCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  updateAccent: {
    width: 4,
  },
  updateBody: {
    flex: 1,
    padding: SPACING.md,
    gap: 4,
  },
  updateTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  updateTag: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  updateDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
  updateTitle: {
    color: COLORS.text,
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.sm,
  },
  updateText: {
    color: COLORS.textLight,
    fontSize: FONTS.sizes.sm,
  },
});
