import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@solo-advertiser/contracts';

/**
 * Partner category service — manages partner category CRUD.
 * Sprint 10 (CTX-016)
 */
@Injectable()
export class PartnerCategoryService {
  private readonly logger = new Logger(PartnerCategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all active partner categories.
   */
  async listCategories() {
    return this.prisma.partnerCategory.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Get category by ID.
   */
  async getCategoryById(id: string) {
    const category = await this.prisma.partnerCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException({
        code: ERROR_CODES.MARKETPLACE.PARTNER_CATEGORY_NOT_FOUND,
        message: 'Partner category not found',
      });
    }

    return category;
  }

  /**
   * Create a new partner category.
   */
  async createCategory(data: {
    code: string;
    name: string;
    description?: string;
    superCategory: string;
    channelsServed: string[];
    enrollmentFields: Record<string, unknown>;
    verificationMethod: string;
    minRequirements?: Record<string, unknown>;
  }) {
    const category = await this.prisma.partnerCategory.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null,
        superCategory: data.superCategory,
        channelsServed: data.channelsServed,
        enrollmentFields: data.enrollmentFields,
        verificationMethod: data.verificationMethod,
        minRequirements: data.minRequirements || {},
      },
    });

    this.logger.log(`Partner category created: ${category.code}`);
    return category;
  }

  /**
   * Update a partner category.
   */
  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      channelsServed: string[];
      enrollmentFields: Record<string, unknown>;
      verificationMethod: string;
      isActive: boolean;
      minRequirements: Record<string, unknown>;
    }>,
  ) {
    await this.getCategoryById(id);

    const updated = await this.prisma.partnerCategory.update({
      where: { id },
      data,
    });

    this.logger.log(`Partner category updated: ${updated.code}`);
    return updated;
  }
}
