import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto, RemoveAssignmentDto, AssignmentQueryDto } from './dto';
import { BulkCreateAssignmentDto } from './dto/create-assignment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload, Role } from '@soloadvertiser/types';

/**
 * Assignment controller — handles admin assignment operations.
 * Base path: /api/v1/assignments
 *
 * RULE-ASN-003: Only Operations Staff+ can create/manage assignments.
 */
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  /** GET /api/v1/assignments — List assignments (filter by campaign, rider, status) */
  @Get()
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async listAssignments(@Query() query: AssignmentQueryDto) {
    const result = await this.assignmentService.listAssignments(query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/assignments/eligible — Get eligible riders for a campaign */
  @Get('eligible')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async getEligibleRiders(@Query('campaignId') campaignId: string) {
    const riders = await this.assignmentService.getEligibleRiders(campaignId);
    return { success: true, data: riders, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/assignments/:id — Get assignment detail */
  @Get(':id')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async getAssignment(@Param('id') id: string) {
    const assignment = await this.assignmentService.getAssignmentById(id);
    return { success: true, data: assignment, timestamp: new Date().toISOString() };
  }

  /** POST /api/v1/assignments — Create assignment (assign rider to campaign) */
  @Post()
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async createAssignment(
    @Body() dto: CreateAssignmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const assignment = await this.assignmentService.createAssignment(dto, user.sub);
    return { success: true, data: assignment, timestamp: new Date().toISOString() };
  }

  /** POST /api/v1/assignments/bulk — Bulk assign riders */
  @Post('bulk')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async bulkCreateAssignments(
    @Body() dto: BulkCreateAssignmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.assignmentService.bulkCreateAssignments(dto, user.sub);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  /** DELETE /api/v1/assignments/:id — Remove assignment (with reason) */
  @Delete(':id')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async removeAssignment(
    @Param('id') id: string,
    @Body() dto: RemoveAssignmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const assignment = await this.assignmentService.removeAssignment(id, dto.reason, user.sub);
    return { success: true, data: assignment, timestamp: new Date().toISOString() };
  }
}
