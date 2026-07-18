import { Module } from '@nestjs/common';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { DictionaryController } from './dictionary.controller';
import { DictionaryService } from './dictionary.service';
import { FeatureFlagController } from './feature-flag.controller';
import { FeatureFlagService } from './feature-flag.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Configuration module — manages platform settings, feature flags, and dictionaries.
 * Super Admin only for write operations; read operations available to authenticated users.
 */
@Module({
  imports: [PrismaModule],
  controllers: [ConfigurationController, DictionaryController, FeatureFlagController],
  providers: [ConfigurationService, DictionaryService, FeatureFlagService],
  exports: [ConfigurationService, FeatureFlagService, DictionaryService],
})
export class ConfigurationModule {}
