import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TemplateVariables } from './interfaces/notification.interface';
import { ERROR_CODES } from '@soloadvertiser/contracts';

export interface RenderedNotification {
  templateId: string;
  title: string;
  body: string;
}

@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger(NotificationTemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Render a template with variables, returning the rendered title and body.
   * Returns null if template not found.
   */
  async render(
    code: string,
    variables: TemplateVariables,
    channel: string = 'in_app',
    language: string = 'en',
  ): Promise<RenderedNotification | null> {
    // Fetch latest active version of the template
    const template = await this.prisma.notificationTemplate.findFirst({
      where: { code, channel, language, isActive: true },
      orderBy: { version: 'desc' },
    });

    if (!template) {
      this.logger.warn(`No active template found: code=${code}, channel=${channel}, lang=${language}`);
      return null;
    }

    // Replace {{variable}} placeholders
    const title = this.interpolate(template.title, variables);
    const body = this.interpolate(template.body, variables);

    return { templateId: template.id, title, body };
  }

  /**
   * List all templates (admin endpoint).
   */
  async listTemplates(page: number = 1, pageSize: number = 50) {
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.notificationTemplate.findMany({
        orderBy: [{ code: 'asc' }, { version: 'desc' }],
        skip,
        take: pageSize,
      }),
      this.prisma.notificationTemplate.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Create a new notification template.
   */
  async createTemplate(data: {
    code: string;
    channel: string;
    language?: string;
    title: string;
    body: string;
    variables?: string[];
    createdBy?: string;
  }) {
    // Auto-increment version for same code/channel/language
    const latest = await this.prisma.notificationTemplate.findFirst({
      where: { code: data.code, channel: data.channel, language: data.language || 'en' },
      orderBy: { version: 'desc' },
    });

    const version = (latest?.version ?? 0) + 1;

    return this.prisma.notificationTemplate.create({
      data: {
        code: data.code,
        channel: data.channel,
        language: data.language || 'en',
        title: data.title,
        body: data.body,
        variables: data.variables || [],
        version,
        createdBy: data.createdBy,
      },
    });
  }

  /**
   * Update an existing template (deactivates it and creates new version, or updates in-place).
   */
  async updateTemplate(
    id: string,
    data: { title?: string; body?: string; variables?: string[]; isActive?: boolean },
  ) {
    const template = await this.prisma.notificationTemplate.findUnique({ where: { id } });
    if (!template) {
      throw new NotFoundException(ERROR_CODES.NOTIFICATION.TEMPLATE_NOT_FOUND);
    }

    return this.prisma.notificationTemplate.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.body !== undefined && { body: data.body }),
        ...(data.variables !== undefined && { variables: data.variables }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  /**
   * Simple template interpolation: replaces {{varName}} with variable values.
   */
  private interpolate(template: string, variables: TemplateVariables): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = variables[key];
      return value !== null && value !== undefined ? String(value) : '';
    });
  }
}
