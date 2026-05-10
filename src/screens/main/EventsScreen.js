import React, { useDeferredValue, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import SkeletonList from '../../components/ui/SkeletonList';
import EmptyState from '../../components/ui/EmptyState';
import { queryFns, queryKeys } from '../../lib/api';

const { width } = Dimensions.get('window');

const FILTERS = [
  { label: 'All', icon: '✦' },
  { label: 'Service', icon: '⛪' },
  { label: 'Conference', icon: '🏛️' },
  { label: 'Meeting', icon: '🤝' },
  { label: 'Outreach', icon: '🌍' },
  { label: 'Youth', icon: '✨' },
  { label: 'Other', icon: '✳️' },
];

const TYPE_CONFIG = {
  Service: { color: COLORS.gold, bg: 'rgba(201,168,76,0.1)' },
  Conference: { color: COLORS.teal, bg: 'rgba(76,201,168,0.1)' },
  Meeting: { color: COLORS.teal, bg: 'rgba(76,201,168,0.1)' },
  Outreach: { color: '#8a4cc9', bg: 'rgba(138,76,201,0.1)' },
  Youth: { color: '#8a4cc9', bg: 'rgba(138,76,201,0.1)' },
  Other: { color: COLORS.red, bg: 'rgba(201,76,76,0.1)' },
};

export default function EventsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const {
    data: events = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({ queryKey: queryKeys.events, queryFn: queryFns.events });

  const filteredEvents = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
    return events.filter((e) => {
      const matchesFilter = activeFilter === 'All' || e.category === activeFilter;
      const matchesSearch =
        !normalizedQuery ||
        e.title?.toLowerCase().includes(normalizedQuery) ||
        e.location?.toLowerCase().includes(normalizedQuery) ||
        e.creatorName?.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, deferredSearchQuery, events]);

  const typeConfig = (type) => TYPE_CONFIG[type] || { color: COLORS.gold, bg: 'rgba(201,168,76,0.1)' };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Events</Text>
          <Text style={styles.headerSubtitle}>
            Diocese of Oke-Osun · {filteredEvents.length} upcoming
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>📅</Text>
        </View>
      </View>

      <FlatList
        data={isLoading || error ? [] : filteredEvents}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
        refreshControl={(
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        )}
        ListHeaderComponent={(
          <View>
            <View style={styles.searchContainer}>
              <View style={styles.searchWrapper}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search events, location..."
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

            <View style={styles.filtersRow}>
              <FlatList
                data={FILTERS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.label}
                contentContainerStyle={{ gap: SPACING.sm, alignItems: 'center' }}
                renderItem={({ item: filter }) => {
                  const active = activeFilter === filter.label;
                  return (
                    <TouchableOpacity
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => setActiveFilter(filter.label)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.filterChipIcon}>{filter.icon}</Text>
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {isLoading && (
              <View style={styles.listContent}>
                <SkeletonList count={5} itemHeight={140} lines={4} />
              </View>
            )}

            {!isLoading && error && (
              <View style={styles.listContent}>
                <EmptyState
                  icon="📭"
                  title="Unable to load events"
                  description="Please check your connection and try again."
                  actionLabel="Retry"
                  onAction={refetch}
                />
              </View>
            )}
          </View>
        )}
        ListFooterComponent={<View style={{ height: 110 }} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: event, index }) => {
          const config = typeConfig(event.category);
          return (
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => setSelectedEvent(event)}
              activeOpacity={0.85}
            >
              <View style={[styles.eventTopBar, { backgroundColor: config.color }]} />
              <View style={styles.eventCardInner}>
                <View style={styles.eventBadgeRow}>
                  <View style={[styles.typeBadge, { backgroundColor: config.bg, borderColor: config.color }]}>
                    <Text style={[styles.typeBadgeText, { color: config.color }]}>
                      {event.category?.toUpperCase()}
                    </Text>
                  </View>
                  {event.isAllParishes && (
                    <View style={styles.allParishesBadge}>
                      <Text style={styles.allParishesBadgeText}>🌐 All Parishes</Text>
                    </View>
                  )}
                  <Text style={styles.eventCardNumber}>
                    #{String(index + 1).padStart(2, '0')}
                  </Text>
                </View>

                <Text style={styles.eventTitle}>{event.title}</Text>

                <View style={styles.eventMetaGrid}>
                  <EventMeta icon="📅" text={`${formatDate(event.date)}${event.time ? `  ·  ${event.time}` : ''}`} />
                  {event.location && <EventMeta icon="📍" text={event.location} lines={1} />}
                  {event.creatorName && <EventMeta icon="👤" text={event.creatorName} lines={1} />}
                </View>

                <View style={styles.eventFooter}>
                  <View style={styles.attendingRow}>
                    <Text style={styles.attendingDot}>•</Text>
                    <Text style={styles.attendingText}>
                      {event.createdAt ? formatDate(event.createdAt) : '—'}
                    </Text>
                  </View>
                  <View style={[styles.categoryPill, { backgroundColor: config.bg, borderColor: config.color }]}>
                    <Text style={[styles.categoryPillText, { color: config.color }]}>
                      View Details ›
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={!isLoading && !error ? (
          <EmptyState
            icon="📭"
            title="No events found"
            description={searchQuery ? 'Try a different search' : 'No events match this filter'}
            actionLabel="Reset Filters"
            onAction={() => { setActiveFilter('All'); setSearchQuery(''); }}
          />
        ) : null}
      />

      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSelectedEvent(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedEvent(null)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            {selectedEvent && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                <View style={[styles.modalAccentBar, { backgroundColor: typeConfig(selectedEvent.category).color }]} />

                <View style={[styles.modalTypeBadge, { backgroundColor: typeConfig(selectedEvent.category).bg, borderColor: typeConfig(selectedEvent.category).color }]}>
                  <Text style={[styles.modalTypeBadgeText, { color: typeConfig(selectedEvent.category).color }]}>
                    {selectedEvent.category?.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>

                <View style={styles.modalMetaGrid}>
                  <ModalMeta icon="📅" label="Date" value={formatDate(selectedEvent.date)} half />
                  {selectedEvent.time && <ModalMeta icon="⏰" label="Time" value={selectedEvent.time} half />}
                  {selectedEvent.location && <ModalMeta icon="📍" label="Location" value={selectedEvent.location} />}
                  {selectedEvent.creatorName && <ModalMeta icon="👤" label="Organised by" value={selectedEvent.creatorName} />}
                  {selectedEvent.parish && <ModalMeta icon="⛪" label="Parish" value={selectedEvent.parish} />}
                </View>

                <View style={styles.modalDivider} />

                {selectedEvent.description && (
                  <>
                    <Text style={styles.modalSectionLabel}>About this Event</Text>
                    <Text style={styles.modalDescription}>{selectedEvent.description}</Text>
                  </>
                )}

                <View style={styles.postedRow}>
                  <Text style={styles.postedText}>
                    📌 Posted {selectedEvent.createdAt ? formatDate(selectedEvent.createdAt) : '—'}
                  </Text>
                  {selectedEvent.isAllParishes && (
                    <View style={styles.allParishesTag}>
                      <Text style={styles.allParishesTagText}>🌐 Diocese-wide Event</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedEvent(null)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>

                <View style={{ height: 20 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const EventMeta = ({ icon, text, lines = 2 }) => (
  <View style={styles.metaRow}>
    <Text style={styles.metaIcon}>{icon}</Text>
    <Text style={styles.metaText} numberOfLines={lines}>{text}</Text>
  </View>
);

const ModalMeta = ({ icon, label, value, half }) => (
  <View style={[styles.modalMetaItem, half && { width: (width - SPACING.lg * 2 - SPACING.sm) / 2 - SPACING.lg }]}>
    <Text style={styles.modalMetaIcon}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.modalMetaLabel}>{label}</Text>
      <Text style={styles.modalMetaValue} numberOfLines={2}>{value}</Text>
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
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.goldLight, letterSpacing: 0.5 },
  headerSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.gold, letterSpacing: 0.5, marginTop: 2 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  headerIconText: { fontSize: 20 },
  searchContainer: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, height: 46, gap: SPACING.sm },
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
  listContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  eventCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden' },
  eventTopBar: { height: 3, width: '100%' },
  eventCardInner: { padding: SPACING.md },
  eventBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  typeBadge: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  typeBadgeText: { fontSize: 9, fontWeight: FONTS.weights.black, letterSpacing: 0.8 },
  allParishesBadge: { backgroundColor: 'rgba(76,201,168,0.1)', borderWidth: 1, borderColor: COLORS.teal, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  allParishesBadgeText: { fontSize: 9, color: COLORS.teal, fontWeight: FONTS.weights.bold },
  eventCardNumber: { marginLeft: 'auto', fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: FONTS.weights.bold, letterSpacing: 0.5, opacity: 0.5 },
  eventTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.sm, lineHeight: 22 },
  eventMetaGrid: { gap: 6, marginBottom: SPACING.md },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  metaIcon: { fontSize: 12, marginTop: 1 },
  metaText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, flex: 1, lineHeight: 18 },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm, marginTop: SPACING.xs },
  attendingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  attendingDot: { fontSize: 8, color: COLORS.teal },
  attendingText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  categoryPill: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6, borderWidth: 1 },
  categoryPillText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  modalSheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.sm },
  modalClose: { position: 'absolute', top: SPACING.md, right: SPACING.lg, width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalCloseText: { color: COLORS.textMuted, fontSize: 13, fontWeight: FONTS.weights.bold },
  modalContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  modalAccentBar: { height: 3, borderRadius: 2, marginBottom: SPACING.lg, marginTop: SPACING.sm },
  modalTypeBadge: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: SPACING.sm },
  modalTypeBadgeText: { fontSize: 10, fontWeight: FONTS.weights.black, letterSpacing: 1 },
  modalTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.lg, lineHeight: 34 },
  modalMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  modalMetaItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, flex: 1, minWidth: '45%' },
  modalMetaIcon: { fontSize: 18, marginTop: 1 },
  modalMetaLabel: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 },
  modalMetaValue: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: FONTS.weights.semibold, lineHeight: 18 },
  modalDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  modalSectionLabel: { fontSize: 10, color: COLORS.gold, fontWeight: FONTS.weights.black, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACING.sm },
  modalDescription: { fontSize: FONTS.sizes.md, color: COLORS.textMuted, lineHeight: 28, marginBottom: SPACING.lg },
  postedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg, flexWrap: 'wrap', gap: SPACING.sm },
  postedText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  allParishesTag: { backgroundColor: 'rgba(76,201,168,0.1)', borderWidth: 1, borderColor: COLORS.teal, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4 },
  allParishesTagText: { fontSize: FONTS.sizes.xs, color: COLORS.teal, fontWeight: FONTS.weights.bold },
  closeBtn: { height: 50, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  closeBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
});
