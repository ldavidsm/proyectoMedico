'use client';
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/types/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    const unsub = notificationService.subscribe(load);
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [load]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: (id: string) => notificationService.markAsRead(id),
    markAllAsRead: () => notificationService.markAllAsRead(),
    deleteNotification: (id: string) => notificationService.deleteNotification(id),
    reload: load,
  };
}

export function useUnreadCount() {
  const { unreadCount } = useNotifications();
  return unreadCount;
}
