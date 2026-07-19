/**
 * Emitted when a new assignment is created (rider assigned to campaign).
 */
export class AssignmentCreatedEvent {
  static readonly EVENT_NAME = 'assignment.created';

  constructor(
    public readonly assignmentId: string,
    public readonly campaignId: string,
    public readonly riderId: string,
    public readonly assignedBy: string | null,
    public readonly timestamp: Date = new Date(),
  ) {}
}
