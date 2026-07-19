// Solo Advertiser — Rider App
// Campaign data model
// Represents a campaign from the rider's perspective

/// Campaign model as seen by riders
class Campaign {
  final String id;
  final String name;
  final String businessName;
  final String status; // available, active, completed, cancelled
  final String wrapType; // full, partial, rear
  final double dailyRate;
  final int durationDays;
  final DateTime startDate;
  final DateTime? endDate;
  final String? creativeUrl;
  final String zoneId;
  final int minKmPerDay;

  const Campaign({
    required this.id,
    required this.name,
    required this.businessName,
    required this.status,
    required this.wrapType,
    required this.dailyRate,
    required this.durationDays,
    required this.startDate,
    this.endDate,
    this.creativeUrl,
    required this.zoneId,
    this.minKmPerDay = 40,
  });

  factory Campaign.fromJson(Map<String, dynamic> json) {
    return Campaign(
      id: json['id'] as String,
      name: json['name'] as String,
      businessName: json['businessName'] as String,
      status: json['status'] as String,
      wrapType: json['wrapType'] as String,
      dailyRate: (json['dailyRate'] as num).toDouble(),
      durationDays: json['durationDays'] as int,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate'] as String) : null,
      creativeUrl: json['creativeUrl'] as String?,
      zoneId: json['zoneId'] as String,
      minKmPerDay: json['minKmPerDay'] as int? ?? 40,
    );
  }

  double get totalEarnings => dailyRate * durationDays;
}
