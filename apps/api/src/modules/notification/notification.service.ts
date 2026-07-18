import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationQueryDto } from './dto';
import {
  NotificationCategory,
  NotificationChannel,
  SendNotificationParams,
  TemplateVariables,
  ALL_NOTIFICATION_CATEGORIES,
} from './interfaces/notification.interface';
import { NotificationTemplateService } from './notification-template.service';
import { PushService } from './push.service';
import { NotificationSentEvent } from './events/notification-sent.event';
import { ERROR_CODES } from '@solo-advertiser/contracts';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly templateService: NotificationTemplateService,
    private readonly pushService: PushService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Send a notification to a user, respecting their preferences.
   */
  async send(params: SendNotificationParams): Promise<void> {
    const { userId, category, templateCode, variables, deepLink, metadata } = params;

    // Fetch user preferences for this category
    const preference = await this.prisma.notificationPreference.findUnique({
      where: { userId_category: { userId, category } },
    });

    // Default: both channels enabled
    const pushEnabled = preference?.push ?? true;
    const inAppEnabled = preference?.inApp ?? true;

    // Render template
    const rendered = await this.templateService.render(templateCode, variables || {});
    if (!rendered) {
      this.logger.warn(`Template not found: ${templateCode}, sending with raw content`);
      return;
    }

    // Send in-app notification
    if (inAppEnabled) {
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          title: rendered.title,
          body: rendered.body,
          type: category,
          channel: NotificationChannel.IN_APP,
          templateId: rendered.templateId,
          deepLink,
          metadata: metadata as any,
        },
      });

      this.eventEmitter.emit(
        NotificationSentEvent.eventName,
        new NotificationSentEvent(
          notification.id,
          userId,
          NotificationChannel.IN_APP,
          category,
          rendered.title,
          notification.createdAt,
        ),
      );
    }

    // Send push notification
    if (pushEnabled) {
      await this.pushService.send({
        userId,
        title: rendered.title,
        body: rendered.body,
        deepLink,
        data: metadata ? { metadata: JSON.stringify(metadata) } : undefined,
      });

      // Also persist push notification record
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          title: rendered.title,
          body: rendered.body,
          type: category,
          channel: NotificationChannel.PUSH,
          templateId: rendered.templateId,
          deepLink,
          metadata: metadata as any,
        },
      });

      this.eventEmitter.emit(
        NotificationSentEvent.eventName,
        new NotificationSentEvent(
          notification.id,
          userId,
          NotificationChannel.PUSH,
          category,
          rendered.title,
          notification.createdAt,
        ),
      );
    }
  }

  /**
   * List notifications for a user with pagination and filters.
   */
  async listForUser(userId: string, query: NotificationQueryDto) {
    const { page = 1, pageSize = 20, isRead, category } = query;
    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (isRead !== undefined) where.isRead = isRead;
    if (category) where.type = category;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException(ERROR_CODES.NOTIFICATION.NOT_FOUND);
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { updated: result.count };
  }

  /**
   * Get notification preferences for a user.
   */
  async getPreferences(userId: string) {
    const preferences = await this.prisma.notificationPreference.findMany({
      where: { userId },
    });

    // Return all categories with defaults for missing ones
    return ALL_NOTIFICATION_CATEGORIES.map((category) => {
      const existing = preferences.find((p) => p.category === category);
      return {
        category,
        push: existing?.push ?? true,
        inApp: existing?.inApp ?? true,
      };
    });
  }

  /**
   * Update notification preferences for a user.
   */
  async updatePreferences(userId: string, items: { category: string; push?: boolean; inApp?: boolean }[]) {
    const results = await Promise.all(
      items.map((item) =>
        this.prisma.notificationPreference.upsert({
          where: { userId_category: { userId, category: item.category } },
          create: {
            userId,
            category: item.category,
            push: item.push ?? true,
            inApp: item.inApp ?? true,
          },
          update: {
            ...(item.push !== undefined && { push: item.push }),
            ...(item.inApp !== undefined && { inApp: item.inApp }),
          },
        }),
      ),
    );

    return results;
  }

  /**
   * Get unread count for badge display.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
