import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BusinessDocumentService } from './business-document.service';
import { SubmitBusinessDocumentDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload, Role } from '@solo-advertiser/types';

/**
 * Business document controller — self-service submission + admin review.
 */
@Controller('businesses')
export class BusinessDocumentController {
  constructor(private readonly documentService: BusinessDocumentService) {}

  // === BUSINESS SELF-SERVICE ===

  /** POST /api/v1/businesses/me/documents — Submit a document */
  @Post('me/documents')
  @Roles(Role.BUSINESS)
  async submitDocument(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitBusinessDocumentDto,
  ) {
    const doc = await this.documentService.submitDocument(user.sub, dto);
    return { success: true, data: doc, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/businesses/me/documents — List own documents */
  @Get('me/documents')
  @Roles(Role.BUSINESS)
  async getMyDocuments(@CurrentUser() user: JwtPayload) {
    const docs = await this.documentService.getDocumentsByUserId(user.sub);
    return { success: true, data: docs, timestamp: new Date().toISOString() };
  }

  // === ADMIN OPERATIONS ===

  /** GET /api/v1/businesses/:id/documents — List business documents */
  @Get(':id/documents')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async getBusinessDocuments(@Param('id') businessId: string) {
    const docs = await this.documentService.getDocumentsByBusinessId(businessId);
    return { success: true, data: docs, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/businesses/:id/documents/:docId/approve — Approve document */
  @Patch(':id/documents/:docId/approve')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async approveDocument(
    @Param('id') businessId: string,
    @Param('docId') docId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const doc = await this.documentService.approveDocument(
      businessId,
      docId,
      user.sub,
    );
    return { success: true, data: doc, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/businesses/:id/documents/:docId/reject — Reject document */
  @Patch(':id/documents/:docId/reject')
  @Roles(Role.OPERATIONS_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async rejectDocument(
    @Param('id') businessId: string,
    @Param('docId') docId: string,
    @CurrentUser() user: JwtPayload,
    @Body('reason') reason?: string,
  ) {
    const doc = await this.documentService.rejectDocument(
      businessId,
      docId,
      user.sub,
      reason,
    );
    return { success: true, data: doc, timestamp: new Date().toISOString() };
  }
}
