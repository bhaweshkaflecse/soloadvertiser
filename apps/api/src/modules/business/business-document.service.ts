import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitBusinessDocumentDto } from './dto';
import { ERROR_CODES } from '@soloadvertiser/contracts';
import { BusinessStatus } from '@soloadvertiser/types';
import { REQUIRED_DOCUMENT_TYPES } from './interfaces/business.interface';
import { BusinessService } from './business.service';

/**
 * Service for business document management — submission, review, and status tracking.
 * Handles auto-transitions:
 * - First document submitted → DOCUMENTS_PENDING
 * - All 3 required documents submitted → UNDER_REVIEW
 */
@Injectable()
export class BusinessDocumentService {
  private readonly logger = new Logger(BusinessDocumentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService,
  ) {}

  /**
   * Submit a document for a business. Auto-transitions business status.
   * RULE-BIZ-008: Blacklisted businesses cannot submit documents.
   */
  async submitDocument(userId: string, dto: SubmitBusinessDocumentDto) {
    const business = await this.businessService.getBusinessByUserId(userId);

    this.assertNotBlacklisted(business.status as BusinessStatus);

    const document = await this.prisma.businessDocument.create({
      data: {
        businessId: business.id,
        documentType: dto.documentType,
        mediaId: dto.mediaId,
        status: 'UPLOADED',
      },
    });

    this.logger.log(`Document submitted: ${document.id} (type: ${dto.documentType}) for business: ${business.id}`);

    // Auto-transition: REGISTERED → DOCUMENTS_PENDING on first document
    if (business.status === 'REGISTERED') {
      await this.businessService.transitionStatus(
        business.id,
        BusinessStatus.DOCUMENTS_PENDING,
        'First document submitted',
        business.userId,
      );
    }

    // Check if all required documents are now submitted
    await this.checkAllDocumentsSubmitted(business.id, business.status as BusinessStatus);

    return document;
  }

  /**
   * Get all documents for a business (self-service by userId).
   */
  async getDocumentsByUserId(userId: string) {
    const business = await this.businessService.getBusinessByUserId(userId);
    return this.getDocumentsByBusinessId(business.id);
  }

  /**
   * Get all documents for a business by businessId (admin).
   */
  async getDocumentsByBusinessId(businessId: string) {
    return this.prisma.businessDocument.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Approve a specific document.
   */
  async approveDocument(businessId: string, documentId: string, reviewerId: string) {
    const document = await this.getDocument(businessId, documentId);

    const updated = await this.prisma.businessDocument.update({
      where: { id: documentId },
      data: {
        status: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });

    this.logger.log(`Document approved: ${documentId} by admin: ${reviewerId}`);
    return updated;
  }

  /**
   * Admin: Reject a specific document with reason.
   */
  async rejectDocument(
    businessId: string,
    documentId: string,
    reviewerId: string,
    reason?: string,
  ) {
    const document = await this.getDocument(businessId, documentId);

    const updated = await this.prisma.businessDocument.update({
      where: { id: documentId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || 'Document rejected',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });

    this.logger.log(`Document rejected: ${documentId} by admin: ${reviewerId}, reason: ${reason}`);
    return updated;
  }

  /**
   * Check if all 3 required documents are submitted. If so, auto-transition to UNDER_REVIEW.
   */
  private async checkAllDocumentsSubmitted(businessId: string, currentStatus: BusinessStatus) {
    if (currentStatus !== 'DOCUMENTS_PENDING' && currentStatus !== 'REGISTERED') {
      return;
    }

    const documents = await this.prisma.businessDocument.findMany({
      where: { businessId },
    });

    const submittedTypes = new Set(documents.map((d) => d.documentType));
    const allRequired = REQUIRED_DOCUMENT_TYPES.every((type) =>
      submittedTypes.has(type),
    );

    if (allRequired) {
      // Only transition if currently in DOCUMENTS_PENDING
      const business = await this.prisma.business.findUnique({ where: { id: businessId } });
      if (business && business.status === 'DOCUMENTS_PENDING') {
        await this.businessService.transitionStatus(
          businessId,
          BusinessStatus.UNDER_REVIEW,
          'All required documents submitted',
          business.userId,
        );
        this.logger.log(`Business ${businessId} auto-transitioned to UNDER_REVIEW`);
      }
    }
  }

  /**
   * Get a specific document, verifying it belongs to the business.
   */
  private async getDocument(businessId: string, documentId: string) {
    const document = await this.prisma.businessDocument.findFirst({
      where: { id: documentId, businessId },
    });

    if (!document) {
      throw new NotFoundException({
        code: ERROR_CODES.BUSINESS.DOCUMENT_NOT_FOUND,
        message: 'Document not found',
      });
    }

    return document;
  }

  /**
   * Assert business is not blacklisted for write operations.
   */
  private assertNotBlacklisted(status: BusinessStatus): void {
    if (status === BusinessStatus.BLACKLISTED) {
      throw new ForbiddenException({
        code: ERROR_CODES.BUSINESS.BLACKLISTED_WRITE_BLOCKED,
        message: 'Blacklisted businesses cannot perform write operations',
      });
    }
  }
}
