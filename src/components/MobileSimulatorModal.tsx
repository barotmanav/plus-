import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Bell,
  Home,
  FileEdit,
  User,
  ShieldAlert,
  Paperclip,
  Wifi,
  Battery,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Notice } from '../types';
import { playNotificationSound } from '../utils/audio';

interface MobileSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNotice: (n: Notice) => void;
}

export const MobileSimulatorModal: React.FC<MobileSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSelectNotice,
}) => {
  const {
    currentUser,
    notices,
    personalNotes,
    activeEmergencyNotice,
  } = useApp();

  const [mobileTab, setMobileTab] = useState<'home' | 'notices' | 'notes' | 'profile'>('home');
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<string>('all');
  const [simulatedPushAlert, setSimulatedPushAlert] = useState<{ title: string; body: string } | null>(null);

  if (!isOpen || !currentUser) return null;

  const publishedNotices = notices.filter((n) => n.status === 'PUBLISHED');

  const filteredNotices = publishedNotices.filter((n) => {
    if (selectedMobileCategory !== 'all' && n.category !== selectedMobileCategory) return false;
    return true;
  });

  const handleTriggerSimulatedPush = () => {
    playNotificationSound('IMPORTANT');
    setSimulatedPushAlert({
      title: '🚨 CAMPUSPULSE INSTANT PUSH',
      body: 'Unit Test & Lecture updates broadcasted to your class IT-A.',
    });
    setTimeout(() => {
      setSimulatedPushAlert(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative flex flex-col items-center">
        
        {/* Top Control Bar */}
        <div className="w-full max-w-sm flex items-center justify-between text-white mb-2 px-2">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold">CampusPulse Flutter Mobile Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerSimulatedPush}
              className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-2 py-1 rounded shadow-xs"
            >
              Simulate Push
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chassis */}
        <div className="w-[350px] h-[680px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden flex flex-col">
          
          {/* Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-800 ml-auto mr-2" />
          </div>

          {/* Screen Content */}
          <div className="w-full h-full bg-slate-50 rounded-[34px] overflow-hidden flex flex-col relative text-slate-900">
            
            {/* Status Bar */}
            <div className="h-9 bg-white px-5 pt-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-700 shrink-0">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3 h-3" />
              </div>
            </div>

            {/* In-App Simulated Push Drawer */}
            {simulatedPushAlert && (
              <div className="absolute top-10 left-3 right-3 z-50 bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 animate-in slide-in-from-top-4 duration-200">
                <span className="text-[10px] font-bold text-blue-400 block mb-0.5">CampusPulse · Now</span>
                <p className="text-xs font-bold leading-tight">{simulatedPushAlert.title}</p>
                <p className="text-[11px] text-slate-300 mt-0.5">{simulatedPushAlert.body}</p>
              </div>
            )}

            {/* Mobile Body */}
            <div className="flex-1 overflow-y-auto pb-14">
              
              {/* Home Screen */}
              {mobileTab === 'home' && (
                <div className="p-4 space-y-3.5">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium">Welcome back 👋</span>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{currentUser.name}</h3>
                      <p className="text-[10px] text-slate-500">{currentUser.className || 'Campus Community'}</p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  </div>

                  {/* Active Emergency Card */}
                  {activeEmergencyNotice && (
                    <div
                      onClick={() => onSelectNotice(activeEmergencyNotice)}
                      className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-3 rounded-2xl shadow-sm space-y-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-100">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Emergency Alert</span>
                      </div>
                      <p className="text-xs font-bold leading-tight">{activeEmergencyNotice.title}</p>
                      <p className="text-[11px] text-red-50 line-clamp-2">{activeEmergencyNotice.description}</p>
                      <div className="text-[10px] text-red-200 flex justify-between items-center pt-1">
                        <span>Tap to view details</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  )}

                  {/* Category Chips */}
                  <div>
                    <span className="text-xs font-bold text-slate-800 block mb-1.5">Categories</span>
                    <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                      {['all', 'academic', 'exam', 'placement', 'emergency'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedMobileCategory(cat)}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            selectedMobileCategory === cat
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700'
                          }`}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notice List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Recent Notices</span>
                    {filteredNotices.slice(0, 4).map((notice) => (
                      <div
                        key={notice.id}
                        onClick={() => onSelectNotice(notice)}
                        className="bg-white rounded-xl p-3 border border-slate-200 cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-blue-600 uppercase">{notice.category}</span>
                          <span>{notice.audience.className || notice.audience.scope}</span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {notice.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {notice.description}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>{notice.authorName}</span>
                          {notice.attachments && notice.attachments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-blue-600 font-medium">
                              <Paperclip className="w-3 h-3" />
                              PDF
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Notices View */}
              {mobileTab === 'notices' && (
                <div className="p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">All Notices</h4>
                  {publishedNotices.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onSelectNotice(n)}
                      className="bg-white p-3 rounded-xl border border-slate-200 text-left space-y-1"
                    >
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">{n.category}</span>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{n.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{n.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile Notes View */}
              {mobileTab === 'notes' && (
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-900">My Notes (Private)</h4>
                  </div>
                  {personalNotes.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No notes yet</p>
                  ) : (
                    personalNotes.map((note) => (
                      <div key={note.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <p className="text-xs font-bold text-slate-900">{note.title}</p>
                        <p className="text-[11px] text-slate-600 whitespace-pre-line line-clamp-3">
                          {note.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Mobile Profile View */}
              {mobileTab === 'profile' && (
                <div className="p-4 space-y-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{currentUser.name}</h4>
                    <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Role:</span>
                      <span className="font-semibold text-slate-800">{currentUser.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-800">{currentUser.departmentName || 'General'}</span>
                    </div>
                    {currentUser.className && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Class:</span>
                        <span className="font-bold text-blue-600">{currentUser.className}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Nav */}
            <div className="absolute bottom-0 left-0 right-0 h-13 bg-white border-t border-slate-200 flex items-center justify-around px-2 text-slate-500">
              <button
                onClick={() => setMobileTab('home')}
                className={`flex flex-col items-center text-[10px] ${mobileTab === 'home' ? 'text-blue-600 font-bold' : ''}`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => setMobileTab('notices')}
                className={`flex flex-col items-center text-[10px] ${mobileTab === 'notices' ? 'text-blue-600 font-bold' : ''}`}
              >
                <Bell className="w-4 h-4" />
                <span>Notices</span>
              </button>
              <button
                onClick={() => setMobileTab('notes')}
                className={`flex flex-col items-center text-[10px] ${mobileTab === 'notes' ? 'text-blue-600 font-bold' : ''}`}
              >
                <FileEdit className="w-4 h-4" />
                <span>Notes</span>
              </button>
              <button
                onClick={() => setMobileTab('profile')}
                className={`flex flex-col items-center text-[10px] ${mobileTab === 'profile' ? 'text-blue-600 font-bold' : ''}`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
