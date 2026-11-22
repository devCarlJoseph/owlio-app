import type { NotificationItemViewModel, NotificationsRole } from '../types/notifications.types'

// Compatibility boundary: real notifications come from personal-workspace.service.ts.
export function getNotificationExamples(role: NotificationsRole): NotificationItemViewModel[] {
  void role
  return []
}
