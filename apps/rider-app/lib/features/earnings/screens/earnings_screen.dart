// Solo Advertiser — Rider App
// SCR-RDR-030: Earnings Screen
// Displays wallet balance, earnings breakdown, and withdrawal options
// Shows daily/weekly/monthly earnings with chart visualization

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/widgets/bottom_nav_bar.dart';
import '../widgets/wallet_balance_card.dart';

/// SCR-RDR-030: Earnings Overview
/// Shows wallet balance, earning trends, and payout history link
class EarningsScreen extends ConsumerWidget {
  const EarningsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Earnings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const WalletBalanceCard(),
          const SizedBox(height: 16),
          // Earnings period selector
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Earnings Breakdown', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  _EarningRow(label: 'Today', amount: '₹320'),
                  _EarningRow(label: 'This Week', amount: '₹1,850'),
                  _EarningRow(label: 'This Month', amount: '₹8,400'),
                  _EarningRow(label: 'Total Earned', amount: '₹45,200'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Payout history link
          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('Payout History'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/earnings/payouts'),
          ),
        ],
      ),
      bottomNavigationBar: const BottomNavBar(currentIndex: 2),
    );
  }
}

class _EarningRow extends StatelessWidget {
  final String label;
  final String amount;

  const _EarningRow({required this.label, required this.amount});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [Text(label), Text(amount, style: const TextStyle(fontWeight: FontWeight.bold))],
      ),
    );
  }
}
