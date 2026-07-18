import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationQueryDto, UpdatePreferencesDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@solo-advertiser/types';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly templateService: NotificationTemplateService,
  ) {}

  /**
   * GET /api/v1/notifications — List user's notifications (paginated).
   */
  @Get()
  async listNotifications(
    @CurrentUser('sub') userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationService.listForUser(userId, query);
  }

  /**
   * PATCH /api/v1/notifications/:id/read — Mark a single notification as read.
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @CurrentUser('sub') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationService.markAsRead(notificationId, userId);
  }

  /**
   * PATCH /api/v1/notifications/read-all — Mark all notifications as read.
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser('sub') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  /**
   * GET /api/v1/notifications/preferences — Get notification preferences.
   */
  @Get('preferences')
  async getPreferences(@CurrentUser('sub') userId: string) {
    return this.notificationService.getPreferences(userId);
  }

  /**
   * PATCH /api/v1/notifications/preferences — Update notification preferences.
   */
  @Patch('preferences')
  @HttpCode(HttpStatus.OK)
  async updatePreferences(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.notificationService.updatePreferences(userId, dto.preferences);
  }

  // === Template Management (Super Admin) ===

  /**
   * GET /api/v1/notifications/templates — List templates (Super Admin).
   */
  @Get('templates')
  @Roles(Role.SUPER_ADMIN)
  async listTemplates(@Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.templateService.listTemplates(page || 1, pageSize || 50);
  }

  /**
   * POST /api/v1/notifications/templates — Create template (Super Admin).
   */
  @Post('templates')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createTemplate(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      code: string;
      channel: string;
      language?: string;
      title: string;
      body: string;
      variables?: string[];
    },
  ) {
    return this.templateService.createTemplate({ ...body, createdBy: userId });
  }

  /**
   * PATCH /api/v1/notifications/templates/:id — Update template (Super Admin).
   */
  @Patch('templates/:id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateTemplate(
    @Param('id') id: string,
    @Body() body: { title?: string; body?: string; variables?: string[]; isActive?: boolean },
  ) {
    return this.templateService.updateTemplate(id, body);
  }
}
