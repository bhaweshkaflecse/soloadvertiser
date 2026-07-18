import { Injectable } from '@nestjs/common';

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
}

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  getHealth(): HealthResponse {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'soloadvertiser-api',
      version: '0.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  getReadiness(): HealthResponse {
    return {
      ...this.getHealth(),
      status: 'ready',
    };
  }

  getLiveness(): HealthResponse {
    return {
      ...this.getHealth(),
      status: 'alive',
    };
  }
}
