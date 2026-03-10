import { Bell, BookOpen, MessageSquare, Award, X, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'course' | 'message' | 'achievement' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'course',
    title: 'Nuevo módulo disponible',
    message: 'El módulo 3 de "Anatomía Avanzada" ya está disponible',
    time: 'Hace 5 min',
    read: false,
  },
  {
    id: '2',
    type: 'message',
    title: 'Mensaje de instructor',
    message: 'Dra. Vivian Morales respondió a tu pregunta',
    time: 'Hace 1 hora',
    read: false,
  },
  {
    id: '3',
    type: 'achievement',
    title: '¡Certificado obtenido!',
    message: 'Has completado exitosamente el curso de Fisioterapia',
    time: 'Hace 2 horas',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Recordatorio de clase',
    message: 'Tu clase en vivo comienza en 30 minutos',
    time: 'Hace 3 horas',
    read: true,
  },
  {
    id: '5',
    type: 'course',
    title: 'Nuevo curso recomendado',
    message: 'Basado en tu progreso, te recomendamos "Terapia Manual Avanzada"',
    time: 'Ayer',
    read: true,
  },
  {
    id: '6',
    type: 'message',
    title: 'Respuesta a tu pregunta',
    message: 'Dr. Marco Delgado ha respondido en el foro del curso',
    time: 'Ayer',
    read: true,
  },
];

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

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

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-30"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel - Estilo Notion */}
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
                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
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
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative px-6 py-4 transition-colors",
                    !notification.read ? "bg-blue-50/50 hover:bg-blue-50/70" : "hover:bg-gray-50"
                  )}
                >
                  <div
                    className="flex gap-3 cursor-pointer"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={cn(
                          "text-sm leading-snug",
                          !notification.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        !notification.read ? "text-gray-700" : "text-gray-500"
                      )}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.time}
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