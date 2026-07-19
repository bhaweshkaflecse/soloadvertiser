import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FeatureFlagService } from './feature-flag.service';
import { ToggleFeatureFlagDto } from './dto/toggle-feature-flag.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role, JwtPayload } from '@soloadvertiser/types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Feature flag controller.
 * Base path: /api/v1/config/flags
 */
@Controller('config/flags')
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  /**
   * GET /api/v1/config/flags
   * List all feature flags.
   */
  @Get()
  async listFlags() {
    const flags = await this.featureFlagService.findAll();
    return { success: true, data: flags, timestamp: new Date().toISOString() };
  }

  /**
   * PATCH /api/v1/config/flags/:key
   * Toggle a feature flag. Super Admin only.
   */
  @Patch(':key')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async toggleFlag(
    @Param('key') key: string,
    @Body() dto: ToggleFeatureFlagDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const flag = await this.featureFlagService.toggle(key, dto.enabled, user.sub);
    return { success: true, data: flag, timestamp: new Date().toISOString() };
  }
}
