import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import {
  CreateBusinessProfileDto,
  UpdateBusinessProfileDto,
  SuspendBusinessDto,
  BusinessQueryDto,
} from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload, Role } from '@soloadvertiser/types';

/**
 * Business controller — handles business self-service and admin operations.
 * Base path: /api/v1/businesses
 */
@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  // === BUSINESS SELF-SERVICE ===

  /** POST /api/v1/businesses/me — Create business profile */
  @Post('me')
  @Roles(Role.BUSINESS)
  async createProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBusinessProfileDto,
  ) {
    const business = await this.businessService.createBusinessProfile(user.sub, dto);
    return { success: true, data: business, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/businesses/me — Get own business profile */
  @Get('me')
  @Roles(Role.BUSINESS)
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    const business = await this.businessService.getBusinessByUserId(user.sub);
    return { success: true, data: business, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/businesses/me/profile — Update company info */
  @Patch('me/profile')
  @Roles(Role.BUSINESS)
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateBusinessProfileDto,
  ) {
    const business = await this.businessService.updateProfile(user.sub, dto);
    return { success: true, data: business, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/businesses/me/dashboard — Dashboard aggregation */
  @Get('me/dashboard')
  @Roles(Role.BUSINESS)
  async getDashboard(@CurrentUser() user: JwtPayload) {
    const dashboard = await this.businessService.getDashboard(user.sub);
    return { success: true, data: dashboard, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/businesses/me/billing/summary — Billing overview */
  @Get('me/billing/summary')
  @Roles(Role.BUSINESS)
  async getBillingSummary(@CurrentUser() user: JwtPayload) {
    const billing = await this.businessService.getBillingSummary(user.sub);
    return { success: true, data: billing, timestamp: new Date().toISOString() };
  }

  // === ADMIN OPERATIONS ===

  /** GET /api/v1/businesses — List all businesses with filters */
  @Get()
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async listBusinesses(@Query() query: BusinessQueryDto) {
    const result = await this.businessService.listBusinesses(query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/businesses/:id — Get business detail */
  @Get(':id')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async getBusiness(@Param('id') id: string) {
    const business = await this.businessService.getBusinessById(id);
    return { success: true, data: business, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/businesses/:id/verify — Verify business (Under Review → Verified) */
  @Patch(':id/verify')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async verifyBusiness(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const business = await this.businessService.verifyBusiness(id, user.sub);
    return { success: true, data: business, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/businesses/:id/reject — Reject docs (→ Documents Pending) */
  @Patch(':id/reject')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async rejectBusiness(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('reason') reason?: string,
  ) {
    const business = await this.businessService.rejectBusiness(id, user.sub, reason);
    return { success: true, data: business, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/businesses/:id/suspend — Suspend business (Ops Staff+) */
  @Patch(':id/suspend')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async suspendBusiness(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SuspendBusinessDto,
  ) {
    const business = await this.businessService.suspendBusiness(id, user.sub, dto.reason);
    return { success: true, data: business, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/businesses/:id/reactivate — Reactivate (Admin+) */
  @Patch(':id/reactivate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async reactivateBusiness(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const business = await this.businessService.reactivateBusiness(id, user.sub);
    return { success: true, data: business, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/businesses/:id/blacklist — Blacklist permanently (Super Admin only) */
  @Patch(':id/blacklist')
  @Roles(Role.SUPER_ADMIN)
  async blacklistBusiness(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SuspendBusinessDto,
  ) {
    const business = await this.businessService.blacklistBusiness(id, user.sub, dto.reason);
    return { success: true, data: business, timestamp: new Date().toISOString() };
  }
}
