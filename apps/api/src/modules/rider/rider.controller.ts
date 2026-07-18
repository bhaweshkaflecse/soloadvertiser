import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RiderService } from './rider.service';
import { RiderAvailabilityService } from './rider-availability.service';
import {
  CreateRiderProfileDto,
  UpdateRiderProfileDto,
  AssignZoneDto,
  RiderQueryDto,
} from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload, Role } from '@solo-advertiser/types';


/**
 * Rider controller — handles rider self-service and admin operations.
 * Base path: /api/v1/riders
 */
@Controller('riders')
export class RiderController {
  constructor(
    private readonly riderService: RiderService,
    private readonly availabilityService: RiderAvailabilityService,
  ) {}

  // === RIDER SELF-SERVICE ===

  /** POST /api/v1/riders/me — Create rider profile */
  @Post('me')
  @Roles(Role.RIDER)
  async createProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRiderProfileDto,
  ) {
    const rider = await this.riderService.createRiderProfile(user.sub, dto);
    return { success: true, data: rider, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/riders/me — Get own rider profile */
  @Get('me')
  @Roles(Role.RIDER)
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    const rider = await this.riderService.getRiderByUserId(user.sub);
    return { success: true, data: rider, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/riders/me/profile — Update personal info */
  @Patch('me/profile')
  @Roles(Role.RIDER)
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateRiderProfileDto,
  ) {
    const rider = await this.riderService.updateProfile(user.sub, dto);
    return { success: true, data: rider, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/riders/me/zone — Set operating zone */
  @Patch('me/zone')
  @Roles(Role.RIDER)
  async assignZone(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AssignZoneDto,
  ) {
    const rider = await this.availabilityService.assignZone(
      user.sub,
      dto.zoneId,
      dto.regionId,
    );
    return { success: true, data: rider, timestamp: new Date().toISOString() };
  }


  /** PATCH /api/v1/riders/me/availability — Toggle Available/Unavailable */
  @Patch('me/availability')
  @Roles(Role.RIDER)
  async toggleAvailability(@CurrentUser() user: JwtPayload) {
    const rider = await this.availabilityService.toggleAvailability(user.sub);
    return { success: true, data: rider, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/riders/me/dashboard — Dashboard aggregation */
  @Get('me/dashboard')
  @Roles(Role.RIDER)
  async getDashboard(@CurrentUser() user: JwtPayload) {
    const dashboard = await this.riderService.getDashboard(user.sub);
    return { success: true, data: dashboard, timestamp: new Date().toISOString() };
  }

  // === ADMIN OPERATIONS ===

  /** GET /api/v1/riders/eligible — Eligible riders for assignment */
  @Get('eligible')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async getEligibleRiders(
    @Query('zoneId') zoneId?: string,
    @Query('assetType') assetType?: string,
    @Query('minScore') minScore?: string,
  ) {
    const riders = await this.availabilityService.getEligibleRiders(
      zoneId,
      assetType,
      minScore ? parseInt(minScore, 10) : undefined,
    );
    return { success: true, data: riders, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/riders — List all riders with filters */
  @Get()
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async listRiders(@Query() query: RiderQueryDto) {
    const result = await this.riderService.listRiders(query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/riders/:id — Get rider detail */
  @Get(':id')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async getRider(@Param('id') id: string) {
    const rider = await this.riderService.getRiderById(id);
    return { success: true, data: rider, timestamp: new Date().toISOString() };
  }


  /** PATCH /api/v1/riders/:id/approve — Approve rider */
  @Patch(':id/approve')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async approveRider(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const rider = await this.riderService.approveRider(id, user.sub);
    return { success: true, data: rider, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/riders/:id/reject — Reject rider docs */
  @Patch(':id/reject')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async rejectRider(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('reason') reason?: string,
  ) {
    const rider = await this.riderService.rejectRider(id, user.sub, reason);
    return { success: true, data: rider, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/riders/:id/suspend — Suspend rider */
  @Patch(':id/suspend')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async suspendRider(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('reason') reason: string,
  ) {
    const rider = await this.riderService.suspendRider(id, user.sub, reason);
    return { success: true, data: rider, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/riders/:id/reactivate — Reactivate suspended rider */
  @Patch(':id/reactivate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async reactivateRider(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const rider = await this.riderService.reactivateRider(id, user.sub);
    return { success: true, data: rider, timestamp: new Date().toISOString() };
  }
}
