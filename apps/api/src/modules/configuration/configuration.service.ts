import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ERROR_CODES } from '@soloadvertiser/contracts';

/**
 * Configuration service — manages platform key-value configuration entries.
 * All settings are stored as JSON values with metadata about their data type.
 */
@Injectable()
export class ConfigurationService {
  private readonly logger = new Logger(ConfigurationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve all configuration entries.
   */
  async findAll() {
    return this.prisma.configEntry.findMany({
      orderBy: { category: 'asc' },
    });
  }

  /**
   * Find a specific configuration entry by key.
   */
  async findByKey(key: string) {
    const entry = await this.prisma.configEntry.findUnique({
      where: { key },
    });

    if (!entry) {
      throw new NotFoundException({
        code: ERROR_CODES.CONFIG.KEY_NOT_FOUND,
        message: `Configuration key "${key}" not found`,
      });
    }

    return entry;
  }

  /**
   * Update a configuration entry value.
   * Only Super Admins can modify configuration.
   */
  async update(key: string, dto: UpdateConfigDto, updatedBy: string) {
    const existing = await this.prisma.configEntry.findUnique({
      where: { key },
    });

    if (!existing) {
      throw new NotFoundException({
        code: ERROR_CODES.CONFIG.KEY_NOT_FOUND,
        message: `Configuration key "${key}" not found`,
      });
    }

    const updated = await this.prisma.configEntry.update({
      where: { key },
      data: {
        value: dto.value as any,
        description: dto.description ?? existing.description,
        updatedBy,
      },
    });

    this.logger.log(`Config updated: ${key} by user ${updatedBy}`);
    return updated;
  }
}
