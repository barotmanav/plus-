/**
 * CampusPulse - Digital Notice Board with Instant Emergency Alerts
 * "College notices. Delivered instantly."
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthView } from './components/AuthView';
import { Navbar } from './components/Navbar';
import { Sidebar, ActivePage } from './components/Sidebar';
import { EmergencyBanner } from './components/EmergencyBanner';
import { NoticeCard } from './components/NoticeCard';
import { NoticeDetailModal } from './components/NoticeDetailModal';
import { CreateNoticeModal } from './components/CreateNoticeModal';
import { CRApplicationModal } from './components/CRApplicationModal';
import { CRApprovalQueue } from './components/CRApprovalQueue';
import { PersonalNotepad } from './components/PersonalNotepad';
import { AdminCategories } from './components/AdminCategories';
import { AdminClasses } from './components/AdminClasses';
import { AdminUsers } from './components/AdminUsers';
import { NotificationCenter } from './components/NotificationCenter';
import { MobileSimulatorModal } from './components/MobileSimulatorModal';
import { ProjectDocsModal } from './components/ProjectDocsModal';
import { LandingPage } from './components/LandingPage';
import { AdminPanel } from './components/AdminPanel';
import { Notice } from './types';
import {
  Bookmark,
  Calendar,
  Building,
  ArrowRight,
  Search,
  FileEdit,
  GraduationCap
} from 'lucide-react';

function CampusPulseMain() {
  const {
    currentUser,
    notices,
    categories,
    activeEmergencyNotice,
    savedNoticeIds,
    dismissEmergencyBanner,
    isMobilePreviewOpen,
    setMobilePreviewOpen,
    quickSwitchRole,
  } = useApp();

  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Modals
  const [createNoticeOpen, setCreateNoticeOpen] = useState(false);
  const [crApplyOpen, setCrApplyOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);

  // When not logged in or in landing view mode, show the full public Landing Page
  if (!currentUser || viewMode === 'landing') {
    return (
      <LandingPage
        onEnterDashboard={() => setViewMode('app')}
        onEnterAdmin={() => {
          quickSwitchRole('ADMIN');
          setActivePage('admin-panel');
          setViewMode('app');
        }}
        onSwitchRoleAndEnter={(role) => {
          quickSwitchRole(role);
          if (role === 'ADMIN' || role === 'FACULTY') {
            setActivePage('admin-panel');
          } else {
            setActivePage('dashboard');
          }
          setViewMode('app');
        }}
      />
    );
  }

  // Filter notices for display
  const publishedNotices = notices.filter(
    (n) => n.status === 'PUBLISHED' || n.authorId === currentUser.id
  );

  const filteredNotices = publishedNotices.filter((notice) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        notice.title.toLowerCase().includes(q) ||
        notice.description.toLowerCase().includes(q) ||
        notice.authorName.toLowerCase().includes(q) ||
        (notice.audience.className && notice.audience.className.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && notice.category !== selectedCategory) {
      return false;
    }

    // Priority filter
    if (selectedPriority !== 'all' && notice.priority !== selectedPriority) {
      return false;
    }

    return true;
  });

  const savedNotices = publishedNotices.filter((n) => savedNoticeIds.includes(n.id));

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        onOpenLanding={() => setViewMode('landing')}
        onOpenDocs={() => setDocsModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenMobileView={() => setMobilePreviewOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8 items-start">
          
          {/* Sidebar */}
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            onOpenCreateNotice={() => setCreateNoticeOpen(true)}
            onOpenCRApply={() => setCrApplyOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            
            {/* Active Emergency Alert Banner */}
            {activeEmergencyNotice && activePage === 'dashboard' && (
              <EmergencyBanner
                notice={activeEmergencyNotice}
                onViewDetails={(n) => setSelectedNotice(n)}
                onDismiss={(id) => dismissEmergencyBanner(id)}
              />
            )}

            {/* PAGE: Dashboard */}
            {activePage === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Welcome Header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                      Welcome back 👋
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      {currentUser.role === 'STUDENT'
                        ? `Enrolled in ${currentUser.className || 'IT-A'} · Semester ${currentUser.semester || 3} · ${currentUser.departmentName || 'Information Technology'}`
                        : currentUser.role === 'CR'
                        ? `Class Representative for ${currentUser.assignedClassName || 'IT-A'}`
                        : `${currentUser.role} · ${currentUser.departmentName || 'College Administration'}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCreateNoticeOpen(true)}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
                    >
                      {currentUser.role === 'CR' ? '+ Create Class Notice' : '+ Create Notice'}
                    </button>
                  </div>
                </div>

                {/* Categories & Filter Bar */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                  <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs shrink-0">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      All
                    </button>

                    {categories
                      .filter((c) => c.isActive)
                      .slice(0, 5)
                      .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.slug)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            selectedCategory === cat.slug
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                  </div>

                  {/* Priority Select */}
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none shrink-0"
                  >
                    <option value="all">All Priorities</option>
                    <option value="NORMAL">Normal</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>

                {/* Main Grid: Feed + Right Snapshot */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Notice Feed */}
                  <div className="lg:col-span-8 space-y-4">
                    {filteredNotices.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                        <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-slate-800">No notices found</h4>
                        <p className="text-xs text-slate-500 mt-1">Try resetting your search query or category filters.</p>
                      </div>
                    ) : (
                      filteredNotices.map((n) => (
                        <NoticeCard key={n.id} notice={n} onSelect={(notice) => setSelectedNotice(notice)} />
                      ))
                    )}
                  </div>

                  {/* Right Snapshot Widgets */}
                  <div className="lg:col-span-4 space-y-4">
                    
                    {/* Academic info */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-blue-600" />
                          Class IT-A Details
                        </span>
                        <span className="text-[10px] text-slate-400">Semester 3</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Department:</span>
                          <span className="font-semibold text-slate-800">Information Tech</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Class Rep (CR):</span>
                          <span className="font-bold text-emerald-700">Rahul Verma</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Faculty Mentor:</span>
                          <span className="font-semibold text-slate-800">Prof. Arvind Sharma</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Access to Notepad */}
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl text-white p-5 shadow-md space-y-2">
                      <div className="flex items-center gap-2">
                        <FileEdit className="w-5 h-5 text-violet-200" />
                        <h4 className="text-sm font-bold">Personal Notepad</h4>
                      </div>
                      <p className="text-xs text-violet-100 leading-relaxed">
                        Private notes for DBMS viva, lab practicals, and personal reminders.
                      </p>
                      <button
                        onClick={() => setActivePage('my-notes')}
                        className="mt-2 w-full py-2 text-xs font-semibold text-violet-900 bg-white hover:bg-violet-50 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <span>Open My Notes</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE: All Notices */}
            {activePage === 'notices' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">All Notices</h2>
                    <p className="text-xs text-slate-500 mt-1">Complete archive of college and departmental circulars.</p>
                  </div>
                  <span className="text-xs text-slate-500">{filteredNotices.length} notices</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNotices.map((n) => (
                    <NoticeCard key={n.id} notice={n} onSelect={(notice) => setSelectedNotice(notice)} />
                  ))}
                </div>
              </div>
            )}

            {/* PAGE: Notifications */}
            {activePage === 'notifications' && (
              <NotificationCenter
                onSelectNoticeById={(id) => {
                  const target = notices.find((n) => n.id === id);
                  if (target) setSelectedNotice(target);
                }}
              />
            )}

            {/* PAGE: Saved Notices */}
            {activePage === 'saved' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">Saved Notices ({savedNotices.length})</h2>
                  <p className="text-xs text-slate-500 mt-1">Quick access to bookmarked notices and circulars.</p>
                </div>

                {savedNotices.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">No saved notices</p>
                    <p className="text-xs text-slate-400 mt-1">Bookmark any notice to keep it saved here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedNotices.map((n) => (
                      <NoticeCard key={n.id} notice={n} onSelect={(notice) => setSelectedNotice(notice)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PAGE: Admin Command Suite & Operations */}
            {activePage === 'admin-panel' && (
              <AdminPanel
                onOpenCreateNotice={() => setCreateNoticeOpen(true)}
                onSelectNotice={(notice) => setSelectedNotice(notice)}
              />
            )}

            {/* PAGE: My Notes */}
            {activePage === 'my-notes' && <PersonalNotepad />}

            {/* PAGE: CR Submissions & Approvals */}
            {activePage === 'cr-submissions' && <CRApprovalQueue />}

            {/* PAGE: Admin Categories */}
            {activePage === 'categories' && <AdminCategories />}

            {/* PAGE: Admin Classes */}
            {activePage === 'classes' && <AdminClasses />}

            {/* PAGE: Admin Users */}
            {activePage === 'users' && <AdminUsers />}
          </main>
        </div>
      </div>

      {/* Notice Detail Modal */}
      <NoticeDetailModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />

      {/* Create Notice Modal */}
      <CreateNoticeModal
        isOpen={createNoticeOpen}
        onClose={() => setCreateNoticeOpen(false)}
      />

      {/* CR Application Modal */}
      <CRApplicationModal
        isOpen={crApplyOpen}
        onClose={() => setCrApplyOpen(false)}
      />

      {/* Mobile Smartphone Simulator */}
      <MobileSimulatorModal
        isOpen={isMobilePreviewOpen}
        onClose={() => setMobilePreviewOpen(false)}
        onSelectNotice={(n) => {
          setSelectedNotice(n);
          setMobilePreviewOpen(false);
        }}
      />

      {/* College Project Technical Specification Modal */}
      <ProjectDocsModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CampusPulseMain />
    </AppProvider>
  );
}
