export type RoleType = 'ADMIN' | 'FACULTY' | 'CR' | 'STUDENT';

export type NoticePriority = 'NORMAL' | 'IMPORTANT' | 'EMERGENCY';

export type NoticeStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED';

export type AudienceScope = 'EVERYONE' | 'DEPARTMENT' | 'CLASS';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: RoleType;
  studentId?: string;
  departmentId?: string;
  departmentName?: string;
  semester?: number;
  classId?: string;
  className?: string;
  avatarUrl?: string;
  isCR?: boolean;
  assignedClassId?: string; // For CR
  assignedClassName?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "IT-A"
  departmentId: string;
  departmentName: string;
  semester: number;
  crId?: string;
  crName?: string;
}

export interface NoticeCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface NoticeAttachment {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'png' | 'jpg' | 'docx';
  fileSize: string;
}

export interface NoticeAudience {
  scope: AudienceScope;
  departmentId?: string;
  departmentName?: string;
  classId?: string;
  className?: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: NoticePriority;
  status: NoticeStatus;
  audience: NoticeAudience;
  attachments?: NoticeAttachment[];
  authorId: string;
  authorName: string;
  authorRole: RoleType;
  isCRSubmission?: boolean;
  rejectionReason?: string;
  isEmergency: boolean;
  isPinned: boolean;
  createdAt: string;
  publishedAt?: string;
  readByUsers: string[];
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  noticeId?: string;
  title: string;
  message: string;
  priority: NoticePriority;
  category: string;
  isRead: boolean;
  createdAt: string;
}

export interface PersonalNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CRApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  departmentId: string;
  departmentName: string;
  semester: number;
  classId: string;
  className: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
