// Solo Advertiser — Rider App
// Payout list item widget
// Displays individual payout with amount, date, status

import 'package:flutter/material.dart';

/// Individual payout item in the history list
class PayoutItem extends StatelessWidget {
  final String amount;
  final String date;
  final String status;

  const PayoutItem({
    super.key,
    required this.amount,
    required this.date,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _statusColor.withOpacity(0.1),
          child: Icon(Icons.payment, color: _statusColor),
        ),
        title: Text(amount, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(date),
        trailing: Chip(
          label: Text(status, style: TextStyle(fontSize: 11, color: _statusColor)),
          backgroundColor: _statusColor.withOpacity(0.1),
        ),
      ),
    );
  }

  Color get _statusColor {
    switch (status) {
      case 'completed': return Colors.green;
      case 'pending': return Colors.orange;
      case 'failed': return Colors.red;
      default: return Colors.grey;
    }
  }
}
