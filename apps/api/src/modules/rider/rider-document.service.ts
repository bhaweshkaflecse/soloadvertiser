import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitDocumentDto } from './dto';
import { ReviewAction } from './dto/review-document.dto';
import { ERROR_CODES } from '@solo-advertiser/contracts';
import { RiderStatus } from '@solo-advertiser/types';
import { REQUIRED_DOCUMENT_TYPES } from './interfaces/rider.interface';
import { RiderService } from './rider.service';

/**
 * Service for rider document management — submission, review, and status tracking.
 * Handles auto-transitions:
 * - First document submitted → DOCUMENTS_PENDING
 * - All 4 required documents submitted → VERIFICATION_PENDING
 */
@Injectable()
export class RiderDocumentService {
  private readonly logger = new Logger(RiderDocumentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly riderService: RiderService,
  ) {}

  /**
   * Submit a document for a rider. Auto-transitions rider status.
   */
  async submitDocument(userId: string, dto: SubmitDocumentDto) {
    const rider = await this.riderService.getRiderByUserId(userId);

    const document = await this.prisma.riderDocument.create({
      data: {
        riderId: rider.id,
        documentType: dto.documentType,
        mediaId: dto.mediaId,
        status: 'UPLOADED',
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      },
    });

    this.logger.log(`Document submitted: ${document.id} (type: ${dto.documentType}) for rider: ${rider.id}`);

    // Auto-transition: PRE_REGISTERED → DOCUMENTS_PENDING on first document
    if (rider.status === 'PRE_REGISTERED') {
      await this.riderService.transitionStatus(
        rider.id,
        RiderStatus.DOCUMENTS_PENDING,
        'First document submitted',
        rider.userId,
      );
    }

    // Check if all required documents are now submitted
    await this.checkAllDocumentsSubmitted(rider.id, rider.status as RiderStatus);

    return document;
  }

  /**
   * Get all documents for a rider (self-service by userId).
   */
  async getDocumentsByUserId(userId: string) {
    const rider = await this.riderService.getRiderByUserId(userId);
    return this.getDocumentsByRiderId(rider.id);
  }

  /**
   * Get all documents for a rider by riderId (admin).
   */
  async getDocumentsByRiderId(riderId: string) {
    return this.prisma.riderDocument.findMany({
      where: { riderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Approve a specific document.
   */
  async approveDocument(riderId: string, documentId: string, reviewerId: string) {
    const document = await this.getDocument(riderId, documentId);

    const updated = await this.prisma.riderDocument.update({
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
    riderId: string,
    documentId: string,
    reviewerId: string,
    reason?: string,
  ) {
    const document = await this.getDocument(riderId, documentId);

    const updated = await this.prisma.riderDocument.update({
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
   * Check if all 4 required documents are submitted. If so, auto-transition to VERIFICATION_PENDING.
   */
  private async checkAllDocumentsSubmitted(riderId: string, currentStatus: RiderStatus) {
    if (currentStatus !== 'DOCUMENTS_PENDING' && currentStatus !== 'PRE_REGISTERED') {
      return;
    }

    const documents = await this.prisma.riderDocument.findMany({
      where: { riderId },
    });

    const submittedTypes = new Set(documents.map((d) => d.documentType));
    const allRequired = REQUIRED_DOCUMENT_TYPES.every((type) =>
      submittedTypes.has(type),
    );

    if (allRequired) {
      // Only transition if currently in DOCUMENTS_PENDING
      const rider = await this.prisma.rider.findUnique({ where: { id: riderId } });
      if (rider && rider.status === 'DOCUMENTS_PENDING') {
        await this.riderService.transitionStatus(
          riderId,
          RiderStatus.VERIFICATION_PENDING,
          'All required documents submitted',
          rider.userId,
        );
        this.logger.log(`Rider ${riderId} auto-transitioned to VERIFICATION_PENDING`);
      }
    }
  }

  /**
   * Get a specific document, verifying it belongs to the rider.
   */
  private async getDocument(riderId: string, documentId: string) {
    const document = await this.prisma.riderDocument.findFirst({
      where: { id: documentId, riderId },
    });

    if (!document) {
      throw new NotFoundException({
        code: ERROR_CODES.RIDER.DOCUMENT_NOT_FOUND,
        message: 'Document not found',
      });
    }

    return document;
  }
}
