// Solo Advertiser — Rider App
// Assignment data model
// Represents a campaign assignment linking a rider to a campaign

/// Campaign assignment model
class Assignment {
  final String id;
  final String riderId;
  final String campaignId;
  final String status; // offered, accepted, active, completed, cancelled
  final DateTime assignedAt;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final double totalKmDriven;
  final double totalEarned;

  const Assignment({
    required this.id,
    required this.riderId,
    required this.campaignId,
    required this.status,
    required this.assignedAt,
    this.startedAt,
    this.completedAt,
    this.totalKmDriven = 0.0,
    this.totalEarned = 0.0,
  });

  factory Assignment.fromJson(Map<String, dynamic> json) {
    return Assignment(
      id: json['id'] as String,
      riderId: json['riderId'] as String,
      campaignId: json['campaignId'] as String,
      status: json['status'] as String,
      assignedAt: DateTime.parse(json['assignedAt'] as String),
      startedAt: json['startedAt'] != null ? DateTime.parse(json['startedAt'] as String) : null,
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt'] as String) : null,
      totalKmDriven: (json['totalKmDriven'] as num?)?.toDouble() ?? 0.0,
      totalEarned: (json['totalEarned'] as num?)?.toDouble() ?? 0.0,
    );
  }

  bool get isActive => status == 'active';
}
