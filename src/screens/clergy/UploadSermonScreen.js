import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { API_ROUTES } from '../../constants/config';
import PageLoader from '../../components/ui/PageLoader';
import useOptimisticUpdate from '../../hooks/useOptimisticUpdate';
import { uploadFileToGCS } from '../../lib/fileUpload';

const TYPE_CONFIG = {
  Audio:    { color: COLORS.gold,    bg: 'rgba(201,168,76,0.1)', icon: '🎙️' },
  Video:    { color: COLORS.teal,    bg: 'rgba(76,201,168,0.1)', icon: '📹' },
  Document: { color: '#a78bfa',      bg: 'rgba(167,139,250,0.1)', icon: '📄' },
};

const STATUS_CONFIG = {
  published: { color: COLORS.teal,      bg: 'rgba(76,201,168,0.1)',  label: '● Published' },
  draft:     { color: COLORS.textMuted, bg: 'rgba(122,117,104,0.1)', label: '○ Draft'     },
};

const FILTERS = ['All', 'Audio', 'Video', 'Document', 'Draft'];

export default function UploadSermonScreen({ navigation }) {
  const { user, token } = useAuth();

  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ── Form State ──
  const [formTitle, setFormTitle] = useState('');
  const [formScripture, setFormScripture] = useState('');
  const [formSeries, setFormSeries] = useState('');
  const [formType, setFormType] = useState('Audio');
  const [formLink, setFormLink] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [seriesDropdown, setSeriesDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pickedFile, setPickedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { runOptimistic } = useOptimisticUpdate();

  // ── Auth headers ──
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // ── Derived series from loaded sermons ──
  const seriesMap = sermons.reduce((acc, s) => {
    if (s.series) acc[s.series] = (acc[s.series] || 0) + 1;
    return acc;
  }, {});
  const SERIES_OPTIONS = ['None', ...Object.keys(seriesMap)];

  // ── Fetch my sermons ──
  const fetchSermons = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch(
        `${API_ROUTES.sermons}?limit=100`,
        { headers: authHeaders }
      );
      const data = await response.json();
      if (response.ok) {
        // filter to only show sermons uploaded by this clergy
        const mine = data.sermons.filter(
          (s) => s.uploadedBy === user?.email
        );
        setSermons(mine);
      } else {
        Alert.alert('Error', data.detail || 'Failed to load sermons');
      }
    } catch {
      Alert.alert('Error', 'Network error. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchSermons(); }, []);

  // ── Reset form ──
  const resetForm = () => {
    setFormTitle('');
    setFormScripture('');
    setFormSeries('');
    setFormType('Audio');
    setFormLink('');
    setFormDuration('');
    setFormDescription('');
    setSeriesDropdown(false);
    setPickedFile(null);
  };

  // ── Pick file ──
  const handlePickFile = async () => {
    try {
      const typeMap = {
        Video:    ['video/*'],
        Audio:    ['audio/*'],
        Document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      };
      const result = await DocumentPicker.getDocumentAsync({
        type: typeMap[formType] || ['audio/*'],
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setPickedFile(file);
      if (!formLink.trim()) setFormLink(file.name);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  // ── Upload sermon ──
  const handleUpload = async () => {
    if (!formTitle.trim() || !formScripture.trim() || (!formLink.trim() && !pickedFile)) {
      Alert.alert('Missing Fields', 'Please fill in Title, Scripture, and either provide a Link or pick a File.');
      return;
    }

    setSubmitting(true);
    setUploading(true);

    try {
      let finalUrl = formLink.trim();

      // If file is picked, upload it to GCS first
      if (pickedFile) {
        try {
          finalUrl = await uploadFileToGCS(pickedFile, token, 'sermons');
        } catch (error) {
          Alert.alert('Upload Error', error.message || 'Failed to upload file');
          setSubmitting(false);
          setUploading(false);
          return;
        }
      }

      const optimisticSermon = {
        id: `tmp-${Date.now()}`,
        title: formTitle.trim(),
        scripture: formScripture.trim(),
        series: formSeries === 'None' ? null : formSeries || null,
        type: formType,
        url: finalUrl,
        duration: formDuration.trim() || null,
        description: formDescription.trim() || null,
        preacher: user?.fullName,
        status: 'published',
        views: 0,
      };

      const result = await runOptimistic({
        apply: () => {
          const prev = sermons;
          setSermons([optimisticSermon, ...prev]);
          return prev;
        },
        rollback: (prev) => setSermons(prev),
        request: async () => {
          const response = await fetch(API_ROUTES.sermons, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              title: formTitle.trim(),
              scripture: formScripture.trim(),
              series: formSeries === 'None' ? null : formSeries || null,
              type: formType,
              url: finalUrl,
              duration: formDuration.trim() || null,
              description: formDescription.trim() || null,
              preacher: user?.fullName,
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || 'Failed to upload sermon');
          return data;
        },
      });

      if (result.success) {
        await fetchSermons(true);
        setUploadModal(false);
        resetForm();
        Alert.alert('✓ Uploaded', 'Sermon has been published and is now visible to members.');
      } else {
        Alert.alert('Error', 'Failed to upload sermon');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Network error.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  // ── Delete sermon ──
  const handleDeleteSermon = (sermonId) => {
    Alert.alert('Delete Sermon', 'Are you sure you want to delete this sermon?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            const result = await runOptimistic({
              apply: () => {
                const prev = sermons;
                setSermons(sermons.filter((s) => s.id !== sermonId));
                setDetailModal(false);
                return prev;
              },
              rollback: (prev) => setSermons(prev),
              request: async () => {
                const response = await fetch(`${API_ROUTES.sermons}/${sermonId}`, {
                  method: 'DELETE',
                  headers: authHeaders,
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || 'Failed to delete sermon');
              },
            });

            if (result.success) {
              Alert.alert('✓ Deleted', 'Sermon deleted successfully.');
            } else {
              Alert.alert('Error', 'Failed to delete sermon');
            }
          } catch {
            Alert.alert('Error', 'Network error.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  // ── Filter + Search ──
  const filteredSermons = sermons.filter((s) => {
    const matchesFilter =
      activeFilter === 'All'   ? true :
      activeFilter === 'Draft' ? s.status === 'draft' :
      s.type === activeFilter;
    const matchesSearch =
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scripture?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ── Stats ──
  const stats = {
    total:     sermons.length,
    published: sermons.filter((s) => s.status !== 'draft').length,
    drafts:    sermons.filter((s) => s.status === 'draft').length,
    views:     sermons.reduce((a, s) => a + (s.views || 0), 0),
  };

  // ── Loading screen ──
  if (loading) {
    return <PageLoader text="Loading your sermons..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Sermons</Text>
          <Text style={styles.headerSubtitle}>Manage & Upload</Text>
        </View>
        <TouchableOpacity style={styles.uploadHeaderBtn} onPress={() => setUploadModal(true)}>
          <Text style={styles.uploadHeaderBtnText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats Bar ── */}
      <View style={styles.statsBar}>
        <StatPill icon="📋" value={stats.total}     label="Total"       />
        <View style={styles.statsBarDivider} />
        <StatPill icon="✅" value={stats.published} label="Published"   color={COLORS.teal} />
        <View style={styles.statsBarDivider} />
        <StatPill icon="📝" value={stats.drafts}    label="Drafts"      color={COLORS.textMuted} />
        <View style={styles.statsBarDivider} />
        <StatPill icon="👁" value={stats.views}     label="Total Views" color={COLORS.gold} />
      </View>

      {/* ── Search ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search sermons..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filters ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
              {f === 'Audio'    ? '🎙️ Audio' :
               f === 'Video'    ? '📹 Video' :
               f === 'Document' ? '📄 Docs' :
               f === 'Draft'    ? '📝 Drafts' : '📋 All'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Sermon List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchSermons(true)} tintColor={COLORS.gold} />
        }
      >
        {filteredSermons.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎙️</Text>
            <Text style={styles.emptyTitle}>No Sermons Found</Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? 'Try a different search' : 'Upload your first sermon'}
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => { setSearchQuery(''); setActiveFilter('All'); setUploadModal(true); }}
            >
              <Text style={styles.emptyBtnText}>+ Upload Sermon</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredSermons.map((sermon) => {
            const typeConfig   = TYPE_CONFIG[sermon.type]   || TYPE_CONFIG.Audio;
            const statusConfig = STATUS_CONFIG[sermon.status] || STATUS_CONFIG.published;
            return (
              <TouchableOpacity
                key={sermon.id}
                style={styles.sermonCard}
                onPress={() => { setSelectedSermon(sermon); setDetailModal(true); }}
                activeOpacity={0.85}
              >
                <View style={[styles.sermonTopBar, { backgroundColor: typeConfig.color }]} />
                <View style={styles.sermonCardInner}>
                  <View style={styles.sermonBadgesRow}>
                    <View style={[styles.typeBadge, { backgroundColor: typeConfig.bg, borderColor: typeConfig.color }]}>
                      <Text style={styles.typeBadgeIcon}>{typeConfig.icon}</Text>
                      <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>{sermon.type}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                    </View>
                    <Text style={styles.sermonDate}>
                      {sermon.createdAt ? sermon.createdAt.slice(0, 10) : '—'}
                    </Text>
                  </View>
                  <Text style={styles.sermonTitle}>{sermon.title}</Text>
                  <Text style={styles.sermonScripture}>📖 {sermon.scripture}</Text>
                  {sermon.series ? <Text style={styles.sermonSeries}>🎯 {sermon.series}</Text> : null}
                  <View style={styles.sermonFooter}>
                    <Text style={styles.sermonMeta}>⏱ {sermon.duration || 'N/A'}</Text>
                    <Text style={styles.sermonDot}>·</Text>
                    <Text style={styles.sermonMeta}>👁 {sermon.views || 0} views</Text>
                    <View style={styles.sermonManageBtn}>
                      <Text style={styles.sermonManageBtnText}>Manage ›</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Upload CTA */}
        <TouchableOpacity style={styles.uploadCta} onPress={() => setUploadModal(true)} activeOpacity={0.85}>
          <Text style={styles.uploadCtaIcon}>🎙️</Text>
          <View>
            <Text style={styles.uploadCtaTitle}>Upload New Sermon</Text>
            <Text style={styles.uploadCtaText}>Add audio, video or link</Text>
          </View>
          <Text style={styles.uploadCtaArrow}>›</Text>
        </TouchableOpacity>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ══════════════════════════════════
          UPLOAD SERMON MODAL
      ══════════════════════════════════ */}
      <Modal
        visible={uploadModal}
        animationType="slide"
        transparent
        onRequestClose={() => { setUploadModal(false); resetForm(); }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => { setUploadModal(false); resetForm(); }} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => { setUploadModal(false); resetForm(); }}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.modalAccentBar} />
              <Text style={styles.modalTitle}>Upload Sermon</Text>
              <Text style={styles.modalSubtitle}>Fill in the details below to add a sermon</Text>

              {/* Type Selector */}
              <Text style={styles.formLabel}>📂  TYPE</Text>
              <View style={styles.typeRow}>
                {['Audio', 'Video', 'Document'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, formType === t && { backgroundColor: TYPE_CONFIG[t].bg, borderColor: TYPE_CONFIG[t].color }]}
                    onPress={() => setFormType(t)}
                  >
                    <Text style={styles.typeChipIcon}>{TYPE_CONFIG[t].icon}</Text>
                    <Text style={[styles.typeChipText, formType === t && { color: TYPE_CONFIG[t].color, fontWeight: FONTS.weights.bold }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FormField label="📝  SERMON TITLE *"       value={formTitle}       onChangeText={setFormTitle}       placeholder="Enter sermon title" />
              <FormField label="📖  SCRIPTURE REFERENCE *" value={formScripture}   onChangeText={setFormScripture}   placeholder="e.g. John 3:16" />

              {/* Series Dropdown */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>🎯  SERMON SERIES</Text>
                <TouchableOpacity style={styles.dropdownBtn} onPress={() => setSeriesDropdown(!seriesDropdown)}>
                  <Text style={[styles.dropdownBtnText, formSeries && { color: COLORS.text }]}>
                    {formSeries || 'Select a series (optional)'}
                  </Text>
                  <Text style={styles.dropdownArrow}>{seriesDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {seriesDropdown && (
                  <View style={styles.dropdownList}>
                    {SERIES_OPTIONS.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.dropdownItem, formSeries === s && styles.dropdownItemActive]}
                        onPress={() => { setFormSeries(s === 'None' ? '' : s); setSeriesDropdown(false); }}
                      >
                        <Text style={[styles.dropdownItemText, formSeries === s && styles.dropdownItemTextActive]}>{s}</Text>
                        {formSeries === s && <Text style={styles.dropdownCheck}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                    {/* Custom series input */}
                    <View style={styles.dropdownCustomWrapper}>
                      <TextInput
                        style={styles.dropdownCustomInput}
                        placeholder="Or type a new series..."
                        placeholderTextColor={COLORS.textMuted}
                        value={formSeries}
                        onChangeText={setFormSeries}
                        onFocus={() => setSeriesDropdown(true)}
                      />
                    </View>
                  </View>
                )}
              </View>

              <FormField
                label={
                  formType === 'Audio'    ? '🎵  AUDIO LINK *' :
                  formType === 'Video'    ? '📹  VIDEO LINK *' :
                                            '🔗  DOCUMENT LINK *'
                }
                value={formLink}
                onChangeText={setFormLink}
                placeholder={
                  formType === 'Audio'    ? 'e.g. https://soundcloud.com/...' :
                  formType === 'Video'    ? 'e.g. https://youtube.com/...' :
                                            'e.g. https://drive.google.com/...'
                }
                keyboardType="url"
              />

              {/* File Picker */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>📁  OR UPLOAD FILE</Text>
                <TouchableOpacity
                  style={[styles.filePickerBtn, pickedFile && styles.filePickerBtnActive]}
                  onPress={handlePickFile}
                  disabled={uploading}
                >
                  <Text style={styles.filePickerIcon}>{pickedFile ? '✓' : '📂'}</Text>
                  <View style={styles.filePickerContent}>
                    <Text style={styles.filePickerText}>
                      {pickedFile ? `File: ${pickedFile.name}` :
                     formType === 'Audio'    ? 'Pick Audio File' :
                     formType === 'Video'    ? 'Pick Video File' :
                                               'Pick PDF / Word Doc'}
                    </Text>
                    {pickedFile && <Text style={styles.filePickerSize}>{Math.round((pickedFile.size || 0) / 1024 / 1024 * 10) / 10} MB</Text>}
                  </View>
                </TouchableOpacity>
                {uploading && (
                  <View style={styles.uploadingIndicator}>
                    <ActivityIndicator color={COLORS.gold} size="small" />
                    <Text style={styles.uploadingText}>Uploading file...</Text>
                  </View>
                )}
              </View>

              <FormField label="⏱  DURATION" value={formDuration} onChangeText={setFormDuration} placeholder="e.g. 45 mins" />

              {/* Description */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>📄  DESCRIPTION</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Brief description of the sermon..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Preacher (auto-filled) */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>⛪  PREACHER</Text>
                <View style={[styles.formInput, styles.formInputReadOnly]}>
                  <Text style={styles.formInputReadOnlyText}>{user?.fullName || 'Rev. Clergy'}</Text>
                </View>
                <Text style={styles.formHint}>Auto-filled from your profile</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                onPress={handleUpload}
                disabled={submitting}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? '⏳  Uploading...' : '🎙️  Upload Sermon'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setUploadModal(false); resetForm(); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════
          SERMON DETAIL MODAL
      ══════════════════════════════════ */}
      {selectedSermon && (
        <Modal visible={detailModal} animationType="slide" transparent onRequestClose={() => setDetailModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setDetailModal(false)} />
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <TouchableOpacity style={styles.modalClose} onPress={() => setDetailModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                <View style={[styles.modalAccentBar, { backgroundColor: TYPE_CONFIG[selectedSermon.type]?.color || COLORS.gold }]} />

                <View style={styles.detailBadgesRow}>
                  <View style={[styles.typeBadge, { backgroundColor: TYPE_CONFIG[selectedSermon.type]?.bg, borderColor: TYPE_CONFIG[selectedSermon.type]?.color }]}>
                    <Text style={styles.typeBadgeIcon}>{TYPE_CONFIG[selectedSermon.type]?.icon}</Text>
                    <Text style={[styles.typeBadgeText, { color: TYPE_CONFIG[selectedSermon.type]?.color }]}>{selectedSermon.type}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[selectedSermon.status]?.bg || STATUS_CONFIG.published.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: STATUS_CONFIG[selectedSermon.status]?.color || STATUS_CONFIG.published.color }]}>
                      {STATUS_CONFIG[selectedSermon.status]?.label || STATUS_CONFIG.published.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.detailTitle}>{selectedSermon.title}</Text>

                <View style={styles.detailMetaGrid}>
                  <DetailMeta icon="📖" label="Scripture" value={selectedSermon.scripture || '—'} />
                  <DetailMeta icon="👤" label="Preacher"  value={selectedSermon.preacher || user?.fullName} />
                  <DetailMeta icon="📅" label="Date"      value={selectedSermon.createdAt ? selectedSermon.createdAt.slice(0, 10) : '—'} />
                  <DetailMeta icon="⏱" label="Duration"  value={selectedSermon.duration || 'N/A'} />
                  <DetailMeta icon="👁" label="Views"     value={`${selectedSermon.views || 0} views`} />
                  {selectedSermon.series && <DetailMeta icon="🎯" label="Series" value={selectedSermon.series} />}
                  {selectedSermon.url && <DetailMeta icon="🔗" label="Link" value={selectedSermon.url} />}
                </View>

                {selectedSermon.description && (
                  <View style={styles.detailDescWrapper}>
                    <Text style={styles.detailDescLabel}>ABOUT THIS SERMON</Text>
                    <Text style={styles.detailDesc}>{selectedSermon.description}</Text>
                  </View>
                )}

                {/* Action loading */}
                {actionLoading && (
                  <View style={styles.actionLoading}>
                    <ActivityIndicator color={COLORS.gold} size="small" />
                    <Text style={styles.actionLoadingText}>Processing...</Text>
                  </View>
                )}

                <View style={styles.detailActionsRow}>
                  <TouchableOpacity
                    style={[styles.detailActionBtn, { backgroundColor: 'rgba(201,76,76,0.1)', borderColor: 'rgba(201,76,76,0.3)' }]}
                    onPress={() => { if (!actionLoading) handleDeleteSermon(selectedSermon.id); }}
                  >
                    <Text style={[styles.detailActionText, { color: COLORS.red }]}>🗑 Delete</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.closeDetailBtn} onPress={() => setDetailModal(false)}>
                  <Text style={styles.closeDetailBtnText}>Close</Text>
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ── Reusable Components ──
const StatPill = ({ icon, value, label, color }) => (
  <View style={styles.statPill}>
    <Text style={styles.statPillIcon}>{icon}</Text>
    <Text style={[styles.statPillValue, color && { color }]}>{value}</Text>
    <Text style={styles.statPillLabel}>{label}</Text>
  </View>
);

const FormField = ({ label, value, onChangeText, placeholder, keyboardType }) => (
  <View style={styles.formField}>
    <Text style={styles.formLabel}>{label}</Text>
    <TextInput
      style={styles.formInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textMuted}
      keyboardType={keyboardType || 'default'}
      autoCapitalize="none"
    />
  </View>
);

const DetailMeta = ({ icon, label, value }) => (
  <View style={styles.detailMetaItem}>
    <Text style={styles.detailMetaLabel}>{icon}  {label}</Text>
    <Text style={styles.detailMetaValue} numberOfLines={1}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingScreen: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  loadingText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },

  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: SPACING.md, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: COLORS.text, fontWeight: FONTS.weights.bold, marginTop: -2 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.gold, letterSpacing: 0.5 },
  headerSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, letterSpacing: 0.5 },
  uploadHeaderBtn: { backgroundColor: COLORS.gold, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8 },
  uploadHeaderBtnText: { fontSize: FONTS.sizes.sm, color: COLORS.background, fontWeight: FONTS.weights.bold },

  // ── Stats Bar ──
  statsBar: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: SPACING.sm },
  statPill: { flex: 1, alignItems: 'center', gap: 2 },
  statPillIcon: { fontSize: 14 },
  statPillValue: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, color: COLORS.text },
  statPillLabel: { fontSize: 9, color: COLORS.textMuted, letterSpacing: 0.3 },
  statsBarDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4 },

  // ── Search ──
  searchContainer: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, height: 46, gap: SPACING.sm },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.sm, height: '100%' },
  searchClear: { color: COLORS.textMuted, fontSize: 13 },

  // ── Filters ──
  filtersRow: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm, gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: 'rgba(201,168,76,0.1)', borderColor: COLORS.gold },
  filterChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  filterChipTextActive: { color: COLORS.gold, fontWeight: FONTS.weights.bold },

  // ── Scroll ──
  scrollContent: { paddingTop: SPACING.sm, paddingHorizontal: SPACING.lg },

  // ── Sermon Card ──
  sermonCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden' },
  sermonTopBar: { height: 3 },
  sermonCardInner: { padding: SPACING.md },
  sermonBadgesRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  typeBadgeIcon: { fontSize: 11 },
  typeBadgeText: { fontSize: 11, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: FONTS.weights.bold },
  sermonDate: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginLeft: 'auto' },
  sermonTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: 4 },
  sermonScripture: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: 2 },
  sermonSeries: { fontSize: FONTS.sizes.sm, color: COLORS.gold, marginBottom: SPACING.sm },
  sermonFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  sermonMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  sermonDot: { color: COLORS.textMuted, fontSize: 10 },
  sermonManageBtn: { marginLeft: 'auto', backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  sermonManageBtnText: { fontSize: 11, color: COLORS.gold, fontWeight: FONTS.weights.semibold },

  // ── Upload CTA ──
  uploadCta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: 'rgba(201,168,76,0.06)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  uploadCtaIcon: { fontSize: 28 },
  uploadCtaTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 2 },
  uploadCtaText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  uploadCtaArrow: { marginLeft: 'auto', fontSize: 22, color: COLORS.textMuted },

  // ── Empty State ──
  emptyState: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text },
  emptySubText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  emptyBtn: { backgroundColor: COLORS.gold, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, marginTop: SPACING.sm },
  emptyBtnText: { color: COLORS.background, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.md },

  // ── Detail Modal ──
  detailBadgesRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  detailTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.md, lineHeight: 28 },
  detailMetaGrid: { backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.lg },
  detailMetaItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailMetaLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  detailMetaValue: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, flex: 1, textAlign: 'right' },
  detailDescWrapper: { backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg },
  detailDescLabel: { fontSize: 10, color: COLORS.gold, fontWeight: FONTS.weights.black, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACING.sm },
  detailDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: 20 },
  actionLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
  actionLoadingText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  detailActionsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  detailActionBtn: { flex: 1, height: 48, borderWidth: 1, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  detailActionText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  closeDetailBtn: { height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg },
  closeDetailBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },

  // ── Modal ──
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  modalSheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.sm },
  modalClose: { position: 'absolute', top: SPACING.md, right: SPACING.lg, width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalCloseText: { color: COLORS.textMuted, fontSize: 13, fontWeight: FONTS.weights.bold },
  modalContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  modalAccentBar: { height: 3, borderRadius: 2, backgroundColor: COLORS.gold, marginBottom: SPACING.lg, marginTop: SPACING.sm },
  modalTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.xs },
  modalSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },
  typeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  typeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, height: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border },
  typeChipIcon: { fontSize: 18 },
  typeChipText: { fontSize: FONTS.sizes.md, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  formField: { gap: SPACING.xs, marginBottom: SPACING.md },
  formLabel: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: COLORS.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: SPACING.xs },
  formInput: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.text, fontSize: FONTS.sizes.md, height: 50 },
  formTextArea: { height: 90, paddingTop: SPACING.sm },
  formInputReadOnly: { backgroundColor: COLORS.surface2, opacity: 0.7, justifyContent: 'center' },
  formInputReadOnlyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
  formHint: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, opacity: 0.7 },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 50 },
  dropdownBtnText: { fontSize: FONTS.sizes.md, color: COLORS.textMuted },
  dropdownArrow: { fontSize: 11, color: COLORS.textMuted },
  dropdownList: { backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemActive: { backgroundColor: 'rgba(201,168,76,0.1)' },
  dropdownItemText: { fontSize: FONTS.sizes.sm, color: COLORS.text },
  dropdownItemTextActive: { color: COLORS.gold, fontWeight: FONTS.weights.bold },
  dropdownCheck: { fontSize: 14, color: COLORS.gold, fontWeight: FONTS.weights.bold },
  dropdownCustomWrapper: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  dropdownCustomInput: { color: COLORS.text, fontSize: FONTS.sizes.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 4 },
  filePickerBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  filePickerBtnActive: { backgroundColor: 'rgba(201,168,76,0.1)', borderColor: COLORS.gold },
  filePickerIcon: { fontSize: 24 },
  filePickerContent: { flex: 1 },
  filePickerText: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
  filePickerSize: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: SPACING.xs },
  uploadingIndicator: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: 'rgba(201,168,76,0.05)', borderRadius: RADIUS.md },
  uploadingText: { color: COLORS.gold, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  submitBtn: { backgroundColor: COLORS.gold, borderRadius: RADIUS.lg, height: 54, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  cancelBtn: { height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg },
  cancelBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
});