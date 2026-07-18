// Solo Advertiser — Rider App
// SCR-RDR-021: Campaign Detail Screen
// Shows campaign information, wrap details, earnings, and requirements
// Includes action buttons for accepting/declining available campaigns

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// SCR-RDR-021: Campaign Detail
/// Displays full campaign information including brand, duration, pay rate
class CampaignDetailScreen extends ConsumerWidget {
  final String id;

  const CampaignDetailScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Campaign Details')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Campaign header image / brand logo
            Container(
              height: 180,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Center(child: Text('Campaign Creative Preview')),
            ),
            const SizedBox(height: 16),
            // Campaign name and brand
            Text('Brand XYZ Campaign', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 4),
            Text('by Brand Company Ltd', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 16),
            // Details card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _DetailRow(label: 'Duration', value: '30 days'),
                    _DetailRow(label: 'Daily Rate', value: '₹500/day'),
                    _DetailRow(label: 'Total Earnings', value: '₹15,000'),
                    _DetailRow(label: 'Wrap Type', value: 'Full vehicle wrap'),
                    _DetailRow(label: 'Zone', value: 'Central Business District'),
                    _DetailRow(label: 'Status', value: 'Active'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Requirements
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Requirements', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    const Text('• Minimum 40 km/day driving'),
                    const Text('• Weekly verification photo'),
                    const Text('• Keep wrap clean and undamaged'),
                    const Text('• Report any damage within 24h'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
