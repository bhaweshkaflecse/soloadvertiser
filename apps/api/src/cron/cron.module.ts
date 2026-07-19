import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';

/**
 * Cron module — registers NestJS schedule module and cron service.
 * All scheduled tasks run on Nepal Standard Time (UTC+5:45).
 */
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
