import React from 'react';
import {
  LayoutDashboard,
  Bell,
  Bookmark,
  FileEdit,
  FolderTree,
  FileCheck2,
  Tag,
  Users,
  Building,
  GraduationCap,
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type ActivePage =
  | 'dashboard'
  | 'admin-panel'
  | 'notices'
  | 'notifications'
  | 'saved'
  | 'my-notes'
  | 'cr-submissions'
  | 'categories'
  | 'classes'
  | 'users'
  | 'settings';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onOpenCreateNotice: () => void;
  onOpenCRApply: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  onOpenCreateNotice,
  onOpenCRApply,
}) => {
  const { currentUser, notices, crApplications, unreadNotificationCount, logout } = useApp();

  if (!currentUser) return null;

  const role = currentUser.role; // ADMIN | FACULTY | CR | STUDENT
  const pendingNoticesCount = notices.filter((n) => n.status === 'PENDING_APPROVAL').length;
  const pendingCRAppsCount = crApplications.filter((a) => a.status === 'PENDING').length;
  const totalPending = pendingNoticesCount + pendingCRAppsCount;

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col justify-between py-2">
      <div className="space-y-6">
        
        {/* Quick Post Button for Staff / CR */}
        {(role === 'ADMIN' || role === 'FACULTY' || role === 'CR') && (
          <button
            onClick={onOpenCreateNotice}
            className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{role === 'CR' ? 'Create Class Notice' : 'Create Notice'}</span>
          </button>
        )}

        {/* Navigation Links */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Navigation
          </p>
          <nav className="space-y-1 text-xs">
            <button
              onClick={() => setActivePage('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 font-medium rounded-xl transition-colors ${
                activePage === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActivePage('notices')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 font-medium rounded-xl transition-colors ${
                activePage === 'notices'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FolderTree className="w-4 h-4 text-indigo-500" />
              <span>All Notices</span>
            </button>

            <button
              onClick={() => setActivePage('notifications')}
              className={`w-full flex items-center justify-between px-3 py-2 font-medium rounded-xl transition-colors ${
                activePage === 'notifications'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Notifications</span>
              </div>
              {unreadNotificationCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Saved Notices for Student & CR */}
            {(role === 'STUDENT' || role === 'CR') && (
              <button
                onClick={() => setActivePage('saved')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 font-medium rounded-xl transition-colors ${
                  activePage === 'saved'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bookmark className="w-4 h-4 text-emerald-500" />
                <span>Saved Notices</span>
              </button>
            )}

            {/* My Notes (Personal Student Notepad) */}
            {(role === 'STUDENT' || role === 'CR') && (
              <button
                onClick={() => setActivePage('my-notes')}
                className={`w-full flex items-center justify-between px-3 py-2 font-medium rounded-xl transition-colors ${
                  activePage === 'my-notes'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileEdit className="w-4 h-4 text-violet-500" />
                  <span>My Notes</span>
                </div>
                <span className="text-[10px] text-slate-400">Private</span>
              </button>
            )}
          </nav>
        </div>

        {/* Role Specific Moderation & Admin Items */}
        {(role === 'ADMIN' || role === 'FACULTY' || role === 'CR') && (
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {role === 'ADMIN' ? 'Administration' : role === 'FACULTY' ? 'Class Moderation' : 'CR Tools'}
            </p>
            <nav className="space-y-1 text-xs">
              
              {/* Admin Command Suite - Strictly ADMIN only */}
              {role === 'ADMIN' && (
                <button
                  onClick={() => setActivePage('admin-panel')}
                  className={`w-full flex items-center justify-between px-3 py-2 font-medium rounded-xl transition-colors ${
                    activePage === 'admin-panel'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Admin Console</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    Admin Only
                  </span>
                </button>
              )}

              {/* CR Submissions & Approvals */}
              {(role === 'ADMIN' || role === 'FACULTY') && (
                <button
                  onClick={() => setActivePage('cr-submissions')}
                  className={`w-full flex items-center justify-between px-3 py-2 font-medium rounded-xl transition-colors ${
                    activePage === 'cr-submissions'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className="w-4 h-4 text-teal-600" />
                    <span>CR Requests</span>
                  </div>
                  {totalPending > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
                      {totalPending}
                    </span>
                  )}
                </button>
              )}

              {/* CR View My Submissions */}
              {role === 'CR' && (
                <button
                  onClick={() => setActivePage('cr-submissions')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 font-medium rounded-xl transition-colors ${
                    activePage === 'cr-submissions'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>My Submissions</span>
                </button>
              )}

              {/* Admin: Categories */}
              {role === 'ADMIN' && (
                <button
                  onClick={() => setActivePage('categories')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 font-medium rounded-xl transition-colors ${
                    activePage === 'categories'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Tag className="w-4 h-4 text-slate-500" />
                  <span>Categories</span>
                </button>
              )}

              {/* Admin: Classes */}
              {role === 'ADMIN' && (
                <button
                  onClick={() => setActivePage('classes')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 font-medium rounded-xl transition-colors ${
                    activePage === 'classes'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building className="w-4 h-4 text-slate-500" />
                  <span>Classes</span>
                </button>
              )}

              {/* Admin: Users */}
              {role === 'ADMIN' && (
                <button
                  onClick={() => setActivePage('users')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 font-medium rounded-xl transition-colors ${
                    activePage === 'users'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Users</span>
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Student CR Application Prompt if Student */}
        {role === 'STUDENT' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Class Representative</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-snug">
              Represent {currentUser.className || 'your class'} and post verified announcements.
            </p>
            <button
              onClick={onOpenCRApply}
              className="w-full py-1.5 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Apply for CR
            </button>
          </div>
        )}
      </div>

      {/* User Info & Logout Footer */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
          <div className="truncate pr-2">
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">{currentUser.role}</p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
