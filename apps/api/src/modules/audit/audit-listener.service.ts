import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditService } from './audit.service';

/**
 * Wildcard event listener that captures ALL domain events into the audit log.
 * Listens to every event emitted via NestJS EventEmitter and creates audit entries.
 *
 * Event payload convention (domain events should include):
 * - actorId: who performed the action
 * - actorRole: role of the actor
 * - entityType: type of entity affected
 * - entityId: ID of entity affected
 * - beforeState: state before the change (optional)
 * - afterState: state after the change (optional)
 * - reason: reason for the action (optional)
 * - ipAddress: client IP (optional)
 * - deviceInfo: client device info (optional)
 * - metadata: additional context (optional)
 */
@Injectable()
export class AuditListenerService {
  private readonly logger = new Logger(AuditListenerService.name);

  constructor(private readonly auditService: AuditService) {}

  /**
   * Wildcard listener — captures all domain events.
   * Uses the '**' pattern to match all event names emitted in the application.
   */
  @OnEvent('**', { async: true })
  async handleAllEvents(payload: Record<string, any>): Promise<void> {
    try {
      // Skip events that explicitly opt out of auditing
      if (payload?._skipAudit === true) {
        return;
      }

      // Extract the event name from the payload or use a generic identifier
      const eventName = payload?._eventName || payload?.event || 'unknown.event';

      // Extract standard audit fields from the event payload
      const actorId = payload?.actorId || payload?.userId || null;
      const actorRole = payload?.actorRole || payload?.role || null;
      const entityType = payload?.entityType || this.inferEntityType(eventName);
      const entityId = payload?.entityId || payload?.id || null;
      const beforeState = payload?.beforeState || payload?.before || null;
      const afterState = payload?.afterState || payload?.after || null;
      const reason = payload?.reason || null;
      const ipAddress = payload?.ipAddress || payload?.ip || null;
      const deviceInfo = payload?.deviceInfo || payload?.device || null;
      const metadata = payload?.metadata || null;

      await this.auditService.createEntry({
        actorId,
        actorRole,
        action: eventName,
        entityType,
        entityId,
        beforeState,
        afterState,
        reason,
        ipAddress,
        deviceInfo,
        metadata,
      });
    } catch (error) {
      // Audit logging should never break the application flow
      this.logger.error(
        `Failed to create audit entry: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  /**
   * Infer entity type from event name.
   * Convention: events are named like "rider.approved", "campaign.created", etc.
   */
  private inferEntityType(eventName: string): string {
    const parts = eventName.split('.');
    return parts[0] || 'system';
  }
}
