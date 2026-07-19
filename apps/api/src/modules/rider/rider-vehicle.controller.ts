import { Body, Controller, Get, Patch } from '@nestjs/common';
import { RiderVehicleService } from './rider-vehicle.service';
import { UpdateVehicleDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload, Role } from '@soloadvertiser/types';

/**
 * Rider vehicle controller — self-service vehicle management.
 */
@Controller('riders')
export class RiderVehicleController {
  constructor(private readonly vehicleService: RiderVehicleService) {}

  /** PATCH /api/v1/riders/me/vehicle — Update vehicle details */
  @Patch('me/vehicle')
  @Roles(Role.RIDER)
  async updateVehicle(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateVehicleDto,
  ) {
    const vehicle = await this.vehicleService.upsertVehicle(user.sub, dto);
    return {
      success: true,
      data: vehicle,
      timestamp: new Date().toISOString(),
    };
  }

  /** GET /api/v1/riders/me/vehicle — Get vehicle details */
  @Get('me/vehicle')
  @Roles(Role.RIDER)
  async getMyVehicle(@CurrentUser() user: JwtPayload) {
    const vehicle = await this.vehicleService.getVehicleByUserId(user.sub);
    return {
      success: true,
      data: vehicle,
      timestamp: new Date().toISOString(),
    };
  }
}
