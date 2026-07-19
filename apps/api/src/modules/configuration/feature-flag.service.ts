import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@soloadvertiser/contracts';

/**
 * Feature flag service — enables/disables platform features at runtime.
 * Used for gradual rollouts, A/B testing, and kill switches.
 */
@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve all feature flags.
   */
  async findAll() {
    return this.prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Check if a specific feature is enabled.
   */
  async isEnabled(key: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { key },
    });

    return flag?.enabled ?? false;
  }

  /**
   * Toggle a feature flag on/off.
   */
  async toggle(key: string, enabled: boolean, updatedBy: string) {
    const existing = await this.prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!existing) {
      throw new NotFoundException({
        code: ERROR_CODES.CONFIG.FLAG_NOT_FOUND,
        message: `Feature flag "${key}" not found`,
      });
    }

    const flag = await this.prisma.featureFlag.update({
      where: { key },
      data: { enabled, updatedBy },
    });

    this.logger.log(
      `Feature flag "${key}" ${enabled ? 'enabled' : 'disabled'} by user ${updatedBy}`,
    );

    return flag;
  }
}
