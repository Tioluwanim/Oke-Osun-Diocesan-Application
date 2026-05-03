import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  Image,
  Linking,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { API_ROUTES } from '../../constants/config';
import SkeletonList from '../../components/ui/SkeletonList';

const { width } = Dimensions.get('window');

const INNER_TABS = [
  { key: 'sermons',   label: 'Sermons',     icon: '🎙️' },
  { key: 'magazines', label: 'Magazines',   icon: '📖' },
  { key: 'bible',     label: 'Bible Study', icon: '📝' },
  { key: 'documents', label: 'Documents',   icon: '📄' },
];

const SERMON_FILTERS = [
  { label: 'All',    icon: '✦'  },
  { label: 'Audio',  icon: '🎙️' },
  { label: 'Video',  icon: '📹' },
  { label: 'Series', icon: '📚' },
  { label: 'Bishop', icon: '⛪' },
  { label: 'Guest',  icon: '🌟' },
];

const SERMON_TYPE_CONFIG = {
  Audio: { color: COLORS.gold, bg: 'rgba(201,168,76,0.1)', icon: '🎙️' },
  Video: { color: COLORS.teal, bg: 'rgba(76,201,168,0.1)', icon: '📹' },
};

const MAG_CATEGORY_CONFIG = {
  Devotional: { color: COLORS.gold, icon: '✝️' },
  Newsletter: { color: COLORS.teal, icon: '📰' },
  Ministry:   { color: COLORS.teal, icon: '🙏' },
  Education:  { color: '#8a4cc9',   icon: '📚' },
  Other:      { color: COLORS.gold, icon: '📖' },
};

const LEVEL_CONFIG = {
  Beginner:     { color: COLORS.teal, bg: 'rgba(76,201,168,0.1)'  },
  Intermediate: { color: COLORS.gold, bg: 'rgba(201,168,76,0.1)'  },
  Advanced:     { color: COLORS.red,  bg: 'rgba(201,76,76,0.1)'   },
};

const DOC_CATEGORY_CONFIG = {
  Governance:     { color: COLORS.gold, icon: '🏛️' },
  Administration: { color: COLORS.teal, icon: '📋' },
  Clergy:         { color: COLORS.teal, icon: '⛪' },
  Education:      { color: '#8a4cc9',   icon: '📚' },
  Other:          { color: COLORS.gold, icon: '📄' },
};

export default function ResourcesScreen() {
  const [activeTab, setActiveTab] = useState('sermons');
  const [sermonFilter, setSermonFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  // ── Per-tab data + loading ──
  const [sermons,      setSermons]      = useState([]);
  const [magazines,    setMagazines]    = useState([]);
  const [bibleStudies, setBibleStudies] = useState([]);
  const [documents,    setDocuments]    = useState([]);

  const [loadingSermons, setLoadingSermons] = useState(true);
  const [loadingMags,    setLoadingMags]    = useState(false);
  const [loadingBible,   setLoadingBible]   = useState(false);
  const [loadingDocs,    setLoadingDocs]    = useState(false);
  const [refreshing,     setRefreshing]     = useState(false);

  // ── Bible Study Reader State ──
  const [selectedStudy,   setSelectedStudy]   = useState(null);
  const [studyModal,      setStudyModal]       = useState(false);
  const [selectedLesson,  setSelectedLesson]   = useState(null);
  const [lessonModal,     setLessonModal]      = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  // ── Fetch sermons ──
  const fetchSermons = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoadingSermons(true);
    try {
      const response = await fetch(`${API_ROUTES.sermons}?limit=100`);
      const data = await response.json();
      if (response.ok) setSermons(data.sermons || []);
    } catch {}
    finally { setLoadingSermons(false); setRefreshing(false); }
  }, []);

  // ── Fetch magazines ──
  const fetchMagazines = useCallback(async () => {
    setLoadingMags(true);
    try {
      const response = await fetch(`${API_ROUTES.magazines}?limit=100`);
      const data = await response.json();
      if (response.ok) setMagazines(data.magazines || []);
    } catch {}
    finally { setLoadingMags(false); }
  }, []);

  // ── Fetch bible studies ──
  const fetchBibleStudies = useCallback(async () => {
    setLoadingBible(true);
    try {
      const response = await fetch(`${API_ROUTES.bibleStudies}?limit=100`);
      const data = await response.json();
      if (response.ok) setBibleStudies(data.bible_studies || []);
    } catch {}
    finally { setLoadingBible(false); }
  }, []);

  // ── Fetch documents ──
  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const response = await fetch(`${API_ROUTES.documents}?limit=100`);
      const data = await response.json();
      if (response.ok) setDocuments(data.documents || []);
    } catch {}
    finally { setLoadingDocs(false); }
  }, []);

  useEffect(() => { fetchSermons(); }, []);

  useEffect(() => {
    if (activeTab === 'magazines'  && magazines.length    === 0) fetchMagazines();
    if (activeTab === 'bible'      && bibleStudies.length === 0) fetchBibleStudies();
    if (activeTab === 'documents'  && documents.length    === 0) fetchDocuments();
  }, [activeTab]);

  const onRefresh = () => {
    if (activeTab === 'sermons')   fetchSermons(true);
    if (activeTab === 'magazines') { setRefreshing(true); fetchMagazines().finally(() => setRefreshing(false)); }
    if (activeTab === 'bible')     { setRefreshing(true); fetchBibleStudies().finally(() => setRefreshing(false)); }
    if (activeTab === 'documents') { setRefreshing(true); fetchDocuments().finally(() => setRefreshing(false)); }
  };

  // ── Derived series ──
  const seriesMap = sermons.reduce((acc, s) => {
    if (s.series) acc[s.series] = (acc[s.series] || 0) + 1;
    return acc;
  }, {});
  const seriesList = Object.entries(seriesMap).map(([title, count], i) => ({ id: `s${i}`, title, count }));

  const filteredSermons = sermons.filter((s) => {
    const matchesFilter =
      sermonFilter === 'All'    ? true :
      sermonFilter === 'Audio'  ? s.type === 'Audio' :
      sermonFilter === 'Video'  ? s.type === 'Video' :
      sermonFilter === 'Bishop' ? s.preacher?.includes('Bishop') :
      sermonFilter === 'Guest'  ? s.preacher?.includes('Guest') :
      sermonFilter === 'Series' ? !!s.series : true;
    const matchesSearch =
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.preacher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scripture?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const typeConfig = (type) => SERMON_TYPE_CONFIG[type] || SERMON_TYPE_CONFIG.Audio;
  const handlePlay = (id) => setPlayingId(playingId === id ? null : id);
  const handleOpenUrl = (url) => { if (url) Linking.openURL(url).catch(() => {}); };
  const isNew = (createdAt) => {
    if (!createdAt) return false;
    return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  };

  // ── Open lesson ──
  const openLesson = (lesson, index) => {
    setSelectedLesson(lesson);
    setCurrentLessonIndex(index);
    setLessonModal(true);
  };

  // ── Navigate lessons ──
  const goToLesson = (direction) => {
    const lessons = selectedStudy?.lessonItems || [];
    const newIndex = currentLessonIndex + direction;
    if (newIndex >= 0 && newIndex < lessons.length) {
      setCurrentLessonIndex(newIndex);
      setSelectedLesson(lessons[newIndex]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={styles.headerTitle}>Resources</Text>
            <Text style={styles.headerSubtitle}>Diocese of Oke-Osun</Text>
          </View>
        </View>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>📚</Text>
        </View>
      </View>

      {/* ── Inner Tabs ── */}
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
                {active && <View style={styles.innerTabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Search ── */}
      {(activeTab === 'sermons' || activeTab === 'magazines' || activeTab === 'bible') && (
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={
                activeTab === 'sermons'   ? 'Search title, preacher, scripture...' :
                activeTab === 'magazines' ? 'Search magazines...' : 'Search Bible studies...'
              }
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
                <Text style={styles.searchClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} colors={[COLORS.gold]} />}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ════ SERMONS TAB ════ */}
        {activeTab === 'sermons' && (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
              {SERMON_FILTERS.map((filter) => {
                const active = sermonFilter === filter.label;
                return (
                  <TouchableOpacity
                    key={filter.label}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setSermonFilter(filter.label)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.filterChipIcon}>{filter.icon}</Text>
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{filter.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {(sermonFilter === 'All' || sermonFilter === 'Series') && seriesList.length > 0 && (
              <View style={styles.seriesSection}>
                <SectionHeader title="Series" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seriesRow}>
                  {seriesList.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={styles.seriesCard}
                      activeOpacity={0.8}
                      onPress={() => { setSermonFilter('Series'); setSearchQuery(s.title); }}
                    >
                      <Text style={styles.seriesIcon}>📚</Text>
                      <Text style={styles.seriesTitle} numberOfLines={2}>{s.title}</Text>
                      <Text style={styles.seriesCount}>{s.count} message{s.count !== 1 ? 's' : ''}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.listSection}>
              <SectionHeader title={sermonFilter === 'All' ? 'All Messages' : sermonFilter} />
              {loadingSermons ? (
                <SkeletonList count={5} itemHeight={150} />
              ) : filteredSermons.length === 0 ? (
                <EmptyState icon="📭" text="No sermons found" subText="Try a different filter or search term" onReset={() => { setSermonFilter('All'); setSearchQuery(''); }} />
              ) : (
                filteredSermons.map((sermon) => {
                  const config    = typeConfig(sermon.type);
                  const isPlaying = playingId === sermon.id;
                  return (
                    <TouchableOpacity
                      key={sermon.id}
                      style={[styles.sermonCard, isPlaying && styles.sermonCardActive]}
                      onPress={() => setSelectedSermon(sermon)}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.cardTopBar, { backgroundColor: config.color }]} />
                      <View style={styles.sermonCardInner}>
                        <View style={styles.badgeRow}>
                          <View style={[styles.typeBadge, { backgroundColor: config.bg, borderColor: config.color }]}>
                            <Text style={styles.typeBadgeIcon}>{config.icon}</Text>
                            <Text style={[styles.typeBadgeText, { color: config.color }]}>{sermon.type}</Text>
                          </View>
                          {isNew(sermon.createdAt) && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
                          {sermon.series && <Text style={styles.seriesTagText} numberOfLines={1}>📚 {sermon.series}</Text>}
                        </View>
                        <View style={styles.sermonContentRow}>
                          <View style={styles.sermonInfo}>
                            <Text style={styles.sermonTitle} numberOfLines={2}>{sermon.title}</Text>
                            <Text style={styles.sermonPreacher} numberOfLines={1}>{sermon.preacher}</Text>
                            <View style={styles.sermonMetaRow}>
                              <Text style={styles.metaSmall}>📅 {sermon.createdAt ? sermon.createdAt.slice(0, 10) : '—'}</Text>
                              <Text style={styles.metaDot}>·</Text>
                              <Text style={styles.metaSmall}>⏱ {sermon.duration || 'N/A'}</Text>
                              {sermon.scripture && <><Text style={styles.metaDot}>·</Text><Text style={styles.metaSmall}>📖 {sermon.scripture}</Text></>}
                            </View>
                            <Text style={styles.metaSmall}>👁 {sermon.views || 0} views</Text>
                          </View>
                          <TouchableOpacity
                            style={[styles.playBtn, { backgroundColor: config.color }]}
                            onPress={() => { handlePlay(sermon.id); if (sermon.url) handleOpenUrl(sermon.url); }}
                          >
                            <Text style={styles.playBtnIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                          </TouchableOpacity>
                        </View>
                        {isPlaying && (
                          <View style={styles.playingBar}>
                            <View style={styles.playingBarTrack}>
                              <View style={[styles.playingBarFill, { backgroundColor: config.color }]} />
                            </View>
                            <Text style={[styles.playingLabel, { color: config.color }]}>Now Playing...</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* ════ MAGAZINES TAB ════ */}
        {activeTab === 'magazines' && (
          <View style={styles.listSection}>
            <SectionHeader title="Publications & Devotionals" />
            {loadingMags ? (
              <SkeletonList count={4} itemHeight={160} />
            ) : magazines.length === 0 ? (
              <EmptyState icon="📖" text="No magazines yet" subText="Check back soon for publications" />
            ) : (
              magazines.filter(m =>
                m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.category?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((mag) => {
                const config = MAG_CATEGORY_CONFIG[mag.category] || { color: COLORS.gold, icon: '📖' };
                return (
                  <TouchableOpacity key={mag.id} style={styles.resourceCard} activeOpacity={0.85}>
                    <View style={[styles.cardTopBar, { backgroundColor: config.color }]} />
                    <View style={styles.resourceCardInner}>
                      <View style={styles.resourceCardRow}>
                        <View style={[styles.resourceIconWrapper, { backgroundColor: `${config.color}18` }]}>
                          <Text style={styles.resourceIconEmoji}>{config.icon}</Text>
                        </View>
                        <View style={styles.resourceInfo}>
                          <View style={styles.badgeRow}>
                            <View style={[styles.typeBadge, { backgroundColor: `${config.color}18`, borderColor: config.color }]}>
                              <Text style={[styles.typeBadgeText, { color: config.color }]}>{mag.category}</Text>
                            </View>
                            {isNew(mag.createdAt) && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
                          </View>
                          <Text style={styles.resourceTitle} numberOfLines={2}>{mag.title}</Text>
                          <View style={styles.sermonMetaRow}>
                            <Text style={styles.metaSmall}>📅 {mag.date || mag.createdAt?.slice(0, 10) || '—'}</Text>
                            {mag.pages && <><Text style={styles.metaDot}>·</Text><Text style={styles.metaSmall}>📄 {mag.pages} pages</Text></>}
                          </View>
                          {mag.description && <Text style={styles.resourceDesc} numberOfLines={2}>{mag.description}</Text>}
                        </View>
                      </View>
                      <View style={styles.resourceActions}>
                        <TouchableOpacity style={[styles.resourceBtn, { backgroundColor: config.color }]} onPress={() => mag.url && handleOpenUrl(mag.url)}>
                          <Text style={styles.resourceBtnText}>👁  Read</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.resourceBtnOutline} onPress={() => mag.url && handleOpenUrl(mag.url)}>
                          <Text style={styles.resourceBtnOutlineText}>⬇  Download</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* ════ BIBLE STUDY TAB ════ */}
        {activeTab === 'bible' && (
          <View style={styles.listSection}>
            <SectionHeader title="Bible Study Outlines" />
            {loadingBible ? (
              <SkeletonList count={4} itemHeight={160} />
            ) : bibleStudies.length === 0 ? (
              <EmptyState icon="📝" text="No Bible studies yet" subText="Check back soon for study materials" />
            ) : (
              bibleStudies.filter(b =>
                b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.book?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((study) => {
                const levelConfig = LEVEL_CONFIG[study.level] || LEVEL_CONFIG.Beginner;
                const lessonCount = study.lessonItems?.length || study.lessons || 0;
                return (
                  <TouchableOpacity
                    key={study.id}
                    style={styles.resourceCard}
                    activeOpacity={0.85}
                    onPress={() => { setSelectedStudy(study); setStudyModal(true); }}
                  >
                    <View style={[styles.cardTopBar, { backgroundColor: levelConfig.color }]} />
                    <View style={styles.resourceCardInner}>
                      <View style={styles.badgeRow}>
                        <View style={[styles.typeBadge, { backgroundColor: levelConfig.bg, borderColor: levelConfig.color }]}>
                          <Text style={[styles.typeBadgeText, { color: levelConfig.color }]}>{study.level}</Text>
                        </View>
                        {isNew(study.createdAt) && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
                        <Text style={styles.metaSmall}>📖 {study.book}</Text>
                      </View>
                      <Text style={styles.resourceTitle}>{study.title}</Text>
                      {study.description && <Text style={styles.resourceDesc} numberOfLines={2}>{study.description}</Text>}
                      <View style={styles.studyFooter}>
                        <Text style={styles.metaSmall}>📚 {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</Text>
                        <TouchableOpacity
                          style={[styles.resourceBtn, { backgroundColor: levelConfig.color }]}
                          onPress={() => { setSelectedStudy(study); setStudyModal(true); }}
                        >
                          <Text style={styles.resourceBtnText}>Start Study ›</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* ════ DOCUMENTS TAB ════ */}
        {activeTab === 'documents' && (
          <View style={styles.listSection}>
            <SectionHeader title="Church Documents" />
            {loadingDocs ? (
              <SkeletonList count={4} itemHeight={90} />
            ) : documents.length === 0 ? (
              <EmptyState icon="📄" text="No documents yet" subText="Church documents will appear here" />
            ) : (
              documents.map((doc) => {
                const config = DOC_CATEGORY_CONFIG[doc.category] || { color: COLORS.gold, icon: '📄' };
                return (
                  <TouchableOpacity key={doc.id} style={styles.docCard} activeOpacity={0.85} onPress={() => doc.url && handleOpenUrl(doc.url)}>
                    <View style={[styles.docIconWrapper, { backgroundColor: `${config.color}18` }]}>
                      <Text style={styles.docIcon}>{config.icon}</Text>
                    </View>
                    <View style={styles.docInfo}>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      <View style={styles.sermonMetaRow}>
                        <View style={[styles.typeBadge, { backgroundColor: `${config.color}18`, borderColor: config.color }]}>
                          <Text style={[styles.typeBadgeText, { color: config.color }]}>{doc.category}</Text>
                        </View>
                        {doc.size && <Text style={styles.metaSmall}>{doc.size}</Text>}
                        {doc.date && <><Text style={styles.metaDot}>·</Text><Text style={styles.metaSmall}>{doc.date}</Text></>}
                      </View>
                    </View>
                    <TouchableOpacity style={styles.docDownloadBtn} onPress={() => doc.url && handleOpenUrl(doc.url)}>
                      <Text style={styles.docDownloadIcon}>⬇</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ══════════════════════════════════
          SERMON DETAIL MODAL
      ══════════════════════════════════ */}
      <Modal visible={!!selectedSermon} animationType="slide" transparent onRequestClose={() => setSelectedSermon(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSelectedSermon(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedSermon(null)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            {selectedSermon && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                <View style={[styles.modalAccentBar, { backgroundColor: typeConfig(selectedSermon.type).color }]} />
                <View style={[styles.modalTypeBadge, { backgroundColor: typeConfig(selectedSermon.type).bg, borderColor: typeConfig(selectedSermon.type).color }]}>
                  <Text style={styles.modalTypeBadgeIcon}>{typeConfig(selectedSermon.type).icon}</Text>
                  <Text style={[styles.modalTypeBadgeText, { color: typeConfig(selectedSermon.type).color }]}>{selectedSermon.type?.toUpperCase()}</Text>
                </View>
                <Text style={styles.modalTitle}>{selectedSermon.title}</Text>
                <Text style={styles.modalPreacher}>{selectedSermon.preacher}</Text>
                <View style={styles.modalMetaGrid}>
                  <ModalMeta icon="📅" label="Date"     value={selectedSermon.createdAt ? selectedSermon.createdAt.slice(0, 10) : '—'} />
                  <ModalMeta icon="⏱" label="Duration" value={selectedSermon.duration || 'N/A'} />
                  {selectedSermon.scripture && <ModalMeta icon="📖" label="Scripture" value={selectedSermon.scripture} />}
                  <ModalMeta icon="👁" label="Views"    value={`${selectedSermon.views || 0} views`} />
                  {selectedSermon.series && <ModalMeta icon="📚" label="Series" value={selectedSermon.series} full />}
                </View>
                {selectedSermon.description && (
                  <>
                    <View style={styles.modalDivider} />
                    <Text style={styles.modalSectionLabel}>About this Message</Text>
                    <Text style={styles.modalDescription}>{selectedSermon.description}</Text>
                  </>
                )}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, { backgroundColor: typeConfig(selectedSermon.type).color }]}
                    onPress={() => { handlePlay(selectedSermon.id); if (selectedSermon.url) handleOpenUrl(selectedSermon.url); setSelectedSermon(null); }}
                  >
                    <Text style={styles.modalActionBtnText}>{playingId === selectedSermon.id ? '⏸  Pause' : '▶  Play Now'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalActionBtnOutline} onPress={() => selectedSermon.url && handleOpenUrl(selectedSermon.url)}>
                    <Text style={styles.modalActionBtnOutlineText}>⬇  Download</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.modalShareBtn}>
                  <Text style={styles.modalShareBtnText}>↗  Share this Sermon</Text>
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════
          BIBLE STUDY DETAIL MODAL
      ══════════════════════════════════ */}
      <Modal visible={studyModal} animationType="slide" transparent onRequestClose={() => setStudyModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setStudyModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setStudyModal(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            {selectedStudy && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                {(() => {
                  const levelConfig = LEVEL_CONFIG[selectedStudy.level] || LEVEL_CONFIG.Beginner;
                  const lessons = selectedStudy.lessonItems || [];
                  return (
                    <>
                      <View style={[styles.modalAccentBar, { backgroundColor: levelConfig.color }]} />

                      {/* Level + Book badges */}
                      <View style={styles.badgeRow}>
                        <View style={[styles.typeBadge, { backgroundColor: levelConfig.bg, borderColor: levelConfig.color }]}>
                          <Text style={[styles.typeBadgeText, { color: levelConfig.color }]}>{selectedStudy.level}</Text>
                        </View>
                        <View style={[styles.typeBadge, { backgroundColor: 'rgba(201,168,76,0.1)', borderColor: COLORS.gold }]}>
                          <Text style={[styles.typeBadgeText, { color: COLORS.gold }]}>📖 {selectedStudy.book}</Text>
                        </View>
                      </View>

                      <Text style={styles.modalTitle}>{selectedStudy.title}</Text>
                      {selectedStudy.description && (
                        <Text style={styles.studyDescription}>{selectedStudy.description}</Text>
                      )}

                      {/* Study info row */}
                      <View style={styles.studyInfoRow}>
                        <View style={styles.studyInfoItem}>
                          <Text style={styles.studyInfoIcon}>📚</Text>
                          <Text style={styles.studyInfoValue}>{lessons.length}</Text>
                          <Text style={styles.studyInfoLabel}>Lessons</Text>
                        </View>
                        <View style={styles.studyInfoDivider} />
                        <View style={styles.studyInfoItem}>
                          <Text style={styles.studyInfoIcon}>🎯</Text>
                          <Text style={[styles.studyInfoValue, { color: levelConfig.color }]}>{selectedStudy.level}</Text>
                          <Text style={styles.studyInfoLabel}>Level</Text>
                        </View>
                        <View style={styles.studyInfoDivider} />
                        <View style={styles.studyInfoItem}>
                          <Text style={styles.studyInfoIcon}>📖</Text>
                          <Text style={styles.studyInfoValue} numberOfLines={1}>{selectedStudy.book}</Text>
                          <Text style={styles.studyInfoLabel}>Book</Text>
                        </View>
                      </View>

                      {/* Lessons List */}
                      {lessons.length > 0 ? (
                        <>
                          <View style={styles.modalDivider} />
                          <Text style={styles.modalSectionLabel}>Lessons</Text>
                          <View style={styles.lessonsList}>
                            {lessons.map((lesson, index) => (
                              <TouchableOpacity
                                key={index}
                                style={[
                                  styles.lessonItem,
                                  index < lessons.length - 1 && styles.lessonItemBorder,
                                ]}
                                onPress={() => openLesson(lesson, index)}
                                activeOpacity={0.7}
                              >
                                <View style={[styles.lessonNumber, { backgroundColor: levelConfig.bg, borderColor: levelConfig.color }]}>
                                  <Text style={[styles.lessonNumberText, { color: levelConfig.color }]}>{index + 1}</Text>
                                </View>
                                <View style={styles.lessonItemInfo}>
                                  <Text style={styles.lessonItemTitle}>{lesson.title}</Text>
                                  {lesson.scripture && (
                                    <Text style={styles.lessonItemScripture}>📖 {lesson.scripture}</Text>
                                  )}
                                </View>
                                <Text style={[styles.lessonArrow, { color: levelConfig.color }]}>›</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </>
                      ) : (
                        <View style={styles.noLessonsBox}>
                          <Text style={styles.noLessonsText}>📝 Lesson content coming soon</Text>
                        </View>
                      )}

                      {lessons.length > 0 && (
                        <TouchableOpacity
                          style={[styles.startStudyBtn, { backgroundColor: levelConfig.color }]}
                          onPress={() => openLesson(lessons[0], 0)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.startStudyBtnText}>▶  Begin Lesson 1</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity style={styles.modalShareBtn} onPress={() => setStudyModal(false)}>
                        <Text style={styles.modalShareBtnText}>Close</Text>
                      </TouchableOpacity>
                      <View style={{ height: 20 }} />
                    </>
                  );
                })()}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════
          LESSON READER MODAL
      ══════════════════════════════════ */}
      <Modal visible={lessonModal} animationType="slide" transparent onRequestClose={() => setLessonModal(false)}>
        <View style={styles.lessonModalOverlay}>
          <View style={styles.lessonModalSheet}>

            {/* Lesson Header */}
            <View style={styles.lessonHeader}>
              <TouchableOpacity style={styles.lessonBackBtn} onPress={() => setLessonModal(false)}>
                <Text style={styles.lessonBackIcon}>‹</Text>
              </TouchableOpacity>
              <View style={styles.lessonHeaderCenter}>
                <Text style={styles.lessonHeaderTitle} numberOfLines={1}>
                  {selectedLesson?.title || 'Lesson'}
                </Text>
                {selectedStudy && (
                  <Text style={styles.lessonHeaderSub}>
                    {currentLessonIndex + 1} of {selectedStudy.lessonItems?.length || 0}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.lessonCloseBtn} onPress={() => setLessonModal(false)}>
                <Text style={styles.lessonCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            {selectedStudy?.lessonItems?.length > 0 && (
              <View style={styles.lessonProgressTrack}>
                <View style={[
                  styles.lessonProgressFill,
                  {
                    width: `${((currentLessonIndex + 1) / selectedStudy.lessonItems.length) * 100}%`,
                    backgroundColor: LEVEL_CONFIG[selectedStudy?.level]?.color || COLORS.gold,
                  },
                ]} />
              </View>
            )}

            {selectedLesson && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.lessonContent}>

                {/* Lesson Title */}
                <Text style={styles.lessonTitle}>{selectedLesson.title}</Text>

                {/* Scripture */}
                {selectedLesson.scripture && (
                  <View style={styles.lessonScriptureCard}>
                    <Text style={styles.lessonScriptureLabel}>SCRIPTURE</Text>
                    <Text style={styles.lessonScripture}>📖 {selectedLesson.scripture}</Text>
                  </View>
                )}

                {/* Content */}
                <Text style={styles.lessonBody}>{selectedLesson.content}</Text>

                {/* Navigation */}
                <View style={styles.lessonNavRow}>
                  <TouchableOpacity
                    style={[
                      styles.lessonNavBtn,
                      currentLessonIndex === 0 && styles.lessonNavBtnDisabled,
                    ]}
                    onPress={() => goToLesson(-1)}
                    disabled={currentLessonIndex === 0}
                  >
                    <Text style={[
                      styles.lessonNavBtnText,
                      currentLessonIndex === 0 && { color: COLORS.textMuted },
                    ]}>
                      ‹ Previous
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.lessonNavDots}>
                    {selectedStudy?.lessonItems?.map((_, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.lessonNavDot,
                          i === currentLessonIndex && {
                            backgroundColor: LEVEL_CONFIG[selectedStudy?.level]?.color || COLORS.gold,
                            width: 16,
                          },
                        ]}
                        onPress={() => openLesson(selectedStudy.lessonItems[i], i)}
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.lessonNavBtn,
                      currentLessonIndex === (selectedStudy?.lessonItems?.length || 0) - 1 && styles.lessonNavBtnDisabled,
                    ]}
                    onPress={() => goToLesson(1)}
                    disabled={currentLessonIndex === (selectedStudy?.lessonItems?.length || 0) - 1}
                  >
                    <Text style={[
                      styles.lessonNavBtnText,
                      currentLessonIndex === (selectedStudy?.lessonItems?.length || 0) - 1 && { color: COLORS.textMuted },
                    ]}>
                      Next ›
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Finished */}
                {currentLessonIndex === (selectedStudy?.lessonItems?.length || 0) - 1 && (
                  <View style={styles.lessonCompleteCard}>
                    <Text style={styles.lessonCompleteIcon}>🎉</Text>
                    <Text style={styles.lessonCompleteTitle}>Study Complete!</Text>
                    <Text style={styles.lessonCompleteText}>
                      You have completed all {selectedStudy?.lessonItems?.length} lessons of {selectedStudy?.title}.
                    </Text>
                    <TouchableOpacity
                      style={[styles.lessonCompleteBtn, { backgroundColor: LEVEL_CONFIG[selectedStudy?.level]?.color || COLORS.gold }]}
                      onPress={() => setLessonModal(false)}
                    >
                      <Text style={styles.lessonCompleteBtnText}>✓  Finish Study</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Reusable Components ──
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionAccent} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const EmptyState = ({ icon, text, subText, onReset }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyText}>{text}</Text>
    <Text style={styles.emptySubText}>{subText}</Text>
    {onReset && (
      <TouchableOpacity style={styles.emptyReset} onPress={onReset}>
        <Text style={styles.emptyResetText}>Reset Filters</Text>
      </TouchableOpacity>
    )}
  </View>
);

const ModalMeta = ({ icon, label, value, full }) => (
  <View style={[styles.modalMetaItem, full && styles.modalMetaItemFull]}>
    <Text style={styles.modalMetaIcon}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.modalMetaLabel}>{label}</Text>
      <Text style={styles.modalMetaValue}>{value}</Text>
    </View>
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
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  headerIconText: { fontSize: 20 },
  innerTabsContainer: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  innerTabsRow: { paddingHorizontal: SPACING.lg, gap: SPACING.xs },
  innerTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, position: 'relative' },
  innerTabActive: {},
  innerTabIcon: { fontSize: 14 },
  innerTabLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.textMuted, letterSpacing: 0.3 },
  innerTabLabelActive: { color: COLORS.gold, fontWeight: FONTS.weights.bold },
  innerTabIndicator: { position: 'absolute', bottom: 0, left: SPACING.md, right: SPACING.md, height: 2, borderRadius: 1, backgroundColor: COLORS.gold },
  searchContainer: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, height: 44, gap: SPACING.sm },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.sm, height: '100%' },
  searchClearBtn: { padding: 4 },
  searchClear: { color: COLORS.textMuted, fontSize: 13 },
  filtersRow: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm, alignItems: 'center' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.md, paddingVertical: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  filterChipIcon: { fontSize: 12 },
  filterChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  filterChipTextActive: { color: COLORS.background, fontWeight: FONTS.weights.bold },
  scrollContent: { paddingTop: SPACING.md },
  tabLoading: { alignItems: 'center', paddingVertical: 60, gap: SPACING.md },
  tabLoadingText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  sectionAccent: { width: 3, height: 16, borderRadius: 2, backgroundColor: COLORS.gold },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  seriesSection: { marginBottom: SPACING.md },
  seriesRow: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  seriesCard: { width: 140, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.xs },
  seriesIcon: { fontSize: 24 },
  seriesTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, lineHeight: 18 },
  seriesCount: { fontSize: FONTS.sizes.xs, color: COLORS.gold },
  listSection: { paddingHorizontal: SPACING.lg },
  cardTopBar: { height: 3 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  typeBadgeIcon: { fontSize: 10 },
  typeBadgeText: { fontSize: 9, fontWeight: FONTS.weights.black, letterSpacing: 0.8 },
  newBadge: { backgroundColor: COLORS.red, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  newBadgeText: { fontSize: 9, color: '#fff', fontWeight: FONTS.weights.black, letterSpacing: 0.8 },
  sermonCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden' },
  sermonCardActive: { borderColor: COLORS.gold, backgroundColor: 'rgba(201,168,76,0.04)' },
  sermonCardInner: { padding: SPACING.md },
  seriesTagText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, flex: 1 },
  sermonContentRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  sermonInfo: { flex: 1 },
  sermonTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 4, lineHeight: 22 },
  sermonPreacher: { fontSize: FONTS.sizes.sm, color: COLORS.gold, marginBottom: 6 },
  sermonMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 4 },
  metaSmall: { fontSize: 10, color: COLORS.textMuted },
  metaDot: { color: COLORS.textMuted, fontSize: 8 },
  playBtn: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  playBtnIcon: { fontSize: 16, color: COLORS.background, marginLeft: 2 },
  playingBar: { marginTop: SPACING.sm, gap: 4 },
  playingBarTrack: { height: 3, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  playingBarFill: { height: '100%', width: '35%', borderRadius: 2 },
  playingLabel: { fontSize: 10, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  resourceCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden' },
  resourceCardInner: { padding: SPACING.md },
  resourceCardRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  resourceIconWrapper: { width: 52, height: 52, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  resourceIconEmoji: { fontSize: 26 },
  resourceInfo: { flex: 1 },
  resourceTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 4, lineHeight: 20 },
  resourceDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: 18, marginTop: 4 },
  resourceActions: { flexDirection: 'row', gap: SPACING.sm },
  resourceBtn: { flex: 1, height: 40, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  resourceBtnText: { color: COLORS.background, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  resourceBtnOutline: { flex: 1, height: 40, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface2 },
  resourceBtnOutlineText: { color: COLORS.text, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  studyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  docCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  docIconWrapper: { width: 48, height: 48, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  docIcon: { fontSize: 24 },
  docInfo: { flex: 1 },
  docTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 6 },
  docDownloadBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  docDownloadIcon: { fontSize: 16, color: COLORS.gold },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  emptyIcon: { fontSize: 52 },
  emptyText: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  emptySubText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center' },
  emptyReset: { marginTop: SPACING.sm, backgroundColor: COLORS.gold, borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  emptyResetText: { color: COLORS.background, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm },

  // ── Shared Modal ──
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  modalSheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.sm },
  modalClose: { position: 'absolute', top: SPACING.md, right: SPACING.lg, width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalCloseText: { color: COLORS.textMuted, fontSize: 13, fontWeight: FONTS.weights.bold },
  modalContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  modalAccentBar: { height: 3, borderRadius: 2, marginBottom: SPACING.lg, marginTop: SPACING.sm },
  modalTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: SPACING.sm },
  modalTypeBadgeIcon: { fontSize: 12 },
  modalTypeBadgeText: { fontSize: 10, fontWeight: FONTS.weights.black, letterSpacing: 1 },
  modalTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.xs, lineHeight: 34 },
  modalPreacher: { fontSize: FONTS.sizes.md, color: COLORS.gold, marginBottom: SPACING.lg, fontWeight: FONTS.weights.semibold },
  modalMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  modalMetaItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, flex: 1, minWidth: '45%' },
  modalMetaItemFull: { minWidth: '100%' },
  modalMetaIcon: { fontSize: 16, marginTop: 1 },
  modalMetaLabel: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 },
  modalMetaValue: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: FONTS.weights.semibold, lineHeight: 18 },
  modalDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  modalSectionLabel: { fontSize: 10, color: COLORS.gold, fontWeight: FONTS.weights.black, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACING.sm },
  modalDescription: { fontSize: FONTS.sizes.md, color: COLORS.textMuted, lineHeight: 28, marginBottom: SPACING.lg },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  modalActionBtn: { flex: 1, height: 52, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  modalActionBtnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  modalActionBtnOutline: { flex: 1, height: 52, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface2 },
  modalActionBtnOutlineText: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
  modalShareBtn: { height: 48, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  modalShareBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, letterSpacing: 0.5 },

  // ── Bible Study Detail Modal ──
  studyDescription: { fontSize: FONTS.sizes.md, color: COLORS.textMuted, lineHeight: 24, marginBottom: SPACING.lg },
  studyInfoRow: { flexDirection: 'row', backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, overflow: 'hidden' },
  studyInfoItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, gap: 3 },
  studyInfoDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  studyInfoIcon: { fontSize: 18 },
  studyInfoValue: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black, color: COLORS.text },
  studyInfoLabel: { fontSize: 9, color: COLORS.textMuted, letterSpacing: 0.5 },
  lessonsList: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, overflow: 'hidden' },
  lessonItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.md },
  lessonItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  lessonNumber: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  lessonNumberText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black },
  lessonItemInfo: { flex: 1 },
  lessonItemTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 2 },
  lessonItemScripture: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  lessonArrow: { fontSize: 20 },
  noLessonsBox: { backgroundColor: COLORS.surface2, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg },
  noLessonsText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  startStudyBtn: { height: 54, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  startStudyBtnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },

  // ── Lesson Reader Modal ──
  lessonModalOverlay: { flex: 1, backgroundColor: COLORS.background },
  lessonModalSheet: { flex: 1 },
  lessonHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: SPACING.md, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  lessonBackBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  lessonBackIcon: { fontSize: 24, color: COLORS.text, fontWeight: FONTS.weights.bold, marginTop: -2 },
  lessonHeaderCenter: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.sm },
  lessonHeaderTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, color: COLORS.text },
  lessonHeaderSub: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  lessonCloseBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  lessonCloseBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: FONTS.weights.bold },
  lessonProgressTrack: { height: 3, backgroundColor: COLORS.border },
  lessonProgressFill: { height: '100%', borderRadius: 0 },
  lessonContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.xl },
  lessonTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.lg, lineHeight: 30 },
  lessonScriptureCard: { backgroundColor: 'rgba(201,168,76,0.08)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg },
  lessonScriptureLabel: { fontSize: 9, color: COLORS.gold, fontWeight: FONTS.weights.black, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  lessonScripture: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: FONTS.weights.semibold },
  lessonBody: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 30, marginBottom: SPACING.xl },
  lessonNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: SPACING.lg },
  lessonNavBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg },
  lessonNavBtnDisabled: { opacity: 0.3 },
  lessonNavBtnText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text },
  lessonNavDots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lessonNavDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  lessonCompleteCard: { backgroundColor: 'rgba(76,201,168,0.08)', borderWidth: 1, borderColor: 'rgba(76,201,168,0.25)', borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  lessonCompleteIcon: { fontSize: 48 },
  lessonCompleteTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text },
  lessonCompleteText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  lessonCompleteBtn: { height: 50, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.xl, justifyContent: 'center', alignItems: 'center', marginTop: SPACING.sm },
  lessonCompleteBtnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
});
