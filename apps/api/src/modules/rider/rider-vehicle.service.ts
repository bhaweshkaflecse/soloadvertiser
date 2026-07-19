import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateVehicleDto } from './dto';
import { ERROR_CODES } from '@soloadvertiser/contracts';
import { RiderService } from './rider.service';

/**
 * Service for managing rider vehicle details.
 */
@Injectable()
export class RiderVehicleService {
  private readonly logger = new Logger(RiderVehicleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly riderService: RiderService,
  ) {}

  /**
   * Create or update vehicle details for a rider.
   */
  async upsertVehicle(userId: string, dto: UpdateVehicleDto) {
    const rider = await this.riderService.getRiderByUserId(userId);

    const existing = await this.prisma.riderVehicle.findUnique({
      where: { riderId: rider.id },
    });

    if (existing) {
      // Update existing vehicle
      const updated = await this.prisma.riderVehicle.update({
        where: { id: existing.id },
        data: {
          vehicleType: dto.vehicleType ?? existing.vehicleType,
          registrationNumber: dto.registrationNumber,
          color: dto.color ?? existing.color,
          makeModel: dto.makeModel ?? existing.makeModel,
        },
      });

      this.logger.log(`Vehicle updated for rider: ${rider.id}`);
      return updated;
    }

    // Create new vehicle
    const vehicle = await this.prisma.riderVehicle.create({
      data: {
        riderId: rider.id,
        vehicleType: dto.vehicleType || 'motorcycle',
        registrationNumber: dto.registrationNumber,
        color: dto.color || null,
        makeModel: dto.makeModel || null,
      },
    });

    this.logger.log(`Vehicle created for rider: ${rider.id}`);
    return vehicle;
  }

  /**
   * Get vehicle for a rider by userId.
   */
  async getVehicleByUserId(userId: string) {
    const rider = await this.riderService.getRiderByUserId(userId);

    const vehicle = await this.prisma.riderVehicle.findUnique({
      where: { riderId: rider.id },
    });

    if (!vehicle) {
      throw new NotFoundException({
        code: ERROR_CODES.RESOURCE.NOT_FOUND,
        message: 'Vehicle not found',
      });
    }

    return vehicle;
  }
}
