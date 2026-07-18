// Solo Advertiser — Rider App
// SCR-RDR-031: Payout History Screen
// Lists all past payouts with date, amount, and status
// Filterable by status (pending, completed, failed)

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../widgets/payout_item.dart';

/// SCR-RDR-031: Payout History
/// Lists all payouts with their status (pending, completed, failed)
class PayoutHistoryScreen extends ConsumerWidget {
  const PayoutHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payout History')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 15, // Placeholder count
        itemBuilder: (context, index) {
          return PayoutItem(
            amount: '₹${(index + 1) * 2000}',
            date: '2024-01-${(index + 1).toString().padLeft(2, '0')}',
            status: index < 2 ? 'pending' : 'completed',
          );
        },
      ),
    );
  }
}
