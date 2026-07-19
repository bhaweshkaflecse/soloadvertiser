import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto, CampaignQueryDto, CancelCampaignDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload, Role } from '@soloadvertiser/types';

/**
 * Campaign controller — handles business campaign CRUD and admin lifecycle operations.
 * Base path: /api/v1/campaigns
 */
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  // === BUSINESS SELF-SERVICE ===

  /** POST /api/v1/campaigns — Create a new campaign (DRAFT) */
  @Post()
  @Roles(Role.BUSINESS)
  async createCampaign(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCampaignDto,
  ) {
    // Lookup business by userId
    const campaign = await this.campaignService.createCampaign(user.sub, dto);
    return { success: true, data: campaign, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/campaigns/me — List own campaigns */
  @Get('me')
  @Roles(Role.BUSINESS)
  async listMyCampaigns(
    @CurrentUser() user: JwtPayload,
    @Query() query: CampaignQueryDto,
  ) {
    const result = await this.campaignService.listBusinessCampaigns(user.sub, query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/campaigns/:id — Get campaign detail */
  @Get(':id')
  @Roles(Role.BUSINESS, Role.OPERATIONS_STAFF, Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async getCampaign(@Param('id') id: string) {
    const campaign = await this.campaignService.getCampaignById(id);
    return { success: true, data: campaign, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/campaigns/:id/confirm — Confirm details (Draft → Pending Payment) */
  @Patch(':id/confirm')
  @Roles(Role.BUSINESS)
  async confirmCampaign(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const campaign = await this.campaignService.confirmCampaign(id, user.sub);
    return { success: true, data: campaign, timestamp: new Date().toISOString() };
  }

  /** DELETE /api/v1/campaigns/:id — Cancel draft campaign */
  @Delete(':id')
  @Roles(Role.BUSINESS)
  async cancelDraft(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const campaign = await this.campaignService.cancelDraft(id, user.sub);
    return { success: true, data: campaign, timestamp: new Date().toISOString() };
  }

  // === ADMIN OPERATIONS ===

  /** GET /api/v1/campaigns — List all campaigns (admin filters) */
  @Get()
  @Roles(Role.OPERATIONS_STAFF, Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async listAllCampaigns(@Query() query: CampaignQueryDto) {
    const result = await this.campaignService.listAllCampaigns(query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/campaigns/:id/pause — Pause campaign (Ops Staff+) */
  @Patch(':id/pause')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async pauseCampaign(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('reason') reason?: string,
  ) {
    const campaign = await this.campaignService.pauseCampaign(id, user.sub, reason);
    return { success: true, data: campaign, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/campaigns/:id/resume — Resume paused campaign */
  @Patch(':id/resume')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async resumeCampaign(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const campaign = await this.campaignService.resumeCampaign(id, user.sub);
    return { success: true, data: campaign, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/campaigns/:id/cancel — Cancel campaign (Admin+ for Running) */
  @Patch(':id/cancel')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async cancelCampaign(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CancelCampaignDto,
  ) {
    const campaign = await this.campaignService.cancelCampaign(id, user.sub, dto.reason);
    return { success: true, data: campaign, timestamp: new Date().toISOString() };
  }
}
