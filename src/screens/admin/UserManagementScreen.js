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
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { API_ROUTES } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../../components/ui/PageLoader';
import useOptimisticUpdate from '../../hooks/useOptimisticUpdate';

const ROLE_CONFIG = {
  admin:  { label: 'Admin',  color: COLORS.red,  bg: 'rgba(201,76,76,0.1)',  border: 'rgba(201,76,76,0.3)',  icon: '🛡️' },
  clergy: { label: 'Clergy', color: COLORS.teal, bg: 'rgba(76,201,168,0.1)', border: 'rgba(76,201,168,0.3)', icon: '⛪' },
  member: { label: 'Member', color: COLORS.gold, bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.3)', icon: '🙏' },
};

const STATUS_CONFIG = {
  active:   { label: '● Active',   color: COLORS.teal,      bg: 'rgba(76,201,168,0.1)'  },
  inactive: { label: '○ Inactive', color: COLORS.textMuted, bg: 'rgba(122,117,104,0.1)' },
  pending:  { label: '◎ Pending',  color: COLORS.gold,      bg: 'rgba(201,168,76,0.1)'  },
};

const FILTERS = ['All', 'Clergy', 'Members', 'Admins', 'Pending', 'Inactive'];

const SORT_OPTIONS = [
  { key: 'name',   label: 'Name (A–Z)'  },
  { key: 'joined', label: 'Date Joined' },
  { key: 'role',   label: 'Role'        },
  { key: 'status', label: 'Status'      },
];

export default function UserManagementScreen({ navigation }) {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [addUserModal, setAddUserModal] = useState(false);
  const [sortModal, setSortModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Add User Form ──
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('member');
  const [formParish, setFormParish] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { runOptimistic } = useOptimisticUpdate();

  // ── Auth headers ──
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // ── Fetch all users ──
  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch(API_ROUTES.adminUsers, { headers: authHeaders });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        Alert.alert('Error', data.detail || 'Failed to load users');
      }
    } catch {
      Alert.alert('Error', 'Network error. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchUsers(); }, []);

  // ── Reset form ──
  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('member');
    setFormParish('');
  };

  // ── Add User — calls register endpoint ──
  const handleAddUser = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      Alert.alert('Error', 'Name and email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const optimisticUser = {
        id: `tmp-${Date.now()}`,
        fullName: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || null,
        role: formRole,
        parish: formParish.trim() || null,
        status: formRole === 'clergy' ? 'pending' : 'active',
      };

      const result = await runOptimistic({
        apply: () => {
          const prev = users;
          setUsers([optimisticUser, ...prev]);
          return prev;
        },
        rollback: (prev) => setUsers(prev),
        request: async () => {
          const response = await fetch(API_ROUTES.adminUserInvite, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              fullName: formName.trim(),
              email: formEmail.trim(),
              phone: formPhone.trim() || null,
              role: formRole,
              parish: formParish.trim() || null,
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || 'Failed to add user');
          return data;
        },
      });

      if (result.success) {
        await fetchUsers(true);
        setAddUserModal(false);
        resetForm();
        Alert.alert(
          '✓ Invite Created',
          `${formName} has been invited.\n\nShare this setup code securely:\n${result.data?.inviteToken || 'Unavailable'}`
        );
      } else {
        Alert.alert('Error', 'Failed to add user');
      }
    } catch {
      Alert.alert('Error', 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Approve user ──
  const handleApprove = async (userId) => {
    setActionLoading(true);
    try {
      const result = await runOptimistic({
        apply: () => {
          const prev = users;
          setUsers(users.map((u) => u.id === userId ? { ...u, status: 'active' } : u));
          setSelectedUser((prevUser) => prevUser ? { ...prevUser, status: 'active' } : prevUser);
          return prev;
        },
        rollback: (prev) => {
          setUsers(prev);
          const original = prev.find((u) => u.id === userId);
          setSelectedUser(original || null);
        },
        request: async () => {
          const response = await fetch(`${API_ROUTES.adminUsers}/${userId}/approve`, {
            method: 'PATCH',
            headers: authHeaders,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || 'Failed to approve user');
        },
      });

      if (result.success) {
        Alert.alert('✓ Approved', 'User has been approved.');
      } else {
        Alert.alert('Error', 'Failed to approve user');
      }
    } catch {
      Alert.alert('Error', 'Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Change role ──
  const handleChangeRole = async (userId, role) => {
    setActionLoading(true);
    try {
      const result = await runOptimistic({
        apply: () => {
          const prev = users;
          setUsers(users.map((u) => u.id === userId ? { ...u, role } : u));
          setSelectedUser((prevUser) => prevUser ? { ...prevUser, role } : prevUser);
          return prev;
        },
        rollback: (prev) => {
          setUsers(prev);
          const original = prev.find((u) => u.id === userId);
          setSelectedUser(original || null);
        },
        request: async () => {
          const response = await fetch(`${API_ROUTES.adminUsers}/${userId}/role`, {
            method: 'PATCH',
            headers: authHeaders,
            body: JSON.stringify({ role }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || 'Failed to change role');
        },
      });

      if (result.success) {
        Alert.alert('✓ Updated', `Role changed to ${role}.`);
      } else {
        Alert.alert('Error', 'Failed to change role');
      }
    } catch {
      Alert.alert('Error', 'Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Change status ──
  const handleChangeStatus = async (userId, status) => {
    setActionLoading(true);
    try {
      const endpoint = status === 'inactive'
        ? `${API_ROUTES.adminUsers}/${userId}/suspend`
        : `${API_ROUTES.adminUsers}/${userId}/approve`;
      const result = await runOptimistic({
        apply: () => {
          const prev = users;
          setUsers(users.map((u) => u.id === userId ? { ...u, status } : u));
          setSelectedUser((prevUser) => prevUser ? { ...prevUser, status } : prevUser);
          return prev;
        },
        rollback: (prev) => {
          setUsers(prev);
          const original = prev.find((u) => u.id === userId);
          setSelectedUser(original || null);
        },
        request: async () => {
          const response = await fetch(endpoint, {
            method: 'PATCH',
            headers: authHeaders,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || 'Failed to update status');
        },
      });

      if (result.success) {
        Alert.alert('✓ Updated', `Status changed to ${status}.`);
      } else {
        Alert.alert('Error', 'Failed to update status');
      }
    } catch {
      Alert.alert('Error', 'Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete user ──
  const handleDelete = (userId) => {
    Alert.alert('Delete User', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const result = await runOptimistic({
                apply: () => {
                  const prev = users;
                  setUsers(users.filter((u) => u.id !== userId));
                  setDetailModal(false);
                  return prev;
                },
                rollback: (prev) => setUsers(prev),
                request: async () => {
                  const response = await fetch(`${API_ROUTES.adminUsers}/${userId}`, {
                    method: 'DELETE',
                    headers: authHeaders,
                  });
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.detail || 'Failed to delete user');
                },
              });

              if (result.success) {
                Alert.alert('✓ Deleted', 'User has been deleted.');
              } else {
                Alert.alert('Error', 'Failed to delete user');
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

  // ── Avatar initials ──
  const getInitials = (name) =>
    (name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  // ── Filter + Search + Sort ──
  const filteredUsers = users
    .filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.parish?.toLowerCase().includes(q) ||
        u.phone?.includes(q);
      const matchFilter =
        activeFilter === 'All'      ? true :
        activeFilter === 'Clergy'   ? u.role === 'clergy' :
        activeFilter === 'Members'  ? u.role === 'member' :
        activeFilter === 'Admins'   ? u.role === 'admin' :
        activeFilter === 'Pending'  ? u.status === 'pending' :
        activeFilter === 'Inactive' ? u.status === 'inactive' : true;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name')   return (a.fullName || '').localeCompare(b.fullName || '');
      if (sortBy === 'role')   return (a.role || '').localeCompare(b.role || '');
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      if (sortBy === 'joined') return (b.createdAt || '').localeCompare(a.createdAt || '');
      return 0;
    });

  // ── Stats ──
  const stats = {
    total:    users.length,
    clergy:   users.filter((u) => u.role === 'clergy').length,
    members:  users.filter((u) => u.role === 'member').length,
    admins:   users.filter((u) => u.role === 'admin').length,
    pending:  users.filter((u) => u.status === 'pending').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
  };

  // ── Loading Screen ──
  if (loading) {
    return <PageLoader text="Loading users..." />;
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
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>{users.length} registered users</Text>
        </View>
        <TouchableOpacity style={styles.addHeaderBtn} onPress={() => setAddUserModal(true)}>
          <Text style={styles.addHeaderBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats Bar ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsBar}>
        <StatCard icon="👥" value={stats.total}    label="Total"    />
        <StatCard icon="⛪" value={stats.clergy}   label="Clergy"   color={COLORS.teal} />
        <StatCard icon="🙏" value={stats.members}  label="Members"  color={COLORS.gold} />
        <StatCard icon="🛡️" value={stats.admins}   label="Admins"   color={COLORS.red}  />
        <StatCard icon="◎" value={stats.pending}  label="Pending"  color={COLORS.gold} />
        <StatCard icon="○" value={stats.inactive} label="Inactive" color={COLORS.textMuted} />
      </ScrollView>

      {/* ── Search + Sort ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, email, parish..."
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
        <TouchableOpacity style={styles.sortBtn} onPress={() => setSortModal(true)}>
          <Text style={styles.sortBtnIcon}>⇅</Text>
        </TouchableOpacity>
      </View>

      {/* ── Filter Chips ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        {FILTERS.map((f) => {
          const count =
            f === 'All'      ? users.length :
            f === 'Clergy'   ? stats.clergy :
            f === 'Members'  ? stats.members :
            f === 'Admins'   ? stats.admins :
            f === 'Pending'  ? stats.pending :
            f === 'Inactive' ? stats.inactive : 0;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>{f}</Text>
              <View style={[styles.filterChipCount, activeFilter === f && styles.filterChipCountActive]}>
                <Text style={[styles.filterChipCountText, activeFilter === f && styles.filterChipCountTextActive]}>{count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Results Count ── */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          {searchQuery ? ` for "${searchQuery}"` : ''}
        </Text>
        <Text style={styles.sortLabel}>Sort: {SORT_OPTIONS.find((s) => s.key === sortBy)?.label}</Text>
      </View>

      {/* ── User List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchUsers(true)} tintColor={COLORS.red} />
        }
      >
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyTitle}>No Users Found</Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? 'Try a different search' : 'No users match this filter'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((u) => {
            const roleConf   = ROLE_CONFIG[u.role]   || ROLE_CONFIG.member;
            const statusConf = STATUS_CONFIG[u.status] || STATUS_CONFIG.active;
            return (
              <TouchableOpacity
                key={u.id}
                style={[
                  styles.userCard,
                  u.status === 'pending'  && styles.userCardPending,
                  u.status === 'inactive' && styles.userCardInactive,
                ]}
                onPress={() => { setSelectedUser(u); setDetailModal(true); }}
                activeOpacity={0.85}
              >
                <View style={[styles.userCardAccent, { backgroundColor: roleConf.color }]} />
                <View style={[styles.avatar, { backgroundColor: roleConf.bg }]}>
                  <Text style={[styles.avatarText, { color: roleConf.color }]}>
                    {getInitials(u.fullName)}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName} numberOfLines={1}>{u.fullName}</Text>
                    {u.status === 'pending' && <View style={styles.pendingDot} />}
                  </View>
                  <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
                  <Text style={styles.userParish} numberOfLines={1}>
                    {u.parish ? `⛪ ${u.parish}` : '⛪ No parish'}
                  </Text>
                </View>
                <View style={styles.userRight}>
                  <View style={[styles.rolePill, { backgroundColor: roleConf.bg, borderColor: roleConf.border }]}>
                    <Text style={styles.rolePillIcon}>{roleConf.icon}</Text>
                    <Text style={[styles.rolePillText, { color: roleConf.color }]}>{roleConf.label}</Text>
                  </View>
                  <Text style={[styles.statusText, { color: statusConf.color }]}>{statusConf.label}</Text>
                  <Text style={styles.joinedText}>
                    {u.createdAt ? u.createdAt.slice(0, 10) : '—'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ══════════════════════════════════
          USER DETAIL MODAL
      ══════════════════════════════════ */}
      {selectedUser && (
        <Modal visible={detailModal} animationType="slide" transparent onRequestClose={() => setDetailModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setDetailModal(false)} />
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <TouchableOpacity style={styles.modalClose} onPress={() => setDetailModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                <View style={[styles.modalAccentBar, { backgroundColor: ROLE_CONFIG[selectedUser.role]?.color || COLORS.gold }]} />

                {/* Avatar + Name */}
                <View style={styles.detailTopSection}>
                  <View style={[styles.detailAvatar, { backgroundColor: ROLE_CONFIG[selectedUser.role]?.bg }]}>
                    <Text style={[styles.detailAvatarText, { color: ROLE_CONFIG[selectedUser.role]?.color }]}>
                      {getInitials(selectedUser.fullName)}
                    </Text>
                  </View>
                  <Text style={styles.detailName}>{selectedUser.fullName}</Text>
                  <View style={styles.detailBadgesRow}>
                    <View style={[styles.detailRoleBadge, { backgroundColor: ROLE_CONFIG[selectedUser.role]?.bg, borderColor: ROLE_CONFIG[selectedUser.role]?.border }]}>
                      <Text style={[styles.detailRoleBadgeText, { color: ROLE_CONFIG[selectedUser.role]?.color }]}>
                        {ROLE_CONFIG[selectedUser.role]?.icon} {ROLE_CONFIG[selectedUser.role]?.label}
                      </Text>
                    </View>
                    <View style={[styles.detailStatusBadge, { backgroundColor: STATUS_CONFIG[selectedUser.status]?.bg }]}>
                      <Text style={[styles.detailStatusBadgeText, { color: STATUS_CONFIG[selectedUser.status]?.color }]}>
                        {STATUS_CONFIG[selectedUser.status]?.label}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Info Grid */}
                <View style={styles.infoGrid}>
                  <InfoRow icon="📧" label="Email"  value={selectedUser.email} />
                  <InfoRow icon="📞" label="Phone"  value={selectedUser.phone || 'Not provided'} />
                  <InfoRow icon="⛪" label="Parish" value={selectedUser.parish || 'Not assigned'} />
                  <InfoRow icon="📅" label="Joined" value={selectedUser.createdAt ? selectedUser.createdAt.slice(0, 10) : '—'} />
                  <InfoRow icon="📌" label="Status" value={STATUS_CONFIG[selectedUser.status]?.label} valueColor={STATUS_CONFIG[selectedUser.status]?.color} />
                </View>

                {/* Action loading */}
                {actionLoading && (
                  <View style={styles.actionLoading}>
                    <ActivityIndicator color={COLORS.red} size="small" />
                    <Text style={styles.actionLoadingText}>Processing...</Text>
                  </View>
                )}

                {/* Approve if pending */}
                {selectedUser.status === 'pending' && !actionLoading && (
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(selectedUser.id)}>
                    <Text style={styles.approveBtnText}>✓  Approve User</Text>
                  </TouchableOpacity>
                )}

                {/* Change Role */}
                <Text style={styles.detailSectionLabel}>CHANGE ROLE</Text>
                <View style={styles.roleRow}>
                  {['member', 'clergy', 'admin'].map((r) => {
                    const rc = ROLE_CONFIG[r];
                    const active = selectedUser.role === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        style={[styles.roleChip, active && { backgroundColor: rc.bg, borderColor: rc.color }]}
                        onPress={() => { if (!active && !actionLoading) handleChangeRole(selectedUser.id, r); }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.roleChipIcon}>{rc.icon}</Text>
                        <Text style={[styles.roleChipText, active && { color: rc.color, fontWeight: FONTS.weights.bold }]}>{rc.label}</Text>
                        {active && <Text style={[styles.roleChipCheck, { color: rc.color }]}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Change Status */}
                <Text style={styles.detailSectionLabel}>CHANGE STATUS</Text>
                <View style={styles.statusRow}>
                  {['active', 'inactive', 'pending'].map((s) => {
                    const sc = STATUS_CONFIG[s];
                    const active = selectedUser.status === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[styles.statusChip, active && { backgroundColor: sc.bg, borderColor: sc.color }]}
                        onPress={() => { if (!active && !actionLoading) handleChangeStatus(selectedUser.id, s); }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.statusChipText, active && { color: sc.color, fontWeight: FONTS.weights.bold }]}>{sc.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Delete */}
                <TouchableOpacity
                  style={[styles.deleteBtn, actionLoading && { opacity: 0.5 }]}
                  onPress={() => { if (!actionLoading) handleDelete(selectedUser.id); }}
                >
                  <Text style={styles.deleteBtnText}>🗑  Delete User</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailModal(false)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ══════════════════════════════════
          ADD USER MODAL
      ══════════════════════════════════ */}
      <Modal
        visible={addUserModal}
        animationType="slide"
        transparent
        onRequestClose={() => { setAddUserModal(false); resetForm(); }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => { setAddUserModal(false); resetForm(); }}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => { setAddUserModal(false); resetForm(); }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={[styles.modalAccentBar, { backgroundColor: COLORS.red }]} />
              <Text style={styles.modalTitle}>Add New User</Text>
              <Text style={styles.modalSubtitle}>
                Manually register a user to the diocese
              </Text>

              {/* Role Selector */}
              <Text style={styles.formLabel}>👤  ROLE</Text>
              <View style={styles.addRoleRow}>
                {['member', 'clergy', 'admin'].map((r) => {
                  const rc = ROLE_CONFIG[r];
                  const active = formRole === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.addRoleChip, active && { backgroundColor: rc.bg, borderColor: rc.color }]}
                      onPress={() => setFormRole(r)}
                    >
                      <Text style={styles.addRoleChipIcon}>{rc.icon}</Text>
                      <Text style={[styles.addRoleChipText, active && { color: rc.color, fontWeight: FONTS.weights.bold }]}>
                        {rc.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <FormInput label="📝  FULL NAME *"  value={formName}   onChangeText={setFormName}   placeholder="e.g. Mr. John Adebayo" />
              <FormInput label="📧  EMAIL *"      value={formEmail}  onChangeText={setFormEmail}  placeholder="e.g. john@gmail.com" keyboardType="email-address" />
              <FormInput label="📞  PHONE NUMBER" value={formPhone}  onChangeText={setFormPhone}  placeholder="e.g. +234 801 234 5678" keyboardType="phone-pad" />
              <FormInput label="⛪  PARISH"       value={formParish} onChangeText={setFormParish} placeholder="e.g. Cathedral, Osogbo" />

              <View style={styles.defaultPwNote}>
                <Text style={styles.defaultPwNoteText}>
                  🔗 A secure invite code will be generated for this account
                </Text>
                <Text style={styles.defaultPwNoteHint}>They will finish setup themselves and choose their own password.</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                onPress={handleAddUser}
                disabled={submitting}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? '⏳  Adding...' : '👤  Add User'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setAddUserModal(false); resetForm(); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════
          SORT MODAL
      ══════════════════════════════════ */}
      <Modal visible={sortModal} animationType="fade" transparent onRequestClose={() => setSortModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSortModal(false)} />
          <View style={styles.sortSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.sortTitle}>Sort By</Text>
            {SORT_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.sortOption, sortBy === s.key && styles.sortOptionActive]}
                onPress={() => { setSortBy(s.key); setSortModal(false); }}
              >
                <Text style={[styles.sortOptionText, sortBy === s.key && styles.sortOptionTextActive]}>{s.label}</Text>
                {sortBy === s.key && <Text style={styles.sortOptionCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Reusable Components ──
const StatCard = ({ icon, value, label, color }) => (
  <View style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, color && { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ icon, label, value, valueColor }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{icon}  {label}</Text>
    <Text style={[styles.infoValue, valueColor && { color: valueColor }]} numberOfLines={1}>{value}</Text>
  </View>
);

const FormInput = ({ label, value, onChangeText, placeholder, keyboardType }) => (
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
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.red, letterSpacing: 0.5 },
  headerSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, letterSpacing: 0.3 },
  addHeaderBtn: { backgroundColor: COLORS.red, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8 },
  addHeaderBtnText: { fontSize: FONTS.sizes.sm, color: '#fff', fontWeight: FONTS.weights.bold },

  // ── Stats Bar ──
  statsBar: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statCard: { alignItems: 'center', backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, minWidth: 72, gap: 2 },
  statIcon: { fontSize: 16 },
  statValue: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.text },
  statLabel: { fontSize: 9, color: COLORS.textMuted, letterSpacing: 0.3 },

  // ── Search ──
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm, gap: SPACING.sm },
  searchWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, height: 46, gap: SPACING.sm },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.sm, height: '100%' },
  searchClear: { color: COLORS.textMuted, fontSize: 13 },
  sortBtn: { width: 46, height: 46, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  sortBtnIcon: { fontSize: 18, color: COLORS.textMuted, fontWeight: FONTS.weights.bold },

  // ── Filters ──
  filtersRow: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm, gap: SPACING.sm },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: SPACING.md, paddingRight: SPACING.sm, paddingVertical: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: 'rgba(201,76,76,0.1)', borderColor: COLORS.red },
  filterChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  filterChipTextActive: { color: COLORS.red, fontWeight: FONTS.weights.bold },
  filterChipCount: { backgroundColor: COLORS.surface2, borderRadius: RADIUS.full, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  filterChipCountActive: { backgroundColor: 'rgba(201,76,76,0.15)' },
  filterChipCountText: { fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weights.black },
  filterChipCountTextActive: { color: COLORS.red },

  // ── Results ──
  resultsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  resultsText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  sortLabel: { fontSize: FONTS.sizes.xs, color: COLORS.red, fontWeight: FONTS.weights.semibold },
  scrollContent: { paddingTop: SPACING.xs },

  // ── User Card ──
  userCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  userCardPending: { borderColor: 'rgba(201,168,76,0.35)', backgroundColor: 'rgba(201,168,76,0.03)' },
  userCardInactive: { opacity: 0.65 },
  userCardAccent: { width: 3, alignSelf: 'stretch' },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: SPACING.md, marginRight: SPACING.sm, flexShrink: 0 },
  avatarText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black },
  userInfo: { flex: 1, paddingVertical: SPACING.md, paddingRight: SPACING.sm },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 2 },
  userName: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, flex: 1 },
  pendingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.gold, flexShrink: 0 },
  userEmail: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: 2 },
  userParish: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  userRight: { alignItems: 'flex-end', paddingRight: SPACING.md, paddingVertical: SPACING.md, gap: 4, flexShrink: 0 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  rolePillIcon: { fontSize: 10 },
  rolePillText: { fontSize: 10, fontWeight: FONTS.weights.bold },
  statusText: { fontSize: 10, fontWeight: FONTS.weights.bold },
  joinedText: { fontSize: 9, color: COLORS.textMuted },

  // ── Empty ──
  emptyState: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text },
  emptySubText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },

  // ── Detail Modal ──
  detailTopSection: { alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  detailAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xs },
  detailAvatarText: { fontSize: 28, fontWeight: FONTS.weights.black },
  detailName: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text, textAlign: 'center' },
  detailBadgesRow: { flexDirection: 'row', gap: SPACING.sm },
  detailRoleBadge: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  detailRoleBadgeText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  detailStatusBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  detailStatusBadgeText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  infoGrid: { backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.lg },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, flexShrink: 0, marginRight: SPACING.sm },
  infoValue: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, flex: 1, textAlign: 'right' },
  actionLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, marginBottom: SPACING.sm },
  actionLoadingText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  detailSectionLabel: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.black, color: COLORS.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACING.sm },
  roleRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  roleChip: { flex: 1, height: 54, borderRadius: RADIUS.md, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', gap: 3 },
  roleChipIcon: { fontSize: 18 },
  roleChipText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  roleChipCheck: { fontSize: 12, fontWeight: FONTS.weights.black },
  statusRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statusChip: { flex: 1, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  statusChipText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  approveBtn: { height: 48, borderRadius: RADIUS.lg, backgroundColor: 'rgba(76,201,168,0.1)', borderWidth: 1, borderColor: 'rgba(76,201,168,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  approveBtnText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.teal },
  deleteBtn: { height: 48, borderRadius: RADIUS.lg, backgroundColor: 'rgba(201,76,76,0.08)', borderWidth: 1, borderColor: 'rgba(201,76,76,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  deleteBtnText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.red },
  closeBtn: { height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg },
  closeBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },

  // ── Add User Modal ──
  addRoleRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  addRoleChip: { flex: 1, height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', gap: 4 },
  addRoleChipIcon: { fontSize: 20 },
  addRoleChipText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold },
  defaultPwNote: { backgroundColor: 'rgba(201,168,76,0.08)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg },
  defaultPwNoteText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  defaultPwNoteValue: { color: COLORS.gold, fontWeight: FONTS.weights.bold },
  defaultPwNoteHint: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 4, opacity: 0.7 },

  // ── Sort Sheet ──
  sortSheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md, paddingHorizontal: SPACING.lg },
  sortTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md, paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sortOptionActive: { backgroundColor: 'rgba(201,76,76,0.05)', marginHorizontal: -SPACING.lg, paddingHorizontal: SPACING.lg },
  sortOptionText: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: FONTS.weights.semibold },
  sortOptionTextActive: { color: COLORS.red, fontWeight: FONTS.weights.bold },
  sortOptionCheck: { fontSize: 16, color: COLORS.red, fontWeight: FONTS.weights.bold },

  // ── Modal Base ──
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
  formInput: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, color: COLORS.text, fontSize: FONTS.sizes.md, height: 50 },
  submitBtn: { backgroundColor: COLORS.red, borderRadius: RADIUS.lg, height: 54, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, letterSpacing: 0.5 },
  cancelBtn: { height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg },
  cancelBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
});
