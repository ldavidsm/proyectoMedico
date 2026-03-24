import { Bell, BookOpen, MessageSquare, Award, X, Trash2, CheckCheck, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/services/notificationService';
import { useRouter } from 'next/navigation';
import type { NotificationType } from '@/types/notifications';

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const router = useRouter();

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  const handleNotificationClick = async (notification: { id: string; is_read: boolean; metadata_json?: { actionUrl?: string } }) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.metadata_json?.actionUrl) {
      router.push(notification.metadata_json.actionUrl);
      onOpenChange(false);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'course_approved':
      case 'course_rejected':
      case 'course_update':
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'seller_approved':
      case 'seller_rejected':
        return <ShieldCheck className="w-5 h-5 text-purple-500" />;
      case 'enrollment':
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'system':
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-30"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 left-0 md:left-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-xl",
          "w-full md:w-[420px] z-40"
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-900">Notificaciones</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative px-6 py-4 transition-colors",
                    !notification.is_read ? "bg-purple-50/50 hover:bg-purple-50/70" : "hover:bg-gray-50"
                  )}
                >
                  <div
                    className="flex gap-3 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={cn(
                          "text-sm leading-snug",
                          !notification.is_read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-1.5"></span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        !notification.is_read ? "text-gray-700" : "text-gray-500"
                      )}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notificationService.getRelativeTime(notification.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button - Appears on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 rounded-md transition-all"
                    title="Eliminar notificación"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
