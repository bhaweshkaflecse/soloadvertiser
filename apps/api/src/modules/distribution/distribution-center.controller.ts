import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DistributionCenterService } from './distribution-center.service';
import { CreateCenterDto, DistributionQueryDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@solo-advertiser/types';

/**
 * Distribution center controller.
 * Base path: /api/v1/marketplace/distribution-centers
 */
@Controller('marketplace/distribution-centers')
export class DistributionCenterController {
  constructor(private readonly centerService: DistributionCenterService) {}

  /** POST — Create center (Super Admin) */
  @Post()
  @Roles(Role.SUPER_ADMIN)
  async createCenter(@Body() dto: CreateCenterDto) {
    const center = await this.centerService.createCenter(dto);
    return { success: true, data: center, timestamp: new Date().toISOString() };
  }

  /** GET — List centers (Admin) */
  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.OPERATIONS_STAFF)
  async listCenters(@Query() query: DistributionQueryDto) {
    const result = await this.centerService.listCenters(query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  /** GET /:id — Center detail */
  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.OPERATIONS_STAFF)
  async getCenter(@Param('id') id: string) {
    const center = await this.centerService.getCenterById(id);
    return { success: true, data: center, timestamp: new Date().toISOString() };
  }

  /** PATCH /:id — Update center (Super Admin) */
  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  async updateCenter(@Param('id') id: string, @Body() dto: Partial<CreateCenterDto>) {
    const center = await this.centerService.updateCenter(id, dto);
    return { success: true, data: center, timestamp: new Date().toISOString() };
  }
}
