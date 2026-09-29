import React, { useState } from 'react';
import {
  Bell,
  Smartphone,
  ShieldAlert,
  Bookmark,
  FileEdit,
  Layers,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Users,
  Building,
  GraduationCap,
  Calendar,
  Send,
  Eye,
  Check,
  ChevronRight,
  Menu,
  X,
  Clock,
  Sparkles,
  FileCheck2,
  Tag,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playNotificationSound } from '../utils/audio';
import { AuthView } from './AuthView';
import { Notice, RoleType } from '../types';
import campusHeroImg from '../assets/images/campuspulse_hero_campus_1790572044945.jpg';
import controlRoomImg from '../assets/images/campuspulse_control_room_1790572058163.jpg';

interface LandingPageProps {
  onEnterDashboard?: () => void;
  onEnterAdmin?: () => void;
  onSwitchRoleAndEnter?: (role: RoleType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  onEnterAdmin,
  onSwitchRoleAndEnter,
}) => {
  const { currentUser, notices, notificationStatus, categories, deviceTokens } = useApp();

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero interactive showcase tab
  const [showcaseTab, setShowcaseTab] = useState<'feed' | 'emergency' | 'audience' | 'cr-pipeline'>('feed');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Emergency Siren Test Bench state
  const [testSirenActive, setTestSirenActive] = useState(false);
  const [testSirenStage, setTestSirenStage] = useState(0);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleRunSirenTest = () => {
    setTestSirenActive(true);
    setTestSirenStage(1);
    playNotificationSound('EMERGENCY');

    setTimeout(() => setTestSirenStage(2), 600);
    setTimeout(() => setTestSirenStage(3), 1300);
    setTimeout(() => setTestSirenStage(4), 2000);
  };

  const faqs = [
    {
      q: 'Does CampusPulse require real Firebase credentials to run locally?',
      a: 'No! CampusPulse features an intelligent dual-mode Notification Service abstraction. When Firebase credentials are configured in your environment, it connects to live Firebase Cloud Messaging (FCM). When running in local development mode without credentials, it operates seamlessly using an interactive development notification engine without errors.'
    },
    {
      q: 'Can students register themselves as Admin or Faculty?',
      a: 'Strictly no. Registration is exclusively student-facing, assigning newly registered accounts the STUDENT role automatically. Admin and Faculty accounts are created and verified only through backend governance or administrative user management.'
    },
    {
      q: 'How does the Class Representative (CR) approval system work?',
      a: 'Any enrolled student can click "Apply for CR" from their dashboard and submit their application. Faculty mentors or Administrators review the application in their moderation queue. Upon approval, the student account is promoted to CR, allowing them to draft circulars specifically for their class section.'
    },
    {
      q: 'Can Class Representatives trigger campus-wide emergency sirens?',
      a: 'No. Emergency sirens are strictly restricted to Admin (Deans) and Faculty members. CRs can only draft announcements for their own assigned class section, which are reviewed before publishing.'
    },
    {
      q: 'How are push notifications targeted by audience?',
      a: 'Each notice has an Audience payload: Campus-Wide, Department-specific (e.g. Information Technology, Computer Engineering), or Class-specific (e.g. IT-A, Semester 3). The dispatch engine filters student device tokens based on their class enrollment, ensuring only the target audience receives notifications.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ============================================================ */}
      {/* 1. TOP BAR CONTRACT (Zone 1: Wordmark, Zone 2: Links, Zone 3: Actions) */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Zone 1: Single text element wordmark */}
            <a href="#hero" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs transition-transform group-hover:scale-105">
                CP
              </div>
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                CampusPulse
              </span>
            </a>

            {/* Zone 2: 4-6 clean text navigation links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <a href="#hero" className="hover:text-slate-900 transition-colors">Home</a>
              <a href="#features" className="hover:text-slate-900 transition-colors">Capabilities</a>
              <a href="#emergency-siren" className="hover:text-slate-900 transition-colors">Emergency Siren</a>
              <a href="#cr-pipeline" className="hover:text-slate-900 transition-colors">CR Pipeline</a>
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#faqs" className="hover:text-slate-900 transition-colors">FAQs</a>
            </nav>

            {/* Zone 3: 1-2 primary actions */}
            <div className="hidden sm:flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => playNotificationSound('EMERGENCY')}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors flex items-center gap-1.5"
                title="Test Siren Chime"
              >
                <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Test Siren</span>
              </button>

              {onEnterAdmin && (
                <button
                  onClick={onEnterAdmin}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin Console</span>
                </button>
              )}

              {currentUser ? (
                <button
                  onClick={onEnterDashboard}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => openAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-xs"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 text-xs font-medium">
            <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">Home</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">Capabilities</a>
            <a href="#emergency-siren" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">Emergency Siren</a>
            <a href="#cr-pipeline" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">CR Pipeline</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">How It Works</a>
            <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">FAQs</a>
            
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              {onEnterAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onEnterAdmin();
                  }}
                  className="flex-1 py-2 text-center text-xs font-semibold text-purple-700 bg-purple-50 rounded-lg border border-purple-200"
                >
                  Admin Console
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuth('login');
                }}
                className="flex-1 py-2 text-center text-xs font-semibold text-white bg-slate-900 rounded-lg"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION (Figma Kit Typography, Kicker & Showcase) */}
      {/* ============================================================ */}
      <section id="hero" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Subtle mesh background accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            
            {/* Clean editorial kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>CampusPulse v2.0 · Digital Notice Board &amp; Instant Emergency Alert System</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08]">
              College notices,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                delivered instantly.
              </span>
            </h1>

            {/* Refined Value Proposition */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Broadcast verified academic circulars, activate audible emergency sirens campus-wide, and route targeted class notices through 4 backend-enforced roles and Firebase push messaging.
            </p>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onEnterAdmin && (
                <button
                  onClick={onEnterAdmin}
                  className="px-5 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Launch Admin Console</span>
                </button>
              )}

              <button
                onClick={handleRunSirenTest}
                className="px-5 py-3 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4 text-rose-600" />
                <span>Simulate Emergency Siren</span>
              </button>

              <button
                onClick={() => (currentUser ? onEnterDashboard && onEnterDashboard() : openAuth('register'))}
                className="px-5 py-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                <span>{currentUser ? 'Student Portal' : 'Student Sign Up'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Quick Role Switcher Bar (Instant Access to any perspective) */}
            {onSwitchRoleAndEnter && (
              <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Quick explore:</span>
                <button
                  onClick={() => onSwitchRoleAndEnter('ADMIN')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>🛡️ Dean / Admin</span>
                </button>
                <button
                  onClick={() => onSwitchRoleAndEnter('FACULTY')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>👨‍🏫 Faculty Mentor</span>
                </button>
                <button
                  onClick={() => onSwitchRoleAndEnter('CR')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>🎓 Class Rep (IT-A)</span>
                </button>
                <button
                  onClick={() => onSwitchRoleAndEnter('STUDENT')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>🎒 Enrolled Student</span>
                </button>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* HERO PRODUCT SHOWCASE WINDOW (Realistic Figma Chrome Mockup) */}
          {/* ============================================================ */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
              
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-100/80 border-b border-slate-200 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-mono text-[11px] text-slate-500 hidden sm:inline">
                    https://campuspulse.edu/dashboard/live
                  </span>
                </div>

                {/* Showcase Tab Switcher */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5">
                  <button
                    onClick={() => setShowcaseTab('feed')}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      showcaseTab === 'feed'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Live Notice Feed
                  </button>
                  <button
                    onClick={() => setShowcaseTab('emergency')}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      showcaseTab === 'emergency'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Emergency Siren
                  </button>
                  <button
                    onClick={() => setShowcaseTab('audience')}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      showcaseTab === 'audience'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Audience Targeting
                  </button>
                  <button
                    onClick={() => setShowcaseTab('cr-pipeline')}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      showcaseTab === 'cr-pipeline'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    CR Pipeline
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="hidden sm:inline">Broadcaster Online</span>
                </div>
              </div>

              {/* Showcase Body Content */}
              <div className="p-5 sm:p-7 bg-slate-50/70">
                
                {/* 1. Live Feed Tab */}
                {showcaseTab === 'feed' && (
                  <div className="space-y-4">
                    {/* Simulated Emergency Banner */}
                    <div className="p-3.5 bg-red-600 text-white rounded-2xl shadow-sm flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/20 rounded-xl shrink-0 mt-0.5">
                          <ShieldAlert className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-white text-red-700 px-2 py-0.5 rounded font-mono">
                              CRITICAL ALERT
                            </span>
                            <span className="text-[11px] text-red-100">Broadcast to all students</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1">
                            Campus Suspension: Severe Monsoon Weather Advisory
                          </h4>
                          <p className="text-xs text-red-100 mt-0.5">
                            All computer labs and afternoon theory classes suspended. Shuttle buses depart at 1:30 PM.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => playNotificationSound('EMERGENCY')}
                        className="px-3 py-1.5 text-[11px] font-bold text-red-700 bg-white hover:bg-red-50 rounded-xl transition-colors shrink-0 flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Chime</span>
                      </button>
                    </div>

                    {/* Notice sample cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            EXAMS &amp; PRACTICALS
                          </span>
                          <span className="text-[11px] text-slate-400">Audience: Class IT-A</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">
                          DBMS Practical Viva Schedule &amp; Lab Assignment Submissions
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          All Batch A students must report to Lab 402 with signed record files by Thursday morning.
                        </p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>By Prof. Arvind Sharma (Faculty Mentor)</span>
                          <span className="text-blue-600 font-semibold cursor-pointer">View Notice →</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            PLACEMENT DRIVE
                          </span>
                          <span className="text-[11px] text-slate-400">Audience: IT &amp; CSE</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Oracle &amp; Microsoft Pre-Placement Campus Talk
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          Auditorium 1, 10:00 AM. Eligible for 7th &amp; 8th-semester engineering students with GPA &gt; 7.5.
                        </p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>By Training &amp; Placement Cell</span>
                          <span className="text-blue-600 font-semibold cursor-pointer">View Notice →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Emergency Siren Tab */}
                {showcaseTab === 'emergency' && (
                  <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-red-400" />
                        <h4 className="text-sm font-bold text-white">Emergency Siren Protocol Specification</h4>
                      </div>
                      <button
                        onClick={() => playNotificationSound('EMERGENCY')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Play Chime Now</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
                        <p className="text-slate-400 text-[11px]">Audio Synthesis</p>
                        <p className="text-white font-bold font-mono mt-1">Dual Sine Wave (880Hz / 440Hz)</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">High-penetration college alarm chime</p>
                      </div>

                      <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
                        <p className="text-slate-400 text-[11px]">Viewport Lock</p>
                        <p className="text-red-400 font-bold font-mono mt-1">Sticky Priority Banner</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">Overrides standard board feeds</p>
                      </div>

                      <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
                        <p className="text-slate-400 text-[11px]">Target Audience</p>
                        <p className="text-emerald-400 font-bold font-mono mt-1">100% Campus-Wide</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">Web Push + Service Worker Broadcast</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Audience Targeting Tab */}
                {showcaseTab === 'audience' && (
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Precision Audience Routing</h4>
                        <p className="text-xs text-slate-500">Notices reach only students enrolled in target classes</p>
                      </div>
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                        <span className="font-bold text-blue-900 block">01. College-Wide</span>
                        <p className="text-blue-700 text-[11px]">
                          Holidays, emergency closures, annual fests, convocations.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                        <span className="font-bold text-indigo-900 block">02. Department-Specific</span>
                        <p className="text-indigo-700 text-[11px]">
                          Target IT, CSE, Mechanical, or Civil engineering branches.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                        <span className="font-bold text-emerald-900 block">03. Class Section</span>
                        <p className="text-emerald-700 text-[11px]">
                          Pinpoint targeting for Section IT-A, Semester 3 vivas &amp; labs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CR Pipeline Tab */}
                {showcaseTab === 'cr-pipeline' && (
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Class Representative (CR) Governance</h4>
                        <p className="text-xs text-slate-500">Student leadership without unauthorized notice spam</p>
                      </div>
                      <GraduationCap className="w-5 h-5 text-emerald-600" />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="font-bold text-slate-800 block">Step 1</span>
                        <span className="text-[11px] text-slate-500">Student applies for CR</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                      <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="font-bold text-slate-800 block">Step 2</span>
                        <span className="text-[11px] text-slate-500">Faculty reviews &amp; approves</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                      <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="font-bold text-slate-800 block">Step 3</span>
                        <span className="text-[11px] text-slate-500">CR drafts class circulars</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                      <div className="flex-1 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-emerald-800 font-semibold">
                        <span className="block">Step 4</span>
                        <span className="text-[11px]">Instant Push to Class</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metric Proof Ribbon (Clean tabular numbers per guidelines) */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
              <span className="text-2xl font-black font-mono text-slate-900 block">&lt; 0.2s</span>
              <span className="text-xs text-slate-500 mt-0.5 block">Broadcast Latency</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
              <span className="text-2xl font-black font-mono text-emerald-600 block">100%</span>
              <span className="text-xs text-slate-500 mt-0.5 block">Delivery Verification</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
              <span className="text-2xl font-black font-mono text-blue-600 block">4 Tiers</span>
              <span className="text-xs text-slate-500 mt-0.5 block">Role-Based Access Control</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
              <span className="text-2xl font-black font-mono text-purple-600 block">FCM Ready</span>
              <span className="text-xs text-slate-500 mt-0.5 block">Web &amp; Mobile Tokens</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. CAMPUS ARCHITECTURE SHOWCASE (High-Fidelity Visual Asset) */}
      {/* ============================================================ */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Collegiate Infrastructure Ready</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
                Built for modern academic institutions &amp; smart university campuses.
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                CampusPulse replaces paper notice boards, lost messaging threads, and noisy group chats with an authoritative, verified institutional announcement network.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-blue-100 text-blue-700 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Departmental Independence</h4>
                    <p className="text-xs text-slate-500">Each branch manages their own faculty, semesters, and class reps without interference.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-blue-100 text-blue-700 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Zero Spoofed Roles</h4>
                    <p className="text-xs text-slate-500">All permissions are strictly verified by Django/database backend logic, never client-side dropdowns.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-blue-100 text-blue-700 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Database Flexibility</h4>
                    <p className="text-xs text-slate-500">Starts instantly on local SQLite, ready for instant connection to production PostgreSQL.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <img
                  src={campusHeroImg}
                  alt="Modern university technological campus"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = '1';
                      target.src = '/images/campuspulse_hero_campus.jpg';
                    } else if (target.dataset.triedFallback === '1') {
                      target.dataset.triedFallback = '2';
                      target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop';
                    }
                  }}
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-300">
                    Trusted by 4 Academic Departments
                  </span>
                  <p className="text-sm font-bold text-white mt-1">
                    Information Technology · Computer Science · Electronics · Mechanical
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ASYMMETRIC BENTO GRID (Features) */}
      {/* ============================================================ */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-blue-600 uppercase">
              Core Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
              Engineered for absolute reliability in emergency &amp; daily campus life.
            </h3>
            <p className="text-sm text-slate-600">
              Every feature solves real operational bottlenecks faced by students, professors, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Span 2 - Emergency Siren */}
            <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold font-mono text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  CRITICAL BROADCAST
                </span>
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  Instant Emergency Siren &amp; Evacuation Protocol
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  When emergencies occur (flash floods, weather advisories, fire alarms, campus lockdowns), Admin and Faculty can trigger an audible siren chime and pin a high-contrast red alert across all active browser and mobile screens instantly.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Dual-tone audio chime
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Overrides standard feeds
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Push to all registered tokens
                </span>
              </div>
            </div>

            {/* Card 2: Span 1 - 4-Tier RBAC */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">4-Tier Verified RBAC</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Strict backend validation ensures users can never escalate roles by altering frontend form requests.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>ADMIN:</span>
                  <span className="font-semibold text-purple-700">Full System Control</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>FACULTY:</span>
                  <span className="font-semibold text-teal-700">Post &amp; Moderate</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>CR:</span>
                  <span className="font-semibold text-emerald-700">Class Notices (Verified)</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>STUDENT:</span>
                  <span className="font-semibold text-blue-700">Read &amp; Bookmark</span>
                </div>
              </div>
            </div>

            {/* Card 3: Span 1 - Audience Precision */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">Audience Precision</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Eliminate circular spam by routing notices exclusively to target classes (e.g. IT-A Semester 3).
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <span className="font-mono text-[11px] text-blue-700 font-bold block">Audience Routing:</span>
                <span className="text-slate-600 text-[11px]">IT-A students see only IT-A and College circulars, filtering irrelevant branch notices.</span>
              </div>
            </div>

            {/* Card 4: Span 2 - CR Pipeline */}
            <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  VERIFIED PEER COMM
                </span>
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  Class Representative (CR) Pipeline &amp; Faculty Moderation
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Students apply to become Class Representatives. Once verified by Faculty, they can post class timetable revisions, lab assignments, and study group updates directly to their classmates under faculty oversight.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Application review queue
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  One-click approve / return with notes
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Scoped exclusively to assigned class
                </span>
              </div>
            </div>

            {/* Card 5: Span 1 - Personal Notepad */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <FileEdit className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">Personal Student Notepad</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Private student notepad synced offline for viva preparation, lab practical steps, and assignment deadlines.
                </p>
              </div>

              <div className="p-3 bg-violet-50/50 rounded-xl text-xs space-y-1">
                <span className="font-bold text-violet-900 block">100% Private to Student</span>
                <span className="text-violet-700 text-[11px]">Pin crucial practical steps, DBMS commands, and project viva questions.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. INTERACTIVE EMERGENCY SIREN SIMULATOR TEST BENCH */}
      {/* ============================================================ */}
      <section id="emergency-siren" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-400 text-xs font-semibold font-mono">
              <Volume2 className="w-3.5 h-3.5" />
              <span>LIVE AUDIO &amp; VISUAL BENCHMARK</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Experience the Emergency Broadcast in Real Time
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Click the button below to test how an authorized emergency dispatch generates the high-priority siren chime and alerts student devices across the campus.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-700">
              <div>
                <h3 className="text-base font-bold text-white">Interactive Alert Simulator</h3>
                <p className="text-xs text-slate-400 mt-0.5">Sample Scenario: Sudden Storm / Lab Evacuation Warning</p>
              </div>

              <button
                onClick={handleRunSirenTest}
                className="px-6 py-3 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 shrink-0 animate-pulse"
              >
                <Volume2 className="w-4 h-4" />
                <span>Trigger Emergency Siren Broadcast</span>
              </button>
            </div>

            {/* Simulation Progress Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  testSirenStage >= 1
                    ? 'bg-red-950/60 border-red-700 text-red-200'
                    : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="font-mono text-[10px] block opacity-75">STEP 01</span>
                <span className="font-bold block mt-1">Admin Sound Chime</span>
                <p className="text-[11px] mt-1 opacity-80">Synthesizes 880Hz alert tone</p>
              </div>

              <div
                className={`p-4 rounded-2xl border transition-all ${
                  testSirenStage >= 2
                    ? 'bg-amber-950/60 border-amber-700 text-amber-200'
                    : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="font-mono text-[10px] block opacity-75">STEP 02</span>
                <span className="font-bold block mt-1">FCM Push Dispatch</span>
                <p className="text-[11px] mt-1 opacity-80">Payload broadcast to tokens</p>
              </div>

              <div
                className={`p-4 rounded-2xl border transition-all ${
                  testSirenStage >= 3
                    ? 'bg-blue-950/60 border-blue-700 text-blue-200'
                    : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="font-mono text-[10px] block opacity-75">STEP 03</span>
                <span className="font-bold block mt-1">Browser Popup Fired</span>
                <p className="text-[11px] mt-1 opacity-80">Service worker notification</p>
              </div>

              <div
                className={`p-4 rounded-2xl border transition-all ${
                  testSirenStage >= 4
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                    : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="font-mono text-[10px] block opacity-75">STEP 04</span>
                <span className="font-bold block mt-1">Screen Lock Verified</span>
                <p className="text-[11px] mt-1 opacity-80">Red emergency banner pinned</p>
              </div>
            </div>

            {testSirenActive && (
              <div className="p-4 bg-red-600 text-white rounded-2xl flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-white animate-bounce" />
                  <div>
                    <span className="text-xs font-bold block">
                      EMERGENCY SIREN ACTIVE: Flash Weather Warning Sent!
                    </span>
                    <span className="text-[11px] text-red-100">
                      Dispatched across {deviceTokens.length} simulated student browser tokens.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setTestSirenActive(false)}
                  className="px-3 py-1 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg text-white"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. ADMIN OPERATIONS & CONTROL ROOM SHOWCASE */}
      {/* ============================================================ */}
      <section id="cr-pipeline" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Centralized University Operations</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
                Admin Control Room &amp; Real-Time Moderation
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Campus administrators enjoy complete oversight over user accounts, notice approvals, department classes, and push diagnostics from a single command dashboard.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">One-Click Notice Moderation</h4>
                  <p className="text-xs text-slate-500">
                    Approve or reject Class Representative announcements with constructive revision notes before they publish.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Device Token Diagnostics</h4>
                  <p className="text-xs text-slate-500">
                    Inspect registered web push and mobile tokens stored in SQLite/PostgreSQL to verify delivery health.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Dynamic Class Management</h4>
                  <p className="text-xs text-slate-500">
                    Add new class sections, assign faculty mentors, and adjust academic semesters with zero coding required.
                  </p>
                </div>
              </div>

              {onEnterAdmin && (
                <div className="pt-2">
                  <button
                    onClick={onEnterAdmin}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Admin Console</span>
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <img
                  src={controlRoomImg}
                  alt="High-tech university administration control room"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = '1';
                      target.src = '/images/campuspulse_control_room.jpg';
                    } else if (target.dataset.triedFallback === '1') {
                      target.dataset.triedFallback = '2';
                      target.src = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop';
                    }
                  }}
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[11px] font-mono text-purple-300 font-semibold uppercase">
                    Admin Command Suite v2.0
                  </span>
                  <p className="text-sm font-bold text-white mt-1">
                    Continuous monitoring of notice broadcasts, FCM push logs, and emergency sirens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. HOW IT WORKS (4-Stage Pipeline) */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-blue-600 uppercase">
              System Architecture
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-950">
              How CampusPulse Dispatches Notices
            </h3>
            <p className="text-sm text-slate-600">
              Four automated steps ensure critical announcements reach students in less than 200 milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                STEP 01
              </span>
              <h4 className="text-base font-bold text-slate-900">Author &amp; Prioritize</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Faculty or approved CR authors notice with category, priority (Normal, Important, Emergency), and audience targeting.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <span className="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                STEP 02
              </span>
              <h4 className="text-base font-bold text-slate-900">RBAC &amp; Audience Check</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Backend validates permissions. CR submissions route to faculty moderation queue; emergency alerts trigger instant dispatch.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <span className="text-xs font-bold font-mono text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">
                STEP 03
              </span>
              <h4 className="text-base font-bold text-slate-900">FCM Push Dispatch</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The notification service retrieves target student device tokens and invokes Firebase Cloud Messaging (or Dev engine).
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                STEP 04
              </span>
              <h4 className="text-base font-bold text-slate-900">Instant Alert &amp; Siren</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Student browsers receive push notifications, sound chimes for emergency alerts, and display notices on their personal board.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. FAQS ACCORDION */}
      {/* ============================================================ */}
      <section id="faqs" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-blue-600 uppercase">
              Frequently Asked Questions
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-950">
              Clear answers on setup, security &amp; architecture.
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. CONVERSION BANNER */}
      {/* ============================================================ */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to experience CampusPulse?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Test the live notice board, try the emergency audio siren, or log in as an administrator right away.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onEnterAdmin && (
              <button
                onClick={onEnterAdmin}
                className="px-6 py-3 text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 rounded-xl transition-all shadow-lg shadow-black/10 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Open Admin Console</span>
              </button>
            )}

            <button
              onClick={() => (currentUser ? onEnterDashboard && onEnterDashboard() : openAuth('register'))}
              className="px-6 py-3 text-xs font-semibold text-white bg-blue-950/50 hover:bg-blue-950/70 border border-blue-400/40 rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <span>{currentUser ? 'Enter Student Portal' : 'Student Sign Up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. MINIMALIST FOOTER */}
      {/* ============================================================ */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              CP
            </div>
            <span className="font-bold text-white">CampusPulse</span>
            <span className="text-slate-500">· College notices, delivered instantly.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Admin &amp; Student Portals</span>
            <span>·</span>
            <span>Firebase Cloud Messaging</span>
            <span>·</span>
            <span>© {new Date().getFullYear()} CampusPulse</span>
          </div>
        </div>
      </footer>

      {/* Clean Email/Password Auth Modal */}
      {authModalOpen && (
        <AuthView
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  );
};
