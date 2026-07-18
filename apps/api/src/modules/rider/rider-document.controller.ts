import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RiderDocumentService } from './rider-document.service';
import { SubmitDocumentDto, ReviewDocumentDto, ReviewAction } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload, Role } from '@solo-advertiser/types';

/**
 * Rider document controller — self-service submission + admin review.
 */
@Controller('riders')
export class RiderDocumentController {
  constructor(private readonly documentService: RiderDocumentService) {}


  // === RIDER SELF-SERVICE ===

  /** POST /api/v1/riders/me/documents — Submit a document */
  @Post('me/documents')
  @Roles(Role.RIDER)
  async submitDocument(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitDocumentDto,
  ) {
    const doc = await this.documentService.submitDocument(user.sub, dto);
    return { success: true, data: doc, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/riders/me/documents — List own documents */
  @Get('me/documents')
  @Roles(Role.RIDER)
  async getMyDocuments(@CurrentUser() user: JwtPayload) {
    const docs = await this.documentService.getDocumentsByUserId(user.sub);
    return { success: true, data: docs, timestamp: new Date().toISOString() };
  }

  // === ADMIN OPERATIONS ===

  /** GET /api/v1/riders/:id/documents — List rider documents */
  @Get(':id/documents')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async getRiderDocuments(@Param('id') riderId: string) {
    const docs = await this.documentService.getDocumentsByRiderId(riderId);
    return { success: true, data: docs, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/riders/:id/documents/:docId/approve — Approve document */
  @Patch(':id/documents/:docId/approve')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async approveDocument(
    @Param('id') riderId: string,
    @Param('docId') docId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const doc = await this.documentService.approveDocument(
      riderId,
      docId,
      user.sub,
    );
    return { success: true, data: doc, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/riders/:id/documents/:docId/reject — Reject document */
  @Patch(':id/documents/:docId/reject')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async rejectDocument(
    @Param('id') riderId: string,
    @Param('docId') docId: string,
    @CurrentUser() user: JwtPayload,
    @Body('reason') reason?: string,
  ) {
    const doc = await this.documentService.rejectDocument(
      riderId,
      docId,
      user.sub,
      reason,
    );
    return { success: true, data: doc, timestamp: new Date().toISOString() };
  }
}
