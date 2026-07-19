import { IsBoolean } from 'class-validator';

/**
 * DTO for toggling a feature flag.
 */
export class ToggleFeatureFlagDto {
  @IsBoolean()
  enabled: boolean;
}
