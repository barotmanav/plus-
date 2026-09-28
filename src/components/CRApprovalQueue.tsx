import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Clock,
  UserCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CRApprovalQueue: React.FC = () => {
  const {
    currentUser,
    notices,
    crApplications,
    approveNotice,
    rejectNotice,
    approveCRApplication,
    rejectCRApplication,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'notices' | 'applications'>('notices');
  const [rejectingNoticeId, setRejectingNoticeId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!currentUser) return null;

  const isCR = currentUser.role === 'CR';
  const isStaff = currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY';

  // Notices pending or submitted by CR
  const crNotices = isCR
    ? notices.filter((n) => n.authorId === currentUser.id && n.isCRSubmission)
    : notices.filter((n) => n.isCRSubmission);

  const pendingNotices = isStaff
    ? notices.filter((n) => n.isCRSubmission && n.status === 'PENDING_APPROVAL')
    : crNotices;

  const pendingApps = crApplications.filter((a) => a.status === 'PENDING');

  const handleConfirmReject = (id: string) => {
    if (!rejectReason.trim()) return;
    rejectNotice(id, rejectReason.trim());
    setRejectingNoticeId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {isCR ? 'My CR Notice Submissions' : 'CR Requests & Notice Approvals'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isCR
              ? `Notices drafted for your class (${currentUser.assignedClassName || 'IT-A'}). Faculty reviews all submissions before publish.`
              : 'Faculty & Admin moderation queue for Class Representatives and class circulars.'}
          </p>
        </div>

        {isStaff && (
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('notices')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'notices' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Notice Drafts ({pendingNotices.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'applications' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              CR Applications ({pendingApps.length})
            </button>
          </div>
        )}
      </div>

      {/* Tab: Notice Submissions */}
      {(activeTab === 'notices' || isCR) && (
        <div className="space-y-4">
          {crNotices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No pending CR notices</p>
              <p className="text-xs text-slate-400 mt-1">
                {isCR ? 'You haven’t submitted any class notices yet.' : 'The review queue is currently clear.'}
              </p>
            </div>
          ) : (
            crNotices.map((notice) => (
              <div
                key={notice.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3 ${
                  notice.status === 'PENDING_APPROVAL'
                    ? 'border-amber-200 bg-amber-50/10'
                    : notice.status === 'PUBLISHED'
                    ? 'border-emerald-200'
                    : 'border-red-200 bg-red-50/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        CR Notice for {notice.audience.className || 'Class IT-A'}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 capitalize">{notice.category}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{notice.title}</h3>
                  </div>

                  <div className="text-xs">
                    {notice.status === 'PENDING_APPROVAL' && (
                      <span className="text-amber-700 bg-amber-50 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                        Pending Approval
                      </span>
                    )}
                    {notice.status === 'PUBLISHED' && (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                        Published ✓
                      </span>
                    )}
                    {notice.status === 'REJECTED' && (
                      <span className="text-red-700 bg-red-50 border border-red-200 font-bold px-2 py-0.5 rounded-full">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {notice.description}
                </p>

                {notice.status === 'REJECTED' && notice.rejectionReason && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>Faculty Feedback: {notice.rejectionReason}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Author: {notice.authorName}</span>

                  {isStaff && notice.status === 'PENDING_APPROVAL' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRejectingNoticeId(notice.id)}
                        className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => approveNotice(notice.id)}
                        className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                      >
                        Approve &amp; Broadcast
                      </button>
                    </div>
                  )}
                </div>

                {/* Reject Input */}
                {rejectingNoticeId === notice.id && (
                  <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-200 space-y-2">
                    <label className="block text-xs font-semibold text-red-900">Reason for Rejection:</label>
                    <input
                      type="text"
                      placeholder="e.g. Please clarify Turing lab room number..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-red-300 rounded-lg bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setRejectingNoticeId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmReject(notice.id)}
                        disabled={!rejectReason.trim()}
                        className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded disabled:opacity-50"
                      >
                        Send Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: CR Candidate Applications (Staff only) */}
      {isStaff && activeTab === 'applications' && (
        <div className="space-y-4">
          {pendingApps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <UserCheck className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No pending CR applications</p>
              <p className="text-xs text-slate-400 mt-1">Student submissions to become Class Representative appear here.</p>
            </div>
          ) : (
            pendingApps.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{app.studentName}</h3>
                    <p className="text-xs text-slate-500">
                      {app.studentEmail} · Department: {app.departmentName} · Class: <strong>{app.className}</strong> (Sem {app.semester})
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                  <span className="font-semibold block text-slate-500 mb-0.5">Candidate Reason:</span>
                  "{app.reason}"
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => rejectCRApplication(app.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => approveCRApplication(app.id)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                  >
                    Approve as Class CR
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
