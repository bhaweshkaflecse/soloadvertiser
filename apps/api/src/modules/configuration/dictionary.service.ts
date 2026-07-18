import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { ERROR_CODES } from '@solo-advertiser/contracts';

/**
 * Dictionary service — manages lookup/reference data used across the platform.
 * Examples: vehicle_types, ad_categories, regions, etc.
 */
@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all distinct dictionary names.
   */
  async listDictionaries(): Promise<string[]> {
    const results = await this.prisma.dictionaryItem.findMany({
      select: { dictionary: true },
      distinct: ['dictionary'],
      orderBy: { dictionary: 'asc' },
    });

    return results.map((r) => r.dictionary);
  }

  /**
   * Get all items for a specific dictionary, ordered by sortOrder.
   */
  async getItems(dictionary: string) {
    const items = await this.prisma.dictionaryItem.findMany({
      where: { dictionary, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (items.length === 0) {
      throw new NotFoundException({
        code: ERROR_CODES.CONFIG.DICTIONARY_NOT_FOUND,
        message: `Dictionary "${dictionary}" not found or has no active items`,
      });
    }

    return items;
  }

  /**
   * Create a new dictionary item.
   */
  async create(dto: CreateDictionaryItemDto) {
    // Check for duplicate within the same dictionary
    const existing = await this.prisma.dictionaryItem.findFirst({
      where: { dictionary: dto.dictionary, code: dto.code },
    });

    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.CONFIG.DUPLICATE_DICTIONARY_ENTRY,
        message: `Entry with code "${dto.code}" already exists in dictionary "${dto.dictionary}"`,
      });
    }

    const item = await this.prisma.dictionaryItem.create({
      data: {
        dictionary: dto.dictionary,
        code: dto.code,
        label: dto.label,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
        metadata: dto.metadata as any,
        regionId: dto.regionId,
      },
    });

    this.logger.log(`Dictionary item created: ${dto.dictionary}/${dto.code}`);
    return item;
  }

  /**
   * Update an existing dictionary item.
   */
  async update(id: string, dto: Partial<CreateDictionaryItemDto>) {
    const existing = await this.prisma.dictionaryItem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException({
        code: ERROR_CODES.CONFIG.DICTIONARY_NOT_FOUND,
        message: 'Dictionary item not found',
      });
    }

    const updated = await this.prisma.dictionaryItem.update({
      where: { id },
      data: {
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as any }),
        ...(dto.regionId !== undefined && { regionId: dto.regionId }),
      },
    });

    this.logger.log(`Dictionary item updated: ${id}`);
    return updated;
  }
}
