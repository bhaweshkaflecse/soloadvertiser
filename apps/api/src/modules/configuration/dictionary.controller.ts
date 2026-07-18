import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role, JwtPayload } from '@solo-advertiser/types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Dictionary controller — manages reference data (dropdowns, lookup tables).
 * Base path: /api/v1/config/dictionary
 */
@Controller('config/dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  /**
   * GET /api/v1/config/dictionary
   * List all distinct dictionaries.
   */
  @Get()
  async listDictionaries() {
    const dictionaries = await this.dictionaryService.listDictionaries();
    return { success: true, data: dictionaries, timestamp: new Date().toISOString() };
  }

  /**
   * GET /api/v1/config/dictionary/:dictionary
   * Get all items for a specific dictionary.
   */
  @Get(':dictionary')
  async getItems(@Param('dictionary') dictionary: string) {
    const items = await this.dictionaryService.getItems(dictionary);
    return { success: true, data: items, timestamp: new Date().toISOString() };
  }

  /**
   * POST /api/v1/config/dictionary
   * Create a new dictionary item. Super Admin only.
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async createItem(@Body() dto: CreateDictionaryItemDto) {
    const item = await this.dictionaryService.create(dto);
    return { success: true, data: item, timestamp: new Date().toISOString() };
  }

  /**
   * PATCH /api/v1/config/dictionary/:id
   * Update a dictionary item. Super Admin only.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async updateItem(
    @Param('id') id: string,
    @Body() dto: Partial<CreateDictionaryItemDto>,
  ) {
    const updated = await this.dictionaryService.update(id, dto);
    return { success: true, data: updated, timestamp: new Date().toISOString() };
  }
}
