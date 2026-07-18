import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@solo-advertiser/types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@solo-advertiser/types';

/**
 * Configuration settings controller.
 * Base path: /api/v1/config/settings
 */
@Controller('config/settings')
export class ConfigurationController {
  constructor(private readonly configService: ConfigurationService) {}

  /**
   * GET /api/v1/config/settings
   * List all configuration settings.
   */
  @Get()
  async listSettings() {
    const settings = await this.configService.findAll();
    return { success: true, data: settings, timestamp: new Date().toISOString() };
  }

  /**
   * GET /api/v1/config/settings/:key
   * Get a specific configuration setting by key.
   */
  @Get(':key')
  async getSetting(@Param('key') key: string) {
    const setting = await this.configService.findByKey(key);
    return { success: true, data: setting, timestamp: new Date().toISOString() };
  }

  /**
   * PATCH /api/v1/config/settings/:key
   * Update a configuration setting value. Super Admin only.
   */
  @Patch(':key')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateConfigDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const updated = await this.configService.update(key, dto, user.sub);
    return { success: true, data: updated, timestamp: new Date().toISOString() };
  }
}
