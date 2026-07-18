/**
 * Notification categories — determines grouping and preference controls.
 */
export enum NotificationCategory {
  ASSIGNMENT = 'assignment',
  VERIFICATION = 'verification',
  PAYOUT = 'payout',
  DOCUMENT = 'document',
  CAMPAIGN = 'campaign',
  SUPPORT = 'support',
  SYSTEM = 'system',
}

/**
 * Notification delivery channels.
 */
export enum NotificationChannel {
  PUSH = 'push',
  IN_APP = 'in_app',
}

/**
 * Template variable context for rendering notification templates.
 */
export interface TemplateVariables {
  [key: string]: string | number | boolean | null;
}

/**
 * Push notification payload for FCM.
 */
export interface PushPayload {
  title: string;
  body: string;
  deepLink?: string;
  data?: Record<string, string>;
}

/**
 * Send notification request (internal).
 */
export interface SendNotificationParams {
  userId: string;
  category: NotificationCategory;
  templateCode: string;
  variables?: TemplateVariables;
  deepLink?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Domain event to notification mapping configuration.
 */
export interface EventNotificationMapping {
  eventName: string;
  category: NotificationCategory;
  templateCode: string;
  getRecipients: (payload: Record<string, unknown>) => string[];
  getVariables?: (payload: Record<string, unknown>) => TemplateVariables;
  getDeepLink?: (payload: Record<string, unknown>) => string | undefined;
}

/**
 * All notification categories for preference initialization.
 */
export const ALL_NOTIFICATION_CATEGORIES: NotificationCategory[] = Object.values(NotificationCategory);
