import { Controller, Get } from '@nestjs/common';

import { AppService, HealthResponse } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  health(): HealthResponse {
    return this.appService.getHealth();
  }

  @Public()
  @Get('ready')
  ready(): HealthResponse {
    return this.appService.getReadiness();
  }

  @Public()
  @Get('live')
  live(): HealthResponse {
    return this.appService.getLiveness();
  }
}
