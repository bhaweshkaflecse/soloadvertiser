import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

/**
 * DTO for creating a new support ticket.
 */
export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([
    'account',
    'campaign',
    'payment',
    'assignment',
    'verification',
    'technical',
    'general',
  ])
  category: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  @IsIn(['low', 'normal', 'high', 'urgent'])
  priority?: string;
}
