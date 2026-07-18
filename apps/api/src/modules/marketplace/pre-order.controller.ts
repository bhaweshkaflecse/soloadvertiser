import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PreOrderService } from './pre-order.service';
import { SubmitPreOrderDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload, Role } from '@solo-advertiser/types';

/**
 * Pre-order controller — handles business pre-orders for non-live channels.
 * Base path: /api/v1/marketplace/pre-orders
 */
@Controller('marketplace/pre-orders')
export class PreOrderController {
  constructor(private readonly preOrderService: PreOrderService) {}

  /** POST /api/v1/marketplace/pre-orders — Submit pre-order (Business) */
  @Post()
  @Roles(Role.BUSINESS)
  async submitPreOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitPreOrderDto,
  ) {
    const preOrder = await this.preOrderService.submitPreOrder(user.sub, dto);
    return { success: true, data: preOrder, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/marketplace/pre-orders — List pre-orders (Business own / Admin all) */
  @Get()
  @Roles(Role.BUSINESS, Role.ADMIN, Role.SUPER_ADMIN, Role.OPERATIONS_STAFF)
  async listPreOrders(
    @CurrentUser() user: JwtPayload,
    @Query('channelId') channelId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const isBusiness = user.role === Role.BUSINESS;
    const result = await this.preOrderService.listPreOrders({
      businessId: isBusiness ? user.sub : undefined,
      channelId,
      status,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  /** GET /api/v1/marketplace/pre-orders/:id — Pre-order detail */
  @Get(':id')
  @Roles(Role.BUSINESS, Role.ADMIN, Role.SUPER_ADMIN, Role.OPERATIONS_STAFF)
  async getPreOrder(@Param('id') id: string) {
    const preOrder = await this.preOrderService.getPreOrderById(id);
    return { success: true, data: preOrder, timestamp: new Date().toISOString() };
  }

  /** DELETE /api/v1/marketplace/pre-orders/:id — Cancel pre-order (Business) */
  @Delete(':id')
  @Roles(Role.BUSINESS)
  async cancelPreOrder(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const preOrder = await this.preOrderService.cancelPreOrder(id, user.sub);
    return { success: true, data: preOrder, timestamp: new Date().toISOString() };
  }
}
