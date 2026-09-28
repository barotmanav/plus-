import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Department,
  ClassItem,
  NoticeCategory,
  Notice,
  NotificationItem,
  PersonalNote,
  CRApplication,
  RoleType,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_CLASSES,
  INITIAL_CATEGORIES,
  INITIAL_NOTICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTES,
  INITIAL_CR_APPLICATIONS,
} from '../data/seedData';
import { playNotificationSound } from '../utils/audio';
import {
  requestBrowserPushPermission,
  getNotificationServiceStatus,
  showBrowserNotification,
  onForegroundMessage,
} from '../services/firebase';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  classes: ClassItem[];
  categories: NoticeCategory[];
  notices: Notice[];
  notifications: NotificationItem[];
  personalNotes: PersonalNote[];
  savedNoticeIds: string[];
  crApplications: CRApplication[];
  browserNotificationPermission: NotificationPermission | 'unsupported';
  isMobilePreviewOpen: boolean;
  activeEmergencyNotice: Notice | null;
  unreadNotificationCount: number;
  notificationStatus: ReturnType<typeof getNotificationServiceStatus>;
  deviceTokens: { userId: string; token: string; deviceType: 'WEB' | 'ANDROID'; createdAt: string }[];

  // Auth
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  registerStudent: (data: { name: string; email: string; departmentId: string; semester: number; classId: string; password?: string }) => void;
  quickSwitchRole: (role: RoleType) => void;

  // Notices
  createNotice: (data: Omit<Notice, 'id' | 'createdAt' | 'publishedAt' | 'readByUsers' | 'status'>) => void;
  approveNotice: (noticeId: string) => void;
  rejectNotice: (noticeId: string, reason: string) => void;
  deleteNotice: (noticeId: string) => void;
  togglePinNotice: (noticeId: string) => void;
  markNoticeAsRead: (noticeId: string) => void;
  toggleBookmark: (noticeId: string) => void;

  // Personal Notepad
  addNote: (title: string, content: string) => void;
  editNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // CR Application
  applyForCR: (reason: string) => void;
  approveCRApplication: (appId: string) => void;
  rejectCRApplication: (appId: string) => void;

  // Admin Tools
  addCategory: (name: string) => void;
  toggleCategory: (id: string) => void;
  addClass: (name: string, departmentId: string, semester: number) => void;
  deleteClass: (id: string) => void;
  addUser: (name: string, email: string, role: RoleType, departmentId?: string, classId?: string, password?: string) => void;
  toggleUserStatus: (id: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissEmergencyBanner: (noticeId: string) => void;
  requestNotificationPermission: () => Promise<void>;
  setMobilePreviewOpen: (open: boolean) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'campuspulse_simple_v2_';

function load<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_KEY + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const loaded = load<User[]>('users', INITIAL_USERS);
    // Ensure all users have their standard password populated
    return loaded.map((u) => {
      const seed = INITIAL_USERS.find((s) => s.email.toLowerCase() === u.email.toLowerCase());
      return {
        ...u,
        password: u.password || seed?.password || (
          u.role === 'ADMIN' ? 'admin123' :
          u.role === 'FACULTY' ? 'faculty123' :
          u.role === 'CR' ? 'cr123' : 'student123'
        ),
      };
    });
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => load<string | null>('currentUserId', null));
  const [departments, setDepartments] = useState<Department[]>(() => load('departments', INITIAL_DEPARTMENTS));
  const [classes, setClasses] = useState<ClassItem[]>(() => load('classes', INITIAL_CLASSES));
  const [categories, setCategories] = useState<NoticeCategory[]>(() => load('categories', INITIAL_CATEGORIES));
  const [notices, setNotices] = useState<Notice[]>(() => load('notices', INITIAL_NOTICES));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => load('notifications', INITIAL_NOTIFICATIONS));
  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>(() => load('personalNotes', INITIAL_NOTES));
  const [savedNoticeIds, setSavedNoticeIds] = useState<string[]>(() => load('savedNoticeIds', ['notice-acad-02']));
  const [crApplications, setCrApplications] = useState<CRApplication[]>(() => load('crApplications', INITIAL_CR_APPLICATIONS));
  const [dismissedEmergencyIds, setDismissedEmergencyIds] = useState<string[]>(() => load('dismissedEmergencyIds', []));
  const [isMobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const [deviceTokens, setDeviceTokens] = useState<{ userId: string; token: string; deviceType: 'WEB' | 'ANDROID'; createdAt: string }[]>(() =>
    load('deviceTokens', [
      { userId: 'user-student', token: 'fcm-web-token-student-demo-manav', deviceType: 'WEB', createdAt: new Date().toISOString() },
      { userId: 'user-cr', token: 'fcm-web-token-cr-demo-rahul', deviceType: 'WEB', createdAt: new Date().toISOString() },
    ])
  );

  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const notificationStatus = getNotificationServiceStatus();

  // Current logged in user object
  const currentUser = users.find((u) => u.id === currentUserId) || null;

  // Sync to localStorage
  useEffect(() => { save('users', users); }, [users]);
  useEffect(() => { save('currentUserId', currentUserId); }, [currentUserId]);
  useEffect(() => { save('departments', departments); }, [departments]);
  useEffect(() => { save('classes', classes); }, [classes]);
  useEffect(() => { save('categories', categories); }, [categories]);
  useEffect(() => { save('notices', notices); }, [notices]);
  useEffect(() => { save('notifications', notifications); }, [notifications]);
  useEffect(() => { save('personalNotes', personalNotes); }, [personalNotes]);
  useEffect(() => { save('savedNoticeIds', savedNoticeIds); }, [savedNoticeIds]);
  useEffect(() => { save('crApplications', crApplications); }, [crApplications]);
  useEffect(() => { save('dismissedEmergencyIds', dismissedEmergencyIds); }, [dismissedEmergencyIds]);
  useEffect(() => { save('deviceTokens', deviceTokens); }, [deviceTokens]);

  // Setup foreground message listener if Firebase is configured
  useEffect(() => {
    let unsubscribe: any = () => {};
    onForegroundMessage((payload) => {
      playNotificationSound('IMPORTANT');
      showBrowserNotification(payload.title, payload.body);
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const requestNotificationPermission = async () => {
    const res = await requestBrowserPushPermission();
    if (res.granted) {
      setBrowserNotificationPermission('granted');
      if (res.token && currentUser) {
        setDeviceTokens((prev) => {
          const filtered = prev.filter((t) => t.token !== res.token);
          return [
            ...filtered,
            {
              userId: currentUser.id,
              token: res.token!,
              deviceType: 'WEB',
              createdAt: new Date().toISOString(),
            },
          ];
        });
      }
      showBrowserNotification(
        'CampusPulse Notifications Active',
        res.mode === 'FIREBASE_FCM'
          ? 'Live Firebase FCM push notifications enabled.'
          : 'Development push notifications active (Mock Mode).'
      );
      playNotificationSound('IMPORTANT');
    } else {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setBrowserNotificationPermission(Notification.permission);
      }
    }
  };

  const triggerPush = (title: string, body: string, priority: Notice['priority']) => {
    playNotificationSound(priority);
    showBrowserNotification(title, body);
  };

  // Active emergency notice
  const activeEmergencyNotice = notices.find(
    (n) => n.isEmergency && n.status === 'PUBLISHED' && !dismissedEmergencyIds.includes(n.id)
  ) || null;

  // Unread notification count for current user
  const unreadNotificationCount = currentUser
    ? notifications.filter((n) => n.recipientId === currentUser.id && !n.isRead).length
    : 0;

  // 1. Auth & Login with Password Verification
  const login = (email: string, password?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!existing) {
      return false;
    }

    const expectedPassword = existing.password || (
      existing.role === 'ADMIN' ? 'admin123' :
      existing.role === 'FACULTY' ? 'faculty123' :
      existing.role === 'CR' ? 'cr123' : 'student123'
    );

    // Verify exact password match
    if (cleanPassword === expectedPassword) {
      setCurrentUserId(existing.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const registerStudent = (data: {
    name: string;
    email: string;
    departmentId: string;
    semester: number;
    classId: string;
    password?: string;
  }) => {
    const dept = departments.find((d) => d.id === data.departmentId);
    const cls = classes.find((c) => c.id === data.classId);
    const newUser: User = {
      id: 'user-' + Date.now(),
      name: data.name,
      email: data.email,
      password: data.password || 'student123',
      role: 'STUDENT',
      departmentId: data.departmentId,
      departmentName: dept?.name || 'Information Technology',
      semester: data.semester,
      classId: data.classId,
      className: cls?.name || 'IT-A',
      studentId: `CP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
  };

  const quickSwitchRole = (role: RoleType) => {
    const target = users.find((u) => u.role === role);
    if (target) {
      setCurrentUserId(target.id);
    }
  };

  // Determine target students
  const resolveRecipients = (audience: Notice['audience']): User[] => {
    const studentsAndCR = users.filter((u) => u.role === 'STUDENT' || u.role === 'CR');
    if (audience.scope === 'EVERYONE') {
      return studentsAndCR;
    }
    if (audience.scope === 'DEPARTMENT') {
      return studentsAndCR.filter((u) => u.departmentId === audience.departmentId);
    }
    if (audience.scope === 'CLASS') {
      return studentsAndCR.filter((u) => u.classId === audience.classId);
    }
    return studentsAndCR;
  };

  // 2. Notice Operations
  const createNotice = (data: Omit<Notice, 'id' | 'createdAt' | 'publishedAt' | 'readByUsers' | 'status'>) => {
    if (!currentUser) return;
    const isCR = currentUser.role === 'CR';
    const isEmergency = data.priority === 'EMERGENCY';

    const status: Notice['status'] = isCR ? 'PENDING_APPROVAL' : 'PUBLISHED';
    const newNotice: Notice = {
      ...data,
      id: 'notice-' + Date.now(),
      status,
      isCRSubmission: isCR,
      createdAt: new Date().toISOString(),
      publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined,
      readByUsers: [],
    };

    setNotices((prev) => [newNotice, ...prev]);

    // If published directly (Admin/Faculty), dispatch instant notifications to targeted students
    if (status === 'PUBLISHED') {
      const recipients = resolveRecipients(data.audience);
      const newItems: NotificationItem[] = recipients.map((r) => ({
        id: 'notif-' + Math.random().toString(36).substring(2, 9),
        recipientId: r.id,
        noticeId: newNotice.id,
        title: isEmergency ? `🚨 EMERGENCY ALERT` : `📢 ${newNotice.title}`,
        message: isEmergency
          ? newNotice.description
          : `${newNotice.title} has been published for ${newNotice.audience.scope === 'CLASS' ? newNotice.audience.className : newNotice.audience.scope}.`,
        priority: newNotice.priority,
        category: newNotice.category,
        isRead: false,
        createdAt: new Date().toISOString(),
      }));

      setNotifications((prev) => [...newItems, ...prev]);
      triggerPush(
        isEmergency ? `🚨 CAMPUSPULSE EMERGENCY` : `CampusPulse Notice: ${newNotice.title}`,
        newNotice.description,
        newNotice.priority
      );
    }
  };

  const approveNotice = (noticeId: string) => {
    const target = notices.find((n) => n.id === noticeId);
    if (!target) return;

    const publishedAt = new Date().toISOString();
    setNotices((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, status: 'PUBLISHED', publishedAt } : n))
    );

    // Notify target students
    const recipients = resolveRecipients(target.audience);
    const newItems: NotificationItem[] = recipients.map((r) => ({
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      recipientId: r.id,
      noticeId: target.id,
      title: `📢 ${target.audience.className || 'Class'} Notice: ${target.title}`,
      message: target.description,
      priority: target.priority,
      category: target.category,
      isRead: false,
      createdAt: publishedAt,
    }));

    setNotifications((prev) => [...newItems, ...prev]);
    triggerPush(`Class Notice Published: ${target.title}`, target.description, 'IMPORTANT');
  };

  const rejectNotice = (noticeId: string, reason: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, status: 'REJECTED', rejectionReason: reason } : n))
    );
  };

  const deleteNotice = (noticeId: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
  };

  const togglePinNotice = (noticeId: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const markNoticeAsRead = (noticeId: string) => {
    if (!currentUser) return;
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === noticeId && !n.readByUsers.includes(currentUser.id)) {
          return { ...n, readByUsers: [...n.readByUsers, currentUser.id] };
        }
        return n;
      })
    );
  };

  const toggleBookmark = (noticeId: string) => {
    setSavedNoticeIds((prev) =>
      prev.includes(noticeId) ? prev.filter((id) => id !== noticeId) : [...prev, noticeId]
    );
  };

  // 3. Personal Notepad
  const addNote = (title: string, content: string) => {
    if (!currentUser) return;
    const note: PersonalNote = {
      id: 'note-' + Date.now(),
      userId: currentUser.id,
      title,
      content,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPersonalNotes((prev) => [note, ...prev]);
  };

  const editNote = (id: string, title: string, content: string) => {
    setPersonalNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n
      )
    );
  };

  const deleteNote = (id: string) => {
    setPersonalNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const togglePinNote = (id: string) => {
    setPersonalNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  // 4. CR Application
  const applyForCR = (reason: string) => {
    if (!currentUser) return;
    const dept = departments.find((d) => d.id === currentUser.departmentId);
    const cls = classes.find((c) => c.id === currentUser.classId);

    const app: CRApplication = {
      id: 'crapp-' + Date.now(),
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      departmentId: currentUser.departmentId || 'dept-it',
      departmentName: dept?.name || 'Information Technology',
      semester: currentUser.semester || 3,
      classId: currentUser.classId || 'class-it-a',
      className: cls?.name || 'IT-A',
      reason,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };
    setCrApplications((prev) => [app, ...prev]);
  };

  const approveCRApplication = (appId: string) => {
    const app = crApplications.find((a) => a.id === appId);
    if (!app || !currentUser) return;

    setCrApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? { ...a, status: 'APPROVED', reviewedBy: currentUser.name, reviewedAt: new Date().toISOString() }
          : a
      )
    );

    // Update user role to CR
    setUsers((prev) =>
      prev.map((u) =>
        u.id === app.studentId
          ? { ...u, role: 'CR', isCR: true, assignedClassId: app.classId, assignedClassName: app.className }
          : u
      )
    );

    // Update class assignment
    setClasses((prev) =>
      prev.map((c) =>
        c.id === app.classId ? { ...c, crId: app.studentId, crName: app.studentName } : c
      )
    );
  };

  const rejectCRApplication = (appId: string) => {
    if (!currentUser) return;
    setCrApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? { ...a, status: 'REJECTED', reviewedBy: currentUser.name, reviewedAt: new Date().toISOString() }
          : a
      )
    );
  };

  // 5. Admin Category & Class Management
  const addCategory = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newCat: NoticeCategory = {
      id: 'cat-' + Date.now(),
      name,
      slug,
      isActive: true,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const addClass = (name: string, departmentId: string, semester: number) => {
    const dept = departments.find((d) => d.id === departmentId);
    const newClass: ClassItem = {
      id: 'class-' + Date.now(),
      name,
      departmentId,
      departmentName: dept?.name || 'General',
      semester,
    };
    setClasses((prev) => [...prev, newClass]);
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const addUser = (name: string, email: string, role: RoleType, departmentId?: string, classId?: string, password?: string) => {
    const dept = departments.find((d) => d.id === departmentId);
    const cls = classes.find((c) => c.id === classId);
    const newUser: User = {
      id: 'user-' + Date.now(),
      name,
      email,
      password: password || (role === 'ADMIN' ? 'admin123' : role === 'FACULTY' ? 'faculty123' : 'student123'),
      role,
      departmentId,
      departmentName: dept?.name,
      classId,
      className: cls?.name,
      assignedClassId: role === 'CR' ? classId : undefined,
      assignedClassName: role === 'CR' ? cls?.name : undefined,
      isCR: role === 'CR',
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const toggleUserStatus = (id: string) => {
    // mock enable/disable
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // 6. Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.recipientId === currentUser.id ? { ...n, isRead: true } : n))
    );
  };

  const dismissEmergencyBanner = (noticeId: string) => {
    setDismissedEmergencyIds((prev) => [...prev, noticeId]);
    markNoticeAsRead(noticeId);
  };

  const resetDemoData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserId('user-student');
    setDepartments(INITIAL_DEPARTMENTS);
    setClasses(INITIAL_CLASSES);
    setCategories(INITIAL_CATEGORIES);
    setNotices(INITIAL_NOTICES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setPersonalNotes(INITIAL_NOTES);
    setSavedNoticeIds(['notice-acad-02']);
    setCrApplications(INITIAL_CR_APPLICATIONS);
    setDismissedEmergencyIds([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        departments,
        classes,
        categories,
        notices,
        notifications,
        personalNotes: currentUser
          ? personalNotes.filter((n) => n.userId === currentUser.id)
          : [],
        savedNoticeIds,
        crApplications,
        browserNotificationPermission,
        isMobilePreviewOpen,
        activeEmergencyNotice,
        unreadNotificationCount,
        notificationStatus,
        deviceTokens,

        login,
        logout,
        registerStudent,
        quickSwitchRole,

        createNotice,
        approveNotice,
        rejectNotice,
        deleteNotice,
        togglePinNotice,
        markNoticeAsRead,
        toggleBookmark,

        addNote,
        editNote,
        deleteNote,
        togglePinNote,

        applyForCR,
        approveCRApplication,
        rejectCRApplication,

        addCategory,
        toggleCategory,
        addClass,
        deleteClass,
        addUser,
        toggleUserStatus,

        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissEmergencyBanner,
        requestNotificationPermission,
        setMobilePreviewOpen,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
