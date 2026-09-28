import React from 'react';
import { Bookmark, Paperclip, Pin, Clock, User, ChevronRight, ShieldCheck } from 'lucide-react';
import { Notice } from '../types';
import { useApp } from '../context/AppContext';

interface NoticeCardProps {
  notice: Notice;
  onSelect: (notice: Notice) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onSelect }) => {
  const { currentUser, savedNoticeIds, toggleBookmark } = useApp();

  const isSaved = savedNoticeIds.includes(notice.id);
  const isRead = currentUser ? notice.readByUsers.includes(currentUser.id) : false;

  const getPriorityStyle = (priority: Notice['priority']) => {
    switch (priority) {
      case 'EMERGENCY':
        return 'border-l-4 border-l-red-600 bg-red-50/15';
      case 'IMPORTANT':
        return 'border-l-4 border-l-amber-500 bg-amber-50/15';
      default:
        return 'border-l-4 border-l-blue-500';
    }
  };

  const getPriorityLabel = (priority: Notice['priority']) => {
    switch (priority) {
      case 'EMERGENCY':
        return <span className="text-red-700 font-bold uppercase text-[10px]">🚨 Emergency Alert</span>;
      case 'IMPORTANT':
        return <span className="text-amber-700 font-bold uppercase text-[10px]">Important</span>;
      default:
        return <span className="text-slate-500 font-medium uppercase text-[10px]">Notice</span>;
    }
  };

  const formatAudience = (aud: Notice['audience']) => {
    switch (aud.scope) {
      case 'EVERYONE':
        return 'Everyone (College)';
      case 'DEPARTMENT':
        return aud.departmentName || 'Department';
      case 'CLASS':
        return aud.className ? `Class ${aud.className}` : 'Assigned Class';
      default:
        return 'General';
    }
  };

  return (
    <div
      onClick={() => onSelect(notice)}
      className={`group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${getPriorityStyle(
        notice.priority
      )}`}
    >
      <div>
        {/* Header Kicker Line */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getPriorityLabel(notice.priority)}
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="capitalize font-semibold text-slate-700">{notice.category}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500">{formatAudience(notice.audience)}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {notice.isPinned && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                <Pin className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>Pinned</span>
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(notice.id);
              }}
              title={isSaved ? 'Remove from Saved' : 'Save Notice'}
              className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
          {notice.title}
        </h4>

        {/* Short Description */}
        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
          {notice.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2 truncate">
          <div className="flex items-center gap-1 font-medium text-slate-700 truncate">
            {notice.isCRSubmission ? (
              <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                CR Approved
              </span>
            ) : (
              <User className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="truncate">{notice.authorName}</span>
          </div>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <Clock className="w-3 h-3" />
            <span>
              {notice.publishedAt
                ? new Date(notice.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                : 'Recent'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {notice.attachments && notice.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              <Paperclip className="w-3 h-3 text-slate-500" />
              <span>{notice.attachments[0].fileType.toUpperCase()}</span>
            </span>
          )}

          {!isRead && (
            <span className="w-2 h-2 rounded-full bg-blue-600" title="Unread Notice" />
          )}

          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};
