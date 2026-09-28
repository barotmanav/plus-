import React from 'react';
import { Volume2, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Notice } from '../types';
import { playNotificationSound } from '../utils/audio';

interface EmergencyBannerProps {
  notice: Notice;
  onViewDetails: (notice: Notice) => void;
  onDismiss: (noticeId: string) => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  notice,
  onViewDetails,
  onDismiss,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl shadow-red-500/20 border border-red-500/30 mb-6 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Urgent Icon & Text */}
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-white animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-red-100">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span>Active Campus Emergency Alert</span>
              <span>·</span>
              <span>Audience: {notice.audience.scope}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white leading-snug">
              {notice.title}
            </h3>

            <p className="text-xs sm:text-sm text-red-50 line-clamp-2 leading-relaxed max-w-3xl">
              {notice.description}
            </p>

            <div className="text-[11px] text-red-200 pt-0.5 flex items-center gap-2">
              <span>Issued by {notice.authorName}</span>
              <span>·</span>
              <span>
                {notice.publishedAt ? new Date(notice.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t border-red-500/40 md:border-t-0">
          <button
            onClick={() => playNotificationSound('EMERGENCY')}
            title="Replay Alert Siren"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewDetails(notice)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-red-700 font-semibold text-xs hover:bg-red-50 transition-all shadow-xs"
          >
            <span>View Directive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDismiss(notice.id)}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-red-800/60 hover:bg-red-800/80 text-white text-xs font-medium transition-colors border border-red-400/30"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Read</span>
          </button>
        </div>
      </div>
    </div>
  );
};
