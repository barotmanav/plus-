import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  FileCode,
  FolderTree
} from 'lucide-react';

interface ProjectDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDocsModal: React.FC<ProjectDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeDocTab, setActiveDocTab] = useState<'synopsis' | 'architecture' | 'er_dfd' | 'roles' | 'backend'>('synopsis');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                CampusPulse — College Project Technical Specification &amp; Report
              </h3>
              <p className="text-[11px] text-slate-500">
                Academic documentation for university evaluation and submission
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'synopsis', label: '1. Abstract & Synopsis' },
            { id: 'architecture', label: '2. Architecture & Pipeline' },
            { id: 'er_dfd', label: '3. ER & DFD Diagrams' },
            { id: 'roles', label: '4. 5-Role Matrix & CR Workflow' },
            { id: 'backend', label: '5. Django & Flutter Structure' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDocTab(tab.id as typeof activeDocTab)}
              className={`pb-2.5 px-2 border-b-2 whitespace-nowrap transition-colors ${
                activeDocTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Document Content Viewer */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
          
          {/* Tab 1: Synopsis */}
          {activeDocTab === 'synopsis' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                  Project Title
                </h4>
                <p className="text-base font-bold text-slate-900">
                  CampusPulse: Smart College Notice Board &amp; Instant Alert System
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  Core Axiom: <em>"The right notice → the right students → instantly."</em>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Abstract</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Traditional physical notice boards and chaotic messaging groups fail modern higher education institutions due to information fragmentation, lack of targeted broadcasting, unverified forwarded rumors, and sluggish dissemination during urgent campus emergencies. <strong>CampusPulse</strong> resolves this by establishing a centralized, role-governed digital communication ecosystem. It features a hierarchical 5-tier access control structure (Super Admin, Department Admin, Faculty, Class Representative, and Student), audience-granular filtering (College-wide down to individual class sections), two-way CR draft approval workflows, private encrypted student study notepads, and instant dual-channel push broadcasting via Web Push (Service Workers) and Android/Flutter Mobile (Firebase Cloud Messaging).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 mb-1">Problem Statement</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Physical bulletin boards cause delayed notice reach and zero read telemetry.</li>
                    <li>Chat apps produce notification fatigue where critical datesheets get buried.</li>
                    <li>No audit trail for official directives during floods or closures.</li>
                    <li>Students cannot filter notices specific to their semester/class section.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 mb-1">Proposed System Objectives</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Deliver targeted notices strictly to affected classes or departments.</li>
                    <li>Siren-backed instant Emergency Alert Broadcast with read confirmations.</li>
                    <li>Gated CR submissions requiring faculty sign-off before student dispatch.</li>
                    <li>Single unified Django REST API powering both Web and Flutter mobile.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Architecture */}
          {activeDocTab === 'architecture' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">System Architecture</h4>
              
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
{`                    CAMPUSPULSE PLATFORM
                             │
            ┌────────────────┴────────────────┐
            │   Role-Based Authentication     │
            │   (Session / Google OAuth)      │
            └────────────────┬────────────────┘
                             │
     ┌──────────┬────────────┼────────────┬──────────┐
     ↓          ↓            ↓            ↓          ↓
Super Admin  Dept Admin   Faculty        CR       Student
     │          │            │            │          │
     └──────────┴────────────┴────────────┴──────────┘
                             │
                    Django REST API Backend
             (Permissions, ViewSets, Audit Logs)
                             │
        ┌────────────────────┼────────────────────┐
        ↓                    ↓                    ↓
PostgreSQL DB         Local File Storage        FCM & Web Push Engine
(Normalized Schema)   (PDF, PNG, DOCX)          (Token Dispatcher)
                             │
              ┌──────────────┴──────────────┐
              ↓                             ↓
     CampusPulse Web App           CampusPulse Mobile App
     (HTML/CSS/JS/React)           (Flutter Framework)
              ↓                             ↓
     🔔 Browser Web Push           🔔 Android Push Notifications`}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                <h5 className="font-bold text-slate-950">Dual Notification Engine Pipeline:</h5>
                <p className="text-slate-900">
                  When a notice is published or approved, the backend notification dispatcher resolves all enrolled students belonging to the target audience (e.g. IT Department, 2nd Year, 3rd Semester, Class IT-A). For each recipient, it generates an in-app notification record and invokes the FCM service with registered browser and device tokens to trigger foreground/background notifications.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: ER & DFD */}
          {activeDocTab === 'er_dfd' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Entity Relationship (ER) &amp; Data Flow Diagrams</h4>
              
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
{`[ USER ] ──────── 1:N ────────< [ NOTICE ]
   │                               │
   ├────── 1:1 ──< [ CR_APPL ]     ├───── 1:N ────< [ ATTACHMENT ]
   │                               ├───── 1:1 ────< [ AUDIENCE ]
   ├────── 1:N ──< [ NOTIF ]       └───── 1:N ────< [ BOOKMARK ]
   │
   ├────── 1:N ──< [ PERSONAL_NOTE ] (Isolated strictly to owner user_id)
   │
   ├────── N:1 ──> [ CLASS ] ─────── N:1 ──> [ DEPARTMENT ]
   └────── N:1 ──> [ ROLE ]`}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
{`DFD LEVEL 0 (Context Diagram):
[Student / Faculty / CR] ── Credentials / Notices ──> ( CampusPulse System )
( CampusPulse System ) ── Filtered Feed & Instant Push Alerts ──> [Students]

DFD LEVEL 1:
1.0 Authenticate & Resolve Role
2.0 Notice Authoring (Validate CR Constraint vs Admin Privilege)
3.0 Faculty/Admin CR Review Queue (Approve / Reject)
4.0 Targeting & Audience Resolution (College / Dept / Class)
5.0 Notification Dispatch (FCM Web Push + In-App Records)
6.0 Personal Notepad Store (Encrypted private CRUD)`}
              </div>
            </div>
          )}

          {/* Tab 4: Roles & Matrix */}
          {activeDocTab === 'roles' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h4>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Feature / Capability</th>
                      <th className="p-2.5">Super Admin</th>
                      <th className="p-2.5">Dept Admin</th>
                      <th className="p-2.5">Faculty</th>
                      <th className="p-2.5">CR</th>
                      <th className="p-2.5">Student</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">Emergency Alert Broadcast</td>
                      <td className="p-2.5 text-emerald-600 font-bold">Yes (Campus)</td>
                      <td className="p-2.5 text-emerald-600 font-bold">Yes (Dept)</td>
                      <td className="p-2.5 text-amber-600 font-bold">Yes (Verified)</td>
                      <td className="p-2.5 text-red-600">No</td>
                      <td className="p-2.5 text-red-600">No</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">Direct Notice Publish</td>
                      <td className="p-2.5 text-emerald-600">Yes</td>
                      <td className="p-2.5 text-emerald-600">Yes (Dept)</td>
                      <td className="p-2.5 text-emerald-600">Yes (Class/Dept)</td>
                      <td className="p-2.5 text-amber-600">Pending Review</td>
                      <td className="p-2.5 text-red-600">No</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">CR Approval &amp; Review Queue</td>
                      <td className="p-2.5 text-emerald-600">Yes</td>
                      <td className="p-2.5 text-emerald-600">Yes</td>
                      <td className="p-2.5 text-emerald-600">Yes</td>
                      <td className="p-2.5 text-red-600">No</td>
                      <td className="p-2.5 text-red-600">No</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">Category Management</td>
                      <td className="p-2.5 text-emerald-600">Yes</td>
                      <td className="p-2.5 text-emerald-600">Yes</td>
                      <td className="p-2.5 text-red-600">No</td>
                      <td className="p-2.5 text-red-600">No</td>
                      <td className="p-2.5 text-red-600">No</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">Personal Student Notepad</td>
                      <td className="p-2.5 text-slate-400">N/A</td>
                      <td className="p-2.5 text-slate-400">N/A</td>
                      <td className="p-2.5 text-slate-400">N/A</td>
                      <td className="p-2.5 text-emerald-600">Yes (Private)</td>
                      <td className="p-2.5 text-emerald-600">Yes (Private)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Structure */}
          {activeDocTab === 'backend' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Production Codebase Directory Structure</h4>
              
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
{`campuspulse/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/ (settings.py, urls.py, wsgi.py, asgi.py)
│   ├── apps/
│   │   ├── users/ (models.py, serializers.py, views.py, permissions.py)
│   │   ├── departments/ (models.py, serializers.py, views.py)
│   │   ├── classes/ (models.py, serializers.py, views.py)
│   │   ├── notices/ (models.py, serializers.py, views.py, filters.py)
│   │   ├── notifications/ (models.py, fcm_service.py, views.py)
│   │   ├── cr/ (models.py, serializers.py, views.py)
│   │   ├── notes/ (models.py, serializers.py, views.py)
│   │   └── audit/ (models.py, serializers.py, views.py)
│   └── tests/ (test_auth.py, test_targeting.py, test_cr.py)
├── mobile/
│   ├── pubspec.yaml
│   └── lib/ (main.dart, screens/, models/, services/)
└── frontend/
    └── src/ (React web interface)`}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          <span>CampusPulse Engineering Team · Ready for College Evaluation</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
