// Solo Advertiser — Rider App
// Rider data model
// Represents the authenticated rider's profile information

/// Rider profile model
class Rider {
  final String id;
  final String fullName;
  final String phone;
  final String? email;
  final String? profilePhotoUrl;
  final String status; // pending, active, suspended
  final String? zoneId;
  final double rating;
  final DateTime createdAt;

  const Rider({
    required this.id,
    required this.fullName,
    required this.phone,
    this.email,
    this.profilePhotoUrl,
    required this.status,
    this.zoneId,
    this.rating = 0.0,
    required this.createdAt,
  });

  factory Rider.fromJson(Map<String, dynamic> json) {
    return Rider(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      phone: json['phone'] as String,
      email: json['email'] as String?,
      profilePhotoUrl: json['profilePhotoUrl'] as String?,
      status: json['status'] as String,
      zoneId: json['zoneId'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'fullName': fullName,
    'phone': phone,
    'email': email,
    'profilePhotoUrl': profilePhotoUrl,
    'status': status,
    'zoneId': zoneId,
    'rating': rating,
    'createdAt': createdAt.toIso8601String(),
  };
}
