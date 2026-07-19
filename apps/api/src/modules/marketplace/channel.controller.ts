import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ReadinessService } from './readiness.service';
import { CreateChannelDto, ChannelQueryDto, ActivateChannelDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload, Role } from '@soloadvertiser/types';

/**
 * Channel controller — manages advertising channel CRUD and lifecycle.
 * Base path: /api/v1/marketplace/channels
 */
@Controller('marketplace')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly readinessService: ReadinessService,
  ) {}

  /** GET /api/v1/marketplace/channels — List all channels (public) */
  @Get('channels')
  @Public()
  async listChannels(@Query() query: ChannelQueryDto) {
    const result = await this.channelService.listChannels(query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/marketplace/channels/:id — Channel detail (public) */
  @Get('channels/:id')
  @Public()
  async getChannel(@Param('id') id: string) {
    const channel = await this.channelService.getChannelById(id);
    return { success: true, data: channel, timestamp: new Date().toISOString() };
  }

  /** POST /api/v1/marketplace/channels — Create channel (Super Admin) */
  @Post('channels')
  @Roles(Role.SUPER_ADMIN)
  async createChannel(@Body() dto: CreateChannelDto) {
    const channel = await this.channelService.createChannel(dto);
    return { success: true, data: channel, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/marketplace/channels/:id — Update channel (Super Admin) */
  @Patch('channels/:id')
  @Roles(Role.SUPER_ADMIN)
  async updateChannel(
    @Param('id') id: string,
    @Body() dto: Partial<CreateChannelDto>,
  ) {
    const channel = await this.channelService.updateChannel(id, dto);
    return { success: true, data: channel, timestamp: new Date().toISOString() };
  }

  /** POST /api/v1/marketplace/channels/:id/activate — Activate (Super Admin) */
  @Post('channels/:id/activate')
  @Roles(Role.SUPER_ADMIN)
  async activateChannel(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() _dto: ActivateChannelDto,
  ) {
    const channel = await this.channelService.activateChannel(id, user.sub);
    return { success: true, data: channel, timestamp: new Date().toISOString() };
  }

  /** POST /api/v1/marketplace/channels/:id/pause — Pause (Super Admin) */
  @Post('channels/:id/pause')
  @Roles(Role.SUPER_ADMIN)
  async pauseChannel(@Param('id') id: string) {
    const channel = await this.channelService.pauseChannel(id);
    return { success: true, data: channel, timestamp: new Date().toISOString() };
  }

  /** POST /api/v1/marketplace/channels/:id/retire — Retire (Super Admin) */
  @Post('channels/:id/retire')
  @Roles(Role.SUPER_ADMIN)
  async retireChannel(@Param('id') id: string) {
    const channel = await this.channelService.retireChannel(id);
    return { success: true, data: channel, timestamp: new Date().toISOString() };
  }

  // === ANALYTICS ENDPOINTS ===

  /** GET /api/v1/marketplace/analytics/readiness — All channels readiness (Admin) */
  @Get('analytics/readiness')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getAllReadiness() {
    const results = await this.readinessService.computeAllReadiness();
    return { success: true, data: results, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/marketplace/analytics/readiness/:channelId — Channel readiness detail */
  @Get('analytics/readiness/:channelId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getChannelReadiness(@Param('channelId') channelId: string) {
    const result = await this.readinessService.computeChannelReadiness(channelId);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/marketplace/analytics/demand — Demand intelligence (Admin) */
  @Get('analytics/demand')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getDemandIntelligence() {
    const result = await this.readinessService.getDemandIntelligence();
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/marketplace/analytics/supply — Supply intelligence (Admin) */
  @Get('analytics/supply')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getSupplyIntelligence() {
    const result = await this.readinessService.getSupplyIntelligence();
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }
}
