import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationListenerService } from './notification-listener.service';
import { PushService } from './push.service';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationTemplateService,
    NotificationListenerService,
    PushService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
