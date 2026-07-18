/**
 * Emitted when an assignment is removed (rider removed from campaign).
 * RULE-ASN-006: Triggers replacement notification.
 */
export class AssignmentRemovedEvent {
  static readonly EVENT_NAME = 'assignment.removed';

  constructor(
    public readonly assignmentId: string,
    public readonly campaignId: string,
    public readonly riderId: string,
    public readonly reason: string,
    public readonly removedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
