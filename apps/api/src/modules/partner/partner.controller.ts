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
import { PartnerService } from './partner.service';
import { SubmitEnrollmentDto, VerifyEnrollmentDto, EnrollmentQueryDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload, Role } from '@soloadvertiser/types';

/**
 * Partner enrollment controller — handles partner enrollment lifecycle.
 * Base path: /api/v1/marketplace/partner-enrollments
 */
@Controller('marketplace/partner-enrollments')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  /** POST — Submit enrollment (Partner/Rider) */
  @Post()
  @Roles(Role.RIDER)
  async submitEnrollment(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitEnrollmentDto,
  ) {
    const enrollment = await this.partnerService.submitEnrollment(user.sub, dto);
    return { success: true, data: enrollment, timestamp: new Date().toISOString() };
  }

  /** GET — List enrollments (Partner own / Admin all) */
  @Get()
  @Roles(Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN, Role.OPERATIONS_STAFF)
  async listEnrollments(
    @CurrentUser() user: JwtPayload,
    @Query() query: EnrollmentQueryDto,
  ) {
    const isPartner = user.role === Role.RIDER;
    const result = await this.partnerService.listEnrollments({
      ...query,
      userId: isPartner ? user.sub : undefined,
    });
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  /** GET /:id — Enrollment detail */
  @Get(':id')
  @Roles(Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN, Role.OPERATIONS_STAFF)
  async getEnrollment(@Param('id') id: string) {
    const enrollment = await this.partnerService.getEnrollmentById(id);
    return { success: true, data: enrollment, timestamp: new Date().toISOString() };
  }

  /** PATCH /:id/verify — Verify enrollment (Admin) */
  @Patch(':id/verify')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.OPERATIONS_STAFF)
  async verifyEnrollment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const enrollment = await this.partnerService.verifyEnrollment(id, user.sub);
    return { success: true, data: enrollment, timestamp: new Date().toISOString() };
  }

  /** PATCH /:id/reject — Reject enrollment (Admin) */
  @Patch(':id/reject')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.OPERATIONS_STAFF)
  async rejectEnrollment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: VerifyEnrollmentDto,
  ) {
    const enrollment = await this.partnerService.rejectEnrollment(
      id, user.sub, dto.rejectionReason,
    );
    return { success: true, data: enrollment, timestamp: new Date().toISOString() };
  }

  /** DELETE /:id — Withdraw enrollment (Partner) */
  @Delete(':id')
  @Roles(Role.RIDER)
  async withdrawEnrollment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const enrollment = await this.partnerService.withdrawEnrollment(id, user.sub);
    return { success: true, data: enrollment, timestamp: new Date().toISOString() };
  }
}
