import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '@solo-advertiser/types';

/**
 * Support controller (CTX-013) — CRUD for support tickets and messages.
 * Base path: /api/v1/support
 */
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  /**
   * POST /api/v1/support/tickets
   * Create a new support ticket (any authenticated user).
   */
  @Post('tickets')
  async createTicket(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTicketDto,
  ) {
    const ticket = await this.supportService.createTicket(user.sub, dto);
    return {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/v1/support/tickets
   * List tickets (own for Rider/Business, all for Staff).
   */
  @Get('tickets')
  async listTickets(
    @CurrentUser() user: JwtPayload,
    @Query() query: TicketQueryDto,
  ) {
    const result = await this.supportService.listTickets(
      user.sub,
      user.role as string,
      query,
    );
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/v1/support/tickets/:id
   * Get ticket detail with messages.
   */
  @Get('tickets/:id')
  async getTicketDetail(
    @CurrentUser() user: JwtPayload,
    @Param('id') ticketId: string,
  ) {
    const ticket = await this.supportService.getTicketDetail(
      ticketId,
      user.sub,
      user.role as string,
    );
    return {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * POST /api/v1/support/tickets/:id/messages
   * Add a message to a ticket.
   */
  @Post('tickets/:id/messages')
  async addMessage(
    @CurrentUser() user: JwtPayload,
    @Param('id') ticketId: string,
    @Body() dto: CreateMessageDto,
  ) {
    const message = await this.supportService.addMessage(
      ticketId,
      user.sub,
      user.role as string,
      dto,
    );
    return {
      success: true,
      data: message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * PATCH /api/v1/support/tickets/:id/assign
   * Assign ticket to a staff member (Ops Staff+).
   */
  @Patch('tickets/:id/assign')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_STAFF')
  async assignTicket(
    @CurrentUser() user: JwtPayload,
    @Param('id') ticketId: string,
    @Body() body: { assigneeId: string },
  ) {
    const ticket = await this.supportService.assignTicket(
      ticketId,
      body.assigneeId,
      user.sub,
    );
    return {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * PATCH /api/v1/support/tickets/:id/resolve
   * Resolve a ticket (Ops Staff+).
   */
  @Patch('tickets/:id/resolve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_STAFF')
  async resolveTicket(
    @CurrentUser() user: JwtPayload,
    @Param('id') ticketId: string,
  ) {
    const ticket = await this.supportService.resolveTicket(
      ticketId,
      user.sub,
    );
    return {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * PATCH /api/v1/support/tickets/:id/close
   * Close a ticket (any authenticated user for their own, staff for any).
   */
  @Patch('tickets/:id/close')
  async closeTicket(
    @CurrentUser() user: JwtPayload,
    @Param('id') ticketId: string,
  ) {
    const ticket = await this.supportService.closeTicket(
      ticketId,
      user.sub,
    );
    return {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    };
  }
}
