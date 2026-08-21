import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, UserStatus, Department, PermissionKey } from '../../types';
import {
  ROLE_CONFIGS,
  ALL_PERMISSIONS,
  ERP_TABS_LIST,
  isStaffMember,
  getUserEffectivePermissions,
  getUserEffectiveTabs,
  PermissionDefinition
} from '../../services/rolePermissions';
import {
  Users,
  Shield,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  KeyRound,
  Fingerprint,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Clock,
  Edit2,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  History,
  Lock,
  UserCheck,
  UserX,
  Sparkles,
  ShieldCheck,
  Award,
  SlidersHorizontal,
  Layers,
  Copy,
  Check,
  ChevronRight,
  Info,
  ShieldAlert
} from 'lucide-react';

const DEPARTMENTS: Department[] = [
  'Executive Leadership',
  'Trip Operations',
  'Procurement & Sourcing',
  'Finance & Accounting',
  'Customer Experience',
  'Trade Delegates',
  'General Staff'
];

export const UserManagementSection: React.FC = () => {
  const {
    users,
    currentUser,
    isSuperAdmin,
    hasPermission,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    assignUserRoleAndPermissions,
    resetUserPermissionsToDefault,
    switchActiveUser,
    auditLogs,
    logUserAudit
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'roles_matrix' | 'audit_logs'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals & Drawers state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [permissionModalUser, setPermissionModalUser] = useState<User | null>(null);

  // Live Matrix Customizer state
  const [matrixSelectedUserId, setMatrixSelectedUserId] = useState<string>(users[0]?.id || '');
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState<string>('all');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');
  const [matrixViewMode, setMatrixViewMode] = useState<'role_overview' | 'user_customizer'>('role_overview');

  // Permission Assignment Modal State
  const [targetRole, setTargetRole] = useState<UserRole>('operations_manager');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [permissionCategoryFilter, setPermissionCategoryFilter] = useState<string>('all');

  // Add / Edit User Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    department: Department;
    jobTitle: string;
    status: UserStatus;
    hasBiometrics: boolean;
    customPermissions?: PermissionKey[];
    customAccessibleTabs?: string[];
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'operations_manager',
    department: 'Trip Operations',
    jobTitle: '',
    status: 'active',
    hasBiometrics: false,
    customPermissions: undefined,
    customAccessibleTabs: undefined
  });

  // Filtered Users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.jobTitle && user.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesDept = departmentFilter === 'all' || user.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || (user.status || 'active') === statusFilter;

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  // Role stats
  const totalStaff = users.filter(u => isStaffMember(u)).length;
  const totalDelegates = users.filter(u => u.role === 'traveler').length;
  const activeCount = users.filter(u => (u.status || 'active') === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;

  const canManageUsers = hasPermission('users_manage') || isSuperAdmin;

  // Open Permission Modal for a specific user
  const handleOpenPermissionModal = (user: User) => {
    setPermissionModalUser(user);
    setTargetRole(user.role);
    const effectivePerms = getUserEffectivePermissions(user);
    const effectiveTabs = getUserEffectiveTabs(user);
    setSelectedPermissions(effectivePerms);
    setSelectedTabs(effectiveTabs);
  };

  // Quick Action: Apply role default permissions
  const handleApplyRoleDefaults = (role: UserRole) => {
    setTargetRole(role);
    const defaults = ROLE_CONFIGS[role]?.defaultPermissions || [];
    const defaultTabs = ROLE_CONFIGS[role]?.accessibleTabs || [];
    setSelectedPermissions([...defaults]);
    setSelectedTabs([...defaultTabs]);
  };

  // Toggle individual permission
  const handleTogglePermission = (key: PermissionKey) => {
    setSelectedPermissions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Toggle all permissions in a category
  const handleToggleCategoryPermissions = (category: string, enable: boolean) => {
    const categoryKeys = ALL_PERMISSIONS.filter(p => p.category === category).map(p => p.key);
    if (enable) {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...categoryKeys])));
    } else {
      setSelectedPermissions(prev => prev.filter(k => !categoryKeys.includes(k)));
    }
  };

  // Toggle accessible ERP tab
  const handleToggleTab = (tabId: string) => {
    setSelectedTabs(prev =>
      prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]
    );
  };

  // Save permissions from modal
  const handleSaveAssignedPermissions = async () => {
    if (!permissionModalUser) return;
    await assignUserRoleAndPermissions(
      permissionModalUser.id,
      targetRole,
      selectedPermissions,
      selectedTabs
    );
    setPermissionModalUser(null);
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '+855 ',
      role: 'operations_manager',
      department: 'Trip Operations',
      jobTitle: '',
      status: 'active',
      hasBiometrics: false,
      customPermissions: undefined,
      customAccessibleTabs: undefined
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      department: (user.department as Department) || 'Executive Leadership',
      jobTitle: user.jobTitle || '',
      status: user.status || 'active',
      hasBiometrics: user.hasBiometrics || false,
      customPermissions: user.customPermissions,
      customAccessibleTabs: user.customAccessibleTabs
    });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingUser) {
      await updateUser({
        ...editingUser,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        department: formData.department,
        jobTitle: formData.jobTitle.trim(),
        status: formData.status,
        hasBiometrics: formData.hasBiometrics,
        customPermissions: formData.customPermissions,
        customAccessibleTabs: formData.customAccessibleTabs
      });
      setEditingUser(null);
    } else {
      await addUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        department: formData.department,
        jobTitle: formData.jobTitle.trim(),
        status: formData.status,
        hasBiometrics: formData.hasBiometrics,
        preferredLanguage: 'km',
        preferredCurrency: 'USD',
        customPermissions: formData.customPermissions,
        customAccessibleTabs: formData.customAccessibleTabs,
        avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 999999)}?w=200&auto=format&fit=crop&q=80`
      });
      setIsAddModalOpen(false);
    }
  };

  const exportDirectoryCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Department', 'Job Title', 'Status', 'Custom Perms Count', 'Biometrics', 'Last Login'];
    const rows = users.map(u => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.phone || ''}"`,
      `"${ROLE_CONFIGS[u.role]?.displayName || u.role}"`,
      `"${u.department || 'N/A'}"`,
      `"${u.jobTitle || 'N/A'}"`,
      `"${u.status || 'active'}"`,
      `"${u.customPermissions ? u.customPermissions.length : 'Default'}"`,
      `"${u.hasBiometrics ? 'Yes' : 'No'}"`,
      `"${u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KHB-User-Directory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logUserAudit('Exported User Directory', `Exported ${users.length} user records to CSV format`, 'info');
  };

  const categories = ['Administration', 'Operations', 'Procurement', 'Finances', 'AI & System'] as const;

  const filteredPermissionsForModal = ALL_PERMISSIONS.filter(p => {
    const matchesSearch =
      p.label.toLowerCase().includes(permissionSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(permissionSearch.toLowerCase()) ||
      p.key.toLowerCase().includes(permissionSearch.toLowerCase());
    const matchesCat = permissionCategoryFilter === 'all' || p.category === permissionCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const matrixUser = users.find(u => u.id === matrixSelectedUserId) || users[0];

  return (
    <div className="space-y-6" id="user-management-module">
      {/* Super Admin Control Ribbon */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Super Admin RBAC Authority Active
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Full Master Clearance
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                You have unrestricted authorization to assign roles, grant custom permissions, and tailor module clearances across the entire organization.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveSubTab('roles_matrix');
              setMatrixViewMode('user_customizer');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors whitespace-nowrap shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Launch Live RBAC Customizer
          </button>
        </div>
      )}

      {/* Header & Stats */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  User Management & Role-Based Access Control (RBAC)
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Live Security Active
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage organization users, role permissions, department memberships, and real-time security audit trails.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={exportDirectoryCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Export Directory CSV
            </button>

            {canManageUsers && (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add New User
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Users</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{users.length}</p>
            <span className="text-[11px] text-slate-400">{totalStaff} Staff Members</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Accounts</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
            <span className="text-[11px] text-emerald-600/80">Authorized Access</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Trade Delegates</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{totalDelegates}</p>
            <span className="text-[11px] text-slate-400">B2B Mission VIPs</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Suspended / Inactive</span>
              <UserX className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{suspendedCount}</p>
            <span className="text-[11px] text-slate-400">Access Blocked</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeSubTab === 'directory'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          User Directory ({users.length})
        </button>

        <button
          onClick={() => setActiveSubTab('roles_matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeSubTab === 'roles_matrix'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Roles & Permissions Matrix & Customizer
        </button>

        <button
          onClick={() => setActiveSubTab('audit_logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeSubTab === 'audit_logs'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Security Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* SUB-TAB 1: USER DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, job, department..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </div>

              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">All Roles</option>
                {Object.entries(ROLE_CONFIGS).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.displayName}
                  </option>
                ))}
              </select>

              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="invited">Invited</option>
              </select>
            </div>
          </div>

          {/* User List Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">User & Profile</th>
                    <th className="px-4 py-3.5">Role & Permissions Clearance</th>
                    <th className="px-4 py-3.5">Department & Job Title</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Security / 2FA</th>
                    <th className="px-5 py-3.5 text-right">Actions & Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-medium text-sm">No users found</p>
                        <p className="text-xs text-slate-500 mt-0.5">Try adjusting your search criteria or filter tags.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const roleConfig = ROLE_CONFIGS[user.role] || ROLE_CONFIGS['traveler'];
                      const isSelf = currentUser?.id === user.id;
                      const userStatus = user.status || 'active';
                      const hasCustomPerms = user.customPermissions && user.customPermissions.length > 0;
                      const effectivePermsCount = getUserEffectivePermissions(user).length;

                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                            isSelf ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          {/* User Avatar & Info */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                {isSelf && (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900" title="You are currently signed in as this user" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {user.name}
                                  {isSelf && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    {user.email}
                                  </span>
                                  {user.phone && (
                                    <span className="hidden md:flex items-center gap-1 text-slate-400">
                                      • <Phone className="w-3 h-3 text-slate-400" />
                                      {user.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge & Permissions Summary */}
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleConfig.badgeColor}`}
                              >
                                <Shield className="w-3 h-3" />
                                {roleConfig.displayName}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {hasCustomPerms ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                    <KeyRound className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                                    {effectivePermsCount} Custom Permissions
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {effectivePermsCount} Default Role Permissions
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Department & Job */}
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                {user.department || 'General Operations'}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-slate-400" />
                                {user.jobTitle || 'Team Member'}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                userStatus === 'active'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : userStatus === 'suspended'
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {userStatus === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                              {userStatus === 'suspended' && <XCircle className="w-3 h-3 text-rose-500" />}
                              {userStatus === 'invited' && <Clock className="w-3 h-3 text-amber-500" />}
                              {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                            </span>
                          </td>

                          {/* Biometrics / Security */}
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-[11px]">
                                <Fingerprint className={`w-3.5 h-3.5 ${user.hasBiometrics ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <span className={user.hasBiometrics ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400'}>
                                  {user.hasBiometrics ? 'FaceID / Passkey' : 'Password Only'}
                                </span>
                              </div>
                              {user.lastLoginAt && (
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {new Date(user.lastLoginAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Assign Role & Permissions Button */}
                              {canManageUsers && (
                                <button
                                  onClick={() => handleOpenPermissionModal(user)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300/60 dark:border-amber-700/60 transition-colors shadow-sm"
                                  title="Assign custom role and fine-grained permissions"
                                >
                                  <KeyRound className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>Clearance</span>
                                </button>
                              )}

                              {/* Switch user button (test view) */}
                              {!isSelf && (
                                <button
                                  onClick={() => switchActiveUser(user.id)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                                  title={`Switch active session to ${user.name}`}
                                >
                                  Switch
                                </button>
                              )}

                              {canManageUsers && (
                                <>
                                  <button
                                    onClick={() => handleOpenEditModal(user)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                                    title="Edit user profile"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => toggleUserStatus(user.id, userStatus === 'active' ? 'suspended' : 'active')}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      userStatus === 'active'
                                        ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                        : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                    }`}
                                    title={userStatus === 'active' ? 'Suspend access' : 'Reactivate access'}
                                  >
                                    {userStatus === 'active' ? <Lock className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                  </button>

                                  {/* Delete user */}
                                  {user.role !== 'super_admin' && (
                                    <button
                                      onClick={() => setUserToDelete(user)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                      title="Delete user account"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ROLES & PERMISSIONS MATRIX & LIVE CUSTOMIZER */}
      {activeSubTab === 'roles_matrix' && (
        <div className="space-y-6">
          {/* Sub-navigation inside Matrix */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMatrixViewMode('role_overview')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  matrixViewMode === 'role_overview'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Role Template Matrix
              </button>
              <button
                onClick={() => setMatrixViewMode('user_customizer')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  matrixViewMode === 'user_customizer'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                ⚡ Live User Permissions Customizer
              </button>
            </div>

            {matrixViewMode === 'user_customizer' && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500">Target User:</span>
                <select
                  value={matrixSelectedUserId}
                  onChange={e => setMatrixSelectedUserId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({ROLE_CONFIGS[u.role]?.displayName || u.role}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* VIEW MODE 1: ROLE OVERVIEW MATRIX */}
          {matrixViewMode === 'role_overview' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Role-Based Access Control (RBAC) Permission Matrix
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Review fine-grained security policies enforced across all modules of the KHB Trade Mission ERP suite.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Total Scopes:</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {ALL_PERMISSIONS.length} Permissions
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">Permission Scope</th>
                      <th className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">Category & Risk</th>
                      <th className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">Description</th>
                      {Object.entries(ROLE_CONFIGS).map(([key, cfg]) => (
                        <th
                          key={key}
                          className="px-2 py-3.5 text-center border-b border-slate-200 dark:border-slate-800"
                          title={cfg.description}
                        >
                          <span className="block text-[10px] font-bold whitespace-nowrap">{cfg.shortTitle}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ALL_PERMISSIONS.map(perm => {
                      return (
                        <tr key={perm.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <KeyRound className="w-3 h-3 text-amber-500" />
                              {perm.label}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{perm.key}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {perm.category}
                              </span>
                              <span
                                className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                  perm.riskLevel === 'critical'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                    : perm.riskLevel === 'high'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                    : perm.riskLevel === 'medium'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                }`}
                              >
                                {perm.riskLevel}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px] min-w-[200px]">
                            {perm.description}
                          </td>
                          {Object.entries(ROLE_CONFIGS).map(([roleKey, cfg]) => {
                            const hasPerm = cfg.defaultPermissions.includes(perm.key);
                            return (
                              <td key={roleKey} className="px-2 py-3 text-center">
                                {hasPerm ? (
                                  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600">
                                    <span className="text-xs font-bold leading-none">-</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: INTERACTIVE LIVE USER CUSTOMIZER */}
          {matrixViewMode === 'user_customizer' && matrixUser && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* User Snapshot Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-base font-bold">
                    {matrixUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {matrixUser.name}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_CONFIGS[matrixUser.role]?.badgeColor}`}
                      >
                        {ROLE_CONFIGS[matrixUser.role]?.displayName}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {matrixUser.email} • {matrixUser.department || 'General'} • {matrixUser.jobTitle || 'Staff'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPermissionModal(matrixUser)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                    Configure Permissions & Modules
                  </button>
                  <button
                    onClick={() => resetUserPermissionsToDefault(matrixUser.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset to Defaults
                  </button>
                </div>
              </div>

              {/* Active Permissions Breakdown */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Currently Granted Permissions ({getUserEffectivePermissions(matrixUser).length} of {ALL_PERMISSIONS.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ALL_PERMISSIONS.map(perm => {
                    const isGranted = getUserEffectivePermissions(matrixUser).includes(perm.key);
                    return (
                      <div
                        key={perm.key}
                        className={`p-3 rounded-xl border transition-all ${
                          isGranted
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-slate-50/40 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isGranted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{perm.label}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{perm.key}</span>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              perm.riskLevel === 'critical'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : perm.riskLevel === 'high'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {perm.riskLevel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                          {perm.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: SECURITY AUDIT TRAIL */}
      {activeSubTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-500" />
                  Live Administrative & Security Audit Trail
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Immutable record of user creation, role adjustments, financial reconciliations, and mission updates.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">No audit logs recorded yet.</div>
              ) : (
                auditLogs.map(log => {
                  return (
                    <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${
                            log.severity === 'security'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                              : log.severity === 'warning'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-xs">{log.action}</span>
                            <span
                              className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                log.severity === 'security'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : log.severity === 'warning'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {log.severity || 'info'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                            <span>Actor: <strong className="text-slate-600 dark:text-slate-300">{log.userName}</strong> ({log.userRole})</span>
                            {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right whitespace-nowrap text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN ROLE & GRANULAR PERMISSIONS */}
      {permissionModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Configure Clearance & Permissions: {permissionModalUser.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {permissionModalUser.email} • {permissionModalUser.department || 'General'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPermissionModalUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Role Selection & Presets Bar */}
              <div className="bg-amber-50/50 dark:bg-slate-800/60 p-4 rounded-xl border border-amber-200/60 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-900 dark:text-white">
                      Primary Assigned Role
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Determines the base security clearance and department membership.
                    </p>
                  </div>

                  <select
                    value={targetRole}
                    onChange={e => handleApplyRoleDefaults(e.target.value as UserRole)}
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {Object.entries(ROLE_CONFIGS).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.displayName} ({cfg.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Presets Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/40 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-500">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyRoleDefaults(targetRole)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-50 text-[11px] font-medium"
                  >
                    Apply Role Defaults
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPermissions(ALL_PERMISSIONS.map(p => p.key));
                      setSelectedTabs(ERP_TABS_LIST.map(t => t.id));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium"
                  >
                    Grant All Permissions
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPermissions([]);
                      setSelectedTabs(['overview']);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-[11px] font-medium"
                  >
                    Revoke All (Read Only)
                  </button>
                </div>
              </div>

              {/* Accessible Sidebar ERP Tabs Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Accessible ERP Dashboard Modules ({selectedTabs.length} of {ERP_TABS_LIST.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTabs(ERP_TABS_LIST.map(t => t.id))}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Select All Modules
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ERP_TABS_LIST.map(tab => {
                    const isChecked = selectedTabs.includes(tab.id);
                    return (
                      <label
                        key={tab.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleTab(tab.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="truncate font-medium">{tab.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permission Scopes List */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Granular Permission Scopes ({selectedPermissions.length} of {ALL_PERMISSIONS.length} Enabled)
                  </h4>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Filter permissions..."
                      value={permissionSearch}
                      onChange={e => setPermissionSearch(e.target.value)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                    />
                    <select
                      value={permissionCategoryFilter}
                      onChange={e => setPermissionCategoryFilter(e.target.value)}
                      className="px-2 py-1 text-[11px] rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Groups */}
                <div className="space-y-4">
                  {categories.map(cat => {
                    const catPerms = filteredPermissionsForModal.filter(p => p.category === cat);
                    if (catPerms.length === 0) return null;

                    const allCheckedInCat = catPerms.every(p => selectedPermissions.includes(p.key));

                    return (
                      <div key={cat} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {cat} Permissions
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleCategoryPermissions(cat, !allCheckedInCat)}
                            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                          >
                            {allCheckedInCat ? 'Deselect Category' : 'Select All in Category'}
                          </button>
                        </div>

                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 bg-white dark:bg-slate-900">
                          {catPerms.map(perm => {
                            const isChecked = selectedPermissions.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.key)}
                                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                      {perm.label}
                                    </span>
                                    <span
                                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                        perm.riskLevel === 'critical'
                                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                          : perm.riskLevel === 'high'
                                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                          : perm.riskLevel === 'medium'
                                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                      }`}
                                    >
                                      {perm.riskLevel}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {perm.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                <span className="font-bold text-slate-900 dark:text-white">{selectedPermissions.length}</span> Permissions •{' '}
                <span className="font-bold text-slate-900 dark:text-white">{selectedTabs.length}</span> Modules Granted
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPermissionModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignedPermissions}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-colors"
                >
                  Save & Apply Clearance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT USER */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  {editingUser ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingUser ? `Edit User: ${editingUser.name}` : 'Add New Organization User'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Assign role authorization boundaries, department membership, and login controls.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sokha Rithy"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sokha@khbevents.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+855 12 345 678"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned Role *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {Object.entries(ROLE_CONFIGS).map(([roleKey, cfg]) => (
                      <option key={roleKey} value={roleKey}>
                        {cfg.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g. Senior Mission Coordinator"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="active">Active (Access Allowed)</option>
                    <option value="suspended">Suspended (Access Blocked)</option>
                    <option value="invited">Invited (Pending Confirmation)</option>
                  </select>
                </div>
              </div>

              {/* Role Scope Notice */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {ROLE_CONFIGS[formData.role]?.displayName} Permissions:
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {ROLE_CONFIGS[formData.role]?.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors"
                >
                  {editingUser ? 'Save User Changes' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete User Account?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Are you sure you want to permanently remove <strong>{userToDelete.name}</strong> ({userToDelete.email})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
