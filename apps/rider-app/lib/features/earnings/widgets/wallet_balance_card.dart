// Solo Advertiser — Rider App
// Wallet balance card widget
// Shows available balance and withdraw button

import 'package:flutter/material.dart';

/// Card displaying current wallet balance with withdraw action
class WalletBalanceCard extends StatelessWidget {
  const WalletBalanceCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFF1E40AF),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Available Balance',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white70)),
            const SizedBox(height: 8),
            Text('₹5,200',
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: Colors.white)),
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: () {/* Request withdrawal */},
              style: OutlinedButton.styleFrom(foregroundColor: Colors.white, side: const BorderSide(color: Colors.white)),
              child: const Text('Withdraw'),
            ),
          ],
        ),
      ),
    );
  }
}
