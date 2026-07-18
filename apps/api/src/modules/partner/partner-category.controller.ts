import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PartnerCategoryService } from './partner-category.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@solo-advertiser/types';

/**
 * Partner category controller — manages partner category CRUD.
 * Base path: /api/v1/marketplace/partner-categories
 */
@Controller('marketplace/partner-categories')
export class PartnerCategoryController {
  constructor(private readonly categoryService: PartnerCategoryService) {}

  /** GET — List categories (public) */
  @Get()
  @Public()
  async listCategories() {
    const categories = await this.categoryService.listCategories();
    return { success: true, data: categories, timestamp: new Date().toISOString() };
  }

  /** POST — Create category (Super Admin) */
  @Post()
  @Roles(Role.SUPER_ADMIN)
  async createCategory(@Body() dto: any) {
    const category = await this.categoryService.createCategory(dto);
    return { success: true, data: category, timestamp: new Date().toISOString() };
  }

  /** PATCH /:id — Update category (Super Admin) */
  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  async updateCategory(@Param('id') id: string, @Body() dto: any) {
    const category = await this.categoryService.updateCategory(id, dto);
    return { success: true, data: category, timestamp: new Date().toISOString() };
  }
}
