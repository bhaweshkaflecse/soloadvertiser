import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCenterDto, DistributionQueryDto } from './dto';

/**
 * Distribution center service — manages distribution center CRUD.
 * Sprint 10 (CTX-017)
 */
@Injectable()
export class DistributionCenterService {
  private readonly logger = new Logger(DistributionCenterService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a distribution center.
   */
  async createCenter(dto: CreateCenterDto) {
    const center = await this.prisma.distributionCenter.create({
      data: {
        name: dto.name,
        type: dto.type,
        regionId: dto.regionId,
        zoneId: dto.zoneId,
        wardId: dto.wardId || null,
        address: dto.address,
        gpsLat: dto.gpsLat || null,
        gpsLng: dto.gpsLng || null,
        supportedChannels: dto.supportedChannels,
        operatingHours: dto.operatingHours,
        capacityPerHour: dto.capacityPerHour,
        contactPhone: dto.contactPhone || null,
        managerUserId: dto.managerUserId || null,
        status: 'active',
      },
    });

    this.logger.log(`Distribution center created: ${center.id}`);
    return center;
  }

  /**
   * List distribution centers with filtering.
   */
  async listCenters(query: DistributionQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.regionId) where.regionId = query.regionId;
    if (query.zoneId) where.zoneId = query.zoneId;
    if (query.status) where.status = query.status;
    if (query.channelCode) {
      where.supportedChannels = { has: query.channelCode };
    }

    const [centers, total] = await Promise.all([
      this.prisma.distributionCenter.findMany({
        where, skip, take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.distributionCenter.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return {
      data: centers,
      meta: { total, page, pageSize, totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get center by ID.
   */
  async getCenterById(id: string) {
    const center = await this.prisma.distributionCenter.findUnique({
      where: { id },
    });
    if (!center) {
      throw new NotFoundException('Distribution center not found');
    }
    return center;
  }

  /**
   * Update center.
   */
  async updateCenter(id: string, data: Partial<CreateCenterDto>) {
    await this.getCenterById(id);
    const updated = await this.prisma.distributionCenter.update({
      where: { id },
      data,
    });
    this.logger.log(`Distribution center updated: ${id}`);
    return updated;
  }
}
