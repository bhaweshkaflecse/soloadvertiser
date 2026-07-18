/**
 * Emitted when an assignment is completed (campaign ended normally).
 */
export class AssignmentCompletedEvent {
  static readonly EVENT_NAME = 'assignment.completed';

  constructor(
    public readonly assignmentId: string,
    public readonly campaignId: string,
    public readonly riderId: string,
    public readonly daysCompleted: number,
    public readonly totalEarnings: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
