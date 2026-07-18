import { Controller, Get } from '@nestjs/common';

import { AppService, HealthResponse } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health(): HealthResponse {
    return this.appService.getHealth();
  }

  @Get('ready')
  ready(): HealthResponse {
    return this.appService.getReadiness();
  }

  @Get('live')
  live(): HealthResponse {
    return this.appService.getLiveness();
  }
}
