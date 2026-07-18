import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for suspending or blacklisting a business (requires reason).
 */
export class SuspendBusinessDto {
  @IsNotEmpty()
  @IsString()
  reason!: string;
}
