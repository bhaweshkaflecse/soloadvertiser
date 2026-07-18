import { Module } from '@nestjs/common';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';
import { TimelineListenerService } from './timeline-listener.service';

@Module({
  controllers: [TimelineController],
  providers: [TimelineService, TimelineListenerService],
  exports: [TimelineService],
})
export class TimelineModule {}
