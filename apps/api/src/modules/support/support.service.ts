import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import {
  TicketStatus,
  VALID_STATUS_TRANSITIONS,
} from './interfaces/support.interface';

/**
 * Support service — manages support tickets and messages.
 * Handles creation, messaging, assignment, resolution, and closure.
 */
@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new support ticket.
   */
  async createTicket(userId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        category: dto.category,
        priority: dto.priority || 'normal',
        status: 'OPEN',
      },
    });

    // Create the initial message
    await this.prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: userId,
        senderRole: 'user',
        content: dto.content,
        mediaIds: [],
      },
    });

    this.eventEmitter.emit('support.ticket.created', {
      _eventName: 'support.ticket.created',
      entityType: 'support_ticket',
      entityId: ticket.id,
      actorId: userId,
      afterState: ticket,
    });

    this.logger.log(`Ticket created: ${ticket.id} by user ${userId}`);

    return ticket;
  }

  /**
   * List tickets with filters and pagination.
   * Regular users see only their own tickets.
   * Staff see all tickets.
   */
  async listTickets(
    userId: string,
    role: string,
    query: TicketQueryDto,
  ) {
    const where: any = {};

    // Non-staff users can only see their own tickets
    const isStaff = [
      'SUPER_ADMIN',
      'ADMIN',
      'OPERATIONS_STAFF',
      'FINANCE_STAFF',
    ].includes(role);

    if (!isStaff) {
      where.userId = userId;
    }

    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.priority) {
      where.priority = query.priority;
    }

    const page = query.page || 1;
    const limit = query.limit || 25;
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get ticket details with all messages.
   */
  async getTicketDetail(ticketId: string, userId: string, role: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Non-staff can only view their own tickets
    const isStaff = [
      'SUPER_ADMIN',
      'ADMIN',
      'OPERATIONS_STAFF',
      'FINANCE_STAFF',
    ].includes(role);

    if (!isStaff && ticket.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return ticket;
  }

  /**
   * Add a message to a ticket.
   */
  async addMessage(
    ticketId: string,
    senderId: string,
    senderRole: string,
    dto: CreateMessageDto,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestException(
        'Cannot add messages to a closed ticket',
      );
    }

    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        senderId,
        senderRole,
        content: dto.content,
        mediaIds: dto.mediaIds || [],
      },
    });

    // If a staff member replies and ticket is OPEN, move to IN_PROGRESS
    const isStaff = [
      'SUPER_ADMIN',
      'ADMIN',
      'OPERATIONS_STAFF',
      'FINANCE_STAFF',
    ].includes(senderRole);

    if (isStaff && ticket.status === 'OPEN') {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // If user replies to AWAITING_RESPONSE, move back to IN_PROGRESS
    if (!isStaff && ticket.status === 'AWAITING_RESPONSE') {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    this.eventEmitter.emit('support.message.created', {
      _eventName: 'support.message.created',
      entityType: 'support_message',
      entityId: message.id,
      actorId: senderId,
      actorRole: senderRole,
      metadata: { ticketId },
    });

    return message;
  }

  /**
   * Assign a ticket to a staff member.
   */
  async assignTicket(
    ticketId: string,
    assigneeId: string,
    assignedBy: string,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
      throw new BadRequestException(
        'Cannot assign a closed or resolved ticket',
      );
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedTo: assigneeId,
        status: 'IN_PROGRESS',
      },
    });

    this.eventEmitter.emit('support.ticket.assigned', {
      _eventName: 'support.ticket.assigned',
      entityType: 'support_ticket',
      entityId: ticketId,
      actorId: assignedBy,
      afterState: { assignedTo: assigneeId },
    });

    return updated;
  }

  /**
   * Resolve a ticket.
   */
  async resolveTicket(ticketId: string, resolvedBy: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    this.validateTransition(
      ticket.status as TicketStatus,
      TicketStatus.RESOLVED,
    );

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });

    this.eventEmitter.emit('support.ticket.resolved', {
      _eventName: 'support.ticket.resolved',
      entityType: 'support_ticket',
      entityId: ticketId,
      actorId: resolvedBy,
      beforeState: { status: ticket.status },
      afterState: { status: 'RESOLVED' },
    });

    return updated;
  }

  /**
   * Close a ticket.
   */
  async closeTicket(ticketId: string, closedBy: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestException('Ticket is already closed');
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    this.eventEmitter.emit('support.ticket.closed', {
      _eventName: 'support.ticket.closed',
      entityType: 'support_ticket',
      entityId: ticketId,
      actorId: closedBy,
      beforeState: { status: ticket.status },
      afterState: { status: 'CLOSED' },
    });

    return updated;
  }

  /**
   * Validate that a status transition is allowed.
   */
  private validateTransition(
    current: TicketStatus,
    target: TicketStatus,
  ): void {
    const allowed = VALID_STATUS_TRANSITIONS[current];
    if (!allowed || !allowed.includes(target)) {
      throw new BadRequestException(
        `Cannot transition from ${current} to ${target}`,
      );
    }
  }
}
