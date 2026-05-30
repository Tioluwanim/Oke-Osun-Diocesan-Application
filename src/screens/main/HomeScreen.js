import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, StatusBar, Animated, useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { getGreeting, isFutureDate, formatDate } from '../../utils/format';
import SkeletonCard    from '../../components/ui/SkeletonCard';
import EmptyState      from '../../components/ui/EmptyState';
import AppIcon         from '../../components/ui/AppIcon';
import SectionHeader   from '../../components/cards/SectionHeader';
import FeatureCard     from '../../components/cards/FeatureCard';
import ScreenHeader    from '../../components/layout/ScreenHeader';
import usePrefetch     from '../../hooks/usePrefetch';
import { prefetchHomeFeeds } from '../../lib/prefetch';
import { queryFns, queryKeys } from '../../lib/api';

const QUICK_ACTIONS = [
  { icon: 'live',     label: 'Watch Live', screen: 'Live',      accent: 'rgba(201,76,76,0.12)' },
  { icon: 'audio',    label: 'Sermons',    screen: 'Resources', accent: 'rgba(201,168,76,0.12)' },
  { icon: 'calendar', label: 'Events',     screen: 'Events',    accent: 'rgba(76,138,201,0.12)' },
  { icon: 'give',     label: 'Give',       screen: 'Give',      accent: 'rgba(76,201,168,0.12)' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const { prefetch } = usePrefetch();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  const { data: liveStream,  isLoading: ll } = useQuery({ queryKey: queryKeys.live,     queryFn: queryFns.live });
  const { data: events = [], isLoading: el } = useQuery({ queryKey: queryKeys.events,   queryFn: queryFns.events });
  const { data: sermons = [], isLoading: sl } = useQuery({ queryKey: queryKeys.sermons,  queryFn: queryFns.sermons });
  const { data: parishes = [], isLoading: pl } = useQuery({ queryKey: queryKeys.parishes, queryFn: queryFns.parishes });
  const isLoading = ll || el || sl || pl;

  useEffect(() => { prefetchHomeFeeds(prefetch); }, [prefetch]);

  // Pulse animation for LIVE badge
  useEffect(() => {
    if (!liveStream?.isLive) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [liveStream?.isLive, pulse]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.live }),
      queryClient.invalidateQueries({ queryKey: queryKeys.events }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sermons }),
      queryClient.invalidateQueries({ queryKey: queryKeys.parishes }),
    ]);
    setRefreshing(false);
  };

  const nextEvent   = useMemo(() => events.filter(e => isFutureDate(e.date)).sort((a,b) => new Date(a.date) - new Date(b.date))[0] || null, [events]);
  const latestSermon = useMemo(() => sermons[0] || null, [sermons]);

  const stats = useMemo(() => [
    { label: 'Events',   value: String(events.length),   icon: 'calendar' },
    { label: 'Sermons',  value: String(sermons.length),  icon: 'audio' },
    { label: 'Parishes', value: String(parishes.length), icon: 'church' },
    { label: 'Live',     value: liveStream?.isLive ? 'On' : 'Off', icon: 'live' },
  ], [events.length, sermons.length, parishes.length, liveStream?.isLive]);

  const updates = useMemo(() => [
    ...events.slice(0, 2).map(e => ({ id: `e-${e.id}`, tag: e.category || 'Event', color: COLORS.gold, title: e.title, body: e.location || 'Diocesan event', date: formatDate(e.date) })),
    ...sermons.slice(0, 1).map(s => ({ id: `s-${s.id}`, tag: 'Sermon', color: COLORS.teal, title: s.title, body: s.preacher || 'Diocese clergy', date: formatDate(s.createdAt) })),
  ], [events, sermons]);

  const nav = (screen) => {
    Haptics.selectionAsync().catch(() => {});
    navigation.navigate(screen);
  };

  const cardBasis = width >= 900 ? '24%' : '48%';
  const pulseStyle = {
    opacity:   pulse.interpolate({ inputRange: [0,1], outputRange: [0.4, 1] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0,1], outputRange: [0.88, 1.2] }) }],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {user?.fullName?.split(' ')[0] || 'Beloved'}</Text>
            <Text style={styles.diocese}>Diocese of Oke-Osun</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} colors={[COLORS.gold]} />}
      >
        {/* LIVE banner */}
        {liveStream?.isLive && (
          <TouchableOpacity style={styles.liveBanner} onPress={() => nav('Live')} activeOpacity={0.85}>
            <Animated.View style={[styles.livePulse, pulseStyle]}>
              <View style={styles.liveDot} />
            </Animated.View>
            <Text style={styles.liveBannerText}>LIVE NOW · {liveStream.title || 'Sunday Service'}</Text>
            <View style={styles.liveJoin}><Text style={styles.liveJoinText}>Join</Text></View>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map(s => (
            <View key={s.label} style={[styles.statCard, { flexBasis: cardBasis, maxWidth: cardBasis }]}>
              <AppIcon name={s.icon} size={20} color={COLORS.gold} style={styles.statIcon} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Next Event */}
        <SectionHeader title="Next Event" onSeeAll={() => nav('Events')} />
        {isLoading ? <SkeletonCard /> : nextEvent
          ? <FeatureCard
              tag={nextEvent.category || 'Event'}
              title={nextEvent.title}
              meta={`${formatDate(nextEvent.date)}${nextEvent.time ? ` · ${nextEvent.time}` : ''}`}
              description={nextEvent.location || nextEvent.parish}
              onPress={() => nav('Events')}
            />
          : <EmptyState icon="calendar" title="No upcoming events" description="New diocesan events will appear here." />
        }

        {/* Latest Sermon */}
        <SectionHeader title="Latest Sermon" onSeeAll={() => nav('Resources')} />
        {isLoading ? <SkeletonCard /> : latestSermon
          ? <FeatureCard
              tag={latestSermon.type || 'Sermon'}
              tagColor={COLORS.teal}
              title={latestSermon.title}
              meta={latestSermon.preacher || 'Diocese clergy'}
              description={latestSermon.duration || latestSermon.series}
              onPress={() => nav('Resources')}
            />
          : <EmptyState icon="audio" title="No sermons yet" description="Uploaded sermons will appear here." />
        }

        {/* Quick Actions */}
        <SectionHeader title="Quick Access" />
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map(a => (
            <TouchableOpacity key={a.label} style={[styles.quickCard, { backgroundColor: a.accent }]} onPress={() => nav(a.screen)} activeOpacity={0.8}>
              <AppIcon name={a.icon} size={26} color={COLORS.gold} />
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Updates */}
        <SectionHeader title="Recent Updates" />
        {isLoading ? <SkeletonCard /> : updates.length
          ? updates.map(u => (
              <View key={u.id} style={styles.updateCard}>
                <View style={[styles.updateAccent, { backgroundColor: u.color }]} />
                <View style={styles.updateBody}>
                  <View style={styles.updateTop}>
                    <Text style={[styles.updateTag, { color: u.color }]}>{u.tag}</Text>
                    <Text style={styles.updateDate}>{u.date}</Text>
                  </View>
                  <Text style={styles.updateTitle}>{u.title}</Text>
                  <Text style={styles.updateText}>{u.body}</Text>
                </View>
              </View>
            ))
          : <EmptyState icon="notification" title="No updates yet" description="Events and sermons will appear here." />
        }

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 44, paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logo: { width: 42, height: 42, borderRadius: 21 },
  greeting: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  diocese:  { fontSize: FONTS.sizes.xs, color: COLORS.gold, letterSpacing: 0.5 },
  scroll: { paddingBottom: SPACING.lg },

  liveBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border,
    marginHorizontal: SPACING.lg, marginTop: SPACING.lg,
    borderRadius: RADIUS.xl, padding: SPACING.md, gap: SPACING.sm,
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 18,
  },
  livePulse: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(201,76,76,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  liveDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.red },
  liveBannerText: { flex: 1, color: COLORS.red, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm },
  liveJoin:      { backgroundColor: COLORS.red, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 5 },
  liveJoinText:  { color: '#fff', fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },

  statsRow: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg,
  },
  statCard: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, paddingVertical: SPACING.md, alignItems: 'center',
    marginBottom: SPACING.sm, minWidth: 150,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 14,
  },
  statIcon:  { marginBottom: SPACING.xs },
  statValue: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.text },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },

  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    gap: SPACING.sm, paddingHorizontal: SPACING.lg,
  },
  quickCard: {
    flexBasis: '48%', flexGrow: 0, minWidth: 150,
    borderRadius: RADIUS.xl, paddingVertical: SPACING.lg,
    alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12,
  },
  quickLabel: { color: COLORS.text, fontWeight: FONTS.weights.semibold, fontSize: FONTS.sizes.sm },

  updateCard: {
    flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.sm,
    backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, overflow: 'hidden',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 14,
  },
  updateAccent: { width: 4 },
  updateBody:   { flex: 1, padding: SPACING.md, gap: 4 },
  updateTop:    { flexDirection: 'row', justifyContent: 'space-between' },
  updateTag:    { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  updateDate:   { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  updateTitle:  { color: COLORS.text, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm },
  updateText:   { color: COLORS.textLight, fontSize: FONTS.sizes.sm },
});