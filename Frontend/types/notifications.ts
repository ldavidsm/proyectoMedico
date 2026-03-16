export type NotificationType =
  | 'course_approved' | 'course_rejected'
  | 'seller_approved' | 'seller_rejected'
  | 'enrollment' | 'payment' | 'system'
  | 'course_update' | 'message' | 'achievement';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata_json?: {
    courseId?: string;
    actionUrl?: string;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}
