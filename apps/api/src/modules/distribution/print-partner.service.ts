import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrintPartnerDto, DistributionQueryDto } from './dto';

/**
 * Print partner service — manages print partner CRUD and nearest lookup.
 * Sprint 10 (CTX-017)
 */
@Injectable()
export class PrintPartnerService {
  private readonly logger = new Logger(PrintPartnerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register a print partner.
   */
  async createPrintPartner(dto: CreatePrintPartnerDto) {
    const partner = await this.prisma.printPartner.create({
      data: {
        name: dto.name,
        contactPerson: dto.contactPerson || null,
        phone: dto.phone,
        email: dto.email || null,
        regionId: dto.regionId,
        zoneId: dto.zoneId,
        gpsLat: dto.gpsLat || null,
        gpsLng: dto.gpsLng || null,
        supportedChannels: dto.supportedChannels,
        capabilities: dto.capabilities,
        maxDailyCapacity: dto.maxDailyCapacity,
        workingHours: dto.workingHours,
        leadTimeDays: dto.leadTimeDays || 3,
        status: 'active',
      },
    });

    this.logger.log(`Print partner registered: ${partner.id}`);
    return partner;
  }

  /**
   * List print partners with filtering.
   */
  async listPrintPartners(query: DistributionQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query.regionId) where.regionId = query.regionId;
    if (query.zoneId) where.zoneId = query.zoneId;
    if (query.status) where.status = query.status;
    if (query.channelCode) {
      where.supportedChannels = { has: query.channelCode };
    }

    const [partners, total] = await Promise.all([
      this.prisma.printPartner.findMany({
        where, skip, take: pageSize,
        orderBy: { qualityRating: 'desc' },
      }),
      this.prisma.printPartner.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return {
      data: partners,
      meta: { total, page, pageSize, totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get print partner by ID.
   */
  async getPartnerById(id: string) {
    const partner = await this.prisma.printPartner.findUnique({
      where: { id },
    });
    if (!partner) {
      throw new NotFoundException('Print partner not found');
    }
    return partner;
  }

  /**
   * Update print partner.
   */
  async updatePartner(id: string, data: Partial<CreatePrintPartnerDto>) {
    await this.getPartnerById(id);
    const updated = await this.prisma.printPartner.update({
      where: { id },
      data,
    });
    this.logger.log(`Print partner updated: ${id}`);
    return updated;
  }

  /**
   * Find nearest capable print partners for a channel.
   */
  async findNearestCapable(channelCode: string, regionId?: string) {
    const where: any = {
      status: 'active',
      supportedChannels: { has: channelCode },
    };
    if (regionId) where.regionId = regionId;

    const partners = await this.prisma.printPartner.findMany({
      where,
      orderBy: { qualityRating: 'desc' },
      take: 10,
    });

    return partners;
  }
}
