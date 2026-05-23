import React, { useState, useEffect } from 'react';
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
  Image,
  Switch,
  ActivityIndicator,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { API_ROUTES } from '../../constants/config';
import { uploadFileToGCS } from '../../lib/fileUpload';
import AppIcon from '../../components/ui/AppIcon';

const ROLE_CONFIG = {
  admin: { label: 'Admin', icon: '🛡️', color: COLORS.red, bg: 'rgba(201,76,76,0.1)' },
  clergy: { label: 'Clergy', icon: '⛪', color: COLORS.teal, bg: 'rgba(76,201,168,0.1)' },
  member: { label: 'Member', icon: '🙏', color: COLORS.gold, bg: 'rgba(201,168,76,0.1)' },
};

const DEFAULT_NOTIF_PREFS = {
  events: true,
  liveStream: true,
  sermons: true,
  notices: true,
  broadcasts: true,
};

const NOTIF_OPTIONS = [
  { key: 'events',     icon: '📅', label: 'New Events',         desc: 'Get notified when new events are added' },
  { key: 'liveStream', icon: '📺', label: 'Live Stream Alerts', desc: 'Know when a live service starts' },
  { key: 'sermons',    icon: '🎙️', label: 'New Sermons',        desc: 'Get notified when sermons are uploaded' },
  { key: 'notices',    icon: '📋', label: 'Parish Notices',     desc: 'Receive parish announcements' },
  { key: 'broadcasts', icon: '📢', label: 'Diocese Broadcasts', desc: 'Diocese-wide messages and updates' },
];

const STATS = [
  { label: 'Events\nAttended', value: '8', icon: '📅' },
  { label: 'Sermons\nListened', value: '24', icon: '🎙️' },
  { label: 'Days\nActive', value: '32', icon: '🔥' },
];

const FAQ_ITEMS = [
  { q: 'How do I change my parish?', a: 'Go to Profile → My Parish and select your parish from the list.' },
  { q: 'How do I watch live services?', a: 'Tap the Live tab at the bottom of the screen to join live services.' },
  { q: 'How do I access sermons?', a: 'Go to the Resources tab and select Sermons to browse all uploaded sermons.' },
  { q: 'How do I register for events?', a: 'Open the Events tab, tap on an event, and follow the registration instructions.' },
  { q: 'Who do I contact for technical issues?', a: 'Use the email below to reach our support team.' },
];

export default function ProfileScreen() {
  const { user, token, logout, updateUser, changePassword } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState(user?.photoUrl || null);

  // ── Edit Profile State ──
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editParish, setEditParish] = useState(user?.parish || '');
  const [saving, setSaving] = useState(false);

  // ── Change Password State ──
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // ── Notifications State ──
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIF_PREFS);
  const [notifBadge, setNotifBadge] = useState(true);

  // ── My Parish State ──
  const [parishModalVisible, setParishModalVisible] = useState(false);
  const [parishes, setParishes] = useState([]);
  const [selectedParish, setSelectedParish] = useState(user?.parish || null);
  const [loadingParishes, setLoadingParishes] = useState(false);
  const [savingParish, setSavingParish] = useState(false);
  const [parishSearch, setParishSearch] = useState('');

  // ── New Modal States ──
  const [membershipModalVisible, setMembershipModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.member;

  useEffect(() => { loadNotifPrefs(); }, []);
  useEffect(() => {
    if (user?.photoUrl) setProfilePhoto(user.photoUrl);
  }, [user?.photoUrl]);

  const loadNotifPrefs = async () => {
    try {
      const stored = await AsyncStorage.getItem('radet_notifications');
      if (stored) setNotifPrefs(JSON.parse(stored));
    } catch (e) {}
  };

  const loadParishes = async () => {
    setLoadingParishes(true);
    try {
      const response = await fetch(API_ROUTES.parishes);
      const data = await response.json();
      if (response.ok) setParishes(data.parishes);
      else Alert.alert('Error', 'Failed to load parishes');
    } catch {
      Alert.alert('Error', 'Network error. Check your connection.');
    } finally {
      setLoadingParishes(false);
    }
  };

  const handleSaveParish = async () => {
    if (!selectedParish) { Alert.alert('Error', 'Please select a parish'); return; }
    setSavingParish(true);
    const result = await updateUser({ parish: selectedParish });
    setSavingParish(false);
    if (result.success) { setParishModalVisible(false); Alert.alert('✓ Saved', 'Your parish has been updated.'); }
    else Alert.alert('Error', result.message);
  };

  const handleToggleNotif = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    try { await AsyncStorage.setItem('radet_notifications', JSON.stringify(updated)); } catch (e) {}
  };

  const handleResetNotifs = async () => {
    setNotifPrefs(DEFAULT_NOTIF_PREFS);
    try {
      await AsyncStorage.setItem('radet_notifications', JSON.stringify(DEFAULT_NOTIF_PREFS));
      Alert.alert('✓ Reset', 'Notification preferences reset to defaults.');
    } catch (e) {}
  };

  const handleSave = async () => {
    if (!editName.trim()) { Alert.alert('Error', 'Full name cannot be empty'); return; }
    setSaving(true);
    const result = await updateUser({ fullName: editName.trim(), phone: editPhone.trim(), parish: editParish.trim() });
    setSaving(false);
    if (result.success) { setEditModalVisible(false); Alert.alert('✓ Saved', 'Your profile has been updated.'); }
    else Alert.alert('Error', result.message);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) { Alert.alert('Error', 'Please fill in all fields'); return; }
    if (newPassword.length < 6) { Alert.alert('Error', 'New password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { Alert.alert('Error', 'New passwords do not match'); return; }
    if (currentPassword === newPassword) { Alert.alert('Error', 'New password must be different from current password'); return; }
    setChangingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setChangingPassword(false);
    if (result.success) {
      setPasswordModalVisible(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
      Alert.alert('✓ Success', 'Your password has been changed successfully.');
    } else Alert.alert('Error', result.message);
  };

  const handleMenuPress = (id) => {
    if (id === 'edit') setEditModalVisible(true);
    if (id === 'password') setPasswordModalVisible(true);
    if (id === 'notifications') { setNotifBadge(false); setNotificationsModalVisible(true); }
    if (id === 'parish') { setParishModalVisible(true); loadParishes(); }
    if (id === 'membership') setMembershipModalVisible(true);
    if (id === 'about') setAboutModalVisible(true);
    if (id === 'support') setSupportModalVisible(true);
    if (id === 'privacy') setPrivacyModalVisible(true);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to update your profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      Haptics.selectionAsync().catch(() => {});
      const asset = result.assets[0];
      setSaving(true);
      try {
        const photoUrl = await uploadFileToGCS({
          uri: asset.uri,
          name: asset.fileName || `profile-${user?.id || Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        }, token, 'profiles');
        const update = await updateUser({ photoUrl });
        if (!update.success) throw new Error(update.message);
        setProfilePhoto(photoUrl);
        Alert.alert('Photo updated', 'Your profile photo has been saved.');
      } catch (error) {
        Alert.alert('Upload failed', error.message || 'Unable to update your photo right now.');
      } finally {
        setSaving(false);
      }
    }
  };

  const filteredParishes = parishes.filter((p) =>
    p.name.toLowerCase().includes(parishSearch.toLowerCase()) ||
    p.archdeaconry?.toLowerCase().includes(parishSearch.toLowerCase()) ||
    p.location?.toLowerCase().includes(parishSearch.toLowerCase())
  );

  const MENU_SECTIONS = [
    {
      title: 'Account',
      items: [
        { id: 'edit',          icon: '✏️', label: 'Edit Profile',    arrow: true },
        { id: 'password',      icon: '🔒', label: 'Change Password', arrow: true },
        { id: 'notifications', icon: '🔔', label: 'Notifications',   arrow: true, badge: notifBadge ? '3' : null },
      ],
    },
    {
      title: 'Diocese',
      items: [
        { id: 'parish',     icon: '⛪', label: 'My Parish',       arrow: true, value: user?.parish ? null : 'Not set' },
        { id: 'membership', icon: '📋', label: 'Membership Card', arrow: true },
        { id: 'giving',     icon: '💝', label: 'Giving & Tithes', arrow: true },
      ],
    },
    {
      title: 'App',
      items: [
        { id: 'about',   icon: '📖', label: 'About Diocese',  arrow: true },
        { id: 'support', icon: '💬', label: 'Help & Support', arrow: true },
        { id: 'privacy', icon: '🛡️', label: 'Privacy Policy', arrow: true },
        { id: 'version', icon: '📱', label: 'App Version',    value: 'v1.0.0' },
      ],
    },
  ];

  // ── Membership card number ──
  const membershipId = user?.id
    ? `OKO-${user.id.slice(-6).toUpperCase()}`
    : 'OKO-XXXXXX';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Diocese of Oke-Osun</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editHeaderBtn} onPress={() => setEditModalVisible(true)}>
          <AppIcon name="edit" size={16} color={COLORS.gold} />
          <Text style={styles.editHeaderText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity style={styles.avatar} onPress={handlePickPhoto} accessibilityRole="button" accessibilityLabel="Upload profile photo">
              <Image source={profilePhoto ? { uri: profilePhoto } : require('../../../assets/logo.png')} style={styles.avatarLogo} resizeMode="cover" />
              <View style={styles.avatarUpload}>
                <AppIcon name="upload" size={14} color={COLORS.background} />
              </View>
            </TouchableOpacity>
            <View style={[styles.avatarRoleBadge, { backgroundColor: roleConfig.color }]}>
              <AppIcon name={user?.role === 'admin' ? 'privacy' : user?.role === 'clergy' ? 'church' : 'person'} size={14} color="#fff" />
            </View>
          </View>
          <Text style={styles.profileName}>{user?.fullName || 'Church Member'}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleConfig.bg, borderColor: roleConfig.color }]}>
            <AppIcon name={user?.role === 'admin' ? 'privacy' : user?.role === 'clergy' ? 'church' : 'person'} size={13} color={roleConfig.color} />
            <Text style={[styles.roleLabel, { color: roleConfig.color }]}>{roleConfig.label}</Text>
          </View>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          {user?.phone && <Text style={styles.profilePhone}>{user.phone}</Text>}
          {user?.parish && <Text style={styles.profileParish}>{user.parish}</Text>}
          <Text style={styles.profilePhone}>Member since {user?.createdAt ? user.createdAt.slice(0, 10) : 'recently'}</Text>
          <View style={styles.dioceseTag}>
            <Text style={styles.dioceseTagText}>✝ Diocese of Oke-Osun, Church of Nigeria</Text>
          </View>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          {STATS.map((stat, index) => (
            <View key={index} style={[styles.statCard, index < STATS.length - 1 && styles.statCardBorder]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Menu Sections ── */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, index < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => handleMenuPress(item.id)}
                  activeOpacity={item.arrow ? 0.7 : 1}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuItemIconWrapper}>
                      <Text style={styles.menuItemIcon}>{item.icon}</Text>
                    </View>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.badge && <View style={styles.menuBadge}><Text style={styles.menuBadgeText}>{item.badge}</Text></View>}
                    {item.value && <Text style={styles.menuItemValue}>{item.value}</Text>}
                    {item.arrow && <Text style={styles.menuArrow}>›</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Sign Out ── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <AppIcon name="logout" size={18} color={COLORS.red} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerCross}>✝</Text>
          <Text style={styles.footerText}>Diocese of Oke-Osun</Text>
          <Text style={styles.footerSub}>Church of Nigeria, Anglican Communion</Text>
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ════════════════════════════════════════
          MODALS
      ════════════════════════════════════════ */}

      {/* ── Edit Profile Modal ── */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEditModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={styles.modalAccentBar} />
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Text style={styles.modalSubtitle}>Update your personal information</Text>
              <View style={styles.formFields}>
                <FormField label="Full Name" icon="👤" value={editName} onChangeText={setEditName} placeholder="Enter your full name" />
                <FormField label="Phone Number" icon="📞" value={editPhone} onChangeText={setEditPhone} placeholder="Enter your phone number" keyboardType="phone-pad" />
                <FormField label="Parish" icon="⛪" value={editParish} onChangeText={setEditParish} placeholder="Enter your parish" />
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>📧  Email Address</Text>
                  <View style={[styles.formInput, styles.formInputReadOnly]}>
                    <Text style={styles.formInputReadOnlyText}>{user?.email || ''}</Text>
                  </View>
                  <Text style={styles.formHint}>Email cannot be changed</Text>
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>🎖️  Role</Text>
                  <View style={[styles.formInput, styles.formInputReadOnly]}>
                    <Text style={styles.formInputReadOnlyText}>{roleConfig.icon} {roleConfig.label}</Text>
                  </View>
                  <Text style={styles.formHint}>Contact admin to change role</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>{saving ? '⏳  Saving...' : '✓  Save Changes'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Change Password Modal ── */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setPasswordModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setPasswordModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={[styles.modalAccentBar, { backgroundColor: COLORS.teal }]} />
              <Text style={styles.modalTitle}>Change Password</Text>
              <Text style={styles.modalSubtitle}>Enter your current password then choose a new one</Text>
              <View style={styles.formFields}>
                {[
                  { label: '🔒  Current Password', value: currentPassword, setter: setCurrentPassword, show: showCurrentPw, toggleShow: () => setShowCurrentPw(!showCurrentPw), placeholder: 'Enter current password' },
                  { label: '🔑  New Password', value: newPassword, setter: setNewPassword, show: showNewPw, toggleShow: () => setShowNewPw(!showNewPw), placeholder: 'Min. 6 characters' },
                  { label: '✅  Confirm New Password', value: confirmNewPassword, setter: setConfirmNewPassword, show: showConfirmPw, toggleShow: () => setShowConfirmPw(!showConfirmPw), placeholder: 'Repeat new password' },
                ].map((field, i) => (
                  <View key={i} style={styles.formField}>
                    <Text style={styles.formLabel}>{field.label}</Text>
                    <View style={styles.passwordWrapper}>
                      <TextInput style={styles.passwordInput} value={field.value} onChangeText={field.setter} placeholder={field.placeholder} placeholderTextColor={COLORS.textMuted} secureTextEntry={!field.show} autoCapitalize="none" />
                      <TouchableOpacity onPress={field.toggleShow}>
                        <Text style={styles.pwToggle}>{field.show ? '🙈' : '👁'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={[styles.saveBtn, changingPassword && styles.saveBtnDisabled]} onPress={handleChangePassword} disabled={changingPassword} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>{changingPassword ? '⏳  Updating...' : '🔒  Update Password'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Notifications Modal ── */}
      <Modal visible={notificationsModalVisible} animationType="slide" transparent onRequestClose={() => setNotificationsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setNotificationsModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setNotificationsModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={[styles.modalAccentBar, { backgroundColor: COLORS.gold }]} />
              <Text style={styles.modalTitle}>Notifications</Text>
              <Text style={styles.modalSubtitle}>Choose what you want to be notified about</Text>
              <View style={styles.notifList}>
                {NOTIF_OPTIONS.map((option, index) => (
                  <View key={option.key} style={[styles.notifRow, index < NOTIF_OPTIONS.length - 1 && styles.notifRowBorder]}>
                    <View style={styles.notifIconWrapper}><Text style={styles.notifIcon}>{option.icon}</Text></View>
                    <View style={styles.notifTextWrapper}>
                      <Text style={styles.notifLabel}>{option.label}</Text>
                      <Text style={styles.notifDesc}>{option.desc}</Text>
                    </View>
                    <Switch value={notifPrefs[option.key]} onValueChange={() => handleToggleNotif(option.key)} trackColor={{ false: COLORS.border, true: COLORS.gold }} thumbColor={notifPrefs[option.key] ? COLORS.background : COLORS.textMuted} />
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.resetBtn} onPress={handleResetNotifs} activeOpacity={0.8}>
                <Text style={styles.resetBtnText}>↺  Reset to Defaults</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setNotificationsModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Done</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── My Parish Modal ── */}
      <Modal visible={parishModalVisible} animationType="slide" transparent onRequestClose={() => setParishModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setParishModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setParishModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={[styles.modalAccentBar, { backgroundColor: COLORS.teal }]} />
              <Text style={styles.modalTitle}>My Parish</Text>
              <Text style={styles.modalSubtitle}>Select your parish in the Diocese of Oke-Osun</Text>
              {user?.parish && (
                <View style={styles.currentParishCard}>
                  <Text style={styles.currentParishLabel}>Current Parish</Text>
                  <Text style={styles.currentParishName}>⛪ {user.parish}</Text>
                </View>
              )}
              <View style={styles.parishSearchWrapper}>
                <Text style={styles.parishSearchIcon}>🔍</Text>
                <TextInput style={styles.parishSearchInput} value={parishSearch} onChangeText={setParishSearch} placeholder="Search parishes..." placeholderTextColor={COLORS.textMuted} />
                {parishSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setParishSearch('')}>
                    <Text style={styles.parishSearchClear}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              {loadingParishes ? (
                <View style={styles.parishLoading}>
                  <ActivityIndicator color={COLORS.gold} size="large" />
                  <Text style={styles.parishLoadingText}>Loading parishes...</Text>
                </View>
              ) : filteredParishes.length === 0 ? (
                <View style={styles.parishEmpty}>
                  <Text style={styles.parishEmptyIcon}>⛪</Text>
                  <Text style={styles.parishEmptyText}>No parishes found</Text>
                </View>
              ) : (
                <View style={styles.parishList}>
                  {filteredParishes.map((parish, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.parishItem, index < filteredParishes.length - 1 && styles.parishItemBorder, selectedParish === parish.name && styles.parishItemSelected]}
                      onPress={() => setSelectedParish(parish.name)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.parishItemLeft}>
                        <Text style={styles.parishItemName}>{parish.name}</Text>
                        {parish.archdeaconry && <Text style={styles.parishItemArchdeaconry}>{parish.archdeaconry}</Text>}
                        {parish.location && <Text style={styles.parishItemLocation}>📍 {parish.location}</Text>}
                      </View>
                      {selectedParish === parish.name && <Text style={styles.parishItemCheck}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TouchableOpacity style={[styles.saveBtn, savingParish && styles.saveBtnDisabled]} onPress={handleSaveParish} disabled={savingParish || !selectedParish} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>{savingParish ? '⏳  Saving...' : '⛪  Save Parish'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setParishModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Membership Card Modal ── */}
      <Modal visible={membershipModalVisible} animationType="slide" transparent onRequestClose={() => setMembershipModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setMembershipModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setMembershipModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={styles.modalAccentBar} />
              <Text style={styles.modalTitle}>Membership Card</Text>
              <Text style={styles.modalSubtitle}>Your digital Diocese membership card</Text>

              {/* The Card */}
              <View style={styles.memberCard}>
                {/* Card Header */}
                <View style={styles.memberCardHeader}>
                  <Image source={require('../../../assets/logo.png')} style={styles.memberCardLogo} resizeMode="contain" />
                  <View style={styles.memberCardHeaderText}>
                    <Text style={styles.memberCardDiocese}>Diocese of Oke-Osun</Text>
                    <Text style={styles.memberCardChurch}>Church of Nigeria, Anglican Communion</Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.memberCardDivider} />

                {/* Card Body */}
                <View style={styles.memberCardBody}>
                  <View style={styles.memberCardAvatar}>
                    <Text style={styles.memberCardAvatarText}>
                      {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.memberCardInfo}>
                    <Text style={styles.memberCardName}>{user?.fullName || 'Church Member'}</Text>
                    <View style={[styles.memberCardRoleBadge, { backgroundColor: roleConfig.bg, borderColor: roleConfig.color }]}>
                      <Text style={[styles.memberCardRole, { color: roleConfig.color }]}>
                        {roleConfig.icon} {roleConfig.label}
                      </Text>
                    </View>
                    {user?.parish && <Text style={styles.memberCardParish}>⛪ {user.parish}</Text>}
                    <Text style={styles.memberCardEmail}>{user?.email}</Text>
                  </View>
                </View>

                {/* Card Footer */}
                <View style={styles.memberCardFooter}>
                  <View style={styles.memberCardIdWrapper}>
                    <Text style={styles.memberCardIdLabel}>MEMBER ID</Text>
                    <Text style={styles.memberCardId}>{membershipId}</Text>
                  </View>
                  <View style={styles.memberCardCross}>
                    <Text style={styles.memberCardCrossText}>✝</Text>
                  </View>
                </View>
              </View>

              <View style={styles.memberCardNote}>
                <Text style={styles.memberCardNoteText}>
                  💡 This digital card serves as your official Diocese membership identification.
                </Text>
              </View>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setMembershipModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── About Diocese Modal ── */}
      <Modal visible={aboutModalVisible} animationType="slide" transparent onRequestClose={() => setAboutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setAboutModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setAboutModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={styles.modalAccentBar} />
              <Text style={styles.modalTitle}>About Diocese</Text>
              <Text style={styles.modalSubtitle}>Diocese of Oke-Osun, Church of Nigeria</Text>

              <View style={styles.aboutLogoWrapper}>
                <Image source={require('../../../assets/logo.png')} style={styles.aboutLogo} resizeMode="contain" />
              </View>

              {[
                { icon: '✝', title: 'Our Diocese', text: 'The Diocese of Oke-Osun is one of the dioceses of the Church of Nigeria (Anglican Communion). We are committed to spreading the Gospel of Jesus Christ and building a strong Christian community across Osun State.' },
                { icon: '🎯', title: 'Our Mission', text: 'To proclaim the Good News of the Kingdom, to teach, baptise and nurture new believers, to respond to human need by loving service, and to seek to transform unjust structures of society.' },
                { icon: '👁', title: 'Our Vision', text: 'A vibrant, Spirit-filled Diocese that transforms lives and communities through the power of the Gospel, rooted in the Anglican tradition and responsive to the needs of our people.' },
                { icon: '📍', title: 'Location', text: 'Cathedral Church of St. Paul, Oke-Church, Gbongan, Osun State, Nigeria.' },
              ].map((section, i) => (
                <View key={i} style={styles.aboutSection}>
                  <View style={styles.aboutSectionHeader}>
                    <Text style={styles.aboutSectionIcon}>{section.icon}</Text>
                    <Text style={styles.aboutSectionTitle}>{section.title}</Text>
                  </View>
                  <Text style={styles.aboutSectionText}>{section.text}</Text>
                </View>
              ))}

              <View style={styles.aboutDivider} />
              <Text style={styles.aboutVersion}>RADET Diocese App  •  v1.0.0</Text>
              <Text style={styles.aboutCopyright}>© 2025 Diocese of Oke-Osun</Text>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAboutModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Help & Support Modal ── */}
      <Modal visible={supportModalVisible} animationType="slide" transparent onRequestClose={() => setSupportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSupportModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setSupportModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={[styles.modalAccentBar, { backgroundColor: COLORS.teal }]} />
              <Text style={styles.modalTitle}>Help & Support</Text>
              <Text style={styles.modalSubtitle}>We're here to help you</Text>

              {/* Contact Options */}
              <Text style={styles.supportSectionTitle}>CONTACT US</Text>
              <View style={styles.supportContactList}>
                {[
                  { icon: '📧', label: 'Email Support', value: 'support@okeosundiocese.ng', action: () => Linking.openURL('mailto:support@okeosundiocese.ng') },
                  { icon: '📞', label: 'Phone', value: '+234 000 000 0000', action: () => Linking.openURL('tel:+2340000000000') },
                  { icon: '🌐', label: 'Website', value: 'www.okeosundiocese.ng', action: () => Linking.openURL('https://www.okeosundiocese.ng') },
                ].map((contact, i, arr) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.supportContactItem, i < arr.length - 1 && styles.supportContactBorder]}
                    onPress={contact.action}
                    activeOpacity={0.7}
                  >
                    <View style={styles.supportContactIcon}><Text style={{ fontSize: 18 }}>{contact.icon}</Text></View>
                    <View style={styles.supportContactText}>
                      <Text style={styles.supportContactLabel}>{contact.label}</Text>
                      <Text style={styles.supportContactValue}>{contact.value}</Text>
                    </View>
                    <Text style={styles.menuArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* FAQ */}
              <Text style={styles.supportSectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
              <View style={styles.faqList}>
                {FAQ_ITEMS.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.faqItem, i < FAQ_ITEMS.length - 1 && styles.faqItemBorder]}
                    onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.faqQuestion}>
                      <Text style={styles.faqQuestionText}>{item.q}</Text>
                      <Text style={styles.faqChevron}>{expandedFaq === i ? '▲' : '▼'}</Text>
                    </View>
                    {expandedFaq === i && (
                      <Text style={styles.faqAnswer}>{item.a}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSupportModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Privacy Policy Modal ── */}
      <Modal visible={privacyModalVisible} animationType="slide" transparent onRequestClose={() => setPrivacyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setPrivacyModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setPrivacyModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={[styles.modalAccentBar, { backgroundColor: COLORS.red }]} />
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <Text style={styles.modalSubtitle}>Last updated: January 2025</Text>

              {[
                { title: '1. Information We Collect', text: 'We collect information you provide during registration including your full name, email address, phone number, and parish affiliation. We also collect usage data to improve the app experience.' },
                { title: '2. How We Use Your Information', text: 'Your information is used solely to provide Diocese services, send relevant notifications about events and services, and maintain your membership records. We do not sell or share your data with third parties.' },
                { title: '3. Data Security', text: 'We take the security of your personal data seriously. Your password is encrypted and never stored in plain text. All data is transmitted securely and stored on protected servers.' },
                { title: '4. Notifications', text: 'You may receive push notifications about events, live services, and Diocese announcements. You can manage your notification preferences at any time in the Notifications settings.' },
                { title: '5. Your Rights', text: 'You have the right to access, correct, or delete your personal data at any time. To request data deletion, please contact us at support@okeosundiocese.ng.' },
                { title: '6. Changes to This Policy', text: 'We may update this privacy policy from time to time. Any changes will be reflected with an updated date at the top of this page.' },
                { title: '7. Contact', text: 'If you have any questions about this Privacy Policy, please contact the Diocese office at support@okeosundiocese.ng.' },
              ].map((section, i) => (
                <View key={i} style={styles.privacySection}>
                  <Text style={styles.privacySectionTitle}>{section.title}</Text>
                  <Text style={styles.privacySectionText}>{section.text}</Text>
                </View>
              ))}

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPrivacyModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Form Field Component ──
const FormField = ({ label, icon, value, onChangeText, placeholder, keyboardType }) => (
  <View style={styles.formField}>
    <Text style={styles.formLabel}>{icon}  {label}</Text>
    <TextInput style={styles.formInput} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={COLORS.textMuted} keyboardType={keyboardType || 'default'} />
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
  editHeaderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8,
  },
  editHeaderText: { fontSize: FONTS.sizes.sm, color: COLORS.gold, fontWeight: FONTS.weights.semibold },
  scrollContent: { paddingTop: SPACING.lg },
  profileCard: {
    marginHorizontal: SPACING.lg, backgroundColor: COLORS.surface, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: RADIUS.xl, padding: SPACING.xl,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  avatarWrapper: { position: 'relative', marginBottom: SPACING.md },
  avatar: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(201,168,76,0.08)',
    borderWidth: 3, borderColor: COLORS.gold, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', padding: 8,
  },
  avatarLogo: { width: '100%', height: '100%' },
  avatarUpload: { position: 'absolute', right: 6, bottom: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.surface },
  avatarRoleBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.surface },
  avatarRoleIcon: { fontSize: 14 },
  profileName: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, marginBottom: SPACING.sm },
  roleIcon: { fontSize: 13 },
  roleLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  profileEmail: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: 4 },
  profilePhone: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: 4 },
  profileParish: { fontSize: FONTS.sizes.sm, color: COLORS.teal, marginBottom: SPACING.md },
  dioceseTag: { backgroundColor: 'rgba(201,168,76,0.06)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 5, marginTop: SPACING.xs },
  dioceseTagText: { fontSize: 10, color: COLORS.gold, letterSpacing: 0.5, fontWeight: FONTS.weights.semibold },
  statsRow: { flexDirection: 'row', marginHorizontal: SPACING.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, overflow: 'hidden' },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, gap: 4 },
  statCardBorder: { borderRightWidth: 1, borderRightColor: COLORS.border },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.goldLight },
  statLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center', lineHeight: 14 },
  menuSection: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  menuSectionTitle: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.black, color: COLORS.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACING.sm, paddingLeft: SPACING.xs },
  menuCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  menuItemIconWrapper: { width: 36, height: 36, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  menuItemIcon: { fontSize: 16 },
  menuItemLabel: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: FONTS.weights.semibold },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  menuBadge: { backgroundColor: COLORS.red, borderRadius: RADIUS.full, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  menuBadgeText: { fontSize: 10, color: '#fff', fontWeight: FONTS.weights.black },
  menuItemValue: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  menuArrow: { fontSize: 20, color: COLORS.textMuted },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginHorizontal: SPACING.lg, height: 54, borderRadius: RADIUS.lg, backgroundColor: 'rgba(201,76,76,0.08)', borderWidth: 1, borderColor: 'rgba(201,76,76,0.25)', marginBottom: SPACING.lg },
  signOutIcon: { fontSize: 18, color: COLORS.red },
  signOutText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.red, letterSpacing: 0.5 },
  footer: { alignItems: 'center', gap: 4, paddingBottom: SPACING.md },
  footerCross: { fontSize: 24, color: COLORS.gold, opacity: 0.5 },
  footerText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold, letterSpacing: 0.5 },
  footerSub: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, opacity: 0.6 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  modalSheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.sm },
  modalClose: { position: 'absolute', top: SPACING.md, right: SPACING.lg, width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalCloseText: { color: COLORS.textMuted, fontSize: 13, fontWeight: FONTS.weights.bold },
  modalContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  modalAccentBar: { height: 3, borderRadius: 2, backgroundColor: COLORS.gold, marginBottom: SPACING.lg, marginTop: SPACING.sm },
  modalTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.xs },
  modalSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: SPACING.xl },
  formFields: { gap: SPACING.md, marginBottom: SPACING.lg },
  formField: { gap: SPACING.xs },
  formLabel: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: COLORS.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
  formInput: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.text, fontSize: FONTS.sizes.md, height: 50 },
  formInputReadOnly: { backgroundColor: COLORS.surface2, opacity: 0.7 },
  formInputReadOnlyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, lineHeight: 36 },
  formHint: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, opacity: 0.7 },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 50 },
  passwordInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md, height: '100%' },
  pwToggle: { fontSize: 16, paddingLeft: SPACING.sm },
  notifList: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, overflow: 'hidden' },
  notifRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.md },
  notifRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  notifIconWrapper: { width: 38, height: 38, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  notifIcon: { fontSize: 18 },
  notifTextWrapper: { flex: 1 },
  notifLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 2 },
  notifDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  resetBtn: { height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.sm },
  resetBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  currentParishCard: { backgroundColor: 'rgba(76,201,168,0.08)', borderWidth: 1, borderColor: COLORS.teal, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  currentParishLabel: { fontSize: FONTS.sizes.xs, color: COLORS.teal, fontWeight: FONTS.weights.bold, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  currentParishName: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: FONTS.weights.semibold },
  parishSearchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 46, marginBottom: SPACING.md, gap: SPACING.sm },
  parishSearchIcon: { fontSize: 16 },
  parishSearchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md },
  parishSearchClear: { fontSize: 14, color: COLORS.textMuted, paddingLeft: SPACING.sm },
  parishLoading: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.md },
  parishLoadingText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  parishEmpty: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  parishEmptyIcon: { fontSize: 40 },
  parishEmptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
  parishList: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, overflow: 'hidden' },
  parishItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  parishItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  parishItemSelected: { backgroundColor: 'rgba(76,201,168,0.08)' },
  parishItemLeft: { flex: 1 },
  parishItemName: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 2 },
  parishItemArchdeaconry: { fontSize: FONTS.sizes.xs, color: COLORS.teal, marginBottom: 2 },
  parishItemLocation: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  parishItemCheck: { fontSize: 18, color: COLORS.teal, fontWeight: FONTS.weights.bold },

  // ── Membership Card ──
  memberCard: { backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.gold, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md },
  memberCardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  memberCardLogo: { width: 40, height: 40 },
  memberCardHeaderText: { flex: 1 },
  memberCardDiocese: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black, color: COLORS.goldLight, letterSpacing: 0.5 },
  memberCardChurch: { fontSize: 9, color: COLORS.gold, letterSpacing: 0.3 },
  memberCardDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.md },
  memberCardBody: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  memberCardAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(201,168,76,0.15)', borderWidth: 2, borderColor: COLORS.gold, justifyContent: 'center', alignItems: 'center' },
  memberCardAvatarText: { fontSize: 24, fontWeight: FONTS.weights.black, color: COLORS.gold },
  memberCardInfo: { flex: 1 },
  memberCardName: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: 4 },
  memberCardRoleBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2, marginBottom: 4 },
  memberCardRole: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  memberCardParish: { fontSize: FONTS.sizes.xs, color: COLORS.teal, marginBottom: 2 },
  memberCardEmail: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  memberCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  memberCardIdWrapper: {},
  memberCardIdLabel: { fontSize: 9, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  memberCardId: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, color: COLORS.goldLight, letterSpacing: 1.5 },
  memberCardCross: {},
  memberCardCrossText: { fontSize: 24, color: COLORS.gold, opacity: 0.5 },
  memberCardNote: { backgroundColor: 'rgba(201,168,76,0.06)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg },
  memberCardNoteText: { fontSize: FONTS.sizes.xs, color: COLORS.gold, lineHeight: 18 },

  // ── About ──
  aboutLogoWrapper: { alignItems: 'center', marginBottom: SPACING.lg },
  aboutLogo: { width: 80, height: 80 },
  aboutSection: { marginBottom: SPACING.lg },
  aboutSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  aboutSectionIcon: { fontSize: 20 },
  aboutSectionTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, color: COLORS.goldLight },
  aboutSectionText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: 22 },
  aboutDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  aboutVersion: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', marginBottom: 4 },
  aboutCopyright: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, textAlign: 'center', opacity: 0.6, marginBottom: SPACING.lg },

  // ── Support ──
  supportSectionTitle: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.black, color: COLORS.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACING.sm },
  supportContactList: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, overflow: 'hidden' },
  supportContactItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.md },
  supportContactBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  supportContactIcon: { width: 38, height: 38, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  supportContactText: { flex: 1 },
  supportContactLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 2 },
  supportContactValue: { fontSize: FONTS.sizes.xs, color: COLORS.teal },
  faqList: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, overflow: 'hidden' },
  faqItem: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  faqItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  faqQuestion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQuestionText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  faqChevron: { fontSize: 10, color: COLORS.textMuted },
  faqAnswer: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: 20, marginTop: SPACING.sm },

  // ── Privacy ──
  privacySection: { marginBottom: SPACING.lg },
  privacySectionTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black, color: COLORS.goldLight, marginBottom: SPACING.sm },
  privacySectionText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: 22 },

  saveBtn: { backgroundColor: COLORS.gold, borderRadius: RADIUS.lg, height: 54, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  cancelBtn: { height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg },
  cancelBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
});
