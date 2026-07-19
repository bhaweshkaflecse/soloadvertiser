import { Controller, Get, Query } from '@nestjs/common';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  /**
   * GET /api/v1/timeline?entityType=X&entityId=Y — Get timeline for an entity.
   * Supports cursor-based pagination with limit.
   */
  @Get()
  async getTimeline(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.timelineService.getTimeline(
      entityType,
      entityId,
      limit ? parseInt(limit, 10) : 50,
      cursor,
    );
  }
}
