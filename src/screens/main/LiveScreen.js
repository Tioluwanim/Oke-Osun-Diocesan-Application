import React, { Suspense, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Linking,
  Image,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import SkeletonList from '../../components/ui/SkeletonList';
import { queryFns, queryKeys } from '../../lib/api';

const WebView = React.lazy(() =>
  import('react-native-webview').then((module) => ({ default: module.WebView }))
);

const { width } = Dimensions.get('window');

const extractYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export default function LiveScreen() {
  const [activeTab, setActiveTab] = useState('live');

  const {
    data: stream = null,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({ queryKey: queryKeys.live, queryFn: queryFns.live });

  const youtubeId = extractYouTubeId(stream?.youtubeUrl);

  const openYouTube = (videoId) => {
    if (videoId) Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
  };

  const openYouTubeChannel = () => {
    Linking.openURL('https://www.youtube.com/@OkeOsunDiocese');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={styles.headerTitle}>Live</Text>
            <Text style={styles.headerSubtitle}>Diocese of Oke-Osun</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.ytButton} onPress={openYouTubeChannel}>
          <Text style={styles.ytButtonIcon}>▶</Text>
          <Text style={styles.ytButtonText}>YouTube</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsRow}>
        {['live', 'upcoming', 'past'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'live' ? '🔴 Live' : tab === 'upcoming' ? '📅 Upcoming' : '🎬 Past'}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={(
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={COLORS.gold} />
        )}
      >
        {activeTab === 'live' && (
          <View>
            {isLoading ? (
              <View style={styles.tabLoading}>
                <SkeletonList count={2} itemHeight={140} lines={4} />
              </View>
            ) : stream?.isLive && youtubeId ? (
              <View>
                <View style={styles.liveBadgeRow}>
                  <View style={styles.livePulse}>
                    <View style={styles.liveDot} />
                  </View>
                  <Text style={styles.liveBadgeText}>STREAMING LIVE NOW</Text>
                </View>

                <View style={styles.videoPlayer}>
                  <Suspense fallback={<SkeletonList count={1} itemHeight={width * 0.56 + 32} lines={2} />}>
                    <WebView
                      style={{ width: '100%', height: width * 0.56 }}
                      source={{ uri: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1` }}
                      allowsFullscreenVideo
                      allowsInlineMediaPlayback
                      mediaPlaybackRequiresUserAction={false}
                      javaScriptEnabled
                    />
                  </Suspense>
                </View>

                <View style={styles.streamInfo}>
                  <Text style={styles.streamTitle}>
                    {stream.title || 'Live Service — Diocese of Oke-Osun'}
                  </Text>
                  <View style={styles.streamMetaList}>
                    {stream.scheduledTime && <StreamMeta icon="⏰" text={`Started at ${stream.scheduledTime}`} />}
                    {stream.description && <StreamMeta icon="📝" text={stream.description} />}
                  </View>

                  <TouchableOpacity
                    style={styles.watchBtn}
                    onPress={() => openYouTube(youtubeId)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.watchBtnDot} />
                    <Text style={styles.watchBtnText}>Watch on YouTube</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.shareBtn}>
                    <Text style={styles.shareBtnText}>↗ Share Stream</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.noLiveContainer}>
                <View style={styles.noLiveIcon}>
                  <Text style={styles.noLiveEmoji}>📺</Text>
                </View>
                <Text style={styles.noLiveTitle}>No Live Stream Right Now</Text>
                <Text style={styles.noLiveSubText}>
                  Check back during service times or see upcoming streams below.
                </Text>

                {stream?.scheduledDate && (
                  <View style={styles.scheduledCard}>
                    <Text style={styles.scheduledLabel}>NEXT STREAM</Text>
                    <Text style={styles.scheduledTitle}>
                      {stream.title || 'Upcoming Service'}
                    </Text>
                    <View style={styles.scheduledMeta}>
                      <StreamMeta icon="📅" text={stream.scheduledDate} />
                      {stream.scheduledTime && <StreamMeta icon="⏰" text={stream.scheduledTime} />}
                    </View>
                  </View>
                )}

                {stream?.youtubeUrl && (
                  <TouchableOpacity
                    style={styles.noLiveBtn}
                    onPress={() => openYouTube(youtubeId)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.noLiveBtnText}>▶ Watch Previous Stream</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.noLiveBtn2}
                  onPress={() => setActiveTab('upcoming')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.noLiveBtn2Text}>📅 View Upcoming Streams</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.noLiveBtnOutline} onPress={openYouTubeChannel}>
                  <Text style={styles.noLiveBtnOutlineText}>▶ Visit YouTube Channel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'upcoming' && (
          <View style={styles.listSection}>
            <SectionHeader title="Upcoming Streams" />

            {isLoading ? (
              <SkeletonList count={2} itemHeight={112} lines={3} />
            ) : stream?.scheduledDate ? (
              <View style={styles.upcomingCard}>
                <View style={styles.upcomingNumber}>
                  <Text style={styles.upcomingNumberText}>01</Text>
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingTitle}>
                    {stream.title || 'Upcoming Service'}
                  </Text>
                  <View style={styles.upcomingMetaList}>
                    <StreamMeta icon="📅" text={stream.scheduledDate} />
                    {stream.scheduledTime && <StreamMeta icon="⏰" text={stream.scheduledTime} />}
                    {stream.description && <StreamMeta icon="📝" text={stream.description} />}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.remindBtn}
                  onPress={() => Linking.openURL('https://www.youtube.com/@OkeOsunDiocese')}
                >
                  <Text style={styles.remindBtnIcon}>🔔</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noScheduleCard}>
                <Text style={styles.noScheduleIcon}>📅</Text>
                <Text style={styles.noScheduleText}>No upcoming streams scheduled yet</Text>
                <Text style={styles.noScheduleSubText}>Check back soon or subscribe to our YouTube channel</Text>
              </View>
            )}

            <View style={styles.notifyCta}>
              <Text style={styles.notifyCtaIcon}>🔔</Text>
              <View style={styles.notifyCtaInfo}>
                <Text style={styles.notifyCtaTitle}>Get Notified</Text>
                <Text style={styles.notifyCtaText}>
                  Subscribe on YouTube to get alerted when a service goes live.
                </Text>
              </View>
              <TouchableOpacity style={styles.notifyCtaBtn} onPress={openYouTubeChannel}>
                <Text style={styles.notifyCtaBtnText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'past' && (
          <View style={styles.listSection}>
            <SectionHeader title="Past Streams" />

            {isLoading ? (
              <SkeletonList count={1} itemHeight={112} lines={3} />
            ) : stream?.youtubeUrl && youtubeId ? (
              <TouchableOpacity
                style={styles.pastCard}
                onPress={() => openYouTube(youtubeId)}
                activeOpacity={0.85}
              >
                <View style={styles.pastThumbnail}>
                  <View style={styles.pastPlayBtn}>
                    <Text style={styles.pastPlayIcon}>▶</Text>
                  </View>
                </View>
                <View style={styles.pastInfo}>
                  <Text style={styles.pastTitle} numberOfLines={2}>
                    {stream.title || 'Last Stream'}
                  </Text>
                  <View style={styles.pastMeta}>
                    {stream.updatedAt && (
                      <Text style={styles.pastMetaText}>
                        📅 {stream.updatedAt.slice(0, 10)}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.pastWatchText}>Watch on YouTube ›</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.noScheduleCard}>
                <Text style={styles.noScheduleIcon}>🎬</Text>
                <Text style={styles.noScheduleText}>No past streams yet</Text>
                <Text style={styles.noScheduleSubText}>Past streams will appear here once available</Text>
              </View>
            )}

            <TouchableOpacity style={styles.ytCta} onPress={openYouTubeChannel} activeOpacity={0.85}>
              <Text style={styles.ytCtaIcon}>▶</Text>
              <View>
                <Text style={styles.ytCtaTitle}>View Full Archive</Text>
                <Text style={styles.ytCtaText}>All past streams on our YouTube channel</Text>
              </View>
              <Text style={styles.ytCtaArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionAccent} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const StreamMeta = ({ icon, text }) => (
  <View style={styles.streamMetaRow}>
    <Text style={styles.streamMetaIcon}>{icon}</Text>
    <Text style={styles.streamMetaText} numberOfLines={2}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: SPACING.md, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerLogo: { width: 36, height: 36 },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.goldLight, letterSpacing: 0.5 },
  headerSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.gold, letterSpacing: 0.5, marginTop: 2 },
  ytButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.red, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8 },
  ytButtonIcon: { fontSize: 12, color: '#fff' },
  ytButtonText: { fontSize: FONTS.sizes.sm, color: '#fff', fontWeight: FONTS.weights.bold },
  tabsRow: { flexDirection: 'row', backgroundColor: COLORS.surfaceElevated, borderBottomWidth: 0, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs, gap: SPACING.sm },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', position: 'relative', backgroundColor: COLORS.surface, borderRadius: RADIUS.full },
  tabActive: {},
  tabText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  tabTextActive: { color: COLORS.gold, fontWeight: FONTS.weights.bold },
  tabIndicator: { position: 'absolute', bottom: 4, left: SPACING.lg, right: SPACING.lg, height: 3, borderRadius: 2, backgroundColor: COLORS.gold },
  scrollContent: { paddingTop: SPACING.lg, paddingBottom: SPACING.lg },
  tabLoading: { alignItems: 'center', paddingVertical: 60, gap: SPACING.md },
  liveBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  livePulse: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(201,76,76,0.2)', justifyContent: 'center', alignItems: 'center' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.red },
  liveBadgeText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black, color: COLORS.red, letterSpacing: 1, flex: 1 },
  videoPlayer: { marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: SPACING.lg, backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 22, elevation: 6 },
  streamInfo: { paddingHorizontal: SPACING.lg },
  streamTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.md, lineHeight: 26 },
  streamMetaList: { gap: 6, marginBottom: SPACING.lg },
  streamMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streamMetaIcon: { fontSize: 13 },
  streamMetaText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, flex: 1 },
  watchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.red, borderRadius: RADIUS.lg, height: 54, marginBottom: SPACING.sm },
  watchBtnDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  watchBtnText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  shareBtn: { height: 48, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  shareBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  noLiveContainer: { alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: 40, gap: SPACING.md },
  noLiveIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 4 },
  noLiveEmoji: { fontSize: 48 },
  noLiveTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text, textAlign: 'center' },
  noLiveSubText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  scheduledCard: { backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.xl, padding: SPACING.md, width: '100%', gap: SPACING.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 5 },
  scheduledLabel: { fontSize: 9, color: COLORS.gold, fontWeight: FONTS.weights.black, letterSpacing: 1.5, textTransform: 'uppercase' },
  scheduledTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  scheduledMeta: { gap: 4 },
  noLiveBtn: { backgroundColor: COLORS.gold, borderRadius: RADIUS.lg, height: 52, width: '100%', justifyContent: 'center', alignItems: 'center' },
  noLiveBtnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  noLiveBtn2: { backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', borderRadius: RADIUS.lg, height: 52, width: '100%', justifyContent: 'center', alignItems: 'center' },
  noLiveBtn2Text: { color: COLORS.gold, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  noLiveBtnOutline: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, height: 52, width: '100%', justifyContent: 'center', alignItems: 'center' },
  noLiveBtnOutlineText: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  sectionAccent: { width: 3, height: 16, borderRadius: 2, backgroundColor: COLORS.gold },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  listSection: { paddingHorizontal: SPACING.lg },
  upcomingCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  upcomingNumber: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  upcomingNumberText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.black, color: COLORS.gold, letterSpacing: 0.5 },
  upcomingInfo: { flex: 1 },
  upcomingTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.sm, lineHeight: 20 },
  upcomingMetaList: { gap: 5 },
  remindBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  remindBtnIcon: { fontSize: 16 },
  noScheduleCard: { backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 5 },
  noScheduleIcon: { fontSize: 40 },
  noScheduleText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  noScheduleSubText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center' },
  notifyCta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: 'rgba(201,168,76,0.06)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.sm },
  notifyCtaIcon: { fontSize: 24 },
  notifyCtaInfo: { flex: 1 },
  notifyCtaTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 2 },
  notifyCtaText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, lineHeight: 16 },
  notifyCtaBtn: { backgroundColor: COLORS.gold, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 7 },
  notifyCtaBtnText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: COLORS.background },
  pastCard: { backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.xl, marginBottom: SPACING.md, flexDirection: 'row', gap: SPACING.md, padding: SPACING.md, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 4 },
  pastThumbnail: { width: 100, height: 64, borderRadius: RADIUS.md, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', flexShrink: 0, borderWidth: 1, borderColor: COLORS.border },
  pastPlayBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(201,76,76,0.85)', justifyContent: 'center', alignItems: 'center' },
  pastPlayIcon: { fontSize: 12, color: '#fff', marginLeft: 2 },
  pastInfo: { flex: 1 },
  pastTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 5, lineHeight: 18 },
  pastMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  pastMetaText: { fontSize: 10, color: COLORS.textMuted },
  pastWatchText: { fontSize: 11, color: COLORS.gold, fontWeight: FONTS.weights.semibold },
  ytCta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.xl, padding: SPACING.md, marginTop: SPACING.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 },
  ytCtaIcon: { fontSize: 24, color: COLORS.red },
  ytCtaTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 2 },
  ytCtaText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  ytCtaArrow: { marginLeft: 'auto', fontSize: 22, color: COLORS.textMuted },
});
