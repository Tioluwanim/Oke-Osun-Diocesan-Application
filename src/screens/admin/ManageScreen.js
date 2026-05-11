import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { API_ROUTES } from '../../constants/config';
import useOptimisticUpdate from '../../hooks/useOptimisticUpdate';
import { uploadFileToGCS } from '../../lib/fileUpload';

const INNER_TABS = [
  { key: 'users',     label: 'Users',     icon: '👤' },
  { key: 'parishes',  label: 'Parishes',  icon: '⛪' },
  { key: 'events',    label: 'Events',    icon: '📅' },
  { key: 'live',      label: 'Live',      icon: '📺' },
  { key: 'resources', label: 'Resources', icon: '📖' },
  { key: 'settings',  label: 'Settings',  icon: '⚙️' },
];

const ROLE_CONFIG = {
  admin:  { label: 'Admin',  color: COLORS.red,  bg: 'rgba(201,76,76,0.1)',  icon: '🛡️' },
  clergy: { label: 'Clergy', color: COLORS.teal, bg: 'rgba(76,201,168,0.1)', icon: '⛪' },
  member: { label: 'Member', color: COLORS.gold, bg: 'rgba(201,168,76,0.1)', icon: '🙏' },
};

const STATUS_CONFIG = {
  active:   { label: '● Active',   color: COLORS.teal      },
  inactive: { label: '○ Inactive', color: COLORS.textMuted  },
  pending:  { label: '◎ Pending',  color: COLORS.gold      },
};

const EVENT_CATEGORIES = ['Service', 'Meeting', 'Conference', 'Outreach', 'Youth', 'Other'];

const SETTINGS_ITEMS = [
  { id: 's1', icon: '🌐', label: 'Diocese Name',       value: 'Diocese of Oke-Osun',   editable: true  },
  { id: 's2', icon: '📍', label: 'Diocese Location',   value: 'Osogbo, Osun State',     editable: true  },
  { id: 's3', icon: '✉️', label: 'Contact Email',      value: 'info@okeosundiocese.ng', editable: true  },
  { id: 's4', icon: '📞', label: 'Contact Phone',      value: '+234 803 000 0000',       editable: true  },
  { id: 's5', icon: '📺', label: 'YouTube Channel',    value: '@OkeOsunDiocese',         editable: true  },
  { id: 's6', icon: '🔔', label: 'Push Notifications', value: 'Enabled',                 editable: false },
  { id: 's7', icon: '🔒', label: 'App Version',        value: 'v1.0.0',                  editable: false },
];

export default function ManageScreen({ navigation }) {
  const { user, token } = useAuth();
  const { runOptimistic } = useOptimisticUpdate();

  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('All');

  // ── Users state ──
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailModal, setUserDetailModal] = useState(false);

  // ── Parishes state ──
  const [parishes, setParishes] = useState([]);
  const [loadingParishes, setLoadingParishes] = useState(false);
  const [addParishModal, setAddParishModal] = useState(false);
  const [parishName, setParishName] = useState('');
  const [parishLocation, setParishLocation] = useState('');
  const [parishArchdeaconry, setParishArchdeaconry] = useState('');
  const [savingParish, setSavingParish] = useState(false);

  // ── Events state ──
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [addEventModal, setAddEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetailModal, setEventDetailModal] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCategory, setEventCategory] = useState('Service');
  const [eventDescription, setEventDescription] = useState('');
  const [eventAllParishes, setEventAllParishes] = useState(false);

  // ── Live state ──
  const [stream, setStream] = useState(null);
  const [loadingStream, setLoadingStream] = useState(false);
  const [savingStream, setSavingStream] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [streamDate, setStreamDate] = useState('');
  const [streamTime, setStreamTime] = useState('');
  const [togglingLive, setTogglingLive] = useState(false);

  // ── Resources state ──
  const [resourceModal, setResourceModal] = useState(false);
  const [resourceType, setResourceType] = useState('magazine');
  const [savingResource, setSavingResource] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resCategory, setResCategory] = useState('');
  const [resDate, setResDate] = useState('');
  const [resDescription, setResDescription] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resPages, setResPages] = useState('');
  const [resBook, setResBook] = useState('');
  const [resLessons, setResLessons] = useState('');
  const [resLevel, setResLevel] = useState('Beginner');
  const [resSize, setResSize] = useState('');
  const [resPickedFile, setResPickedFile] = useState(null);
  const [resUploading, setResUploading] = useState(false);

  // ── Auth headers ──
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // ── Fetch users ──
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(API_ROUTES.adminUsers, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch {}
    finally { setLoadingUsers(false); }
  }, [token]);

  // ── Fetch parishes ──
  const fetchParishes = useCallback(async () => {
    setLoadingParishes(true);
    try {
      const res = await fetch(API_ROUTES.parishes);
      const data = await res.json();
      if (res.ok) setParishes(data.parishes || []);
    } catch {}
    finally { setLoadingParishes(false); }
  }, []);

  // ── Fetch events ──
  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch(`${API_ROUTES.events}?limit=100`);
      const data = await res.json();
      if (res.ok) setEvents(data.events || []);
    } catch {}
    finally { setLoadingEvents(false); }
  }, []);

  // ── Fetch stream ──
  const fetchStream = useCallback(async () => {
    setLoadingStream(true);
    try {
      const res = await fetch(API_ROUTES.live);
      const data = await res.json();
      if (res.ok) {
        setStream(data.stream);
        setStreamTitle(data.stream?.title || '');
        setStreamUrl(data.stream?.youtubeUrl || '');
        setStreamDescription(data.stream?.description || '');
        setStreamDate(data.stream?.scheduledDate || '');
        setStreamTime(data.stream?.scheduledTime || '');
      }
    } catch {}
    finally { setLoadingStream(false); }
  }, []);

  // ── Load on tab switch ──
  useEffect(() => {
    if (activeTab === 'users'    && users.length    === 0) fetchUsers();
    if (activeTab === 'parishes' && parishes.length === 0) fetchParishes();
    if (activeTab === 'events'   && events.length   === 0) fetchEvents();
    if (activeTab === 'live')                               fetchStream();
  }, [activeTab]);

  // ── User actions ──
  const handleApproveUser = async (id) => {
    try {
      const result = await runOptimistic({
        apply: () => {
          const prev = users;
          setUsers(users.map(u => u.id === id ? { ...u, status: 'active' } : u));
          setUserDetailModal(false);
          return prev;
        },
        rollback: (prev) => setUsers(prev),
        request: async () => {
          const res = await fetch(`${API_ROUTES.adminUsers}/${id}/approve`, { method: 'PATCH', headers: authHeaders });
          if (!res.ok) throw new Error('Failed to approve user');
        },
      });

      if (result.success) {
        Alert.alert('✓ Approved', 'Clergy account approved.');
      } else {
        Alert.alert('Error', 'Failed to approve user');
      }
    } catch { Alert.alert('Error', 'Network error'); }
  };

  const handleChangeRole = async (id, role) => {
    try {
      const result = await runOptimistic({
        apply: () => {
          const prev = users;
          setUsers(users.map(u => u.id === id ? { ...u, role } : u));
          setSelectedUser(prevUser => (prevUser ? { ...prevUser, role } : prevUser));
          return prev;
        },
        rollback: (prev) => {
          setUsers(prev);
          const original = prev.find((u) => u.id === id);
          setSelectedUser(original || null);
        },
        request: async () => {
          const res = await fetch(`${API_ROUTES.adminUsers}/${id}/role`, { method: 'PATCH', headers: authHeaders, body: JSON.stringify({ role }) });
          if (!res.ok) throw new Error('Failed to change role');
        },
      });

      if (result.success) {
        Alert.alert('✓ Updated', `Role changed to ${role}.`);
      } else {
        Alert.alert('Error', 'Failed to change role');
      }
    } catch { Alert.alert('Error', 'Network error'); }
  };

  const handleSuspendUser = async (id) => {
    Alert.alert('Suspend User', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Suspend', style: 'destructive', onPress: async () => {
        try {
          const result = await runOptimistic({
            apply: () => {
              const prev = users;
              setUsers(users.map(u => u.id === id ? { ...u, status: 'inactive' } : u));
              setUserDetailModal(false);
              return prev;
            },
            rollback: (prev) => setUsers(prev),
            request: async () => {
              const res = await fetch(`${API_ROUTES.adminUsers}/${id}/suspend`, { method: 'PATCH', headers: authHeaders });
              if (!res.ok) throw new Error('Failed to suspend user');
            },
          });
          if (!result.success) Alert.alert('Error', 'Failed to suspend user');
        } catch {}
      }},
    ]);
  };

  const handleDeleteUser = async (id) => {
    Alert.alert('Delete User', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const result = await runOptimistic({
            apply: () => {
              const prev = users;
              setUsers(users.filter(u => u.id !== id));
              setUserDetailModal(false);
              return prev;
            },
            rollback: (prev) => setUsers(prev),
            request: async () => {
              const res = await fetch(`${API_ROUTES.adminUsers}/${id}`, { method: 'DELETE', headers: authHeaders });
              if (!res.ok) throw new Error('Failed to delete user');
            },
          });
          if (!result.success) Alert.alert('Error', 'Failed to delete user');
        } catch {}
      }},
    ]);
  };

  // ── Add Parish ──
  const handleAddParish = async () => {
    if (!parishName.trim() || !parishLocation.trim()) {
      Alert.alert('Error', 'Please fill in name and location');
      return;
    }
    setSavingParish(true);
    try {
      const optimisticParish = {
        id: `tmp-${Date.now()}`,
        name: parishName.trim(),
        location: parishLocation.trim(),
        archdeaconry: parishArchdeaconry.trim() || null,
        status: 'active',
      };
      const result = await runOptimistic({
        apply: () => {
          const prev = parishes;
          setParishes([...prev, optimisticParish]);
          return prev;
        },
        rollback: (prev) => setParishes(prev),
        request: async () => {
          const res = await fetch(API_ROUTES.parishes, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ name: parishName.trim(), location: parishLocation.trim(), archdeaconry: parishArchdeaconry.trim() || null }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || 'Failed to add parish');
        },
      });
      if (result.success) {
        setParishName(''); setParishLocation(''); setParishArchdeaconry('');
        setAddParishModal(false);
        Alert.alert('✓ Added', 'New parish added.');
      } else {
        Alert.alert('Error', 'Failed to add parish');
      }
    } catch { Alert.alert('Error', 'Network error'); }
    finally { setSavingParish(false); }
  };

  // ── Add Event ──
  const handleAddEvent = async () => {
    if (!eventTitle.trim() || !eventDate.trim()) {
      Alert.alert('Error', 'Title and date are required.');
      return;
    }
    setSavingEvent(true);
    try {
      const optimisticEvent = {
        id: `tmp-${Date.now()}`,
        title: eventTitle.trim(),
        date: eventDate.trim(),
        time: eventTime.trim() || null,
        location: eventLocation.trim() || null,
        category: eventCategory,
        description: eventDescription.trim() || null,
        isAllParishes: eventAllParishes,
      };
      const result = await runOptimistic({
        apply: () => {
          const prev = events;
          setEvents([optimisticEvent, ...prev]);
          return prev;
        },
        rollback: (prev) => setEvents(prev),
        request: async () => {
          const res = await fetch(API_ROUTES.events, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              title:        eventTitle.trim(),
              date:         eventDate.trim(),
              time:         eventTime.trim() || null,
              location:     eventLocation.trim() || null,
              category:     eventCategory,
              description:  eventDescription.trim() || null,
              isAllParishes: eventAllParishes,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || 'Failed to create event');
        },
      });
      if (result.success) {
        resetEventForm();
        setAddEventModal(false);
        Alert.alert('✓ Created', 'Event created successfully.');
      } else {
        Alert.alert('Error', 'Failed to create event');
      }
    } catch { Alert.alert('Error', 'Network error'); }
    finally { setSavingEvent(false); }
  };

  // ── Delete Event ──
  const handleDeleteEvent = async (id) => {
    Alert.alert('Delete Event', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const result = await runOptimistic({
            apply: () => {
              const prev = events;
              setEvents(events.filter(e => e.id !== id));
              setEventDetailModal(false);
              return prev;
            },
            rollback: (prev) => setEvents(prev),
            request: async () => {
              const res = await fetch(`${API_ROUTES.events}/${id}`, { method: 'DELETE', headers: authHeaders });
              if (!res.ok) throw new Error('Failed to delete event');
            },
          });
          if (result.success) {
            Alert.alert('✓ Deleted', 'Event deleted.');
          } else {
            Alert.alert('Error', 'Failed to delete event');
          }
        } catch {}
      }},
    ]);
  };

  const resetEventForm = () => {
    setEventTitle(''); setEventDate(''); setEventTime('');
    setEventLocation(''); setEventCategory('Service');
    setEventDescription(''); setEventAllParishes(false);
  };

  // ── Update Live Stream ──
  const handleSaveStream = async () => {
    if (!streamUrl.trim()) {
      Alert.alert('Error', 'YouTube URL is required.');
      return;
    }
    setSavingStream(true);
    try {
      const optimisticStream = {
        ...(stream || {}),
        youtubeUrl: streamUrl.trim(),
        title: streamTitle.trim() || null,
        description: streamDescription.trim() || null,
        scheduledDate: streamDate.trim() || null,
        scheduledTime: streamTime.trim() || null,
      };
      const result = await runOptimistic({
        apply: () => {
          const prev = stream;
          setStream(optimisticStream);
          return prev;
        },
        rollback: (prev) => setStream(prev),
        request: async () => {
          const res = await fetch(API_ROUTES.live, {
            method: 'PATCH',
            headers: authHeaders,
            body: JSON.stringify({
              youtubeUrl:    streamUrl.trim(),
              title:         streamTitle.trim() || null,
              description:   streamDescription.trim() || null,
              scheduledDate: streamDate.trim() || null,
              scheduledTime: streamTime.trim() || null,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || 'Failed to update stream');
          return data;
        },
      });
      if (result.success) {
        Alert.alert('✓ Saved', 'Live stream settings updated.');
      } else {
        Alert.alert('Error', 'Failed to update stream');
      }
    } catch { Alert.alert('Error', 'Network error'); }
    finally { setSavingStream(false); }
  };

  // ── Toggle Live ──
  const handleToggleLive = async () => {
    setTogglingLive(true);
    try {
      const result = await runOptimistic({
        apply: () => {
          const prev = stream;
          if (stream) setStream({ ...stream, isLive: !stream.isLive });
          return prev;
        },
        rollback: (prev) => setStream(prev),
        request: async () => {
          const res = await fetch(`${API_ROUTES.live}/toggle`, { method: 'PATCH', headers: authHeaders });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || 'Failed to toggle live');
          setStream(data.stream);
          Alert.alert(data.stream.isLive ? '🔴 Live!' : '⚫ Offline', data.message);
        },
      });
      if (!result.success) Alert.alert('Error', 'Failed to toggle live');
    } catch { Alert.alert('Error', 'Network error'); }
    finally { setTogglingLive(false); }
  };

  // ── Upload Resource ──
  const handlePickResourceFile = async () => {
    try {
      const typeMap = {
        magazine:   ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        bible_study:['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        document:   ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '*/*'],
      };
      const result = await DocumentPicker.getDocumentAsync({ type: typeMap[resourceType] || ['*/*'] });
      if (result.canceled) return;
      const file = result.assets[0];
      setResPickedFile(file);
      if (!resUrl.trim()) setResUrl(file.name);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleUploadResource = async () => {
    if (!resTitle.trim()) { Alert.alert('Error', 'Title is required.'); return; }
    setSavingResource(true);
    setResUploading(true);
    try {
      let url, body;
      let finalUrl = resUrl.trim() || null;

      // If file is picked, upload it to GCS first
      if (resPickedFile) {
        try {
          const folderMap = {
            magazine: 'magazines',
            bible_study: 'bible-studies',
            document: 'documents',
          };
          finalUrl = await uploadFileToGCS(resPickedFile, token, folderMap[resourceType]);
        } catch (error) {
          Alert.alert('Upload Error', error.message || 'Failed to upload file');
          setSavingResource(false);
          setResUploading(false);
          return;
        }
      }

      if (resourceType === 'magazine') {
        url = API_ROUTES.magazines;
        body = { title: resTitle.trim(), category: resCategory || 'Newsletter', date: resDate.trim() || null, description: resDescription.trim() || null, url: finalUrl, pages: resPages ? parseInt(resPages) : null };
      } else if (resourceType === 'bible_study') {
        url = API_ROUTES.bibleStudies;
        body = { title: resTitle.trim(), book: resBook.trim() || 'General', lessons: resLessons ? parseInt(resLessons) : 1, level: resLevel, description: resDescription.trim() || null, url: finalUrl };
      } else {
        url = API_ROUTES.documents;
        body = { title: resTitle.trim(), category: resCategory || 'Administration', date: resDate.trim() || null, size: resSize.trim() || null, url: finalUrl };
      }
      const res = await fetch(url, { method: 'POST', headers: authHeaders, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        resetResourceForm();
        setResourceModal(false);
        Alert.alert('✓ Uploaded', `${resourceType === 'magazine' ? 'Magazine' : resourceType === 'bible_study' ? 'Bible Study' : 'Document'} uploaded successfully.`);
      } else {
        Alert.alert('Error', data.detail || 'Failed to upload');
      }
    } catch (error) { Alert.alert('Error', error.message || 'Network error'); }
    finally { setSavingResource(false); setResUploading(false); }
  };

  const resetResourceForm = () => {
    setResTitle(''); setResCategory(''); setResDate(''); setResDescription('');
    setResUrl(''); setResPages(''); setResBook(''); setResLessons('');
    setResLevel('Beginner'); setResSize(''); setResPickedFile(null);
  };

  // ── Filtered users ──
  const USER_FILTERS = ['All', 'Clergy', 'Members', 'Pending Clergy'];
  const pendingClergyCount = users.filter(u => u.role === 'clergy' && u.status === 'pending').length;

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchSearch = u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.parish?.toLowerCase().includes(q);
    const matchFilter =
      userFilter === 'All'            ? true :
      userFilter === 'Clergy'         ? u.role === 'clergy' :
      userFilter === 'Members'        ? u.role === 'member' :
      userFilter === 'Pending Clergy' ? (u.role === 'clergy' && u.status === 'pending') : true;
    return matchSearch && matchFilter;
  });

  const getInitials = (name) => (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Manage</Text>
          <Text style={styles.headerSubtitle}>Admin Control Panel</Text>
        </View>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeIcon}>🛡️</Text>
          <Text style={styles.adminBadgeText}>Admin</Text>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ════ USERS TAB ════ */}
        {activeTab === 'users' && (
          <View>
            <View style={styles.summaryRow}>
              <SummaryPill icon="👤" value={users.length} label="Total" />
              <SummaryPill icon="⛪" value={users.filter(u => u.role === 'clergy').length} label="Clergy" color={COLORS.teal} />
              <SummaryPill icon="🙏" value={users.filter(u => u.role === 'member').length} label="Members" color={COLORS.gold} />
              <SummaryPill icon="◎" value={pendingClergyCount} label="Pending" color={COLORS.gold} />
            </View>

            {pendingClergyCount > 0 && (
              <View style={styles.pendingNotice}>
                <Text style={styles.pendingNoticeIcon}>⛪</Text>
                <Text style={styles.pendingNoticeText}>{pendingClergyCount} clergy account{pendingClergyCount > 1 ? 's' : ''} awaiting approval</Text>
                <TouchableOpacity onPress={() => setUserFilter('Pending Clergy')}>
                  <Text style={styles.pendingNoticeAction}>Review ›</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.searchContainer}>
              <View style={styles.searchWrapper}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput style={styles.searchInput} placeholder="Search users..." placeholderTextColor={COLORS.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
                {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Text style={styles.searchClear}>✕</Text></TouchableOpacity>}
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
              {USER_FILTERS.map((f) => (
                <TouchableOpacity key={f} style={[styles.filterChip, userFilter === f && styles.filterChipActive]} onPress={() => setUserFilter(f)}>
                  <Text style={[styles.filterChipText, userFilter === f && styles.filterChipTextActive]}>
                    {f === 'Pending Clergy' ? `◎ Pending Clergy${pendingClergyCount > 0 ? ` (${pendingClergyCount})` : ''}` : f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.resultsCount}>{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found</Text>

            {loadingUsers ? (
              <View style={styles.tabLoading}><ActivityIndicator color={COLORS.red} /><Text style={styles.tabLoadingText}>Loading users...</Text></View>
            ) : filteredUsers.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyStateIcon}>👤</Text><Text style={styles.emptyStateText}>No users found</Text></View>
            ) : (
              filteredUsers.map((u) => {
                const roleConfig   = ROLE_CONFIG[u.role]   || ROLE_CONFIG.member;
                const statusConfig = STATUS_CONFIG[u.status] || STATUS_CONFIG.active;
                const isPending    = u.role === 'clergy' && u.status === 'pending';
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.userCard, isPending && styles.userCardPending]}
                    onPress={() => { setSelectedUser(u); setUserDetailModal(true); }}
                    activeOpacity={0.85}
                  >
                    {isPending && <View style={styles.userCardAccentBar} />}
                    <View style={[styles.userAvatar, { backgroundColor: roleConfig.bg }]}>
                      <Text style={[styles.userAvatarText, { color: roleConfig.color }]}>{getInitials(u.fullName)}</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <View style={styles.userNameRow}>
                        <Text style={styles.userName}>{u.fullName}</Text>
                        {isPending && <View style={styles.pendingDot} />}
                      </View>
                      <Text style={styles.userEmail}>{u.email}</Text>
                      <Text style={styles.userParish}>📍 {u.parish || 'No parish'}</Text>
                    </View>
                    <View style={styles.userRight}>
                      <View style={[styles.roleBadge, { backgroundColor: roleConfig.bg, borderColor: roleConfig.color }]}>
                        <Text style={[styles.roleBadgeText, { color: roleConfig.color }]}>{roleConfig.icon} {roleConfig.label}</Text>
                      </View>
                      <Text style={[styles.userStatus, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* ════ PARISHES TAB ════ */}
        {activeTab === 'parishes' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddParishModal(true)}>
              <Text style={styles.addBtnIcon}>+</Text>
              <Text style={styles.addBtnText}>Add New Parish</Text>
            </TouchableOpacity>
            <SectionHeader title={`${parishes.length} Parishes`} />
            {loadingParishes ? (
              <View style={styles.tabLoading}><ActivityIndicator color={COLORS.red} /><Text style={styles.tabLoadingText}>Loading parishes...</Text></View>
            ) : parishes.map((parish, index) => (
              <View key={parish.id} style={styles.parishCard}>
                <View style={[styles.parishTopBar, { backgroundColor: parish.status === 'active' ? COLORS.teal : COLORS.textMuted }]} />
                <View style={styles.parishCardInner}>
                  <View style={styles.parishCardTop}>
                    <View style={styles.parishNumber}><Text style={styles.parishNumberText}>{String(index + 1).padStart(2, '0')}</Text></View>
                    <View style={styles.parishInfo}>
                      <Text style={styles.parishName}>{parish.name}</Text>
                      {parish.location && <Text style={styles.parishLocation}>📍 {parish.location}</Text>}
                      {parish.archdeaconry && <Text style={styles.parishDeanery}>🏛️ {parish.archdeaconry}</Text>}
                    </View>
                    <View style={[styles.parishStatusBadge, { backgroundColor: parish.status === 'active' ? 'rgba(76,201,168,0.1)' : 'rgba(122,117,104,0.1)' }]}>
                      <Text style={[styles.parishStatusText, { color: parish.status === 'active' ? COLORS.teal : COLORS.textMuted }]}>
                        {parish.status === 'active' ? '● Active' : '○ Inactive'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ════ EVENTS TAB ════ */}
        {activeTab === 'events' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddEventModal(true)}>
              <Text style={styles.addBtnIcon}>+</Text>
              <Text style={styles.addBtnText}>Create New Event</Text>
            </TouchableOpacity>
            <SectionHeader title={`${events.length} Events`} />
            {loadingEvents ? (
              <View style={styles.tabLoading}><ActivityIndicator color={COLORS.red} /><Text style={styles.tabLoadingText}>Loading events...</Text></View>
            ) : events.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyStateIcon}>📅</Text><Text style={styles.emptyStateText}>No events yet</Text></View>
            ) : events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => { setSelectedEvent(event); setEventDetailModal(true); }}
                activeOpacity={0.85}
              >
                <View style={[styles.eventTopBar, { backgroundColor: COLORS.gold }]} />
                <View style={styles.eventCardInner}>
                  <View style={styles.eventBadgeRow}>
                    <View style={styles.eventCategoryBadge}>
                      <Text style={styles.eventCategoryText}>{event.category?.toUpperCase()}</Text>
                    </View>
                    {event.isAllParishes && (
                      <View style={styles.allParishesBadge}><Text style={styles.allParishesBadgeText}>🌐 All Parishes</Text></View>
                    )}
                    <Text style={styles.eventDate}>{event.date}</Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventMeta}>
                    {event.time && <Text style={styles.eventMetaText}>⏰ {event.time}</Text>}
                    {event.location && <Text style={styles.eventMetaText}>📍 {event.location}</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ════ LIVE TAB ════ */}
        {activeTab === 'live' && (
          <View style={styles.liveSection}>
            {loadingStream ? (
              <View style={styles.tabLoading}><ActivityIndicator color={COLORS.red} /><Text style={styles.tabLoadingText}>Loading stream info...</Text></View>
            ) : (
              <>
                {/* Live Status Card */}
                <View style={styles.liveStatusCard}>
                  <View style={styles.liveStatusLeft}>
                    <View style={[styles.liveStatusDot, { backgroundColor: stream?.isLive ? COLORS.red : COLORS.textMuted }]} />
                    <View>
                      <Text style={styles.liveStatusTitle}>
                        {stream?.isLive ? '🔴 LIVE NOW' : '⚫ Offline'}
                      </Text>
                      <Text style={styles.liveStatusSub}>
                        {stream?.isLive ? 'Stream is currently live' : 'Stream is offline'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleLiveBtn, { backgroundColor: stream?.isLive ? 'rgba(201,76,76,0.1)' : 'rgba(76,201,168,0.1)', borderColor: stream?.isLive ? COLORS.red : COLORS.teal }]}
                    onPress={handleToggleLive}
                    disabled={togglingLive}
                  >
                    {togglingLive ? <ActivityIndicator color={stream?.isLive ? COLORS.red : COLORS.teal} size="small" /> : (
                      <Text style={[styles.toggleLiveBtnText, { color: stream?.isLive ? COLORS.red : COLORS.teal }]}>
                        {stream?.isLive ? '⏹ Go Offline' : '▶ Go Live'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                <SectionHeader title="Stream Settings" />

                {/* Stream Form */}
                <View style={styles.liveForm}>
                  <FormField label="📺  STREAM TITLE" value={streamTitle} onChangeText={setStreamTitle} placeholder="e.g. Sunday Morning Service" />
                  <FormField label="🔗  YOUTUBE URL *" value={streamUrl} onChangeText={setStreamUrl} placeholder="https://youtube.com/watch?v=..." keyboardType="url" />
                  <FormField label="📝  DESCRIPTION" value={streamDescription} onChangeText={setStreamDescription} placeholder="Brief description..." />
                  <FormField label="📅  SCHEDULED DATE" value={streamDate} onChangeText={setStreamDate} placeholder="e.g. 2026-03-22" />
                  <FormField label="⏰  SCHEDULED TIME" value={streamTime} onChangeText={setStreamTime} placeholder="e.g. 8:00 AM" />

                  <TouchableOpacity
                    style={[styles.saveStreamBtn, savingStream && { opacity: 0.6 }]}
                    onPress={handleSaveStream}
                    disabled={savingStream}
                  >
                    <Text style={styles.saveStreamBtnText}>
                      {savingStream ? '⏳  Saving...' : '💾  Save Stream Settings'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {/* ════ RESOURCES TAB ════ */}
        {activeTab === 'resources' && (
          <View>
            <SectionHeader title="Upload Resources" />

            {/* Resource type selector */}
            <View style={styles.resourceTypeRow}>
              {[
                { key: 'magazine',   label: 'Magazine',   icon: '📖' },
                { key: 'bible_study',label: 'Bible Study', icon: '📝' },
                { key: 'document',   label: 'Document',   icon: '📄' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.resourceTypeChip, resourceType === type.key && styles.resourceTypeChipActive]}
                  onPress={() => { setResourceType(type.key); resetResourceForm(); }}
                >
                  <Text style={styles.resourceTypeIcon}>{type.icon}</Text>
                  <Text style={[styles.resourceTypeText, resourceType === type.key && styles.resourceTypeTextActive]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={() => setResourceModal(true)}>
              <Text style={styles.addBtnIcon}>+</Text>
              <Text style={styles.addBtnText}>Upload {resourceType === 'magazine' ? 'Magazine' : resourceType === 'bible_study' ? 'Bible Study' : 'Document'}</Text>
            </TouchableOpacity>

            {/* Info card */}
            <View style={styles.resourceInfoCard}>
              <Text style={styles.resourceInfoIcon}>💡</Text>
              <View style={styles.resourceInfoTextWrapper}>
                <Text style={styles.resourceInfoTitle}>How it works</Text>
                <Text style={styles.resourceInfoText}>
                  Upload a link to your file (Google Drive, Dropbox, YouTube, etc). Members can then view or download it directly from the Resources screen.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ════ SETTINGS TAB ════ */}
        {activeTab === 'settings' && (
          <View>
            <SectionHeader title="Diocese Settings" />
            <View style={styles.settingsCard}>
              {SETTINGS_ITEMS.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.settingsItem, index < SETTINGS_ITEMS.length - 1 && styles.settingsItemBorder]}
                  activeOpacity={item.editable ? 0.7 : 1}
                >
                  <View style={styles.settingsItemLeft}>
                    <View style={styles.settingsIconWrapper}><Text style={styles.settingsIcon}>{item.icon}</Text></View>
                    <View style={styles.settingsItemInfo}>
                      <Text style={styles.settingsLabel}>{item.label}</Text>
                      <Text style={styles.settingsValue}>{item.value}</Text>
                    </View>
                  </View>
                  {item.editable && <Text style={styles.settingsArrow}>›</Text>}
                </TouchableOpacity>
              ))}
            </View>
            <SectionHeader title="Danger Zone" />
            <View style={styles.dangerCard}>
              <TouchableOpacity style={styles.dangerItem} onPress={() => Alert.alert('Reset App', 'Reset all cached data?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive' }])}>
                <View style={styles.dangerItemLeft}>
                  <Text style={styles.dangerIcon}>⚠️</Text>
                  <View><Text style={styles.dangerLabel}>Reset App Data</Text><Text style={styles.dangerSubLabel}>Clear all cached data</Text></View>
                </View>
                <Text style={styles.dangerArrow}>›</Text>
              </TouchableOpacity>
              <View style={styles.settingsItemBorder} />
              <TouchableOpacity style={styles.dangerItem} onPress={() => Alert.alert('Export Data', 'Diocese data export queued.')}>
                <View style={styles.dangerItemLeft}>
                  <Text style={styles.dangerIcon}>📤</Text>
                  <View><Text style={styles.dangerLabel}>Export Diocese Data</Text><Text style={styles.dangerSubLabel}>Download full backup</Text></View>
                </View>
                <Text style={styles.dangerArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ══════════════════════════════════
          USER DETAIL MODAL
      ══════════════════════════════════ */}
      {selectedUser && (
        <Modal visible={userDetailModal} animationType="slide" transparent onRequestClose={() => setUserDetailModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setUserDetailModal(false)} />
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <TouchableOpacity style={styles.modalClose} onPress={() => setUserDetailModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                <View style={[styles.modalAccentBar, { backgroundColor: ROLE_CONFIG[selectedUser.role]?.color || COLORS.red }]} />
                <View style={styles.userDetailTop}>
                  <View style={[styles.userDetailAvatar, { backgroundColor: ROLE_CONFIG[selectedUser.role]?.bg }]}>
                    <Text style={[styles.userDetailAvatarText, { color: ROLE_CONFIG[selectedUser.role]?.color }]}>{getInitials(selectedUser.fullName)}</Text>
                  </View>
                  <Text style={styles.userDetailName}>{selectedUser.fullName}</Text>
                  <View style={styles.userDetailBadgeRow}>
                    <View style={[styles.userDetailRoleBadge, { backgroundColor: ROLE_CONFIG[selectedUser.role]?.bg, borderColor: ROLE_CONFIG[selectedUser.role]?.color }]}>
                      <Text style={[styles.userDetailRoleText, { color: ROLE_CONFIG[selectedUser.role]?.color }]}>{ROLE_CONFIG[selectedUser.role]?.icon} {ROLE_CONFIG[selectedUser.role]?.label}</Text>
                    </View>
                    <View style={[styles.userDetailStatusBadge, { backgroundColor: `${STATUS_CONFIG[selectedUser.status]?.color}18` }]}>
                      <Text style={[styles.userDetailStatusText, { color: STATUS_CONFIG[selectedUser.status]?.color }]}>{STATUS_CONFIG[selectedUser.status]?.label}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.userDetailMetaGrid}>
                  <DetailMeta icon="📧" label="Email"  value={selectedUser.email} />
                  <DetailMeta icon="📍" label="Parish" value={selectedUser.parish || 'Not assigned'} />
                  <DetailMeta icon="📅" label="Joined" value={selectedUser.createdAt ? selectedUser.createdAt.slice(0, 10) : '—'} />
                  <DetailMeta icon="📌" label="Status" value={STATUS_CONFIG[selectedUser.status]?.label} valueColor={STATUS_CONFIG[selectedUser.status]?.color} />
                </View>
                {selectedUser.role === 'clergy' && selectedUser.status === 'pending' && (
                  <View style={styles.pendingActionsRow}>
                    <View style={styles.pendingClegyNote}><Text style={styles.pendingClergyNoteText}>⚠️ This clergy account is awaiting approval.</Text></View>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => handleApproveUser(selectedUser.id)}>
                      <Text style={styles.approveBtnText}>✓ Approve Clergy Account</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <Text style={styles.sectionLabel}>CHANGE ROLE</Text>
                <View style={styles.roleChangeRow}>
                  {['member', 'clergy', 'admin'].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleChangeChip, selectedUser.role === r && { backgroundColor: ROLE_CONFIG[r].bg, borderColor: ROLE_CONFIG[r].color }]}
                      onPress={() => { if (selectedUser.role !== r) handleChangeRole(selectedUser.id, r); }}
                    >
                      <Text style={styles.roleChangeIcon}>{ROLE_CONFIG[r].icon}</Text>
                      <Text style={[styles.roleChangeText, selectedUser.role === r && { color: ROLE_CONFIG[r].color, fontWeight: FONTS.weights.bold }]}>{ROLE_CONFIG[r].label}</Text>
                      {selectedUser.role === r && <Text style={[styles.roleCheckmark, { color: ROLE_CONFIG[r].color }]}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.userActionsBtns}>
                  <TouchableOpacity style={styles.suspendBtn} onPress={() => handleSuspendUser(selectedUser.id)}>
                    <Text style={styles.suspendBtnText}>⏸ Suspend</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteUserBtn} onPress={() => handleDeleteUser(selectedUser.id)}>
                    <Text style={styles.deleteUserBtnText}>🗑 Delete</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.closeDetailBtn} onPress={() => setUserDetailModal(false)}>
                  <Text style={styles.closeDetailBtnText}>Close</Text>
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ══════════════════════════════════
          ADD PARISH MODAL
      ══════════════════════════════════ */}
      <Modal visible={addParishModal} animationType="slide" transparent onRequestClose={() => setAddParishModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setAddParishModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setAddParishModal(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={[styles.modalAccentBar, { backgroundColor: COLORS.red }]} />
              <Text style={styles.modalTitle}>Add New Parish</Text>
              <Text style={styles.modalSubtitle}>Add a parish to the Diocese of Oke-Osun</Text>
              <FormField label="⛪  PARISH NAME *"     value={parishName}         onChangeText={setParishName}         placeholder="e.g. St. John's Parish" />
              <FormField label="📍  LOCATION *"         value={parishLocation}     onChangeText={setParishLocation}     placeholder="e.g. Osogbo, Osun State" />
              <FormField label="🏛️  ARCHDEACONRY"       value={parishArchdeaconry} onChangeText={setParishArchdeaconry} placeholder="e.g. Osogbo Archdeaconry" />
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.red }, savingParish && { opacity: 0.6 }]} onPress={handleAddParish} disabled={savingParish}>
                <Text style={styles.submitBtnText}>{savingParish ? '⏳  Saving...' : '⛪  Add Parish'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddParishModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════
          ADD EVENT MODAL
      ══════════════════════════════════ */}
      <Modal visible={addEventModal} animationType="slide" transparent onRequestClose={() => { setAddEventModal(false); resetEventForm(); }}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => { setAddEventModal(false); resetEventForm(); }} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => { setAddEventModal(false); resetEventForm(); }}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={[styles.modalAccentBar, { backgroundColor: COLORS.gold }]} />
              <Text style={styles.modalTitle}>Create Event</Text>
              <Text style={styles.modalSubtitle}>Add a new event to the diocese calendar</Text>

              {/* Category selector */}
              <Text style={styles.formLabel}>📋  CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.sm, marginBottom: SPACING.md }}>
                {EVENT_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryChip, eventCategory === cat && styles.categoryChipActive]}
                    onPress={() => setEventCategory(cat)}
                  >
                    <Text style={[styles.categoryChipText, eventCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <FormField label="📝  TITLE *"      value={eventTitle}       onChangeText={setEventTitle}       placeholder="e.g. Sunday Service" />
              <FormField label="📅  DATE *"        value={eventDate}        onChangeText={setEventDate}        placeholder="e.g. 2026-04-06" />
              <FormField label="⏰  TIME"           value={eventTime}        onChangeText={setEventTime}        placeholder="e.g. 8:00 AM" />
              <FormField label="📍  LOCATION"      value={eventLocation}    onChangeText={setEventLocation}    placeholder="e.g. Cathedral, Osogbo" />
              <View style={styles.formField}>
                <Text style={styles.formLabel}>📄  DESCRIPTION</Text>
                <TextInput
                  style={[styles.formInput, { height: 80, paddingTop: SPACING.sm }]}
                  value={eventDescription}
                  onChangeText={setEventDescription}
                  placeholder="Brief description..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* All parishes toggle */}
              <TouchableOpacity style={styles.toggleRow} onPress={() => setEventAllParishes(!eventAllParishes)}>
                <View style={[styles.toggleBox, eventAllParishes && styles.toggleBoxActive]}>
                  {eventAllParishes && <Text style={styles.toggleCheck}>✓</Text>}
                </View>
                <View>
                  <Text style={styles.toggleLabel}>Diocese-wide Event</Text>
                  <Text style={styles.toggleSub}>Visible to all parishes</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.gold }, savingEvent && { opacity: 0.6 }]} onPress={handleAddEvent} disabled={savingEvent}>
                <Text style={styles.submitBtnText}>{savingEvent ? '⏳  Saving...' : '📅  Create Event'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAddEventModal(false); resetEventForm(); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════
          EVENT DETAIL MODAL
      ══════════════════════════════════ */}
      {selectedEvent && (
        <Modal visible={eventDetailModal} animationType="slide" transparent onRequestClose={() => setEventDetailModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEventDetailModal(false)} />
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <TouchableOpacity style={styles.modalClose} onPress={() => setEventDetailModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                <View style={[styles.modalAccentBar, { backgroundColor: COLORS.gold }]} />
                <View style={styles.eventDetailBadgeRow}>
                  <View style={styles.eventCategoryBadge}><Text style={styles.eventCategoryText}>{selectedEvent.category?.toUpperCase()}</Text></View>
                  {selectedEvent.isAllParishes && <View style={styles.allParishesBadge}><Text style={styles.allParishesBadgeText}>🌐 All Parishes</Text></View>}
                </View>
                <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>
                <View style={styles.userDetailMetaGrid}>
                  <DetailMeta icon="📅" label="Date"       value={selectedEvent.date} />
                  {selectedEvent.time     && <DetailMeta icon="⏰" label="Time"     value={selectedEvent.time} />}
                  {selectedEvent.location && <DetailMeta icon="📍" label="Location" value={selectedEvent.location} />}
                  {selectedEvent.creatorName && <DetailMeta icon="⛪" label="Created by" value={selectedEvent.creatorName} />}
                </View>
                {selectedEvent.description && (
                  <View style={styles.eventDescBox}>
                    <Text style={styles.eventDescText}>{selectedEvent.description}</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.deleteUserBtn} onPress={() => handleDeleteEvent(selectedEvent.id)}>
                  <Text style={styles.deleteUserBtnText}>🗑  Delete Event</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.closeDetailBtn, { marginTop: SPACING.sm }]} onPress={() => setEventDetailModal(false)}>
                  <Text style={styles.closeDetailBtnText}>Close</Text>
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ══════════════════════════════════
          UPLOAD RESOURCE MODAL
      ══════════════════════════════════ */}
      <Modal visible={resourceModal} animationType="slide" transparent onRequestClose={() => { setResourceModal(false); resetResourceForm(); }}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => { setResourceModal(false); resetResourceForm(); }} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => { setResourceModal(false); resetResourceForm(); }}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={[styles.modalAccentBar, { backgroundColor: COLORS.teal }]} />
              <Text style={styles.modalTitle}>
                Upload {resourceType === 'magazine' ? 'Magazine' : resourceType === 'bible_study' ? 'Bible Study' : 'Document'}
              </Text>
              <Text style={styles.modalSubtitle}>Fill in the details below</Text>

              <FormField label="📝  TITLE *" value={resTitle} onChangeText={setResTitle} placeholder="Enter title" />

              {resourceType === 'magazine' && (
                <>
                  <FormField label="🏷️  CATEGORY" value={resCategory} onChangeText={setResCategory} placeholder="Devotional / Newsletter / Ministry" />
                  <FormField label="📅  DATE" value={resDate} onChangeText={setResDate} placeholder="e.g. Mar 2026" />
                  <FormField label="📄  PAGES" value={resPages} onChangeText={setResPages} placeholder="e.g. 48" keyboardType="numeric" />
                </>
              )}

              {resourceType === 'bible_study' && (
                <>
                  <FormField label="📖  BOOK" value={resBook} onChangeText={setResBook} placeholder="e.g. Matthew 5–7" />
                  <FormField label="📚  NUMBER OF LESSONS" value={resLessons} onChangeText={setResLessons} placeholder="e.g. 8" keyboardType="numeric" />
                  <Text style={styles.formLabel}>🎯  LEVEL</Text>
                  <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
                    {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                      <TouchableOpacity key={l} style={[styles.categoryChip, resLevel === l && styles.categoryChipActive]} onPress={() => setResLevel(l)}>
                        <Text style={[styles.categoryChipText, resLevel === l && styles.categoryChipTextActive]}>{l}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {resourceType === 'document' && (
                <>
                  <FormField label="🏷️  CATEGORY" value={resCategory} onChangeText={setResCategory} placeholder="Governance / Administration / Clergy" />
                  <FormField label="📅  DATE" value={resDate} onChangeText={setResDate} placeholder="e.g. Jan 2024" />
                  <FormField label="💾  FILE SIZE" value={resSize} onChangeText={setResSize} placeholder="e.g. 2.4 MB" />
                </>
              )}

              <View style={styles.formField}>
                <Text style={styles.formLabel}>📄  DESCRIPTION</Text>
                <TextInput style={[styles.formInput, { height: 70, paddingTop: SPACING.sm }]} value={resDescription} onChangeText={setResDescription} placeholder="Brief description..." placeholderTextColor={COLORS.textMuted} multiline textAlignVertical="top" />
              </View>

              <FormField label="🔗  FILE/URL LINK" value={resUrl} onChangeText={setResUrl} placeholder="https://drive.google.com/..." keyboardType="url" />

              {/* File Picker */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>📁  OR UPLOAD FILE DIRECTLY</Text>
                <TouchableOpacity
                  style={[styles.filePickerBtn, resPickedFile && styles.filePickerBtnActive]}
                  onPress={handlePickResourceFile}
                  disabled={resUploading}
                >
                  <Text style={styles.filePickerIcon}>{resPickedFile ? '✓' : '📂'}</Text>
                  <View style={styles.filePickerContent}>
                    <Text style={styles.filePickerText}>
                      {resPickedFile ? `File: ${resPickedFile.name}` : 'Pick PDF, Word, or any file'}
                    </Text>
                    {resPickedFile && (
                      <Text style={styles.filePickerSize}>
                        {Math.round((resPickedFile.size || 0) / 1024 / 1024 * 10) / 10} MB
                      </Text>
                    )}
                  </View>
                  {resPickedFile && (
                    <TouchableOpacity onPress={() => setResPickedFile(null)}>
                      <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
                {resUploading && (
                  <View style={styles.uploadingIndicator}>
                    <ActivityIndicator color={COLORS.teal} size="small" />
                    <Text style={[styles.uploadingText, { color: COLORS.teal }]}>Uploading file...</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.teal }, savingResource && { opacity: 0.6 }]} onPress={handleUploadResource} disabled={savingResource}>
                <Text style={styles.submitBtnText}>{savingResource ? '⏳  Uploading...' : '⬆️  Upload Resource'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setResourceModal(false); resetResourceForm(); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
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

const SummaryPill = ({ icon, value, label, color }) => (
  <View style={styles.summaryPill}>
    <Text style={styles.summaryPillIcon}>{icon}</Text>
    <Text style={[styles.summaryPillValue, color && { color }]}>{value}</Text>
    <Text style={styles.summaryPillLabel}>{label}</Text>
  </View>
);

const DetailMeta = ({ icon, label, value, valueColor }) => (
  <View style={styles.detailMetaItem}>
    <Text style={styles.detailMetaLabel}>{icon}  {label}</Text>
    <Text style={[styles.detailMetaValue, valueColor && { color: valueColor }]}>{value}</Text>
  </View>
);

const FormField = ({ label, value, onChangeText, placeholder, keyboardType }) => (
  <View style={styles.formField}>
    <Text style={styles.formLabel}>{label}</Text>
    <TextInput style={styles.formInput} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={COLORS.textMuted} keyboardType={keyboardType || 'default'} autoCapitalize="none" />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: Platform.OS === 'ios' ? 55 : 45, paddingBottom: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.red, letterSpacing: 0.5 },
  headerSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, letterSpacing: 0.5, marginTop: 2 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(201,76,76,0.1)', borderWidth: 1, borderColor: 'rgba(201,76,76,0.3)', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 7 },
  adminBadgeIcon: { fontSize: 14 },
  adminBadgeText: { fontSize: FONTS.sizes.sm, color: COLORS.red, fontWeight: FONTS.weights.bold },
  innerTabsContainer: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  innerTabsRow: { paddingHorizontal: SPACING.lg, gap: SPACING.xs },
  innerTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, position: 'relative' },
  innerTabActive: {},
  innerTabIcon: { fontSize: 14 },
  innerTabLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.textMuted },
  innerTabLabelActive: { color: COLORS.red, fontWeight: FONTS.weights.bold },
  innerTabIndicator: { position: 'absolute', bottom: 0, left: SPACING.md, right: SPACING.md, height: 2, borderRadius: 1, backgroundColor: COLORS.red },
  scrollContent: { paddingTop: SPACING.sm },
  tabLoading: { alignItems: 'center', paddingVertical: 40, gap: SPACING.sm },
  tabLoadingText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  summaryRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: SPACING.sm },
  summaryPill: { flex: 1, alignItems: 'center', gap: 2 },
  summaryPillIcon: { fontSize: 14 },
  summaryPillValue: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.text },
  summaryPillLabel: { fontSize: 9, color: COLORS.textMuted, letterSpacing: 0.3 },
  pendingNotice: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginHorizontal: SPACING.lg, marginTop: SPACING.md, backgroundColor: 'rgba(76,201,168,0.06)', borderWidth: 1, borderColor: 'rgba(76,201,168,0.2)', borderRadius: RADIUS.md, padding: SPACING.sm },
  pendingNoticeIcon: { fontSize: 16 },
  pendingNoticeText: { flex: 1, fontSize: FONTS.sizes.xs, color: COLORS.textMuted, lineHeight: 18 },
  pendingNoticeAction: { fontSize: FONTS.sizes.sm, color: COLORS.teal, fontWeight: FONTS.weights.bold },
  searchContainer: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, height: 46, gap: SPACING.sm },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.sm, height: '100%' },
  searchClear: { color: COLORS.textMuted, fontSize: 13 },
  filtersRow: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm, gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: 'rgba(201,76,76,0.1)', borderColor: COLORS.red },
  filterChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  filterChipTextActive: { color: COLORS.red, fontWeight: FONTS.weights.bold },
  resultsCount: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm, letterSpacing: 0.3 },
  userCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, overflow: 'hidden' },
  userCardPending: { borderColor: 'rgba(76,201,168,0.35)', backgroundColor: 'rgba(76,201,168,0.03)' },
  userCardAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: COLORS.teal, borderTopLeftRadius: RADIUS.lg, borderBottomLeftRadius: RADIUS.lg },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 2 },
  pendingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.teal },
  userAvatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  userAvatarText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black },
  userInfo: { flex: 1 },
  userName: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text },
  userEmail: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: 2 },
  userParish: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  userRight: { alignItems: 'flex-end', gap: 5 },
  roleBadge: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  roleBadgeText: { fontSize: 10, fontWeight: FONTS.weights.bold },
  userStatus: { fontSize: 10, fontWeight: FONTS.weights.bold },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyStateIcon: { fontSize: 40 },
  emptyStateText: { fontSize: FONTS.sizes.md, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  sectionAccent: { width: 3, height: 16, borderRadius: 2, backgroundColor: COLORS.red },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  sectionLabel: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.black, color: COLORS.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACING.sm, paddingHorizontal: SPACING.xs },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginHorizontal: SPACING.lg, marginTop: SPACING.md, marginBottom: SPACING.sm, height: 52, borderRadius: RADIUS.lg, backgroundColor: 'rgba(201,76,76,0.1)', borderWidth: 1, borderColor: 'rgba(201,76,76,0.3)' },
  addBtnIcon: { fontSize: 22, color: COLORS.red, fontWeight: FONTS.weights.black },
  addBtnText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.red },
  parishCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, overflow: 'hidden' },
  parishTopBar: { height: 3 },
  parishCardInner: { padding: SPACING.md },
  parishCardTop: { flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start' },
  parishNumber: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(201,76,76,0.1)', borderWidth: 1, borderColor: 'rgba(201,76,76,0.2)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  parishNumberText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.black, color: COLORS.red },
  parishInfo: { flex: 1 },
  parishName: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 2 },
  parishLocation: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: 2 },
  parishDeanery: { fontSize: FONTS.sizes.xs, color: COLORS.gold },
  parishStatusBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3, flexShrink: 0 },
  parishStatusText: { fontSize: 10, fontWeight: FONTS.weights.bold },

  // ── Events ──
  eventCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, overflow: 'hidden' },
  eventTopBar: { height: 3 },
  eventCardInner: { padding: SPACING.md },
  eventBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  eventCategoryBadge: { backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: COLORS.gold, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  eventCategoryText: { fontSize: 9, color: COLORS.gold, fontWeight: FONTS.weights.black, letterSpacing: 0.8 },
  allParishesBadge: { backgroundColor: 'rgba(76,201,168,0.1)', borderWidth: 1, borderColor: COLORS.teal, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  allParishesBadgeText: { fontSize: 9, color: COLORS.teal, fontWeight: FONTS.weights.bold },
  eventDate: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginLeft: 'auto' },
  eventTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.xs },
  eventMeta: { gap: 4 },
  eventMetaText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  eventDetailBadgeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  eventDetailTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.md },
  eventDescBox: { backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  eventDescText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: 20 },

  // ── Live ──
  liveSection: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  liveStatusCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  liveStatusLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  liveStatusDot: { width: 12, height: 12, borderRadius: 6 },
  liveStatusTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, color: COLORS.text },
  liveStatusSub: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  toggleLiveBtn: { borderWidth: 1, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: 10 },
  toggleLiveBtnText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  liveForm: { gap: SPACING.xs },
  saveStreamBtn: { backgroundColor: COLORS.red, borderRadius: RADIUS.lg, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: SPACING.sm },
  saveStreamBtnText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },

  // ── Resources ──
  resourceTypeRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, marginBottom: SPACING.sm },
  resourceTypeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: 46, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  resourceTypeChipActive: { backgroundColor: 'rgba(76,201,168,0.1)', borderColor: COLORS.teal },
  resourceTypeIcon: { fontSize: 16 },
  resourceTypeText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  resourceTypeTextActive: { color: COLORS.teal, fontWeight: FONTS.weights.bold },
  resourceInfoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginHorizontal: SPACING.lg, marginTop: SPACING.md, backgroundColor: 'rgba(201,168,76,0.06)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', borderRadius: RADIUS.lg, padding: SPACING.md },
  resourceInfoIcon: { fontSize: 20 },
  resourceInfoTextWrapper: { flex: 1 },
  resourceInfoTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 4 },
  resourceInfoText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, lineHeight: 18 },

  // ── Category chips ──
  categoryChip: { paddingHorizontal: SPACING.md, paddingVertical: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  categoryChipActive: { backgroundColor: 'rgba(201,168,76,0.1)', borderColor: COLORS.gold },
  categoryChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  categoryChipTextActive: { color: COLORS.gold, fontWeight: FONTS.weights.bold },

  // ── Toggle row ──
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  toggleBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  toggleBoxActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  toggleCheck: { fontSize: 14, color: COLORS.background, fontWeight: FONTS.weights.black },
  toggleLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text },
  toggleSub: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },

  // ── Settings ──
  settingsCard: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.sm },
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  settingsItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingsItemLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  settingsIconWrapper: { width: 36, height: 36, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  settingsIcon: { fontSize: 16 },
  settingsItemInfo: { flex: 1 },
  settingsLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 2 },
  settingsValue: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  settingsArrow: { fontSize: 20, color: COLORS.textMuted },
  dangerCard: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(201,76,76,0.2)', borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.sm },
  dangerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  dangerItemLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  dangerIcon: { fontSize: 22 },
  dangerLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.red, marginBottom: 2 },
  dangerSubLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  dangerArrow: { fontSize: 20, color: COLORS.red },

  // ── User Detail Modal ──
  userDetailTop: { alignItems: 'center', marginBottom: SPACING.lg, gap: SPACING.sm },
  userDetailAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xs },
  userDetailAvatarText: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black },
  userDetailName: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text, textAlign: 'center' },
  userDetailBadgeRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  userDetailRoleBadge: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  userDetailRoleText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  userDetailStatusBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  userDetailStatusText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  userDetailMetaGrid: { backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.lg },
  detailMetaItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailMetaLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  detailMetaValue: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, flex: 1, textAlign: 'right' },
  pendingActionsRow: { marginBottom: SPACING.lg, gap: SPACING.sm },
  pendingClegyNote: { backgroundColor: 'rgba(76,201,168,0.06)', borderWidth: 1, borderColor: 'rgba(76,201,168,0.2)', borderRadius: RADIUS.md, padding: SPACING.sm },
  pendingClergyNoteText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, lineHeight: 18 },
  approveBtn: { height: 48, borderRadius: RADIUS.lg, backgroundColor: 'rgba(76,201,168,0.1)', borderWidth: 1, borderColor: 'rgba(76,201,168,0.3)', justifyContent: 'center', alignItems: 'center' },
  approveBtnText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.teal },
  roleChangeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  roleChangeChip: { flex: 1, height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', gap: 3 },
  roleChangeIcon: { fontSize: 18 },
  roleChangeText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  roleCheckmark: { fontSize: 11, fontWeight: FONTS.weights.black },
  userActionsBtns: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  suspendBtn: { flex: 1, height: 46, borderRadius: RADIUS.lg, backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', justifyContent: 'center', alignItems: 'center' },
  suspendBtnText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.gold },
  deleteUserBtn: { flex: 1, height: 46, borderRadius: RADIUS.lg, backgroundColor: 'rgba(201,76,76,0.08)', borderWidth: 1, borderColor: 'rgba(201,76,76,0.25)', justifyContent: 'center', alignItems: 'center' },
  deleteUserBtnText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.red },
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
  modalAccentBar: { height: 3, borderRadius: 2, marginBottom: SPACING.lg, marginTop: SPACING.sm },
  modalTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.xs },
  modalSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },
  formField: { gap: SPACING.xs, marginBottom: SPACING.md },
  formLabel: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: COLORS.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: SPACING.xs },
  formInput: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.text, fontSize: FONTS.sizes.md, height: 50 },
  submitBtn: { borderRadius: RADIUS.lg, height: 54, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  filePickerBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  filePickerBtnActive: { backgroundColor: 'rgba(76,201,168,0.1)', borderColor: COLORS.teal },
  filePickerIcon: { fontSize: 24 },
  filePickerContent: { flex: 1 },
  filePickerText: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
  filePickerSize: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: SPACING.xs },
  uploadingIndicator: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: 'rgba(76,201,168,0.05)', borderRadius: RADIUS.md },
  uploadingText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  submitBtnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  cancelBtn: { height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg },
  cancelBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
});