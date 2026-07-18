// Solo Advertiser — Rider App
// Wallet data model
// Represents rider's earnings wallet and payout history

/// Wallet model with balance and payout info
class Wallet {
  final String riderId;
  final double availableBalance;
  final double pendingBalance;
  final double totalEarned;
  final String payoutMethod; // bank_transfer, upi
  final List<Payout> recentPayouts;

  const Wallet({
    required this.riderId,
    required this.availableBalance,
    this.pendingBalance = 0.0,
    required this.totalEarned,
    this.payoutMethod = 'bank_transfer',
    this.recentPayouts = const [],
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      riderId: json['riderId'] as String,
      availableBalance: (json['availableBalance'] as num).toDouble(),
      pendingBalance: (json['pendingBalance'] as num?)?.toDouble() ?? 0.0,
      totalEarned: (json['totalEarned'] as num).toDouble(),
      payoutMethod: json['payoutMethod'] as String? ?? 'bank_transfer',
      recentPayouts: (json['recentPayouts'] as List<dynamic>?)
          ?.map((e) => Payout.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
    );
  }
}

/// Individual payout record
class Payout {
  final String id;
  final double amount;
  final String status; // pending, processing, completed, failed
  final DateTime requestedAt;
  final DateTime? completedAt;
  final String? transactionRef;

  const Payout({
    required this.id,
    required this.amount,
    required this.status,
    required this.requestedAt,
    this.completedAt,
    this.transactionRef,
  });

  factory Payout.fromJson(Map<String, dynamic> json) {
    return Payout(
      id: json['id'] as String,
      amount: (json['amount'] as num).toDouble(),
      status: json['status'] as String,
      requestedAt: DateTime.parse(json['requestedAt'] as String),
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt'] as String) : null,
      transactionRef: json['transactionRef'] as String?,
    );
  }
}
