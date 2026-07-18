import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrintPartnerService } from './print-partner.service';
import { CreatePrintPartnerDto, DistributionQueryDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@solo-advertiser/types';

/**
 * Print partner controller.
 * Base path: /api/v1/marketplace/print-partners
 */
@Controller('marketplace/print-partners')
export class PrintPartnerController {
  constructor(private readonly printPartnerService: PrintPartnerService) {}

  /** POST — Register print partner (Super Admin) */
  @Post()
  @Roles(Role.SUPER_ADMIN)
  async createPrintPartner(@Body() dto: CreatePrintPartnerDto) {
    const partner = await this.printPartnerService.createPrintPartner(dto);
    return { success: true, data: partner, timestamp: new Date().toISOString() };
  }

  /** GET — List print partners (Admin) */
  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.OPERATIONS_STAFF)
  async listPrintPartners(@Query() query: DistributionQueryDto) {
    const result = await this.printPartnerService.listPrintPartners(query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  /** GET /nearest — Find nearest capable (Admin) */
  @Get('nearest')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.OPERATIONS_STAFF)
  async findNearest(
    @Query('channelCode') channelCode: string,
    @Query('regionId') regionId?: string,
  ) {
    const partners = await this.printPartnerService.findNearestCapable(
      channelCode, regionId,
    );
    return { success: true, data: partners, timestamp: new Date().toISOString() };
  }

  /** GET /:id — Print partner detail */
  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.OPERATIONS_STAFF)
  async getPrintPartner(@Param('id') id: string) {
    const partner = await this.printPartnerService.getPartnerById(id);
    return { success: true, data: partner, timestamp: new Date().toISOString() };
  }

  /** PATCH /:id — Update print partner (Super Admin) */
  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  async updatePrintPartner(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePrintPartnerDto>,
  ) {
    const partner = await this.printPartnerService.updatePartner(id, dto);
    return { success: true, data: partner, timestamp: new Date().toISOString() };
  }
}
