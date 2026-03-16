import type { NotificationsResponse } from '@/types/notifications';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class NotificationService {
  private listeners: Array<() => void> = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => { this.listeners = this.listeners.filter(l => l !== callback); };
  }

  private notify() { this.listeners.forEach(l => l()); }

  async getNotifications(): Promise<NotificationsResponse> {
    const res = await fetch(`${API_URL}/notifications/`, {
      credentials: 'include'
    });
    if (!res.ok) return { notifications: [], unread_count: 0 };
    return res.json();
  }

  async getUnreadCount(): Promise<number> {
    const data = await this.getNotifications();
    return data.unread_count;
  }

  async markAsRead(id: string): Promise<void> {
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include'
    });
    this.notify();
  }

  async markAllAsRead(): Promise<void> {
    await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      credentials: 'include'
    });
    this.notify();
  }

  async deleteNotification(id: string): Promise<void> {
    await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    this.notify();
  }

  getRelativeTime(timestamp: string): string {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return 'Ahora mismo';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    if (diff < 172800) return 'Ayer';
    return `Hace ${Math.floor(diff / 86400)} días`;
  }
}

export const notificationService = new NotificationService();
