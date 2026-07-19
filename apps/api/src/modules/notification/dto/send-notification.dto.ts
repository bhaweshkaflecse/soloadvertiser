import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { NotificationCategory } from '../interfaces/notification.interface';

/**
 * DTO for sending a notification (internal/admin use).
 */
export class SendNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @IsString()
  @IsOptional()
  templateCode?: string;

  @IsString()
  @IsOptional()
  deepLink?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
