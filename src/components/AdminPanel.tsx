import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  Bell,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Tag,
  Building,
  GraduationCap,
  Plus,
  Trash2,
  Search,
  Filter,
  Send,
  Volume2,
  Smartphone,
  Eye,
  Activity,
  Layers,
  Sparkles,
  Info,
  Check,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoleType, Notice } from '../types';
import { playNotificationSound } from '../utils/audio';

interface AdminPanelProps {
  onOpenCreateNotice?: () => void;
  onSelectNotice?: (notice: Notice) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onOpenCreateNotice,
  onSelectNotice,
}) => {
  const {
    currentUser,
    users,
    departments,
    classes,
    categories,
    notices,
    crApplications,
    notificationStatus,
    deviceTokens,
    addUser,
    toggleUserStatus,
    addCategory,
    toggleCategory,
    addClass,
    deleteClass,
    approveNotice,
    rejectNotice,
    deleteNotice,
    togglePinNotice,
    approveCRApplication,
    rejectCRApplication,
    createNotice,
    quickSwitchRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'notices' | 'users' | 'cr-queue' | 'classes' | 'categories' | 'fcm'
  >('overview');

  // Notice moderation states
  const [noticeSearch, setNoticeSearch] = useState('');
  const [noticeTab, setNoticeTab] = useState<'all' | 'pending' | 'emergency'>('pending');
  const [rejectingNoticeId, setRejectingNoticeId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Quick user creation states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<RoleType>('FACULTY');
  const [newUserDept, setNewUserDept] = useState(departments[0]?.id || 'dept-it');
  const [newUserClass, setNewUserClass] = useState(classes[0]?.id || 'class-it-a');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Category state
  const [newCatName, setNewCatName] = useState('');

  // Class state
  const [newClassName, setNewClassName] = useState('');
  const [newClassDept, setNewClassDept] = useState(departments[0]?.id || 'dept-it');
  const [newClassSem, setNewClassSem] = useState(3);

  // Emergency Quick Dispatch state
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyTitle, setEmergencyTitle] = useState('');
  const [emergencyDesc, setEmergencyDesc] = useState('');
  const [emergencySent, setEmergencySent] = useState(false);

  // FCM Simulator test state
  const [fcmTestTitle, setFcmTestTitle] = useState('Campus Security Update');
  const [fcmTestBody, setFcmTestBody] = useState('Immediate test push ping to registered browser and mobile devices.');
  const [fcmTestSent, setFcmTestSent] = useState(false);

  // Compute metrics
  const totalUsers = users.length;
  const facultyCount = users.filter((u) => u.role === 'FACULTY').length;
  const crCount = users.filter((u) => u.role === 'CR').length;
  const studentCount = users.filter((u) => u.role === 'STUDENT').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  const totalNotices = notices.length;
  const publishedNotices = notices.filter((n) => n.status === 'PUBLISHED').length;
  const pendingNotices = notices.filter((n) => n.status === 'PENDING_APPROVAL');
  const emergencyNotices = notices.filter((n) => n.priority === 'EMERGENCY');
  const pendingCRApps = crApplications.filter((a) => a.status === 'PENDING');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    addUser(
      newUserName.trim(),
      newUserEmail.trim(),
      newUserRole,
      newUserDept,
      newUserRole === 'CR' || newUserRole === 'STUDENT' ? newUserClass : undefined,
      newUserPassword.trim() || undefined
    );
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim());
    setNewCatName('');
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    addClass(newClassName.trim().toUpperCase(), newClassDept, newClassSem);
    setNewClassName('');
  };

  const handleTriggerEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyTitle.trim() || !emergencyDesc.trim() || !currentUser) return;
    
    playNotificationSound('EMERGENCY');
    createNotice({
      title: emergencyTitle.trim(),
      description: emergencyDesc.trim(),
      category: 'emergency',
      priority: 'EMERGENCY',
      isEmergency: true,
      audience: {
        scope: 'EVERYONE',
      },
      isPinned: true,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
    });

    setEmergencySent(true);
    setTimeout(() => {
      setEmergencySent(false);
      setEmergencyModalOpen(false);
      setEmergencyTitle('');
      setEmergencyDesc('');
    }, 1200);
  };

  const handleSendFCMTest = (e: React.FormEvent) => {
    e.preventDefault();
    playNotificationSound('IMPORTANT');
    setFcmTestSent(true);
    setTimeout(() => setFcmTestSent(false), 2000);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.departmentName && u.departmentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filter notices for moderation
  const filteredModerationNotices = notices.filter((n) => {
    if (noticeTab === 'pending' && n.status !== 'PENDING_APPROVAL') return false;
    if (noticeTab === 'emergency' && n.priority !== 'EMERGENCY') return false;
    if (noticeSearch.trim()) {
      const q = noticeSearch.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Strictly restrict Admin Console to ADMIN
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Access: Administrator Only</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The Admin Console is strictly reserved for College Administration / Dean accounts. Your current logged-in role is <strong className="font-mono text-purple-700">{currentUser?.role || 'Guest'}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ============================================================ */}
      {/* 1. ADMIN PANEL HERO BANNER */}
      {/* ============================================================ */}
      <div className="bg-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold font-mono tracking-wider text-blue-400 uppercase bg-blue-950/80 border border-blue-800/60 px-2.5 py-0.5 rounded-full">
                Administrator Command Suite
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-300 font-medium">
                {currentUser?.role === 'ADMIN' ? 'Dean / Administrative Master' : 'Faculty Moderator'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              CampusPulse Operations &amp; Moderation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Broadcast high-priority emergency alerts, review Class Representative submissions, manage department access, and monitor real-time push notification delivery.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                playNotificationSound('EMERGENCY');
              }}
              title="Test Siren Chime"
              className="px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/50 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Test Audio Siren</span>
            </button>

            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Dispatch Emergency Alert</span>
            </button>

            {onOpenCreateNotice && (
              <button
                onClick={onOpenCreateNotice}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Notice</span>
              </button>
            )}
          </div>
        </div>

        {/* Realtime Telemetry / Stats Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3">
            <p className="text-[11px] font-medium text-slate-400">Total Users</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5">{totalUsers}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              {facultyCount} Faculty · {crCount} CRs
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3">
            <p className="text-[11px] font-medium text-slate-400">Active Notices</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5">{publishedNotices}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">Live on Board</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3">
            <p className="text-[11px] font-medium text-slate-400">Drafts Pending</p>
            <p className="text-xl font-bold font-mono text-amber-400 mt-0.5">{pendingNotices.length}</p>
            <p className="text-[10px] text-amber-400/80 mt-0.5">CR submissions</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3">
            <p className="text-[11px] font-medium text-slate-400">Emergency Sirens</p>
            <p className="text-xl font-bold font-mono text-rose-400 mt-0.5">{emergencyNotices.length}</p>
            <p className="text-[10px] text-rose-400/80 mt-0.5">High-Priority</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3">
            <p className="text-[11px] font-medium text-slate-400">CR Applications</p>
            <p className="text-xl font-bold font-mono text-blue-400 mt-0.5">{pendingCRApps.length}</p>
            <p className="text-[10px] text-blue-400/80 mt-0.5">Awaiting review</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3">
            <p className="text-[11px] font-medium text-slate-400">FCM Tokens</p>
            <p className="text-xl font-bold font-mono text-teal-400 mt-0.5">{deviceTokens.length}</p>
            <p className="text-[10px] text-teal-400/80 mt-0.5">
              {notificationStatus.isConfigured ? 'Live Firebase' : 'Dev Mode Active'}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. ADMIN TABS NAVIGATION (Figma Kit Style Segmented Bar) */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto pb-px">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview &amp; Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'notices'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Notice Moderation</span>
            {pendingNotices.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center font-mono">
                {pendingNotices.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cr-queue')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'cr-queue'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>CR Applications</span>
            {pendingCRApps.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center font-mono">
                {pendingCRApps.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'classes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Classes &amp; Depts</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('fcm')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'fcm'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Push Engine (FCM)</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: SYSTEM OVERVIEW & METRICS */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Notice distribution by Department */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Broadcast Distribution by Audience</h3>
                  <p className="text-xs text-slate-500">Notice coverage across departments and sections</p>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-500">{publishedNotices} total</span>
              </div>

              <div className="space-y-3.5">
                {departments.map((dept) => {
                  const count = notices.filter(
                    (n) => n.audience.departmentId === dept.id || n.audience.scope === 'EVERYONE'
                  ).length;
                  const pct = Math.round((count / Math.max(notices.length, 1)) * 100);

                  return (
                    <div key={dept.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{dept.name} ({dept.code})</span>
                        <span className="font-mono text-slate-500">{count} notices ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Priority distribution tags */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-slate-500 font-medium">Priority breakdown:</span>
                <span className="text-slate-700">
                  Normal: <strong className="font-mono">{notices.filter((n) => n.priority === 'NORMAL').length}</strong>
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-amber-700">
                  Important: <strong className="font-mono">{notices.filter((n) => n.priority === 'IMPORTANT').length}</strong>
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-rose-700">
                  Emergency: <strong className="font-mono">{notices.filter((n) => n.priority === 'EMERGENCY').length}</strong>
                </span>
              </div>
            </div>

            {/* Role & Verification Matrix */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">User Role Authorization</h3>
                  <p className="text-xs text-slate-500">Backend RBAC enforcement matrix</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-purple-900">ADMIN (Deans &amp; HoDs)</p>
                    <p className="text-[11px] text-purple-700">All permissions + Emergency sirens + RBAC</p>
                  </div>
                  <span className="text-sm font-bold font-mono text-purple-800">{adminCount}</span>
                </div>

                <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-teal-900">FACULTY (Professors &amp; Mentors)</p>
                    <p className="text-[11px] text-teal-700">Post notices + Emergency sirens + Approve CR</p>
                  </div>
                  <span className="text-sm font-bold font-mono text-teal-800">{facultyCount}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-900">CLASS REPRESENTATIVE (CR)</p>
                    <p className="text-[11px] text-emerald-700">Draft notices for own class (Faculty approval required)</p>
                  </div>
                  <span className="text-sm font-bold font-mono text-emerald-800">{crCount}</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-900">STUDENT (General)</p>
                    <p className="text-[11px] text-blue-700">Read notices + Notepad + Apply for CR role</p>
                  </div>
                  <span className="text-sm font-bold font-mono text-blue-800">{studentCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Alert Quick Dispatcher Panel */}
          <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 rounded-md backdrop-blur-xs font-mono">
                  Siren Dispatch Protocol
                </span>
                <span className="text-xs text-red-200">· Available only to Admin &amp; Faculty</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Need to alert the entire campus right now?</h3>
              <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
                Emergency notices trigger a red sticky banner across all student viewports, an audible emergency alarm chime, and sub-second push delivery to all registered devices.
              </p>
            </div>

            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="px-6 py-3 text-xs font-bold text-red-700 bg-white hover:bg-red-50 active:bg-red-100 rounded-2xl shadow-lg transition-all whitespace-nowrap shrink-0 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Broadcast Emergency Siren</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: NOTICE MODERATION */}
      {/* ============================================================ */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter segmented buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setNoticeTab('pending')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  noticeTab === 'pending'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CR Drafts Pending ({pendingNotices.length})
              </button>
              <button
                onClick={() => setNoticeTab('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  noticeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Notices ({notices.length})
              </button>
              <button
                onClick={() => setNoticeTab('emergency')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  noticeTab === 'emergency'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Emergency ({emergencyNotices.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                placeholder="Search notices by title/author..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notices List */}
          {filteredModerationNotices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No notices in this queue</h4>
              <p className="text-xs text-slate-500 mt-1">All CR submissions and circulars have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredModerationNotices.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    n.status === 'PENDING_APPROVAL'
                      ? 'border-amber-300 bg-amber-50/20'
                      : n.priority === 'EMERGENCY'
                      ? 'border-rose-200'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {n.priority === 'EMERGENCY' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-mono">
                          EMERGENCY SIREN
                        </span>
                      )}
                      {n.status === 'PENDING_APPROVAL' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono">
                          CR DRAFT PENDING
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-900 truncate">{n.title}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{n.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Author: <strong className="text-slate-700">{n.authorName}</strong> ({n.authorRole})</span>
                      <span>·</span>
                      <span>Audience: <strong>{n.audience.scope === 'EVERYONE' ? 'Campus Wide' : n.audience.className || n.audience.departmentName || 'Department'}</strong></span>
                      <span>·</span>
                      <span>Category: <strong className="capitalize">{n.category}</strong></span>
                    </div>

                    {n.rejectionReason && (
                      <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg mt-2">
                        <strong>Previous Revision Feedback:</strong> {n.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Actions for this notice */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {onSelectNotice && (
                      <button
                        onClick={() => onSelectNotice(n)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    )}

                    {n.status === 'PENDING_APPROVAL' && (
                      <>
                        <button
                          onClick={() => approveNotice(n.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve &amp; Broadcast</span>
                        </button>

                        <button
                          onClick={() => setRejectingNoticeId(n.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {n.status === 'PUBLISHED' && (
                      <button
                        onClick={() => togglePinNotice(n.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          n.isPinned
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {n.isPinned ? 'Pinned' : 'Pin to Top'}
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotice(n.id)}
                      title="Delete Notice"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rejection Modal */}
          {rejectingNoticeId && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Return Notice Draft with Feedback</h3>
                <p className="text-xs text-slate-500">
                  Provide guidance to the Class Representative on why this notice was rejected or how to correct it.
                </p>

                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Please verify the exam hall room number with the Department Office before resubmitting..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setRejectingNoticeId(null);
                      setRejectReason('');
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!rejectReason.trim()) return;
                      rejectNotice(rejectingNoticeId, rejectReason.trim());
                      setRejectingNoticeId(null);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: USER & ROLE MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Add User Bar */}
          <form
            onSubmit={handleAddUser}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Priya Rao"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                placeholder="e.g. priya@college.edu"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as RoleType)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="FACULTY">FACULTY (Professor)</option>
                <option value="ADMIN">ADMIN (Dean / Office)</option>
                <option value="CR">CR (Class Representative)</option>
                <option value="STUDENT">STUDENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={newUserDept}
                onChange={(e) => setNewUserDept(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {(newUserRole === 'CR' || newUserRole === 'STUDENT') && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Section</label>
                <select
                  value={newUserClass}
                  onChange={(e) => setNewUserClass(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} (Sem {c.semester})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Set Password</label>
              <input
                type="password"
                placeholder="Default if empty (e.g. faculty123)"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create User</span>
              </button>
            </div>
          </form>

          {/* User Search & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Role Filter:</span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                {['all', 'ADMIN', 'FACULTY', 'CR', 'STUDENT'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                      userRoleFilter === role
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {role === 'all' ? 'All Roles' : role}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{u.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'FACULTY'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : u.role === 'CR'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {u.role}
                      </span>
                      {u.isCR && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Approved CR
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {u.email} · {u.departmentName || 'Campus Wide'} {u.className ? `· Section ${u.className}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => quickSwitchRole(u.role)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                    title={`Simulate logging in as ${u.role}`}
                  >
                    Switch to {u.role}
                  </button>

                  {u.role !== 'ADMIN' && (
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Deactivate / Remove User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: CR APPLICATIONS QUEUE */}
      {/* ============================================================ */}
      {activeTab === 'cr-queue' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Student Class Representative (CR) Pipeline</h2>
              <p className="text-xs text-slate-500 mt-1">
                Students apply to represent their class. Once approved by Faculty/Admin, their account role upgrades to CR, granting permission to draft official class notices.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {pendingCRApps.length} pending applications
            </span>
          </div>

          {crApplications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No applications received yet</p>
              <p className="text-xs text-slate-500 mt-1">Students can apply for the CR position from their portal.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {crApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{app.studentName}</span>
                      <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                        Target: {app.className}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          app.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : app.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      &ldquo;{app.reason}&rdquo;
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()} · Contact: {app.studentEmail}
                    </p>
                  </div>

                  {app.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveCRApplication(app.id)}
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve as CR</span>
                      </button>

                      <button
                        onClick={() => rejectCRApplication(app.id)}
                        className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: CLASSES & DEPARTMENTS */}
      {/* ============================================================ */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          
          {/* Add Class Form */}
          <form
            onSubmit={handleAddClass}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Section Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. IT-C or CSE-B"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={newClassDept}
                onChange={(e) => setNewClassDept(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester (1 - 8)</label>
              <select
                value={newClassSem}
                onChange={(e) => setNewClassSem(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class Section</span>
              </button>
            </div>
          </form>

          {/* Classes Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {classes.map((cls) => {
              const dept = departments.find((d) => d.id === cls.departmentId);
              return (
                <div key={cls.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold font-mono flex items-center justify-center text-xs">
                      {cls.name}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">Class {cls.name}</span>
                      <p className="text-[11px] text-slate-500">
                        {dept?.name || 'Department'} · Semester {cls.semester}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteClass(cls.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Remove Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: CATEGORIES */}
      {/* ============================================================ */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <form onSubmit={handleAddCategory} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex gap-2">
            <input
              type="text"
              required
              placeholder="New Category Name (e.g. Scholarship, Placement Drive, Sports)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono ml-2">slug: {cat.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      cat.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="text-xs text-slate-500 hover:text-slate-900 underline"
                  >
                    Toggle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: FCM PUSH ENGINE DIAGNOSTICS */}
      {/* ============================================================ */}
      {activeTab === 'fcm' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Firebase Cloud Messaging (FCM) Status</h3>
                <p className="text-xs text-slate-500">Real-time push delivery infrastructure for Web and Mobile</p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full font-mono ${
                  notificationStatus.isConfigured
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {notificationStatus.isConfigured ? 'LIVE FCM ENGINE' : 'DEVELOPMENT MOCK MODE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Registered Tokens:</span>
                <span className="text-base font-bold font-mono text-slate-900">{deviceTokens.length} active devices</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Engine Mode:</span>
                <span className="text-xs font-mono text-slate-700">{notificationStatus.label}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Service Worker:</span>
                <span className="text-xs font-mono text-emerald-600">/firebase-messaging-sw.js active</span>
              </div>
            </div>

            {/* Test Push Sender form */}
            <form onSubmit={handleSendFCMTest} className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Simulate FCM Push Dispatch</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={fcmTestTitle}
                  onChange={(e) => setFcmTestTitle(e.target.value)}
                  placeholder="Push Notification Title"
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                />
                <input
                  type="text"
                  required
                  value={fcmTestBody}
                  onChange={(e) => setFcmTestBody(e.target.value)}
                  placeholder="Push Notification Body"
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Ping to All Registered Tokens</span>
                </button>

                {fcmTestSent && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Ping dispatched successfully to {deviceTokens.length} tokens</span>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Registered Device Tokens Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Active Device Tokens in SQLite / Postgres DB</h4>
            <div className="divide-y divide-slate-100">
              {deviceTokens.map((token, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-800">{token.userId}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 rounded">
                        {token.deviceType}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-400 truncate max-w-md">{token.token}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(token.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EMERGENCY BROADCAST MODAL */}
      {/* ============================================================ */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-red-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Campus-Wide Emergency Siren Broadcast</h3>
                <p className="text-xs text-slate-500 mt-1">
                  This action overrides student dashboard feeds, activates audio chimes, and pins a red banner to all connected screens.
                </p>
              </div>
            </div>

            <form onSubmit={handleTriggerEmergency} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgent Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Flood Advisory: Campus Suspends Classes at 2 PM"
                  value={emergencyTitle}
                  onChange={(e) => setEmergencyTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Action Instructions *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide precise safety instructions, assembly points, lab evacuations, or authorized transport routes..."
                  value={emergencyDesc}
                  onChange={(e) => setEmergencyDesc(e.target.value)}
                  className="w-full p-3.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed"
                />
              </div>

              {emergencySent && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                  <Check className="w-4 h-4 text-red-600" />
                  <span>SIREN DISPATCHED! Broadcasting to all campus devices...</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEmergencyModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emergencySent}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Confirm &amp; Sound Siren</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
