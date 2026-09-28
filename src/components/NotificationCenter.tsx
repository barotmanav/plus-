import React from 'react';
import { Bell, CheckCheck, ShieldAlert, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NotificationCenterProps {
  onSelectNoticeById: (noticeId?: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onSelectNoticeById }) => {
  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    browserNotificationPermission,
    requestNotificationPermission,
    notificationStatus,
  } = useApp();

  if (!currentUser) return null;

  const userNotifications = notifications.filter((n) => n.recipientId === currentUser.id);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Notifications</h2>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
              notificationStatus.isConfigured
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-amber-800 bg-amber-50 border-amber-200'
            }`}>
              {notificationStatus.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Instant browser and mobile alerts received for {currentUser.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {browserNotificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Enable Browser Alerts</span>
            </button>
          )}

          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-2.5">
        {userNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">
              When faculty publishes a notice or triggers an emergency alert, it will arrive here instantly.
            </p>
          </div>
        ) : (
          userNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationAsRead(item.id);
                if (item.noticeId) onSelectNoticeById(item.noticeId);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                !item.isRead
                  ? 'bg-blue-50/50 border-blue-200 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 opacity-90'
              } ${item.priority === 'EMERGENCY' ? 'border-l-4 border-l-red-600 bg-red-50/15' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.priority === 'EMERGENCY'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {item.priority === 'EMERGENCY' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Unread" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.message}</p>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-700 font-medium">Browser &amp; Mobile push delivered</span>
                  </div>
                </div>
              </div>

              {item.noticeId && (
                <button
                  type="button"
                  className="shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <span>Open Notice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
