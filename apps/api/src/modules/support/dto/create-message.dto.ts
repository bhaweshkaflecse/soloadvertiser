import { IsNotEmpty, IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

/**
 * DTO for adding a message to a support ticket.
 */
export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  mediaIds?: string[];
}
