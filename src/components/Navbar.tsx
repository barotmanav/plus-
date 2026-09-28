import React, { useState } from 'react';
import {
  Bell,
  Smartphone,
  Volume2,
  ChevronDown,
  UserCheck,
  LogOut,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playNotificationSound } from '../utils/audio';
import { RoleType } from '../types';

interface NavbarProps {
  onOpenDocs?: () => void;
  onOpenLanding?: () => void;
  onSwitchAccount?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenMobileView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDocs,
  onOpenLanding,
  onSwitchAccount,
  searchQuery,
  setSearchQuery,
  onOpenMobileView,
}) => {
  const {
    currentUser,
    unreadNotificationCount,
    activeEmergencyNotice,
    browserNotificationPermission,
    requestNotificationPermission,
    logout,
    resetDemoData,
    notifications,
    markNotificationAsRead
  } = useApp();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  if (!currentUser) return null;

  const myNotifications = notifications
    .filter((n) => n.recipientId === currentUser.id)
    .slice(0, 5);

  const getRoleBadgeStyle = (role: RoleType) => {
    switch (role) {
      case 'ADMIN':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'FACULTY':
        return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'CR':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'STUDENT':
        return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
              CP
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">CampusPulse</span>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">College notices. Delivered instantly.</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search notices, exams, placement circulars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
              <svg
                className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            
            {/* Siren Audio Test */}
            <button
              onClick={() => playNotificationSound('EMERGENCY')}
              title="Test Emergency Audio Chime"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-red-600" />
              <span>Siren Test</span>
            </button>

            {/* Mobile App Simulator */}
            <button
              onClick={onOpenMobileView}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Mobile Preview</span>
            </button>

            {/* Landing Page link for quick navigation */}
            {onOpenLanding && (
              <button
                onClick={onOpenLanding}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="View Public Landing Page"
              >
                <span className="hidden sm:inline">Public Page</span>
              </button>
            )}

            {/* Web Push Prompt */}
            {browserNotificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                title="Enable Push Notifications"
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>Enable Push</span>
              </button>
            )}

            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
                {activeEmergencyNotice && unreadNotificationCount === 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Notifications</span>
                    <span className="text-[11px] text-blue-600 font-semibold">{unreadNotificationCount} new</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-100">
                    {myNotifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-400">No notifications</p>
                    ) : (
                      myNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-2.5 text-left cursor-pointer rounded-lg ${
                            notif.isRead ? 'bg-white opacity-75' : 'bg-blue-50/60'
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900 leading-tight">{notif.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated User Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${getRoleBadgeStyle(
                  currentUser.role
                )}`}
              >
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <span className="block leading-tight text-slate-900">{currentUser.name}</span>
                  <span className="text-[10px] font-bold text-slate-600">{currentUser.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-3">
                  <div className="pb-2 border-b border-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verified Role:</span>
                      <span className="font-bold text-slate-800">{currentUser.role}</span>
                    </div>
                    {currentUser.departmentName && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Department:</span>
                        <span className="font-semibold text-slate-700">{currentUser.departmentName}</span>
                      </div>
                    )}
                    {currentUser.className && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Class Section:</span>
                        <span className="font-semibold text-slate-700">{currentUser.className}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                    <button
                      onClick={() => {
                        logout();
                        setProfileMenuOpen(false);
                        if (onSwitchAccount) onSwitchAccount();
                      }}
                      className="w-full py-1.5 px-2 text-left rounded-lg text-blue-600 hover:bg-blue-50 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Switch Account (Password Required)</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full py-1.5 px-2 text-left rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
