import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { RELIABILITY_WEIGHTS } from './interfaces/rider.interface';
import { RiderScoreUpdatedEvent } from './events/rider-score-updated.event';

/**
 * Service for computing rider reliability scores.
 * Formula: Verification(30%) + Attendance(25%) + Activity(20%) + Completion(15%) + Response(10%)
 */
@Injectable()
export class RiderScoreService {
  private readonly logger = new Logger(RiderScoreService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}


  /**
   * Compute and persist a new reliability score for a rider.
   * Each component is scored 0-100, then weighted.
   */
  async computeScore(
    riderId: string,
    components: {
      verification: number;
      attendance: number;
      activity: number;
      completion: number;
      response: number;
    },
  ) {
    const composite = Math.round(
      (components.verification * RELIABILITY_WEIGHTS.verification +
        components.attendance * RELIABILITY_WEIGHTS.attendance +
        components.activity * RELIABILITY_WEIGHTS.activity +
        components.completion * RELIABILITY_WEIGHTS.completion +
        components.response * RELIABILITY_WEIGHTS.response) /
        100,
    );

    const score = await this.prisma.reliabilityScore.create({
      data: {
        riderId,
        verification: components.verification,
        attendance: components.attendance,
        activity: components.activity,
        completion: components.completion,
        response: components.response,
        compositeScore: composite,
      },
    });

    // Update the rider's cached composite score
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
    });
    const previousScore = rider?.reliabilityScore ?? 0;

    await this.prisma.rider.update({
      where: { id: riderId },
      data: { reliabilityScore: composite },
    });

    this.logger.log(
      `Reliability score computed for rider ${riderId}: ${composite}`,
    );

    this.eventEmitter.emit(
      RiderScoreUpdatedEvent.EVENT_NAME,
      new RiderScoreUpdatedEvent(riderId, previousScore, composite),
    );

    return score;
  }

  /**
   * Get the latest reliability score for a rider.
   */
  async getLatestScore(riderId: string) {
    return this.prisma.reliabilityScore.findFirst({
      where: { riderId },
      orderBy: { computedAt: 'desc' },
    });
  }

  /**
   * Get score history for a rider.
   */
  async getScoreHistory(riderId: string, limit = 10) {
    return this.prisma.reliabilityScore.findMany({
      where: { riderId },
      orderBy: { computedAt: 'desc' },
      take: limit,
    });
  }
}
