import React from 'react';
import { X, Bookmark, Paperclip, Download, Calendar, Building2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Notice } from '../types';
import { useApp } from '../context/AppContext';

interface NoticeDetailModalProps {
  notice: Notice | null;
  onClose: () => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({ notice, onClose }) => {
  const { currentUser, savedNoticeIds, toggleBookmark, markNoticeAsRead } = useApp();

  if (!notice) return null;

  const isSaved = savedNoticeIds.includes(notice.id);

  // Automatically mark read when modal is opened
  React.useEffect(() => {
    if (notice) {
      markNoticeAsRead(notice.id);
    }
  }, [notice, markNoticeAsRead]);

  const handleDownloadAttachment = (fileName: string) => {
    const blob = new Blob([`CampusPulse Document: ${fileName}\nNotice: ${notice.title}\n\n${notice.description}`], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            {notice.priority === 'EMERGENCY' ? (
              <span className="flex items-center gap-1 text-red-600 font-bold uppercase">
                <ShieldAlert className="w-4 h-4" />
                Emergency Alert
              </span>
            ) : (
              <span className="capitalize">{notice.category} Notice</span>
            )}
            <span>·</span>
            <span>Priority: {notice.priority}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark(notice.id)}
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
              title={isSaved ? 'Remove from Saved' : 'Save Notice'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
              {notice.title}
            </h2>

            {/* Target Audience Metadata Strip */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 border-y border-slate-100 py-2.5">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Audience: </span>
                <span className="font-semibold text-slate-800">
                  {notice.audience.scope === 'EVERYONE'
                    ? 'Everyone (All College)'
                    : notice.audience.scope === 'DEPARTMENT'
                    ? `${notice.audience.departmentName} Department`
                    : `Class ${notice.audience.className || 'Assigned'}`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Posted: </span>
                <span className="text-slate-700">
                  {notice.publishedAt ? new Date(notice.publishedAt).toLocaleString() : 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* Author attribution */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-900">{notice.authorName}</p>
              <p className="text-[11px] text-slate-500">{notice.authorRole} · Official Publisher</p>
            </div>
            <div className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Notice</span>
            </div>
          </div>

          {/* Full Description */}
          <div className="text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line">
            {notice.description}
          </div>

          {/* Attachments */}
          {notice.attachments && notice.attachments.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 block">Attachments</span>
              <div className="space-y-2">
                {notice.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{att.fileName}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{att.fileType} · {att.fileSize}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadAttachment(att.fileName)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => toggleBookmark(notice.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save Notice'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
